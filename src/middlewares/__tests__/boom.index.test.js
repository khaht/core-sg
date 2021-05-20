const boom = require('../boom');
const lodash = require('lodash');

describe('Handler error', () => {
  const app = { use: jest.fn() };
  const { initialize, handlerError } = boom({ app });
  test('Should init handler error', () => {
    expect(initialize).toBeDefined();
    expect(typeof initialize).toBe('function');
    expect(handlerError).toBeDefined();
    expect(typeof handlerError).toBe('function');
  });

  test('Should call initialize', () => {
    initialize();
    expect(app.use).toHaveBeenCalledTimes(1);
  });

  test('Should add error to response object and call next function', () => {
    lodash.isObject = jest.fn(() => true);
    const req = {};
    const res = {};
    const next = jest.fn();
    handlerError(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('Should call next function', () => {
    lodash.isObject = jest.fn(() => false);
    const req = {};
    const res = {};
    const next = jest.fn();
    handlerError(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
