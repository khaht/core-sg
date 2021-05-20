const path = require('path');
const fse = require('fs-extra');
const apiLoad = require('../api.load');
const _ = require('lodash');

describe('API load', () => {
  test('Should throw error if not exist module', async () => {
    await apiLoad({ dir: 'test' }).catch((e) =>
      expect(e.message).toEqual(
        "Missing 'modules' folder. Please create one in your app root directory"
      )
    );
  });

  test('Should return api load', async () => {
    const names = [];
    const paths = fse.readdirSync(path.resolve(process.cwd(), 'modules'), {
      withFileTypes: true,
    });
    for (let fd of paths) {
      fd.name !== '__tests__' ? names.push(fd.name) : null;
    }
    const resp = await apiLoad({ dir: process.cwd() });
    expect(Object.keys(resp)).toEqual(names);
  });
});
