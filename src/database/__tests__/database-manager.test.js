const _ = require('lodash');
const logger = require('utils/logger.util');
const { createDatabaseManager } = require('../database-manager');

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

  const DatabaseManager = createDatabaseManager(sgApp);

  test('Should return initialize=flase', () => {
    expect(DatabaseManager.initialized).toBeFalsy();
  });

  describe('Database manager initialize', () => {
    test('Should return initialize=true', async () => {
      await DatabaseManager.initialize();
      expect(DatabaseManager.initialized).toBeTruthy();
    });

    test('Should return error if call initialize function again', async () => {
      await DatabaseManager.initialize().catch((e) => {
        expect(e.message).toBe('Database manager already initialized');
      });
    });
  });

  describe('Query DB', () => {
    test('Should call query function', () => {
      DatabaseManager.connector.db.collection = jest
        .fn()
        .mockImplementation(() => 'users');
      const resp = DatabaseManager.query('users');
      expect(DatabaseManager.connector.db.collection).toHaveBeenCalled();
      expect(resp).toBe('users');
    });

    test('Should call query function and throw error when entity is null', () => {
      expect(() => DatabaseManager.query()).toThrow();
    });

    test('Should call query function and throw error when model is null', () => {
      DatabaseManager.connector.db.collection = jest
        .fn()
        .mockImplementation(() => '');
      expect(() => DatabaseManager.query('users')).toThrow();
    });

    test('Should call find function', () => {
      DatabaseManager.connector.find = jest.fn();
      DatabaseManager.find('users', {
        conditions: { email: 'test@gmail.com' },
      });
      expect(DatabaseManager.connector.find).toHaveBeenCalled();
    });

    test('Should call findOne function', () => {
      DatabaseManager.connector.findOne = jest.fn();
      DatabaseManager.findOne('users', '123456789');
      expect(DatabaseManager.connector.findOne).toHaveBeenCalled();
    });

    test('Should call create function', () => {
      DatabaseManager.connector.create = jest.fn();
      DatabaseManager.create('users', { name: 'ABC' }, '123456789');
      expect(DatabaseManager.connector.create).toHaveBeenCalled();
    });

    test('Should call update function', () => {
      DatabaseManager.connector.update = jest.fn();
      DatabaseManager.update('users', { name: 'DEF' }, '123456789');
      expect(DatabaseManager.connector.update).toHaveBeenCalled();
    });

    test('Should call delete function', () => {
      DatabaseManager.connector.delete = jest.fn();
      DatabaseManager.delete('users', '123456789');
      expect(DatabaseManager.connector.delete).toHaveBeenCalled();
    });
  });
});
