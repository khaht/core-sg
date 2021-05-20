/**
 * Module dependencies
 */
const cors = require('cors');

const defaults = {
  origin: '*',
  maxAge: 31536000,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  keepHeadersOnError: false,
};

module.exports = ({ app, config }) => ({
  initialize() {
    const {
      origin,
      expose,
      maxAge,
      credentials,
      methods,
      headers,
      keepHeadersOnError,
    } = {
      ...defaults,
      ...config.get('middleware.settings.cors'),
    };

    app.use(
      cors({
        // origin: async function (req, aaa) {
        //   let originList;

        //   if (typeof origin === 'function') {
        //     originList = await origin(req);
        //   } else {
        //     originList = origin;
        //   }

        //   const whitelist = Array.isArray(originList) ? originList : originList.split(/\s*,\s*/);

        //   const requestOrigin = req.header('origin');
        //   if (whitelist.includes('*')) {
        //     return '*';
        //   }

        //   if (!whitelist.includes(requestOrigin)) {
        //     return req.throw(`${requestOrigin} is not a valid origin`);
        //   }
        //   return requestOrigin;
        // },
        origin,
        exposeHeaders: expose,
        maxAge,
        credentials,
        allowMethods: methods,
        allowHeaders: headers,
        keepHeadersOnError,
      })
    );
  },
});
