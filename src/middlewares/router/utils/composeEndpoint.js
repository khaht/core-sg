const _ = require('lodash');
const createRouteChecker = require('./routerChecker');

module.exports = (app) => {
  const routerChecker = createRouteChecker(sgApp);

  return (route, { plugin, router }) => {
    if (_.isEmpty(_.get(route, 'method')) || _.isEmpty(_.get(route, 'path'))) {
      return;
    }

    const checker = routerChecker(route, plugin);
    const { method, endpoint, policies, action } = checker;

    if (_.isUndefined(action) || !_.isFunction(action)) {
      // eslint-disable-next-line consistent-return
      return app.log.warn(
        `Ignored attempt to bind route '${route.method} ${route.path}' to unknown controller/action.`
      );
    }

    router[method](endpoint, policies, async (req, res, next) => {
      const resp = await action(req, res, next);
      if (resp && resp.headersSent) {
        return resp;
      }
      return res.json({ data: resp });
    });
  };
};
