const _ = require('lodash');

const getConfigUrls = (serverConfig) => {
  // Defines serverUrl value
  let serverUrl = _.get(serverConfig, 'url', '');
  serverUrl = _.trim(serverUrl, '/ ');
  if (typeof serverUrl !== 'string') {
    throw new Error(
      'Invalid server url config. Make sure the url is a string.'
    );
  }
  if (serverUrl.startsWith('http')) {
    try {
      serverUrl = _.trim(new URL(serverConfig.url).toString(), '/');
    } catch (e) {
      throw new Error(
        'Invalid server url config. Make sure the url defined in server.js is valid.'
      );
    }
  } else if (serverUrl !== '') {
    serverUrl = `/${serverUrl}`;
  }

  return {
    serverUrl,
  };
};

const getAbsoluteUrl = (adminOrServer) => (config, forAdminBuild = false) => {
  const { serverUrl, adminUrl } = getConfigUrls(config.server, forAdminBuild);
  const url = adminOrServer === 'server' ? serverUrl : adminUrl;

  if (url.startsWith('http')) {
    return url;
  }

  const hostname =
    config.environment === 'development' &&
    ['127.0.0.1', '0.0.0.0'].includes(config.server.host)
      ? 'localhost'
      : config.server.host;

  return `http://${hostname}:${config.server.port}${url}`;
};

module.exports = {
  getConfigUrls,
  getAbsoluteServerUrl: getAbsoluteUrl('server'),
};
