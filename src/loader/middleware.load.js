/* eslint-disable consistent-return, no-param-reassign, no-await-in-loop */
const path = require('path');
// const fs = require('fs-extra');
const _ = require('lodash');
const glob = require('./glob.load');
// const findPackagePath = require('./package-path.load');

/**
 * Build loader functions
 * @param {*} app - app instance
 */
const createLoaders = (app) => {
  const mountMiddleware = (name, files, middlewares) => {
    files.forEach((file) => {
      middlewares[name] = middlewares[name] || { loaded: false };

      if (_.endsWith(file, 'index.js') && !middlewares[name].load) {
        return Object.defineProperty(middlewares[name], 'load', {
          configurable: false,
          enumerable: true,
          get: () =>
            require(file)({ ...app, log: app.log.child({ middleware: name }) }),
        });
      }

      if (_.endsWith(file, 'defaults.json')) {
        middlewares[name].defaults = require(file);
      }
    });
  };

  const loadMiddlewaresInDir = async (dir, middlewares) => {
    const files = await glob('*/*(index|defaults).*(js|json)', {
      cwd: dir,
    });

    files.forEach((f) => {
      const name = f.split('/')[0];
      mountMiddleware(name, [path.resolve(dir, f)], middlewares);
    });
  };

  const loadInternalMiddlewares = (middlewares) =>
    loadMiddlewaresInDir(
      path.resolve(__dirname, '..', 'middlewares'),
      middlewares
    );

  const loadLocalMiddlewares = (appPath, middlewares) =>
    loadMiddlewaresInDir(path.resolve(appPath, 'middlewares'), middlewares);

  // const loadPluginsMiddlewares = async (plugins, middlewares) => {
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const pluginName of plugins) {
  //     const dir = path.resolve(findPackagePath(`app-plugin-${pluginName}`), 'middlewares');
  //     await loadMiddlewaresInDir(dir, middlewares);
  //   }
  // };

  // const loadLocalPluginsMiddlewares = async (appPath, middlewares) => {
  //   const pluginsDir = path.resolve(appPath, 'plugins');
  //   if (!fs.existsSync(pluginsDir)) return;

  //   const pluginsNames = await fs.readdir(pluginsDir);

  //   pluginsNames.forEach(async (pluginFolder) => {
  //     // ignore files
  //     // eslint-disable-next-line no-await-in-loop
  //     const stat = await fs.stat(path.resolve(pluginsDir, pluginFolder));
  //     // eslint-disable-next-line
  //     // if (!stat.isDirectory()) continue;
  //     if (stat.isDirectory()) {
  //       const dir = path.resolve(pluginsDir, pluginFolder, 'middlewares');
  //       await loadMiddlewaresInDir(dir, middlewares);
  //     }
  //   });
  // };

  // const loadAdminMiddlewares = async (middlewares) => {
  //   const dir = path.resolve(findPackagePath('app-admin'), 'middlewares');
  //   await loadMiddlewaresInDir(dir, middlewares);
  // };

  // const loadMiddlewareDependencies = async (packages, middlewares) => {
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const packageName of packages) {
  //     const baseDir = path.dirname(require.resolve(`app-middleware-${packageName}`));
  //     const files = await glob('*(index|defaults).*(js|json)', {
  //       cwd: baseDir,
  //       absolute: true,
  //     });

  //     mountMiddleware(packageName, files, middlewares);
  //   }
  // };

  return {
    loadInternalMiddlewares,
    loadLocalMiddlewares,
    // loadPluginsMiddlewares,
    // loadLocalPluginsMiddlewares,
    // loadMiddlewareDependencies,
    // loadAdminMiddlewares,
  };
};

/**
 * Load middlewares
 */
module.exports = async (app) => {
  const { appPath } = app.config;

  const middlewares = {};

  const loaders = createLoaders(app);

  // await loaders.loadMiddlewareDependencies(installedMiddlewares, middlewares);
  // internal middlewares
  await loaders.loadInternalMiddlewares(middlewares);
  // local middleware
  await loaders.loadLocalMiddlewares(appPath, middlewares);
  // plugins middlewares
  // await loaders.loadPluginsMiddlewares(installedPlugins, middlewares);
  // local plugin middlewares
  // await loaders.loadLocalPluginsMiddlewares(appPath, middlewares);
  // load admin middlwares
  // await loaders.loadAdminMiddlewares(middlewares);

  return middlewares;
};
