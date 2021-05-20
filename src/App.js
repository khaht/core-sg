/* eslint-disable no-console, consistent-return */
const _ = require('lodash');
const chalk = require('chalk');
const CLITable = require('cli-table3');
const express = require('express');
const http = require('http');
const errorHandler = require('errorhandler');

const bootstrap = require('./bootstrap');
const loadModules = require('./loader/modules.load');
const logger = require('./utils/logger.util');
const createFs = require('./utils/fs.util');
const { getAbsoluteServerUrl } = require('./utils/config.util');
const loadConfiguration = require('./configs');
const createEventHub = require('./services/event-hub');
const initializeMiddlewares = require('./middlewares');
const createWebhookRunner = require('./services/webhook-runner');
const { createDatabaseManager } = require('./database');

class App {
  constructor(options = {}) {
    this.app = express();
    this.router = new express.Router();

    this.initServer();

    // Logger
    this.log = logger;

    this.dir = options.dir || process.cwd();

    this.admin = {};
    this.plugins = {};
    this.config = loadConfiguration(this.dir, options);

    this.isLoaded = false;

    // internal services.
    this.fs = createFs(this);
    this.eventHub = createEventHub();
  }

  initServer() {
    this.server = http.createServer(this.app);
    // handle port in use cleanly
    this.server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        return this.stopWithError(
          `The port ${err.port} is already used by another application.`
        );
      }

      return this.log.error(err);
    });

    // Close current connections to fully destroy the server
    const connections = {};

    this.server.on('connection', (conn) => {
      const key = `${conn.remoteAddress}:${conn.remotePort}`;
      connections[key] = conn;

      conn.on('close', () => {
        delete connections[key];
      });
    });

    this.server.destroy = (cb) => {
      this.server.close(cb);

      const connKeys = Object.keys(connections);
      connKeys.forEach((key) => {
        connections[key].destroy();
      });
    };
  }

  /**
   * Add behaviors to the server
   */
  async listen(cb) {
    const onListen = async (err) => {
      if (err) return this.stopWithError(err);

      // Should the startup message be displayed?
      const hideStartupMessage = process.env.HIDE_STARTUP_MESSAGE
        ? process.env.HIDE_STARTUP_MESSAGE === 'true'
        : false;

      if (hideStartupMessage === false) {
        this.logStartupMessage();
      }

      if (cb && typeof cb === 'function') {
        cb();
      }
    };

    const listenSocket = this.config.get('server.socket');
    const listenErrHandler = (err) =>
      onListen(err).catch((err1) => this.stopWithError(err1));

    if (listenSocket) {
      this.server.listen(listenSocket, listenErrHandler);
    } else {
      this.server.listen(
        this.config.get('server.port'),
        this.config.get('server.host'),
        listenErrHandler
      );
    }
  }

  stopWithError(err, customMessage) {
    this.log.debug("⛔️ Server wasn't able to start properly.");
    if (customMessage) {
      this.log.error(customMessage);
    }
    this.log.error(err);
    return this.stop();
  }

  stop(exitCode = 1) {
    // Destroy server and available connections.
    if (_.has(this, 'server.destroy')) {
      this.server.destroy();
    }

    // Kill process.
    process.exit(exitCode);
  }

  async start(cb) {
    try {
      if (!this.isLoaded) {
        await this.load();
      }

      // router
      const routePrefix = this.config.get(
        'middleware.settings.router.prefix',
        ''
      );
      this.app.use(routePrefix, this.router);

      // Launch server.
      this.listen(cb);
    } catch (err) {
      this.stopWithError(err);
    }
  }

  async destroy() {
    if (_.has(this, 'server.destroy')) {
      this.server.destroy();
    }

    await Promise.all(
      Object.values(this.plugins).map((plugin) => {
        if (_.has(plugin, 'destroy') && typeof plugin.destroy === 'function') {
          return plugin.destroy();
        }
        return Promise.resolve();
      })
    );

    if (_.has(this, 'admin')) {
      await this.admin.destroy();
    }

    this.eventHub.removeAllListeners();

    if (_.has(this, 'db')) {
      await this.db.destroy();
    }

    delete global.app;
  }

  // eslint-disable-next-line class-methods-use-this
  async health(req, res, next) {
    req.meta = {};
    if (req.url === '/_health' && ['HEAD', 'GET'].includes(req.method)) {
      return res.status(204);
    }
    await next();
  }

  serverError(err, req, res) {
    this.log.error(err);
    res.status(500).send('Server Error');
  }

  async load() {
    this.app.use(async (req, res, next) => this.health(req, res, next));

    if (process.env.NODE_ENV === 'development') {
      // only use in development
      this.app.use(errorHandler());
    } else {
      this.app.use((err, _req, res) => this.serverError(err, _req, res));
    }

    const modules = await loadModules(this);

    this.api = modules.api;
    this.modules = modules.api;
    this.plugins = modules.plugins;
    this.middleware = modules.middlewares;

    await bootstrap(this);

    // init webhook runner
    this.webhookRunner = createWebhookRunner({
      eventHub: this.eventHub,
      logger: this.log,
      configuration: this.config.get('server.webhooks', {}),
    });

    // Init core store
    // this.models['core_store'] = coreStoreModel(this.config);
    // this.models['app_webhooks'] = webhookModel(this.config);

    this.db = createDatabaseManager(this);
    await this.db.initialize();

    // this.store = createCoreStore({
    //   environment: this.config.environment,
    //   db: this.db,
    // });

    // this.entityValidator = entityValidator;

    // this.entityService = createEntityService({
    //   db: this.db,
    //   eventHub: this.eventHub,
    //   entityValidator: this.entityValidator,
    // });

    // this.telemetry = createTelemetry(this);

    await initializeMiddlewares.call(this);

    await this.runBootstrapFunctions();
    await this.freeze();

    this.isLoaded = true;

    return this;
  }

  logStats() {
    const columns = Math.min(process.stderr.columns, 80) - 2;
    console.log();
    console.log(chalk.black.bgWhite(_.padEnd(' Project information', columns)));
    console.log();

    const infoTable = new CLITable({
      colWidths: [20, 50],
      chars: {
        mid: '',
        'left-mid': '',
        'mid-mid': '',
        'right-mid': '',
      },
    });

    infoTable.push(
      [chalk.blue('Time'), `${new Date()}`],
      [chalk.blue('Launched in'), `${Date.now() - this.config.launchedAt} ms`],
      [chalk.blue('Environment'), this.config.environment],
      [chalk.blue('Process PID'), process.pid]
      // [chalk.blue('Version'), `${this.config.info.app} (node ${process.version})`]
    );

    console.log(infoTable.toString());
    console.log();
    console.log(chalk.black.bgWhite(_.padEnd(' Actions available', columns)));
    console.log();
  }

  logStartupMessage() {
    this.logStats();

    console.log(chalk.bold('Welcome back!'));

    // if (this.config.serveAdminPanel === true) {
    //   console.log(chalk.grey('To manage your project 🚀, go to the administration panel at:'));
    //   const adminUrl = getAbsoluteAdminUrl(sgApp.config);
    //   console.log(chalk.bold(adminUrl));
    //   console.log();
    // }

    console.log(chalk.grey('To access the server ⚡️, go to:'));
    const serverUrl = getAbsoluteServerUrl(this.config);
    console.log(chalk.bold(serverUrl));
    console.log();
  }

  async runBootstrapFunctions() {
    const execBootstrap = async (fn) => {
      if (!fn) return;

      return fn();
    };

    // plugins bootstrap
    const pluginBoostraps = Object.keys(this.plugins).map((plugin) =>
      execBootstrap(
        _.get(this.plugins[plugin], 'config.functions.bootstrap')
      ).catch((err) => {
        sgApp.log.error(`Bootstrap function in plugin "${plugin}" failed`);
        sgApp.log.error(err);
        sgApp.stop();
      })
    );
    await Promise.all(pluginBoostraps);

    // user bootstrap
    await execBootstrap(_.get(this.config, ['functions', 'bootstrap']));
  }

  async freeze() {
    Object.freeze(this.config);
    Object.freeze(this.dir);
    Object.freeze(this.admin);
    Object.freeze(this.plugins);
    Object.freeze(this.api);
  }

  getModel(modelKey, plugin) {
    return this.db.getModel(modelKey, plugin);
  }

  /**
   * Binds queries with a specific model
   * @param {string} entity - entity name
   * @param {string} plugin - plugin name or null
   */
  query(entity, plugin) {
    return this.db.query(entity, plugin);
  }
}

module.exports = (options) => {
  const app = new App(options);
  global.sgApp = app; // sgApp stand for social gear App
  return app;
};
