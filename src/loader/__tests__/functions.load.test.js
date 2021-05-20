const loadFunctions = require('../functions.load');
const del = require('del');
const path = require('path');
const fs = require('fs');

const getConfigDir = (prefix, dir = process.cwd()) => {
  const configDir = path.resolve(dir, prefix ? `${prefix}-config` : 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }

  return configDir;
};

const testConfigDir = getConfigDir('functions-load-test');
const testConfigSubDir = getConfigDir('test', testConfigDir);

describe('Load Functions', () => {
  afterAll(async () => {
    await del(testConfigDir);
  });

  test('Should load functions', () => {
    const dir = path.resolve(process.cwd(), 'config', 'functions');
    const resp = loadFunctions(dir);
    expect(Object.keys(resp)).toEqual(['bootstrap', 'cron', 'responses', 'validator.load']);
  });

  test('Should return empty object if dir is not exists', () => {
    const dir = path.resolve(process.cwd(), 'config', 'functions', 'test');
    const resp = loadFunctions(dir);
    expect(resp).toEqual({});
  });

  test('Should throw error when could not load function', () => {
    // create file
    const jsConfigFilePath = path.join(testConfigSubDir, 'test.js');
    fs.writeFileSync(jsConfigFilePath, 'invalid data!!!');
    expect(() => loadFunctions(testConfigDir)).toThrowError();
  });
});
