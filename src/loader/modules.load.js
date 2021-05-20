/**
 * Load Modules is the root module loader.
 * This is where all the app environment is loaded
 * - APIs
 * - Middlewres
 */

const loadApis = require('./api.load');
// const loadAdmin = require('./load-admin');
const loadPlugins = require('./plugins.load');
const loadMiddlewares = require('./middleware.load');
// const loadExtensions = require('./load-extensions');

module.exports = async (sgApp) => {
  const [api, middlewares, plugins] = await Promise.all([
    loadApis(sgApp),
    loadMiddlewares(sgApp),
    loadPlugins(sgApp),
  ]);

  return {
    api,
    plugins,
    middlewares,
  };
};
