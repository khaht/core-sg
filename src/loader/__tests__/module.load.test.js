const loadModule = require('../modules.load');

jest.mock('../api.load', () => jest.fn(() => Promise.resolve('loadApis')));
jest.mock('../plugins.load', () =>
  jest.fn(() => Promise.resolve('loadPlugins'))
);
jest.mock('../middleware.load', () =>
  jest.fn(() => Promise.resolve('loadMiddlewares'))
);

describe('Load module', () => {
  const sgApp = { config: {} };
  test('Should load api, plugins, middlewares, hook', async () => {
    const { api, plugins, middlewares, hook } = await loadModule(sgApp);
    expect(api).toBe('loadApis');
    expect(plugins).toBe('loadPlugins');
    expect(middlewares).toBe('loadMiddlewares');
  });
});
