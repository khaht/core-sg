const service = require('../service');

describe('Service', () => {
  test('Should create single type service', () => {
    const sgApp = {};
    const model = { kind: 'singleType', modelName: 'auth' };
    expect(service({ sgApp, model })).toEqual({ sgApp, model });
  });

  test('Should create collection type service', () => {
    const sgApp = {};
    const model = { kind: 'collectionType', modelName: 'auth' };
    expect(service({ sgApp, model })).toEqual({ sgApp, model });
  });
});
