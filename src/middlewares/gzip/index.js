/**
 * Gzip middleware
 */
const compression = require('compression');

module.exports = ({ app, config }) => ({
  /**
   * Initialize the middleware
   */
  initialize() {
    const { options = {} } = config.middleware.settings.gzip;
    app.use(compression(options));
  },
});
