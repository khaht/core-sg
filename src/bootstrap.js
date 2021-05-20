/* eslint-disable no-param-reassign */
const _ = require('lodash');

const { getConfigUrls } = require('./utils/config.util');

const getKind = (obj) => obj.kind || 'collectionType';

const pickSchema = (model) => {
  const schema = _.cloneDeep(
    _.pick(model, [
      'connection',
      'collectionName',
      'info',
      'options',
      'attributes',
    ])
  );

  schema.kind = getKind(model);
  return schema;
};

module.exports = (sgApp) => {
  // Set connections.
  sgApp.connections = {};

  const defaultConnection = sgApp.config.get('database.defaultConnection');

  // Set current connections.
  sgApp.config.connections = sgApp.config.get('database.connections', {});

  sgApp.contentTypes = {};

  const apiModules = Object.keys(sgApp.api || []);

  sgApp.models = apiModules.reduce((acc, apiName) => {
    const api = sgApp.api[apiName];

    Object.keys(api.models || {}).forEach((modelName) => {
      const model = sgApp.api[apiName].models[modelName];

      Object.assign(model, {
        __schema__: pickSchema(model),
        kind: getKind(model),
        modelType: 'contentType',
        uid: `application::${apiName}.${modelName}`,
        apiName,
        modelName,
        globalId: model.globalId || _.upperFirst(_.camelCase(modelName)),
        collectionName:
          model.collectionName || `${modelName}`.toLocaleLowerCase(),
        connection: model.connection || defaultConnection,
      });

      sgApp.contentTypes[model.uid] = model;

      // TODO: Create core api (For example: Default route, controller, services)
      // const { service, controller } = createCoreApi({ model, api, sgApp });

      // _.set(sgApp.api[apiName], ['services', modelName], service);
      // _.set(sgApp.api[apiName], ['controllers', modelName], controller);

      acc[modelName] = model;
    });

    return acc;
  }, {});

  // Set controllers.
  sgApp.controllers = apiModules.reduce((acc, key) => {
    Object.keys(sgApp.api[key].controllers || {}).forEach((index) => {
      const controller = sgApp.api[key].controllers[index];
      controller.identity = controller.identity || _.upperFirst(index);
      acc[index] = controller;
    });
    return acc;
  }, {});

  // Set services.
  sgApp.services = apiModules.reduce((acc, key) => {
    Object.keys(sgApp.api[key].services || {}).forEach((index) => {
      acc[index] = sgApp.api[key].services[index];
    });
    return acc;
  }, {});

  // Set routes.
  sgApp.config.routes = apiModules.reduce(
    (acc, key) => acc.concat(_.get(sgApp.api[key], 'config.routes') || {}),
    []
  );

  // Preset config in alphabetical order.
  sgApp.config.middleware.settings = Object.keys(sgApp.middleware).reduce(
    (acc, current) => {
      // Try to find the settings in the current environment, then in the main configurations.
      const currentSettings = _.merge(
        _.cloneDeep(
          _.get(sgApp.middleware[current], ['defaults', current], {})
        ),
        sgApp.config.get(['middleware', 'settings', current], {})
      );

      acc[current] = !_.isObject(currentSettings) ? {} : currentSettings;

      // Ensure that enabled key exist by forcing to false.
      _.defaults(acc[current], { enabled: false });

      return acc;
    },
    {}
  );

  // default settings
  sgApp.config.port = sgApp.config.get('server.port') || sgApp.config.port;
  sgApp.config.host = sgApp.config.get('server.host') || sgApp.config.host;

  const { serverUrl } = getConfigUrls(sgApp.config.get('server'));

  sgApp.config.server = sgApp.config.server || {};
  sgApp.config.server.url = serverUrl;
};
