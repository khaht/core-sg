const routerChecker = require('../router/utils/routerChecker');
const logger = require('utils/logger.util');
const _ = require('lodash');

jest.mock('utils/policy.util');

const initializeApp = () => {
  global.sgApp = {
    log: logger,
    stopWithError: jest.fn(() => {
      throw new Error('error');
    }),
    controllers: { auth: { login: jest.fn(), identity: 'Auth' } },
    api: {
      auth: {
        controllers: {
          auth: {
            identity: 'Auth',
            log: {},
          },
        },
        config: {
          routes: [
            {
              method: 'POST',
              path: '/login',
              handler: 'auth.login',
              config: {
                policies: ['global::validator'],
                validator: 'validateLoginUserInput',
              },
            },
          ],
        },
      },
    },
  };
};

describe('Router checker', () => {
  beforeEach(() => {
    initializeApp();
  });
  test('should return router', () => {
    const policyUtils = require('utils/policy.util');
    policyUtils.globalPolicy = jest.fn(() => 'globalPolicy');
    policyUtils.get = jest.fn(() => 'policyUtils');

    const route = {
      method: 'POST',
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: ['global::validator'],
        validator: 'validateLoginUserInput',
      },
    };

    const resp = routerChecker(sgApp)(route);
    expect(Object.keys(resp)).toEqual([
      'method',
      'endpoint',
      'policies',
      'action',
    ]);
  });

  test('should throw error if controller is not found', () => {
    const policyUtils = require('utils/policy.util');
    policyUtils.globalPolicy = jest.fn(() => 'globalPolicy');
    policyUtils.get = jest.fn(() => 'policyUtils');

    sgApp.controllers = {};
    const route = {
      method: 'POST',
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: ['global::validator'],
        validator: 'validateLoginUserInput',
      },
    };

    try {
      routerChecker(sgApp)(route);
    } catch (error) {
      expect(error.message).toBe('error');
    }
  });

  test('should throw error if action controller is not function', () => {
    const policyUtils = require('utils/policy.util');
    policyUtils.globalPolicy = jest.fn(() => 'globalPolicy');
    policyUtils.get = jest.fn(() => 'policyUtils');

    sgApp.controllers = { auth: { login: 'login', identity: 'Auth' } };

    const route = {
      method: 'POST',
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: ['global::validator'],
        validator: 'validateLoginUserInput',
      },
    };

    try {
      routerChecker(sgApp)(route);
    } catch (error) {
      expect(error.message).toBe('error');
    }
  });

  test('should throw error if create endpoint fail', () => {
    const policyUtils = require('utils/policy.util');
    policyUtils.globalPolicy = jest.fn(() => 'globalPolicy');
    policyUtils.get = jest.fn(() => {
      throw new Error('error');
    });

    const route = {
      method: 'POST',
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: 'global::validator',
        validator: 'validateLoginUserInput',
      },
    };

    try {
      routerChecker(sgApp)(route);
    } catch (error) {
      expect(error.message).toBe('error');
    }
  });

  test('should not get policy util if config policies is undefined ', () => {
    const policyUtils = require('utils/policy.util');
    policyUtils.globalPolicy = jest.fn(() => 'globalPolicy');
    policyUtils.get = jest.fn(() => {
      throw new Error('error');
    });

    const route = {
      method: 'POST',
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: undefined,
        validator: 'validateLoginUserInput',
      },
    };

    const resp = routerChecker(sgApp)(route);
    expect(Object.keys(resp)).toEqual([
      'method',
      'endpoint',
      'policies',
      'action',
    ]);
  });
});
