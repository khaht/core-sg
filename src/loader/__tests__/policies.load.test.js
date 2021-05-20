const { join } = require('path');
const loadPolicies = require('../policies.load');
const {
  getConfigDir,
  removeDir,
  createFile,
} = require('../../../tests/helper');

const isAuthenticatedContent = `
module.exports = (req, res, next) => {
  if (!req.meta.isAuthenticated) {
    return res.forbidden();
  }
  return next();
};
`;

const testConfigDir = getConfigDir('test-policies');
// const configDir = getConfigDir();

describe('Load policies', () => {
  const policyAuthPath = join(testConfigDir, 'isAuthenticated.js');

  beforeAll(() => {
    createFile(policyAuthPath, isAuthenticatedContent);
  });
  afterAll(() => {
    removeDir(testConfigDir);
  });

  test('Should load policies', () => {
    const resp = loadPolicies(testConfigDir);
    expect(resp.isauthenticated).toBeInstanceOf(Function);
  });

  test('Should throw error if policy file is not a function', () => {
    createFile(join(testConfigDir, 'invalid.js'), 'module.exports = {}');
    expect(() => loadPolicies(testConfigDir)).toThrowError();
  });

  test("should return empty object if policy directory doesn't exist", () => {
    const resp = loadPolicies(testConfigDir + 'not-exist-dir');
    expect(resp).toEqual({});
  });
});
