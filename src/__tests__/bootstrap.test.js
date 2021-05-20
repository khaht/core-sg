const bootstrap = require('../bootstrap');
const createApp = require('../App');

describe('boostrap.js', () => {
  test('boostrap must be a function', () => {
    const appInstance = createApp();
    bootstrap({ ...appInstance, middleware: {} });
    expect(bootstrap).toBeInstanceOf(Function);
  });
});
