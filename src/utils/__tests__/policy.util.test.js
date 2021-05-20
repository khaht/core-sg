const { get, createPolicyFactory } = require('../policy.util');
const logger = require('../logger.util');
const createApp = require('../../App');

const initialize = async () => {
  // Create new app instance
  // const appInstance = createApp();

  // // start instance
  // await appInstance.start().then(() => logger.info('App started'));

  // console.log('app>> ', appInstance);
  // return appInstance;
  return Promise.resolve();
};

describe('Policy util', () => {
  // let app;
  // beforeAll(async () => {
  //   console.log('Haha');
  //   app = await initialize();
  //   console.log('app>>> ', app.api);
  // });

  // afterAll(async () => {
  //   app.server.destroy();
  // });

  const validator = jest.fn();

  global.sgApp = {
    config: { policies: { validator } },
    api: {
      auth: {
        controllers: { auth: [Object], 'authenticated-user': [Object] },
        services: { auth: [Object], passport: [Object], token: [Object] },
        validators: { auth: [Object], user: [Object] },
        config: { routes: [Array], __filename__: 'routes.json' },
      },
      home: {
        controllers: { home: [Object] },
        services: { home: [Object] },
        config: { routes: [Array], __filename__: 'routes.json' },
      },
      user: { models: { user: [Object] }, services: { user: [Object] } },
    },
    // policies: {
    //   isauthenticated: [Function(anonymous)],
    //   validator: [AsyncFunction(anonymous)],
    // },
  };

  describe('Get policy', () => {
    test('should get policy', () => {
      const policy = 'global::validator';
      const apiName = 'auth';
      const resp = get(policy, apiName);
      expect(resp).toEqual(validator);
    });

    test('should throw error when could not find application policy', () => {
      const policy = 'application::validator';
      const apiName = 'auth';
      expect(() => get(policy, apiName)).toThrow();
    });

    test('should throw error when could not find admin policy', () => {
      const policy = 'admin::validator';
      const apiName = 'auth';
      expect(() => get(policy, apiName)).toThrow();
    });

    test('should throw error when could not find plugins policy', () => {
      const policy = 'plugins::validator';
      const apiName = 'auth';
      expect(() => get(policy, apiName)).toThrow();
    });
  });

  describe('Create policy factory', () => {
    test('Should create policy factory', () => {
      const factoryCallback = jest.fn();
      const options = { validator: jest.fn(), name: 'home' };
      const args = [];
      createPolicyFactory(factoryCallback, options)(args);
      expect(options.validator).toHaveBeenCalledTimes(1);
      expect(factoryCallback).toHaveBeenCalledTimes(1);
    });

    test('Should throw error when create policy factory', () => {
      const factoryCallback = jest.fn();
      const options = { validator: 'home', name: 'home' };
      const args = [];
      expect(() =>
        createPolicyFactory(factoryCallback, options)(args)
      ).toThrow();
    });
  });
});
