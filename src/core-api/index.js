/**
 * Core API
 */

const _ = require('lodash');

const createController = require('./controller');
const createService = require('./service');

/**
 * Returns a service and a controller built based on the content type passed
 */
function createCoreApi({ api, model, sgApp }) {
  const { modelName } = model;

  // find corresponding service and controller
  const apiService = _.get(api, ['services', modelName], {});
  const apiController = _.get(api, ['controllers', modelName], {});

  const service = Object.assign(createService({ model, sgApp }), apiService);

  const controller = Object.assign(createController({ service, model }), apiController);

  return {
    service,
    controller,
  };
}

module.exports = {
  createCoreApi,
};
