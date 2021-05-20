const _ = require('lodash');
const logger = require('../../../../utils/logger.util');
const firebaseConnector = require('../index');

describe('Create database manager', () => {
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
      defaultConnection: 'default',
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

  const connector = firebaseConnector();

  test('Should initialize', () => {
    connector.initialize();
    expect(connector.db).not.toBeNull();
  });

  test('Should find item', async () => {
    connector.db = {
      collection: jest.fn().mockImplementation((collection) => ({
        where: jest.fn().mockImplementation((k, o, v) => ({
          orderBy: jest.fn().mockImplementation((k, v) => ({
            limit: jest.fn().mockImplementation((v) => ({
              get: jest.fn().mockResolvedValue([
                {
                  data() {
                    return {
                      id: '1234',
                      name: 'ABCD',
                      kind: 'find',
                    };
                  },
                },
              ]),
            })),
          })),
        })),
      })),
    };

    const resp = await connector.find('users', {
      conditions: { email: 'test@gmail.com' },
      order: { k: 'name', v: 'asc' },
      limit: 1,
    });
    expect(resp).toEqual([{ id: '1234', name: 'ABCD', kind: 'find' }]);
  });

  test('Should find item with operation', async () => {
    connector.db = {
      collection: jest.fn().mockImplementation((collection) => ({
        where: jest.fn().mockImplementation((k, o, v) => ({
          orderBy: jest.fn().mockImplementation((k, v) => ({
            limit: jest.fn().mockImplementation((v) => ({
              get: jest.fn().mockResolvedValue([
                {
                  data() {
                    return {
                      id: '1234',
                      name: 'ABCD',
                      kind: 'find',
                    };
                  },
                },
              ]),
            })),
          })),
        })),
      })),
    };

    const resp = await connector.find('users', {
      conditions: { email: 'test@gmail.com' },
      order: { k: 'name', v: 'asc' },
      operators: { email: '==' },
      limit: 1,
    });
    expect(resp).toEqual([{ id: '1234', name: 'ABCD', kind: 'find' }]);
  });

  test('Should find item with query is empty', async () => {
    connector.db = {
      collection: jest.fn().mockImplementation((collection) => ({
        get: jest.fn().mockResolvedValue([
          {
            data() {
              return {
                id: '1234',
                name: 'ABCD',
                kind: 'find',
              };
            },
          },
        ]),
      })),
    };

    const resp = await connector.find('users');
    expect(resp).toEqual([{ id: '1234', name: 'ABCD', kind: 'find' }]);
  });

  test('Should findOne item', async () => {
    connector.db = {
      collection: jest.fn().mockImplementation((collection) => ({
        doc: jest.fn().mockImplementation((id) => ({
          get: jest.fn().mockResolvedValue({
            data() {
              return {
                id: '1234',
                name: 'ABCD',
                kind: 'findOne',
              };
            },
          }),
        })),
      })),
    };

    const resp = await connector.findOne('users', '1234');
    expect(resp).toEqual({ id: '1234', name: 'ABCD', kind: 'findOne' });
  });

  test('Should create item', async () => {
    connector.db = {
      collection: jest.fn().mockImplementation((collection) => ({
        doc: jest.fn().mockImplementation((id) => ({
          set: jest
            .fn()
            .mockResolvedValue({ id: '1234', name: 'ABCD', kind: 'create' }),
        })),
      })),
    };

    const resp = await connector.create('users', { name: 'ABCD' }, '1234');
    expect(resp).toEqual({ id: '1234', name: 'ABCD', kind: 'create' });
  });

  test('Should update item', async () => {
    connector.db = {
      collection: jest.fn().mockImplementation((collection) => ({
        doc: jest.fn().mockImplementation((id) => ({
          set: jest
            .fn()
            .mockResolvedValue({ id: '1234', name: 'ABCD', kind: 'update' }),
        })),
      })),
    };

    const resp = await connector.update('users', { name: 'ABCD' }, '1234');
    expect(resp).toEqual({ id: '1234', name: 'ABCD', kind: 'update' });
  });

  test('Should delete item', async () => {
    connector.db = {
      collection: jest.fn().mockImplementation((collection) => ({
        doc: jest.fn().mockImplementation((id) => ({
          delete: jest.fn().mockResolvedValue(true),
        })),
      })),
    };

    const resp = await connector.delete('users', '1234');
    expect(resp).toBeTruthy();
  });
});
