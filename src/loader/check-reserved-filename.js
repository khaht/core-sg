const _ = require('lodash');

// files to load with filename key
const prefixedPaths = [
  'functions',
  'policies',
  'locales',
  'middleware',
  'language',
  'layout',
];

module.exports = function checkReservedFilenames(file) {
  return !!_.some(prefixedPaths, (e) => file.indexOf(`config/${e}`) >= 0);
};
