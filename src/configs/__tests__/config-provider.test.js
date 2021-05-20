const _ = require('lodash');
const configProvider = require('../config-provider');

const initialConfig = {
  server: {
    host: '0.0.0.0',
    port: 4000,
  },
};

describe('Load config provider', () => {
  test('Should return object has get set has', () => {
    const _configs = configProvider(initialConfig);

    expect(Object.keys(_.pick(_configs, ['get', 'set', 'has']))).toEqual([
      'get',
      'set',
      'has',
    ]);
  });

  test('Should return object has get set has with config is empty', () => {
    const _configs = configProvider();

    expect(Object.keys(_.pick(_configs, ['get', 'set', 'has']))).toEqual([
      'get',
      'set',
      'has',
    ]);
  });

  test('Should set a config', () => {
    let _configs = configProvider(initialConfig);
    _configs = _configs.set('server.port', 3000);

    expect(_.pick(_configs, 'server')).toEqual({
      server: {
        host: '0.0.0.0',
        port: 3000,
      },
    });
  });

  test('Should get a config', () => {
    const _configs = configProvider(initialConfig);
    const port = _configs.get('server.port');

    expect(port).toBe(4000);
  });

  test('Should has a config', () => {
    const _configs = configProvider(initialConfig);
    const hasPort = _configs.has('server.port');

    expect(hasPort).toBe(true);
  });
});
