const { join } = require('path');
const loadFiles = require('../files.load');

jest.mock('../filepath-to-prop-path', () =>
  jest.fn(() => ['item1', 'item2']).mockImplementationOnce(() => [])
);

describe('Load Files', () => {
  test('Should load files', async () => {
    const apiDir = join(process.cwd(), 'modules');
    const apiConfigs = await loadFiles(apiDir, '*/!(config)/**/*.*(js|json)');
    Object.keys(apiConfigs).forEach((item) => {
      expect(apiConfigs[item].hasOwnProperty('config')).toBeFalsy();
    });
  });
});
