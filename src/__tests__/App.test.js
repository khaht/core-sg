const sgApp = require('../App');

describe('Init App', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  test('Should initial App', () => {
    const app = sgApp();
    expect(Object.keys(app)).toEqual([
      'app',
      'router',
      'server',
      'log',
      'dir',
      'admin',
      'plugins',
      'config',
      'isLoaded',
      'fs',
      'eventHub',
    ]);
  });

  describe('InitServer error', () => {
    test('Should initServer error', async () => {
      const app = sgApp();
      app.log.error = jest.fn(() => 'error');
      app.server._events.error('error');
      expect(app.log.error).toHaveBeenCalledTimes(1);
    });

    test('Should initServer error when the port is already used by another application.', async () => {
      const app = sgApp();
      app.stopWithError = jest.fn();
      app.server._events.error({ code: 'EADDRINUSE', port: 4000 });
      expect(app.stopWithError).toHaveBeenCalledTimes(1);
    });

    test('Should initServer, connect and destroy server.', async () => {
      const cb = jest.fn();
      const app = sgApp();
      const conn = {
        remoteAddress: 'localhost',
        remotePort: 4000,
        on: jest.fn(),
        destroy: jest.fn(),
      };
      app.server.close = jest.fn();

      app.initServer();
      app.server._events.connection[1](conn);
      app.server.destroy(cb);
      expect(conn.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Listen behaviors to the server', () => {
    test('should call listen function, listen on port and host', () => {
      const app = sgApp();
      app.server.listen = jest.fn();
      app.listen();
      expect(app.server.listen).toHaveBeenCalledTimes(1);
    });

    test('should call listen function, listen on socket', () => {
      const app = sgApp();
      app.server.listen = jest.fn();
      app.config.get = jest.fn((key) => {
        if (key == 'server.socket') return 'server.socket';
      });
      app.listen();
      expect(app.server.listen).toHaveBeenCalledTimes(1);
      expect(app.config.get).toHaveBeenCalledTimes(1);
    });

    test('should call listenErrHandler', () => {
      const cb = jest.fn();
      const app = sgApp();
      app.logStartupMessage = jest.fn();
      app.server.listen = jest.fn((listen, callback) => {
        if (listen == 'error') callback();
      });
      app.config.get = jest.fn((key) => {
        if (key == 'server.socket') return 'error';
      });
      app.listen(cb);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(app.server.listen).toHaveBeenCalledTimes(1);
      expect(app.config.get).toHaveBeenCalledTimes(1);
      expect(app.logStartupMessage).toHaveBeenCalledTimes(1);
    });

    test('should call listenErrHandler with a error', () => {
      const app = sgApp();
      app.stopWithError = jest.fn();
      app.server.listen = jest.fn((listen, callback) => {
        if (listen == 'error') callback('error');
      });
      app.config.get = jest.fn((key) => {
        if (key == 'server.socket') return 'error';
      });
      app.listen();
      expect(app.server.listen).toHaveBeenCalledTimes(1);
      expect(app.config.get).toHaveBeenCalledTimes(1);
      expect(app.stopWithError).toHaveBeenCalledTimes(1);
    });

    test('should call listenErrHandler with HIDE_STARTUP_MESSAGE=true', () => {
      process.env.HIDE_STARTUP_MESSAGE = true;
      const app = sgApp();
      app.server.listen = jest.fn((listen, callback) => {
        if (listen == 'error') callback();
      });
      app.config.get = jest.fn((key) => {
        if (key == 'server.socket') return 'error';
      });
      app.listen();
      expect(app.server.listen).toHaveBeenCalledTimes(1);
      expect(app.config.get).toHaveBeenCalledTimes(1);
    });

    test('should call listenErrHandler with HIDE_STARTUP_MESSAGE=false', () => {
      process.env.HIDE_STARTUP_MESSAGE = false;
      const app = sgApp();
      app.logStartupMessage = jest.fn();
      app.server.listen = jest.fn((listen, callback) => {
        if (listen == 'error') callback();
      });
      app.config.get = jest.fn((key) => {
        if (key == 'server.socket') return 'error';
      });
      app.listen();
      expect(app.server.listen).toHaveBeenCalledTimes(1);
      expect(app.config.get).toHaveBeenCalledTimes(1);
      expect(app.logStartupMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Server connection', () => {
    test('should connection to server', () => {
      const app = sgApp();
      const conn = {
        remoteAddress: 'localhost',
        remotePort: 4000,
        on: jest.fn((type, callback) => {
          if (type == 'close') {
            callback();
          }
        }),
      };
      app.server._events.connection[1](conn);
      expect(conn.on).toHaveBeenCalledTimes(1);
    });
  });

  describe('Stop WithError', () => {
    test('Should call stopWithError function with customMessage', async () => {
      const app = sgApp();
      app.stop = jest.fn();
      app.log.error = jest.fn();
      app.stopWithError('error', 'customMessage');
      expect(app.stop).toHaveBeenCalledTimes(1);
      expect(app.log.error).toHaveBeenCalledTimes(2);
    });

    test('Should call stopWithError function with does not have customMessage', async () => {
      const app = sgApp();
      app.stop = jest.fn();
      app.log.error = jest.fn();
      app.stopWithError('error');
      expect(app.stop).toHaveBeenCalledTimes(1);
      expect(app.log.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Stop app', () => {
    test('Should call stop function', async () => {
      const app = sgApp();
      process.exit = jest.fn();
      app.stop();
      expect(process.exit).toHaveBeenCalledTimes(1);
    });

    test('Should call stop function in case does not have server destroy function', async () => {
      const app = sgApp();
      delete app.server.destroy;
      process.exit = jest.fn();
      app.stop();
      expect(process.exit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Start app', () => {
    test('Should call start function', async () => {
      const app = sgApp();
      const cb = jest.fn();
      app.load = jest.fn();
      app.listen = jest.fn();
      await app.start(cb);
      expect(app.load).toHaveBeenCalledTimes(1);
      expect(app.listen).toHaveBeenCalledTimes(1);
      expect(app.listen).toHaveBeenCalledWith(cb);
    });

    test('Should call start function and not call load', async () => {
      const app = sgApp();
      const cb = jest.fn();
      app.listen = jest.fn();
      app.isLoaded = true;
      await app.start(cb);
      expect(app.listen).toHaveBeenCalledTimes(1);
      expect(app.listen).toHaveBeenCalledWith(cb);
    });

    test('Should call start function and throw error', async () => {
      const app = sgApp();
      const cb = jest.fn();
      app.load = jest.fn();
      app.listen = jest.fn(() => {
        throw new Error('error');
      });
      app.stopWithError = jest.fn();
      await app.start(cb);
      expect(app.load).toHaveBeenCalledTimes(1);
      expect(app.listen).toHaveBeenCalledTimes(1);
      expect(app.stopWithError).toHaveBeenCalledTimes(1);
      expect(app.listen).toHaveBeenCalledWith(cb);
    });
  });

  describe('Destroy app', () => {
    test('Should call destroy function', async () => {
      const app = sgApp();
      app.db = { destroy: jest.fn() };
      app.plugins = { plugin1: { destroy: jest.fn() }, plugin2: {} };
      app.eventHub.removeAllListeners = jest.fn();
      app.admin.destroy = jest.fn();
      await app.destroy();
      expect(app.admin.destroy).toHaveBeenCalledTimes(1);
      expect(app.db.destroy).toHaveBeenCalledTimes(1);
      expect(app.plugins.plugin1.destroy).toHaveBeenCalledTimes(1);
    });

    test('Should call destroy function in case else', async () => {
      const app = sgApp();
      app.plugins = { plugin1: { destroy: jest.fn() }, plugin2: {} };
      app.eventHub.removeAllListeners = jest.fn();
      delete app.server.destroy;
      delete app.admin;
      await app.destroy();
      expect(app.plugins.plugin1.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Load App', () => {
    test('Should call load function', async () => {
      const app = sgApp();
      app.app = { use: jest.fn() };
      await app.load();
      expect(app.app.use).toHaveBeenCalled();
    });

    test('Should call load function with mode dev', async () => {
      process.env.NODE_ENV = 'development';
      const app = sgApp();
      app.app = { use: jest.fn() };
      await app.load();
      expect(app.app.use).toHaveBeenCalled();
    });
  });

  test('should call health function and go to next function', async () => {
    const app = sgApp();
    const req = {};
    const res = { status: jest.fn() };
    const next = jest.fn();
    await app.health(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should call health function and return status 204', async () => {
    const app = sgApp();
    const req = { url: '/_health', method: 'HEAD' };
    const res = { status: jest.fn().mockImplementation((status) => status) };
    const next = jest.fn();
    const resp = await app.health(req, res, next);
    expect(resp).toBe(204);
    expect(res.status).toHaveBeenCalledTimes(1);
  });

  test('should call serverError function and return status 500', async () => {
    const app = sgApp();
    const err = {};
    const req = {};
    const res = {
      status: jest.fn().mockImplementation((status) => ({
        send: jest.fn().mockImplementation((message) => message),
      })),
    };
    app.serverError(err, req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
  });

  test('Should call logStartupMessage function', async () => {
    const app = sgApp();
    app.logStartupMessage();
  });

  describe('Run Bootstrap Functions', () => {
    test('should execBootstrap return undefined', async () => {
      const app = sgApp();
      app.plugins = {
        email: { config: { functions: { bootstrap: null } } },
      };

      await app.runBootstrapFunctions();
    });

    test('should run Bootstrap function is fail', async () => {
      const app = sgApp();
      app.stop = jest.fn();
      app.plugins = {
        email: { config: { functions: { bootstrap: 'bootstrap' } } },
      };

      await app.runBootstrapFunctions();
      expect(app.stop).toHaveBeenCalledTimes(1);
    });
  });

  test('should call freeze function', () => {
    const app = sgApp();
    app.freeze();
  });

  describe('Call database', () => {
    const app = sgApp();
    test('should return get model', () => {
      app.db = {
        getModel: jest.fn(() => 'model'),
      };
      expect(app.getModel()).toBe('model');
      expect(app.db.getModel).toHaveBeenCalledTimes(1);
    });

    test('should return query', () => {
      app.db = {
        query: jest.fn(() => 'query'),
      };
      expect(app.query()).toBe('query');
      expect(app.db.query).toHaveBeenCalledTimes(1);
    });
  });
});
