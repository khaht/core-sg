const { join } = require('path');
const fs = require('fs');
const path = require('path');
const fileParse = require('../require-file-parse');
const { removeDir } = require('../../../tests/helper');

const getConfigDir = (prefix) => {
  const dir = process.cwd();
  const configDir = path.resolve(dir, prefix ? `${prefix}-config` : 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }

  return configDir;
};

const testConfigDir = getConfigDir('test-require-file-parse');

describe('File parse', () => {
  const dir = process.cwd();
  afterAll(() => {
    removeDir(testConfigDir);
  });
  test('Should require database.js', () => {
    const filePath = join(dir, 'config', 'database.js');
    const resp = fileParse(filePath);
    expect(resp).toBeDefined();
    expect(typeof resp).toBe('function');
  });

  test('Should require serviceaccount.json', () => {
    const filePath = join(dir, 'firebase', 'serviceaccount.json');
    const resp = fileParse(filePath);
    expect(resp).toBeDefined();
    expect(typeof resp).toBe('object');
  });

  test('should require json file', () => {
    const jsonConfigFilePath = path.join(testConfigDir, 'hello.json');
    const helloConfig = { name: 'world' };
    fs.writeFileSync(jsonConfigFilePath, JSON.stringify(helloConfig));
    const configs = fileParse(jsonConfigFilePath);
    expect(configs).toEqual(helloConfig);
    fs.unlinkSync(jsonConfigFilePath);
  });
});
