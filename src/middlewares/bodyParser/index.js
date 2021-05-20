const bodyParser = require('body-parser');

module.exports = ({ app, log }) => ({
  initialize() {
    log.debug('bodyParser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
  },
});
