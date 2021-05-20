const globLoader = require('../glob.load');
const glob = require('glob');

jest.mock('glob');
describe('glob.load', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  test('should throw error if pattern is not valid', async () => {
    glob.mockImplementation((_, cb) => cb(new Error('Test Error')));
    await expect(globLoader('/')).rejects.toThrowError();
  });

  test('should return files list', async () => {
    glob.mockImplementation((_, cb) => cb(null, ['/test.js']));
    await expect(globLoader('/')).resolves.toEqual(['/test.js']);
  });
});
