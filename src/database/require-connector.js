const path = require('path');
const VError = require('verror');

/**
 * Requires a database connector
 * @param {string} connector connector name
 * @param {DatabaseManager} databaseManager reference to the database manager
 */
module.exports = function requireConnector(connector) {
  sgApp.log.debug(`connector: ${connector}`);
  if (!connector) {
    throw new VError(
      { name: 'ConnectorError' },
      'initialize connector without name'
    );
  }

  try {
    // return require(`sgapp-connector-${connector}`);
    const connectorPath = path.resolve(__dirname, 'connector', connector);
    return require(connectorPath);
  } catch (error) {
    throw new VError(
      { name: 'ConnectorError', cause: error },
      'initialize connector "%s"',
      connector
    );
  }
};
