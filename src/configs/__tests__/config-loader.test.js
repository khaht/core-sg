const path = require('path');
const fs = require('fs');
const del = require('del');
const loadConfigs = require('../config-loader');

const getConfigDir = (prefix) => {
  const dir = process.cwd();
  const configDir = path.resolve(dir, prefix ? `${prefix}-config` : 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }

  return configDir;
};

const testConfigDir = getConfigDir('test');
const configDir = getConfigDir();

describe('Run config loader', () => {
  beforeAll(() => {
    // copy all from config to test config
    const files = fs
      .readdirSync(configDir)
      .filter((file) => file.endsWith('.js') || file.endsWith('.json'));
    files.forEach((f) => {
      fs.copyFileSync(path.join(configDir, f), path.join(testConfigDir, f));
    });
  });
  afterAll(async () => {
    await del(testConfigDir);
    await del(getConfigDir('not-exist'));
  });

  test('Should return empty object if the configuration directory does not exists', () => {
    const configDir = getConfigDir('not-exist');
    const configs = loadConfigs(configDir);
    expect(Object.keys(configs).length).toEqual(0);
  });

  test('Should load configuration file from config directory', () => {
    // load all configuration in /path/to/project/dir/config
    const configs = loadConfigs(testConfigDir);
    expect(configs).toEqual({
      database: expect.any(Object),
      email: expect.any(Object),
      middleware: expect.any(Object),
      plugins: expect.any(Object),
      server: expect.any(Object),
    });
  });

  test('should throw exception if config dir contain invalid javascript file', () => {
    // create file
    const invalidFilePath = path.join(testConfigDir, 'invalid.js');
    fs.writeFileSync(invalidFilePath, 'Not a javascript file');
    expect(() => {
      loadConfigs(testConfigDir);
    }).toThrowError();
    fs.unlinkSync(invalidFilePath);
  });

  test('Should load json config file if it exists', () => {
    // create file
    const jsonConfigFilePath = path.join(testConfigDir, 'hello.json');
    const helloConfig = { name: 'world' };
    fs.writeFileSync(jsonConfigFilePath, JSON.stringify(helloConfig));
    const configs = loadConfigs(testConfigDir);
    expect(configs.hello).toEqual(helloConfig);
    fs.unlinkSync(jsonConfigFilePath);
  });

  test('should throw exception if config dir contain invalid json file', () => {
    // create file
    const invalidFilePath = path.join(testConfigDir, 'invalid.json');
    fs.writeFileSync(invalidFilePath, 'Not a json file');
    expect(() => {
      loadConfigs(testConfigDir);
    }).toThrowError();
    fs.unlinkSync(invalidFilePath);
  });

  test("shouldn't load empty configuration for json / js file", () => {
    // create file
    const invalidFilePath = path.join(testConfigDir, 'anyfile.ext');
    fs.writeFileSync(invalidFilePath, 'Not a json / js file');
    const configs = loadConfigs(testConfigDir);
    expect(Object.keys(configs.anyfile).length).toEqual(0);
    fs.unlinkSync(invalidFilePath);
  });

  test('should load nested json configuration', () => {
    // create file
    const jsonConfigFilePath = path.join(testConfigDir, 'hello.json');
    const helloConfig = { name: 'world', profile: { phone: '0123456789' } };
    fs.writeFileSync(jsonConfigFilePath, JSON.stringify(helloConfig));
    const configs = loadConfigs(testConfigDir);
    expect(configs.hello).toEqual(helloConfig);
    fs.unlinkSync(jsonConfigFilePath);
  });

  test('should load json configuration with expression inside value', () => {
    // create file
    const jsonConfigFilePath = path.join(testConfigDir, 'hello.json');
    const helloConfig = {
      firstName: 'world',
      lastName: 'hello',
      // eslint-disable-next-line no-template-curly-in-string
      fullName: "${acc.firstName + ' ' + acc.lastName}",
    };
    fs.writeFileSync(jsonConfigFilePath, JSON.stringify(helloConfig));
    const configs = loadConfigs(testConfigDir);
    expect(configs.hello).toEqual({
      firstName: helloConfig.firstName,
      lastName: helloConfig.lastName,
      fullName: `${helloConfig.firstName} ${helloConfig.lastName}`,
    });
    fs.unlinkSync(jsonConfigFilePath);
  });
});
