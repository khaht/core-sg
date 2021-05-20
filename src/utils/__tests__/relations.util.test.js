const { getRelationalFields } = require('../relations.util');
const { prop } = require('lodash/fp');

describe('Get relational fields', () => {
  test('Should get relational fields', () => {
    const relationalFields = jest.fn().mockImplementation(() => {
      return ['oneToMany'].map(prop('alias'));
    });
    const resp = relationalFields();

    expect(relationalFields).toHaveBeenCalled();
    expect(
      getRelationalFields({
        associations: [
          {
            nature: 'oneToMany',
          },
        ],
      })
    ).toEqual(resp);
  });
});
