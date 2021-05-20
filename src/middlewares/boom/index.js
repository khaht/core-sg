const lodash = require('lodash');
const HandlerError = require('../../error');

module.exports = ({ app }) => ({
  handlerError(_, res, next) {
    if (lodash.isObject(HandlerError)) {
      const keys = Object.keys(HandlerError);
      keys.forEach((key) => {
        res[key] = (options) => HandlerError[key](res, options);
      });
    }
    return next();
  },

  initialize() {
    app.use((_, res, next) => this.handlerError(_, res, next));
  },
});
