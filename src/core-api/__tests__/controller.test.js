const controller = require('../controller');

describe('Controller', () => {
  test('Should create single type controller', () => {
    const service = { auth: jest.fn() };
    const model = { kind: 'singleType', modelName: 'auth' };
    expect(controller({ service, model })).toEqual({ service, model });
  });

  test('Should create collection type controller', () => {
    const service = { auth: jest.fn() };
    const model = { kind: 'collectionType', modelName: 'auth' };
    expect(controller({ service, model })).toEqual({ service, model });
  });
});
