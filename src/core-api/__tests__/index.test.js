const { createCoreApi } = require('../index');

describe('Core API', () => {
  test('Should create core API with single type', () => {
    const sgApp = {};
    const model = { kind: 'singleType', modelName: 'auth' };
    const api = { auth: jest.fn() };
    expect(createCoreApi({ sgApp, model, api })).toEqual({
      service: { model, sgApp },
      controller: {
        model,
        service: { model, sgApp },
      },
    });
  });

  test('Should create core API with collection type', () => {
    const sgApp = {};
    const model = { kind: 'collectionType', modelName: 'auth' };
    const api = { auth: jest.fn() };
    expect(createCoreApi({ sgApp, model, api })).toEqual({
      service: { model, sgApp },
      controller: {
        model,
        service: { model, sgApp },
      },
    });
  });
});
