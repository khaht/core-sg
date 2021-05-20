const middlewares = require('../index');

describe('Middlewares', () => {
  this.config = {
    middleware: {
      timeout: 1000,
      load: {
        before: ['responseTime', 'logger', 'cors', 'responses', 'gzip'],
        order: [],
        after: ['parser', 'router'],
      },
      settings: {
        bodyParser: { enabled: true, options: {} },
        boom: { enabled: false },
        cors: {
          headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
          origin: '*',
          enabled: false,
        },
        gzip: { enabled: false, options: {} },
        router: { enabled: true, prefix: '', routes: {} },
        auth: { enabled: true },
        'firebase-auth': { enabled: false },
        'http-logger': { enabled: true },
        i18n: { enabled: true },
      },
    },
  };

  test('Should load all middlewares', async () => {
    this.middleware = {
      bodyParser: {
        loaded: false,
        defaults: {
          bodyParser: {
            enabled: true,
            options: {},
          },
        },
        load: {
          initialize: jest.fn(),
          beforeInitialize: jest.fn()
        },
      },
      boom: {
        loaded: false,
        defaults: {
          responsestatus: {
            enabled: true,
            options: {},
          },
        },
        load: {
          initialize: jest.fn(),
        },
      },
      cors: {
        loaded: false,
        load: {
          initialize: jest.fn(),
        },
      },
      gzip: {
        loaded: false,
        defaults: {
          gzip: {
            enabled: false,
            options: {},
          },
        },
        load: {
          initialize: jest.fn(),
        },
      },
      router: {
        loaded: false,
        defaults: {
          router: {
            enabled: true,
            prefix: '',
            routes: {},
          },
        },
        load: {
          initialize: jest.fn(),
        },
      },
      auth: {
        loaded: false,
        defaults: {
          auth: {
            enabled: true,
          },
        },
        load: {
          initialize: jest.fn(),
        },
      },
      'firebase-auth': {
        loaded: false,
        defaults: {
          'firebase-auth': {
            enabled: false,
          },
        },
        load: {
          initialize: jest.fn(),
        },
      },
      'http-logger': {
        loaded: false,
        defaults: {
          'http-logger': {
            enabled: true,
          },
        },
        load: {
          initialize: jest.fn(),
        },
      },
      i18n: {
        loaded: false,
        defaults: {
          i18n: {
            enabled: true,
          },
        },
        load: {
          initialize: jest.fn(),
        },
      },
    };
    await middlewares.call(this);
    expect(this.middleware.bodyParser.load.initialize).toHaveBeenCalledTimes(1);
    expect(this.middleware.boom.load.initialize).toHaveBeenCalledTimes(1);
    expect(this.middleware.cors.load.initialize).toHaveBeenCalledTimes(1);
    expect(this.middleware.router.load.initialize).toHaveBeenCalledTimes(1);
    expect(this.middleware.auth.load.initialize).toHaveBeenCalledTimes(1);
    expect(
      this.middleware['http-logger'].load.initialize
    ).toHaveBeenCalledTimes(1);
    expect(this.middleware.i18n.load.initialize).toHaveBeenCalledTimes(1);
  });

  test('Should throw error if have exception', async () => {
    this.middleware = {
      i18n: {
        loaded: false,
        defaults: {
          i18n: {
            enabled: true,
          },
        },
        load: {
          initialize: jest.fn(() => Promise.reject('can not load i18n')),
        },
      },
    };

    await middlewares.call(this).catch((e) => {
      expect(e).toBe('can not load i18n');
    });
  });

  test('Should throw error if taking too long to load', async () => {
    this.middleware = {
      i18n: {
        loaded: false,
        defaults: {
          i18n: {
            enabled: true,
          },
        },
        load: {
          initialize: jest.fn(
            async () =>
              await new Promise((res) => setTimeout(() => res(true), 3000))
          ),
        },
      },
    };

    await middlewares.call(this).catch((e) => {
      expect(e.message).toBe(`(middleware: i18n) is taking too long to load.`);
    });
  });
});
