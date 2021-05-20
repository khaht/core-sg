const { join } = require('path');
const { existsSync } = require('fs-extra');
const _ = require('lodash');
const findPackagePath = require('./package-path.load');
const loadFiles = require('./files.load');
const loadConfig = require('./config-files.load');

const loadLocalPlugins = async ({ dir, config }) => {
  const pluginsDir = join(dir, 'plugins');

  if (!existsSync(pluginsDir)) return {};

  const [files, configs] = await Promise.all([
    loadFiles(pluginsDir, '{*/!(config)/*.*(js|json),*/package.json}'),
    loadConfig(pluginsDir, '*/config/**/*.+(js|json)'),
  ]);
  const userConfigs = Object.keys(files).reduce((acc, plugin) => {
    acc[plugin] = { config: config.get(['plugins', plugin], {}) };
    return acc;
  }, {});
  return _.merge(files, configs, userConfigs);
};

const loadPlugins = async ({ installedPlugins, config }) => {
  const plugins = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const plugin of installedPlugins) {
    const pluginPath = findPackagePath(`@social-gear/plugin-${plugin}`);

    // eslint-disable-next-line no-await-in-loop
    const files = await loadFiles(
      pluginPath,
      '{!(config|node_modules|tests)/*.*(js|json),package.json}',
    );

    // eslint-disable-next-line no-await-in-loop
    const { config: pluginConfig } = await loadConfig(pluginPath);

    const userConfig = config.get(['plugins', plugin], {});

    const mergedConfig = _.merge(pluginConfig, userConfig);

    _.set(plugins, plugin, _.assign({}, files, { config: mergedConfig }));
  }

  return plugins;
};

module.exports = async ({ dir, config }) => {
  const localPlugins = await loadLocalPlugins({ dir, config });
  const plugins = await loadPlugins({
    installedPlugins: config.installedPlugins,
    config,
  });

  const pluginsIntersection = _.intersection(
    Object.keys(localPlugins),
    Object.keys(plugins),
  );

  if (pluginsIntersection.length > 0) {
    throw new Error(
      `You have some local plugins with the same name as npm installed plugins:\n${pluginsIntersection
        .map((p) => `- ${p}`)
        .join('\n')}`,
    );
  }

  // check for conflicts
  return _.merge(plugins, localPlugins);
};
