const { join } = require('path');
const loadConfig = require('../config-files.load');

describe('Load Config', () => {
  test('Should load api configs', async () => {
    const apiDir = join(process.cwd(), 'modules');
    const apiConfigs = await loadConfig(apiDir, '*/config/**/*.*(js|json)');
    Object.keys(apiConfigs).forEach((item) => {
      expect(apiConfigs[item].hasOwnProperty('config')).toBeTruthy();
    });
  });

  test('Should load api configs with default pattern', async () => {
    const apiDir = join(process.cwd(), 'modules');
    const apiConfigs = await loadConfig(apiDir);
    Object.keys(apiConfigs).forEach((item) => {
      expect(apiConfigs[item].hasOwnProperty('config')).toBeTruthy();
    });
  });
});
