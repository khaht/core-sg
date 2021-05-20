const _ = require('lodash');
const loadPlugins = require('../plugins.load');

describe('Load Plugins', () => {
  const defaultConfig = {
    plugins: {
      email: {
        provider: 'nodemailer',
        providerOptions: {
          host: 'smtp.gmail.com',
          port: '587',
          auth: {
            user: 'no-reply@c-plus.cloud',
            pass: ",/IX>U.tABm~y'I$%Py^wZ`8x\\b7+5=L",
          },
        },
        settings: {
          defaultFrom: 'no-reply@c-plus.cloud',
          defaultReplyTo: 'no-reply@c-plus.cloud',
        },
      },
    },
    installedPlugins: []
  };

  const config = {
    ...defaultConfig,
    get(path, defaultValue) {
      return _.get(defaultConfig, path, defaultValue);
    },

    set(path, val) {
      _.set(defaultConfig, path, val);
      return this;
    },

    has(path) {
      return _.has(defaultConfig, path);
    },
  };

  test('Should Load Plugins', async () => {
    const resp = await loadPlugins({ dir: process.cwd(), config });
    expect(resp.email).not.toBeUndefined();
  });
});
