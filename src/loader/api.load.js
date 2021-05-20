const { join } = require('path');
const { existsSync } = require('fs-extra');
const _ = require('lodash');
const loadFiles = require('./files.load');
const loadConfig = require('./config-files.load');

module.exports = async ({ dir }) => {
  const apiDir = join(dir, 'modules');

  if (!existsSync(apiDir)) {
    throw new Error('Missing \'modules\' folder. Please create one in your app root directory');
  }

  const apis = await loadFiles(apiDir, '*/!(config)/**/*.*(js|json)');
  const apiConfigs = await loadConfig(apiDir, '*/config/**/*.*(js|json)');

  return _.merge(apis, apiConfigs);
};
