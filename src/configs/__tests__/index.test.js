const _ = require('lodash');
const configs = require('../index');

const options = {};
const dir = process.cwd();

describe('Load configs', () => {
  test('Should return object has get set has', () => {
    const _configs = configs(dir, options);
    expect(Object.keys(_.pick(_configs, ['get', 'set', 'has']))).toEqual([
      'get',
      'set',
      'has',
    ]);
  });

  test('Should set a config', () => {
    let _configs = configs(dir, options);
    _configs = _configs.set('server.port', 3000);

    expect(_configs.server.port).toBe(3000);
  });

  test('Should get a config', () => {
    const _configs = configs(dir, options);
    const port = _configs.get('server.port');

    expect(port).toBe(4000);
  });

  test('Should has a config', () => {
    const _configs = configs(dir);
    const hasPort = _configs.has('server.port');

    expect(hasPort).toBe(true);
  });

  test('should create config without directory - will use current directory', () => {
    const _configs = configs();
    expect(_configs.appPath).toEqual(dir);
  });

  test('should create config with provided directory', () => {
    const _configs = configs(process.cwd());
    expect(_configs.appPath).toEqual(process.cwd());
  });
});
