/* eslint-disable */
const _ = require('lodash');

const { createQuery } = require('./queries');
const createConnectorRegistry = require('./connector-registry');
const constants = require('./constants');
const { validateModelSchemas } = require('./validation');

class DatabaseManager {
  constructor(sgApp) {
    this.sgApp = sgApp;

    this.initialized = false;

    this.connectors = createConnectorRegistry({
      connections: sgApp.config.get('database.connections'),
      defaultConnection: sgApp.config.get('database.defaultConnection'),
    });

    this.queries = new Map();
    this.models = new Map();
  }

  async initialize() {
    if (this.initialized === true) {
      throw new Error('Database manager already initialized');
    }

    this.initialized = true;

    this.connectors.load();

    validateModelSchemas({ sgApp: this.sgApp, manager: this });

    await this.connectors.initialize();

    this.initializeModelsMap();

    return this;
  }

  async destroy() {
    await Promise.all(this.connectors.getAll().map((connector) => connector.destroy()));
  }

  initializeModelsMap() {
    Object.keys(this.sgApp.models).forEach((modelKey) => {
      const model = this.sgApp.models[modelKey];
      this.models.set(model.uid, model);
    });

    Object.keys(this.sgApp.plugins).forEach((pluginKey) => {
      Object.keys(this.sgApp.plugins[pluginKey].models).forEach((modelKey) => {
        const model = this.sgApp.plugins[pluginKey].models[modelKey];
        this.models.set(model.uid, model);
      });
    });
  }

  query(entity, plugin) {
    if (!entity) {
      throw new Error('argument entity is required');
    }

    const normalizedName = entity.toLowerCase();

    // get by uid or name / plugin
    const model = this.models.has(entity)
      ? this.models.get(entity)
      : this.getModel(normalizedName, plugin);

    if (!model) {
      throw new Error(`The model ${entity} can't be found.`);
    }

    if (this.queries.has(model.uid)) {
      return this.queries.get(model.uid);
    }

    const connectorQuery = this.connectors
      .get(model.orm)
      .queries({ model, modelKey: model.modelName, sgApp });

    const query = createQuery({
      connectorQuery,
      model,
    });

    this.queries.set(model.uid, query);
    return query;
  }

  getModel(name, plugin) {
    const key = _.toLower(name);

    if (this.models.has(key)) return this.models.get(key);

    if (plugin === 'admin') {
      return _.get(sgApp.admin, ['models', key]);
    }

    if (plugin) {
      return _.get(sgApp.plugins, [plugin, 'models', key]);
    }

    return _.get(sgApp, ['models', key]) || _.get(sgApp, ['components', key]);
  }

  getModelByAssoc(assoc) {
    return this.getModel(assoc.collection || assoc.model, assoc.plugin);
  }

  getModelByCollectionName(collectionName) {
    return Array.from(this.models.values())
      .find((model) => model.collectionName === collectionName);
  }

  getModelByGlobalId(globalId) {
    return Array.from(this.models.values()).find((model) => model.globalId === globalId);
  }

  getModelsByAttribute(attr) {
    if (attr.type === 'component') {
      return [this.getModel(attr.component)];
    }
    if (attr.type === 'dynamiczone') {
      return attr.components.map((compoName) => this.getModel(compoName));
    }
    if (attr.model || attr.collection) {
      return [this.getModelByAssoc(attr)];
    }

    return [];
  }

  getModelsByPluginName(pluginName) {
    if (!pluginName) {
      return sgApp.models;
    }

    return pluginName === 'admin' ? sgApp.admin.models : sgApp.plugins[pluginName].models;
  }

  getReservedNames() {
    return {
      models: constants.RESERVED_MODEL_NAMES,
      attributes: [
        ...constants.RESERVED_ATTRIBUTE_NAMES,
        ...(sgApp.db.connectors.default.defaultTimestamps || []),
      ],
    };
  }
}

function createDatabaseManager(sgApp) {
  return new DatabaseManager(sgApp);
}

module.exports = {
  createDatabaseManager,
};
