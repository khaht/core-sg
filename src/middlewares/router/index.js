const _ = require('lodash');
const createEndpointComposer = require('./utils/composeEndpoint');

module.exports = (sgApp) => {
  const composeEndpoint = createEndpointComposer(sgApp);

  return {
    initialize() {
      _.forEach(sgApp.config.routes, (route) => {
        composeEndpoint(route, { router: sgApp.router });
      });
    },
  };
};
