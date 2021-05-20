const loadMiddleware = require('../middleware.load');
const logger = require('utils/logger.util');

describe('Load middleware', () => {
  const app = {
    log: logger,
    config: {
      installedMiddlewares: ['test'],
      appPath: process.cwd(),
    },
    app: {
      use: jest.fn(),
    }
  };

  test('Should load all middleware', async () => {
    const resp = await loadMiddleware(app);
    expect(Object.keys(resp)).toEqual([
      'bodyParser',
      'boom',
      'cors',
      'gzip',
      'router',
      'auth',
      'firebase-auth',
      'http-logger',
      'i18n',
    ]);
  });

  test('Should call load and initialize for bodyParser middleware', async () => {
    const { bodyParser = {} } = await loadMiddleware(app);
    const { load = {} } = bodyParser;
    const { initialize = undefined } = load;
    expect(initialize).toBeDefined();
    expect(typeof initialize).toBe('function');

    initialize();
    expect(app.app.use).toHaveBeenCalledTimes(2);
  });
});
