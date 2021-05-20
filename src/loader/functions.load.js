const fse = require('fs-extra');

const walk = require('../utils/walk.util');

const loadFunction = (file) => {
  try {
    return require(file);
  } catch (error) {
    throw new Error(`Could not load function ${file}: ${error.message}`);
  }
};

const loadFunctions = (dir) => {
  if (!fse.existsSync(dir)) return {};

  return walk(dir, { loader: loadFunction });
};

module.exports = loadFunctions;
