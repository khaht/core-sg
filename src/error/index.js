const HttpStatusCode = require('http-status-code');
const {
  FORBIDDEN,
  INTERNAL_ERROR,
  UN_AUTHORIZED,
  INVALID_TOKEN,
  SERVICE_NOT_FOUND,
  REQUEST_SKIPPED,
  REQUEST_REJECTED,
  REQUEST_TIMEOUT,
  VALIDATION_ERROR,
  BAD_REQUEST,
} = require('../constants');

const getHttpMsg = (statusCode) => HttpStatusCode.getMessage(statusCode);

const getAnyMsg = (anyMsg, statusCode = 400) => {
  let message = anyMsg;
  if (typeof anyMsg === 'object') {
    message = anyMsg.message || getHttpMsg(statusCode);
  }
  return !!message ? message : getHttpMsg(statusCode);
};

const resStatus = (
  res,
  options = { type: INTERNAL_ERROR, statusCode: 500, message: getHttpMsg(500) }
) => {
  const { type, statusCode, message } = options;
  res.status(statusCode).json({
    message,
    type,
    statusCode,
  });
  return {
    headersSent: true,
  };
};

const internalError = (res) => resStatus(res);

const forbidden = (res) =>
  resStatus(res, {
    type: FORBIDDEN,
    statusCode: 403,
    message: getHttpMsg(403),
  });

const unAuthorized = (res) =>
  resStatus(res, {
    type: UN_AUTHORIZED,
    statusCode: 401,
    message: getHttpMsg(401),
  });

const invalidToken = (res) =>
  resStatus(res, {
    type: INVALID_TOKEN,
    statusCode: 401,
    message: getHttpMsg(401),
  });

const serviceNotFound = (res) =>
  resStatus(res, {
    type: SERVICE_NOT_FOUND,
    statusCode: 404,
    message: getHttpMsg(404),
  });

const requestTimeout = (res) =>
  resStatus(res, {
    type: REQUEST_TIMEOUT,
    statusCode: 504,
    message: getHttpMsg(504),
  });

const requestSkipped = (res) =>
  resStatus(res, {
    type: REQUEST_SKIPPED,
    statusCode: 514,
    message: getHttpMsg(514),
  });

const requestRejected = (res) =>
  resStatus(res, {
    type: REQUEST_REJECTED,
    statusCode: 503,
    message: getHttpMsg(503),
  });

const validationError = (res, options) =>
  resStatus(res, {
    type: VALIDATION_ERROR,
    statusCode: 422,
    message: getAnyMsg(options, 422),
  });

const badRequest = (res, options) =>
  resStatus(res, {
    type: BAD_REQUEST,
    statusCode: 400,
    message: getAnyMsg(options),
  });

const retryAbleError = (res, options) =>
  resStatus(res, {
    type: options.type || INTERNAL_ERROR,
    statusCode: options.statusCode || 500,
    message: options.message || getHttpMsg(500),
  });

module.exports = {
  invalidToken,
  internalError,
  requestRejected,
  requestSkipped,
  validationError,
  retryAbleError,
  serviceNotFound,
  requestTimeout,
  forbidden,
  unAuthorized,
  badRequest,
};
