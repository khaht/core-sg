const {
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
} = require('../index');

describe('Error', () => {
  const res = {
    status: jest.fn(() => ({
      json: jest.fn(),
    })),
  };

  test('Should return invalid token error', () => {
    expect(invalidToken(res)).toEqual({ headersSent: true });
  });

  test('Should return internal error', () => {
    expect(internalError(res)).toEqual({ headersSent: true });
  });

  test('Should return request rejected', () => {
    expect(requestRejected(res)).toEqual({ headersSent: true });
  });

  test('Should return request skipped', () => {
    expect(requestSkipped(res)).toEqual({ headersSent: true });
  });

  test('Should return validation error', () => {
    expect(validationError(res, { message: 'validation error' })).toEqual({ headersSent: true });
  });

  test('Should return validation error with message by statusCode', () => {
    expect(validationError(res, {})).toEqual({ headersSent: true });
  });

  test('Should return retry able error', () => {
    expect(retryAbleError(res, {})).toEqual({ headersSent: true });
  });

  test('Should return service not found', () => {
    expect(serviceNotFound(res)).toEqual({ headersSent: true });
  });

  test('Should return request timeout', () => {
    expect(requestTimeout(res)).toEqual({ headersSent: true });
  });

  test('Should return forbidden', () => {
    expect(forbidden(res)).toEqual({ headersSent: true });
  });

  test('Should return unAuthorized', () => {
    expect(unAuthorized(res)).toEqual({ headersSent: true });
  });

  test('Should return badRequest', () => {
    expect(badRequest(res)).toEqual({ headersSent: true });
  });
});
