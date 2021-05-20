const logger = require('utils/logger.util');
const _ = require('lodash');
const createConnectorRegistry = require('../connector-registry');

describe('Create connector registry', () => {
  const config = {
    database: {
      connections: {
        default: {
          connector: 'firebase',
          settings: {
            client: 'cloudfirestore',
            serviceAccount:
              process.env.SERVICE_ACCOUNT_PATH ||
              '../firebase/serviceaccount.json',
          },
          options: {
            useNullAsDefault: true,
          },
        },
      },
    },
  };

  global.sgApp = {
    log: logger,
    config: {
      ...config,

      get(path, defaultValue) {
        return _.get(config, path, defaultValue);
      },

      set(path, val) {
        _.set(config, path, val);

        return this;
      },

      has(path) {
        return _.has(config, path);
      },
    },
  };
  const connections = {
    default: {
      connector: 'firebase',
      settings: {
        client: 'cloudfirestore',
        serviceAccount:
          process.env.SERVICE_ACCOUNT_PATH || '../firebase/serviceaccount.json',
      },
      options: {
        useNullAsDefault: true,
      },
    },
  };
  const defaultConnection = 'default';
  const connectors = createConnectorRegistry({
    defaultConnection,
    connections,
  });
  connectors.load();

  test('Should create connector registry', () => {
    expect(Object.keys(connectors)).toEqual([
      'load',
      'initialize',
      'getAll',
      'get',
      'set',
      'default',
      'getByConnection',
    ]);
  });

  test('Should ignore if connector modules loaded', () => {
    connectors.load();
  });

  test('Should initialize connectors', async () => {
    await connectors.initialize();
  });

  test('Should get all connectors', () => {
    const resp = connectors.getAll();
    expect(resp.length).toBe(1);
  });

  test('Should get connector by key', () => {
    const resp = connectors.get('firebase');
    expect(Object.keys(resp)).toEqual([
      'db',
      'initialize',
      'parseSnapshots',
      'find',
      'findOne',
      'create',
      'update',
      'delete',
    ]);
  });

  test('Should set connector by key', () => {
    const fn = jest.fn();
    connectors.set('dynamodb', { find: fn });
    const resp = connectors.get('dynamodb');
    expect(resp).toEqual({ find: fn });
  });

  test('Should get default connector', () => {
    const _default = connectors.default;
    expect(Object.keys(_default)).toEqual([
      'db',
      'initialize',
      'parseSnapshots',
      'find',
      'findOne',
      'create',
      'update',
      'delete',
    ]);
  });

  test('Should get by connection', () => {
    const resp = connectors.getByConnection('default');
    expect(Object.keys(resp)).toEqual([
      'db',
      'initialize',
      'parseSnapshots',
      'find',
      'findOne',
      'create',
      'update',
      'delete',
    ]);
  });

  test('Should throw error when get by connection not exists', () => {
    expect(() => connectors.getByConnection('connection')).toThrow();
  });
});
