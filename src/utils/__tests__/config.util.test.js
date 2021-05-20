const { getAbsoluteServerUrl } = require('../config.util');
const lodash = require('lodash');

describe('Get absolute server url', () => {
  test('Should return localhost', () => {
    const config = {
      environment: 'development',
      server: {
        host: '127.0.0.1',
        port: '3000',
      },
    };

    const url = getAbsoluteServerUrl(config);
    expect(url).toEqual('http://localhost:3000');
  });

  test('Should return with hostName', () => {
    const config = {
      server: {
        host: 'demo.com',
        port: '3000',
      },
    };

    const url = getAbsoluteServerUrl(config);
    expect(url).toEqual('http://demo.com:3000');
  });

  test('Should return url', () => {
    const config = {
      server: {
        url: 'http://test.com',
      },
    };

    const url = getAbsoluteServerUrl(config);
    expect(url).toEqual('http://test.com');
  });

  test('Should return url with path', () => {
    const config = {
      environment: 'development',
      server: {
        url: 'test',
        host: '127.0.0.1',
        port: 4000,
      },
    };

    const url = getAbsoluteServerUrl(config);
    expect(url).toEqual('http://localhost:4000/test');
  });

  test('Should throw error if url have not to string', () => {
    lodash.trim = jest.fn((data) => data);

    const config = {
      environment: 'development',
      server: {
        url: { path: 'test' },
        host: '127.0.0.1',
        port: 4000,
      },
    };

    expect(() => getAbsoluteServerUrl(config)).toThrow();
  });

  test('Should throw error if url have not to string', () => {
    lodash.trim = jest
      .fn()
      .mockImplementationOnce((data) => data)
      .mockImplementationOnce(() => {
        throw new Error('Invalid server url config. Make sure the url defined in server.js is valid.')
      });

    const config = {
      server: {
        url: 'http://test.com',
      },
    };

    expect(() => getAbsoluteServerUrl(config)).toThrow();
  });
});
