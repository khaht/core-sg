const _ = require('lodash');

describe('Logger Util', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  test('log level should be debug if LOG_LEVEL environment is not set', () => {
    process.env.LOG_LEVEL = undefined;
    process.env.LOG_ENABLED = 'true';
    const logger = require('../logger.util');

    expect(logger.level).toEqual('debug');
  });

  test('should load logger pino', () => {
    const logger = require('../logger.util');
    const v = _.pick(logger, [
      'levels',
      'silent',
      'trace',
      'debug',
      'info',
      'warn',
      'error',
      'fatal',
    ]);
    expect(v).toEqual({
      levels: expect.any(Object),
      silent: expect.any(Function),
      trace: expect.any(Function),
      debug: expect.any(Function),
      info: expect.any(Function),
      warn: expect.any(Function),
      error: expect.any(Function),
      fatal: expect.any(Function),
    });
  });

  test('should load logger pino with LOG_LEVEL default', () => {
    process.env.LOG_LEVEL = undefined;
    const logger = require('../logger.util');
    const v = _.pick(logger, [
      'levels',
      'silent',
      'trace',
      'debug',
      'info',
      'warn',
      'error',
      'fatal',
    ]);
    expect(v).toEqual({
      levels: expect.any(Object),
      silent: expect.any(Function),
      trace: expect.any(Function),
      debug: expect.any(Function),
      info: expect.any(Function),
      warn: expect.any(Function),
      error: expect.any(Function),
      fatal: expect.any(Function),
    });
  });

  test('should throw error when invalid log level', () => {
    process.env.LOG_LEVEL = 'test';
    expect(() => require('../logger.util')).toThrowError();
  });
});
