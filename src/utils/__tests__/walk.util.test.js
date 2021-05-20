const walk = require('../walk.util');
const path = require('path');

describe('Walk util', () => {
  test('Should Walk util', () => {
    const dir = path.resolve(process.cwd(), 'config', 'functions');
    const _loadder = jest.fn().mockImplementation((file) => {
      try {
        return require(file);
      } catch (error) {
        throw new Error(`Could not load function ${file}: ${error.message}`);
      }
    });

    const resp = walk(dir, { loader: _loadder });
    expect(Object.keys(resp)).toEqual(['bootstrap', 'cron', 'responses', 'validator.load']);
  });

  test('Should throw error if loader must not be a function', () => {
    const dir = path.resolve(process.cwd(), 'config', 'functions');
    expect(() => walk(dir)).toThrow()
  });
});
