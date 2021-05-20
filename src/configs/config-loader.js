const path = require('path');
const fs = require('fs');
const env = require('@ltv/env');
const templateConfiguration = require('../utils/template-configuration.util');

const loadJsFile = (file) => {
  try {
    const jsModule = require(file);

    // call if function
    if (typeof jsModule === 'function') {
      return jsModule({ env });
    }

    return jsModule;
  } catch (error) {
    throw new Error(`Could not load js config file ${file}: ${error.message}`);
  }
};

const loadJSONFile = (file) => {
  try {
    return templateConfiguration(JSON.parse(fs.readFileSync(file)));
  } catch (error) {
    throw new Error(`Could not load json config file ${file}: ${error.message}`);
  }
};

const loadFile = (file) => {
  const ext = path.extname(file);

  const loadFileEx = {
    '.js': loadJsFile,
    '.json': loadJSONFile,
  };

  if (!loadFileEx[ext]) {
    return {};
  }

  return loadFileEx[ext](file);
};

module.exports = (dir) => {
  if (!fs.existsSync(dir)) return {};

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((file) => file.isFile())
    .reduce((acc, file) => {
      const key = path.basename(file.name, path.extname(file.name));

      acc[key] = loadFile(path.resolve(dir, file.name));

      return acc;
    }, {});
};
