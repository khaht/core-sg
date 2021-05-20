const assert = require('assert');
const path = require('path');
const _ = require('lodash');
const fse = require('fs-extra');

const loadPolicy = (file) => {
  try {
    const policy = require(file);

    assert(typeof policy === 'function', 'Policy must be a function.');

    return policy;
  } catch (error) {
    throw new Error(`Could not load policy ${file}: ${error.message}`);
  }
};

module.exports = (dir) => {
  if (!fse.existsSync(dir)) return {};

  const root = {};
  const paths = fse
    .readdirSync(dir, { withFileTypes: true })
    .filter((fd) => fd.isFile());

  paths.forEach((fd) => {
    const { name } = fd;
    const fullPath = dir + path.sep + name;

    const ext = path.extname(name);
    const key = path.basename(name, ext);
    root[_.toLower(key)] = loadPolicy(fullPath);
  });

  return root;
};
