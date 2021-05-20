const composeEndpoint = require('../router/utils/composeEndpoint');
const logger = require('utils/logger.util');

jest.mock('../router/utils/routerChecker');

describe('Compose endpoint', () => {
  global.sgApp = {
    log: logger,
    stopWithError: jest.fn(),
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

  // afterEach(() => {
  //   jest.resetModules();
  //   jest.restoreAllMocks();
  // });

  test('should compose endpoint', () => {
    const createRouteChecker = require('../router/utils/routerChecker');
    createRouteChecker.mockReturnValueOnce(
      jest.fn(() => ({
        method: 'post',
        endpoint: '/login',
        policies: jest.fn((req, res, next) => next()),
        action: jest.fn(),
      }))
    );

    const route = {
      method: 'POST',
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: ['global::validator'],
        validator: 'validateLoginUserInput',
      },
    };

    const router = {
      post: jest.fn(),
    };

    composeEndpoint({ log: logger })(route, { router });
    expect(router.post).toHaveBeenCalledTimes(1);
  });

  test('should return undefined when method is empty', () => {
    const route = {
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: ['global::validator'],
        validator: 'validateLoginUserInput',
      },
    };

    const router = {
      post: jest.fn(),
    };

    expect(composeEndpoint({ log: logger })(route, { router })).toBeUndefined();
  });

  test('should return undefined when path is empty', () => {
    const route = {
      method: 'POST',
      handler: 'auth.login',
      config: {
        policies: ['global::validator'],
        validator: 'validateLoginUserInput',
      },
    };

    const router = {
      post: jest.fn(),
    };

    expect(composeEndpoint({ log: logger })(route, { router })).toBeUndefined();
  });

  test('should return warn log when action is undefined', () => {
    const createRouteChecker = require('../router/utils/routerChecker');
    createRouteChecker.mockReturnValueOnce(
      jest.fn(() => ({
        method: 'post',
        endpoint: '/login',
        policies: jest.fn((req, res, next) => next()),
        action: undefined,
      }))
    );

    const route = {
      method: 'POST',
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: ['global::validator'],
        validator: 'validateLoginUserInput',
      },
    };

    const router = {
      post: jest.fn(),
    };

    expect(composeEndpoint({ log: logger })(route, { router })).toBeUndefined();
  });

  test('should return warn log when action is not function', () => {
    const createRouteChecker = require('../router/utils/routerChecker');
    createRouteChecker.mockReturnValueOnce(
      jest.fn(() => ({
        method: 'post',
        endpoint: '/login',
        policies: jest.fn((req, res, next) => next()),
        action: 'action',
      }))
    );

    const route = {
      method: 'POST',
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: ['global::validator'],
        validator: 'validateLoginUserInput',
      },
    };

    const router = {
      post: jest.fn(),
    };

    expect(composeEndpoint({ log: logger })(route, { router })).toBeUndefined();
  });

  test('should call router and response json data', () => {
    const checker = {
      method: 'post',
      endpoint: '/login',
      policies: jest.fn((req, res, next) => next()),
      action: jest.fn(),
    };
    const createRouteChecker = require('../router/utils/routerChecker');
    createRouteChecker.mockReturnValueOnce(jest.fn(() => checker));

    const route = {
      method: 'POST',
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: ['global::validator'],
        validator: 'validateLoginUserInput',
      },
    };

    const express = require('express');
    const mRouter = { post: jest.fn() };
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);
    const req = {};
    const res = { json: jest.fn() };
    const next = jest.fn();
    mRouter.post.mockImplementation((path, policies, callback) => {
      if (path === '/login') {
        callback(req, res, next);
      }
    });

    composeEndpoint({ log: logger })(route, { router: mRouter });
    expect(checker.action).toHaveBeenCalledTimes(1);
  });

  test('should call router and response with headersSent', () => {
    const checker = {
      method: 'post',
      endpoint: '/login',
      policies: jest.fn((req, res, next) => next()),
      action: jest.fn(() => ({ headersSent: true })),
    };
    const createRouteChecker = require('../router/utils/routerChecker');
    createRouteChecker.mockReturnValueOnce(jest.fn(() => checker));

    const route = {
      method: 'POST',
      path: '/login',
      handler: 'auth.login',
      config: {
        policies: ['global::validator'],
        validator: 'validateLoginUserInput',
      },
    };

    const express = require('express');
    const mRouter = { post: jest.fn() };
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);
    const req = {};
    const res = { json: jest.fn() };
    const next = jest.fn();
    mRouter.post.mockImplementation((path, policies, callback) => {
      if (path === '/login') {
        callback(req, res, next);
      }
    });

    composeEndpoint({ log: logger })(route, { router: mRouter });
    expect(checker.action).toHaveBeenCalledTimes(1);
  });
});
