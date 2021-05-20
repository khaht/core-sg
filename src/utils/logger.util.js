/**
 * Logger.
 */

const pino = require('pino');
const _ = require('lodash');
const env = require('@ltv/env');

const logLevels = Object.keys(pino.levels.values);

function getLogLevel() {
  if (!_.isString(process.env.LOG_LEVEL)) {
    return 'debug';
  }

  const logLevel = process.env.LOG_LEVEL.toLowerCase();

  if (!_.includes(logLevels, logLevel)) {
    const acceptedLogs = logLevels.join("', '");
    throw new Error(
      `Invalid log level set in LOG_LEVEL environment variable. Accepted values are: '${acceptedLogs}'.`
    );
  }

  return logLevel;
}

const level = getLogLevel();
let loggerConfig = {
  level,
  timestamp: env.bool('LOG_TIMESTAMP', true),
  forceColor: env.bool('LOG_FORCE_COLOR', true),
  enabled: env.bool('LOG_ENABLED', true),
};

if (env.bool('LOG_PRETTY_PRINT', true)) {
  loggerConfig = {
    ...loggerConfig,
    prettyPrint: {
      levelFirst: true,
      colorize: true,
      translateTime: true,
    },
  };
}

const logger = pino(loggerConfig);

module.exports = logger;
