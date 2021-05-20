const path = require('path');
const _ = require('lodash');
const dotenv = require('dotenv');
const env = require('@ltv/env');

dotenv.config({ path: process.env.ENV_PATH || 'local.env' });

const nodeEnv = env('NODE_ENV', 'development');

const getPrefixedDeps = require('../utils/get-prefixed-dependencies.util');
const loadPolicies = require('../loader/policies.load');
const loadFunctions = require('../loader/functions.load');
const loadConfigDir = require('./config-loader');
const createConfigProvider = require('./config-provider');

const { version: appVersion } = require(path.join(
  __dirname,
  '../../package.json'
));

const CONFIG_PATHS = {
  modules: 'modules',
  config: 'config',
  plugins: 'plugins',
  policies: 'policies',
  tmp: '.tmp',
};

const defaultConfig = {
  server: {
    host: env('HOST', 'localhost'),
    port: env('PORT', 4000),
    proxy: false,
    cron: { enabled: false },
    autoOpen: false,
  },
  admin: {},
  middleware: {
    timeout: 1000,
    load: {
      before: ['responseTime', 'logger', 'cors', 'responses', 'gzip'],
      order: [],
      after: ['parser', 'router'],
    },
    settings: {},
  },
  routes: {},
  functions: {},
  policies: {},
};

module.exports = (dir, initialConfig = {}) => {
  const appDir = dir || process.cwd();
  const pkgJSON = require(path.resolve(appDir, 'package.json'));

  const configDir = path.resolve(appDir, 'config');

  const rootConfig = {
    launchedAt: Date.now(),
    appPath: appDir,
    paths: CONFIG_PATHS,
    environment: nodeEnv,
    uuid: _.get(pkgJSON, 'app.uuid'),
    template: _.get(pkgJSON, 'app.template'),
    info: {
      ...pkgJSON,
      appVersion,
    },
    installedPlugins: getPrefixedDeps('@social-gear/middleware', pkgJSON),
    installedMiddlewares: getPrefixedDeps('@social-gear/middleware', pkgJSON),
    ...initialConfig,
  };

  const baseConfig = {
    ...loadConfigDir(configDir),
    policies: loadPolicies(path.resolve(configDir, 'policies')),
    functions: loadFunctions(path.resolve(configDir, 'functions')),
  };

  const envDir = path.resolve(configDir, 'env', nodeEnv);
  const envConfig = loadConfigDir(envDir);

  return createConfigProvider(
    _.merge(rootConfig, defaultConfig, baseConfig, envConfig)
  );
};
