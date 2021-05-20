const checkReservedFilename = require('../check-reserved-filename');

describe('Check Reserved Filename', () => {
  test('Should return true', async () => {
    expect(checkReservedFilename('/config/functions/test.js')).toBeTruthy();
  });

  test('Should return false', async () => {
    expect(checkReservedFilename('/config/test.js')).toBeFalsy();
  });
});
