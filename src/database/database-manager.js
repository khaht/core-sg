// TODO: This is only for temporary testing

const createConnectorRegistry = require('./connector-registry');

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

    // validateModelSchemas({ sgApp: this.sgApp, manager: this });

    await this.connectors.initialize();

    this.connector = this.connectors.default;

    // this.initializeModelsMap();

    // const serviceAccount = sgApp.config.get('database.connections');

    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount.default.settings.serviceAccount),
    // });

    // this.db = admin.firestore();

    return this;
  }

  query(entity) {
    if (!entity) {
      throw new Error('argument entity is required');
    }

    const normalizedName = entity.toLowerCase();

    // get by uid or name / plugin
    const model = this.connector.db.collection(normalizedName);

    if (!model) {
      throw new Error(`The model ${entity} can't be found.`);
    }

    return model;
  }

  find(cName, query) {
    return this.connector.find(cName, query);
  }

  findOne(cName, id) {
    return this.connector.findOne(cName, id);
  }

  create(cName, data, id) {
    return this.connector.create(cName, data, id);
  }

  update(cName, data, id) {
    return this.connector.update(cName, data, id);
  }

  delete(cName, id) {
    return this.connector.delete(cName, id);
  }
}

function createDatabaseManager(sgApp) {
  return new DatabaseManager(sgApp);
}

module.exports = {
  createDatabaseManager,
};
