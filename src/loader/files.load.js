/* eslint-disable no-await-in-loop */
const path = require('path');
const _ = require('lodash');
const fse = require('fs-extra');
const glob = require('./glob.load');
const filePathToPath = require('./filepath-to-prop-path');

/**
 * Returns an Object build from a list of files matching a glob pattern in a directory
 * It builds a tree structure resembling the folder structure in dir
 * @param {string} dir - Directory to load
 * @param {string} pattern - Glob pattern to search for
 * @param {Object} options - Options
 * @param {Function} options.requireFn - Function that will require the matches files
 * @param {Function} options.shouldUseFileNameAsKey - Weather to use the filename as a
 *                                          key in the Object path or not
 * @param {Object} options.globArgs - extra glob function arguments
 */
const loadFiles = async (
  dir,
  pattern,
  { requireFn = require, shouldUseFileNameAsKey = () => true, globArgs = {} } = {},
) => {
  const root = {};
  const files = await glob(pattern, { cwd: dir, ...globArgs });

  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const absolutePath = path.resolve(dir, file);

    // load module
    delete require.cache[absolutePath];
    let mod;

    if (path.extname(absolutePath) === '.json') {
      mod = await fse.readJson(absolutePath);
    } else {
      mod = requireFn(absolutePath);
    }

    Object.defineProperty(mod, '__filename__', {
      enumerable: true,
      configurable: false,
      writable: false,
      value: path.basename(file),
    });

    const propPath = filePathToPath(file, shouldUseFileNameAsKey(file));

    if (propPath.length === 0) _.merge(root, mod);
    _.merge(root, _.setWith({}, propPath, mod, Object));
  }

  return root;
};

module.exports = loadFiles;
