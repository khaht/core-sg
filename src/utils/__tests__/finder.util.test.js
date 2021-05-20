const finderUtil = require('../finder.util');

describe("Find controller's location", () => {
  test('Should throw error', () => {
    expect(() => finderUtil()).toThrow();
    expect(() => finderUtil({})).toThrow();
  });

  test("Should return the API's name where the controller is located", () => {
    expect(
      finderUtil(
        {
          auth: {
            controllers: {
              auth: jest.fn(),
              'authenticated-user': jest.fn(),
            },
          },
        },
        {
          identity: 'auth',
        }
      )
    ).toBe('auth');
    expect(
      finderUtil(
        {
          auth: {
            controllers: {
              auth: jest.fn(),
              'authenticated-user': jest.fn(),
            },
          },
        },
        'auth'
      )
    ).toBe('auth');
  });

  test('should throw error if api is not a object', () => {});
});
