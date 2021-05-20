const templateConfiguration = require('../template-configuration.util');

describe('Template configuration util', () => {
  test('Should return template configuration', () => {
    const config = {
      server: {
        host: '0.0.0.0',
        port: 3000,
      },
      content: 'config content',
      _content: "${obj['content']}",
    };
    const resp = templateConfiguration(config);
    expect(resp).toEqual({
      server: {
        host: '0.0.0.0',
        port: 3000,
      },
      content: 'config content',
      _content: 'config content',
    });
  });
});
