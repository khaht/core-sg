const {
  uniq, difference, get, isUndefined, merge,
} = require('lodash');

const requiredMiddlewares = [
  // 'responses',
  'router',
  // 'logger',
  'boom',
  'cors',
  // 'cron',
  // 'xframe',
  // 'xss',
  // 'public',
  // 'favicon',
];

// eslint-disable-next-line func-names
module.exports = async function () {
  /** Utils */
  const middlewareConfig = this.config.middleware;

  // check if a middleware exists
  const middlewareExists = (key) => !isUndefined(this.middleware[key]);

  // check if a middleware is enabled
  const middlewareEnabled = (key) => requiredMiddlewares.includes(key) || get(middlewareConfig, ['settings', key, 'enabled'], false) === true;

  // list of enabled middlewares
  const enabledMiddlewares = Object.keys(this.middleware).filter(middlewareEnabled);

  // Method to initialize middlewares and emit an event.
  const initialize = (middlewareKey) => {
    if (this.middleware[middlewareKey].loaded === true) return;

    const module = this.middleware[middlewareKey].load;

    // eslint-disable-next-line consistent-return
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`(middleware: ${middlewareKey}) is taking too long to load.`)),
        middlewareConfig.timeout || 1000,
      );

      this.middleware[middlewareKey] = merge(this.middleware[middlewareKey], module);

      Promise.resolve()
        .then(() => module.initialize())
        .then(() => {
          clearTimeout(timeout);
          this.middleware[middlewareKey].loaded = true;
          resolve();
        })
        // eslint-disable-next-line consistent-return
        .catch((err) => {
          clearTimeout(timeout);

          if (err) {
            return reject(err);
          }
        });
    });
  };

  /**
   * Run init functions
   */

  // Run beforeInitialize of every middleware
  /* eslint-disable */
  await Promise.all(
    enabledMiddlewares.map((key) => {
      const { beforeInitialize } = this.middleware[key].load;
      if (typeof beforeInitialize === 'function') {
        return beforeInitialize();
      }
    }),
  );
  /* eslint-disable */

  // run the initialization of an array of middlewares sequentially
  const initMiddlewaresSeq = async (middlewareArr) => {
    for (const key of uniq(middlewareArr)) {
      await initialize(key);
    }
  };

  const middlewaresBefore = get(middlewareConfig, 'load.before', [])
    .filter(middlewareExists)
    .filter(middlewareEnabled);

  const middlewaresAfter = get(middlewareConfig, 'load.after', [])
    .filter(middlewareExists)
    .filter(middlewareEnabled);

  const middlewaresOrder = get(middlewareConfig, 'load.order', [])
    .filter(middlewareExists)
    .filter(middlewareEnabled);

  const unspecifiedMiddlewares = difference(enabledMiddlewares, middlewaresBefore, middlewaresOrder, middlewaresAfter);

  // before
  await initMiddlewaresSeq(middlewaresBefore);

  // ordered // rest of middlewares
  await Promise.all([initMiddlewaresSeq(middlewaresOrder), Promise.all(unspecifiedMiddlewares.map(initialize))]);

  // after
  await initMiddlewaresSeq(middlewaresAfter);
};
