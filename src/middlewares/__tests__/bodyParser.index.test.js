const bodyParser = require('../bodyParser/index');
const logger = require('utils/logger.util');

describe('Body parser', () => {
  const app = { use: jest.fn() };
  const log = logger;
  const { initialize } = bodyParser({ app, log });
  test('Should init bodyParser', () => {
    expect(initialize).toBeDefined();
    expect(typeof initialize).toBe('function');
  });

  test('Should call initialize', () => {
    initialize();
    expect(app.use).toHaveBeenCalledTimes(2);
  });
});
