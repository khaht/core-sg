const tokgen = require('../tokgen.util');

describe('Token util', () => {
  test('Should generate token/keys', () => {
    const token = tokgen();
    expect(token.length).toBe(43);
  });
});
