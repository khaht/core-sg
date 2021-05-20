const gzip = require('../gzip');

describe('Gzip', () => {
  const app = { use: jest.fn() };
  const config = { middleware: { settings: { gzip: {} } } };
  const { initialize } = gzip({ app, config });
  test('Should init gzip', () => {
    expect(initialize).toBeDefined();
    expect(typeof initialize).toBe('function');
  });

  test('Should call initialize', () => {
    initialize();
    expect(app.use).toHaveBeenCalledTimes(1);
  });
});
