const logger = require('utils/logger.util');
const requireConnector = require('../require-connector');

describe('Require connector', () => {
  global.sgApp = {
    log: logger,
  };

  test('Should require a database connector', () => {
    const resp = requireConnector('firebase');
    expect(typeof resp).toBe('function');
  });

  test('Should throw error when connector is null', () => {
    expect(() => requireConnector()).toThrowError();
  });

  test('Should throw error when connector is not exists', () => {
    expect(() => requireConnector('db_test')).toThrowError();
  });

  test('shoud throw error when connector is not provided', () => {
    expect(() => requireConnector()).toThrowError();
  });
});
