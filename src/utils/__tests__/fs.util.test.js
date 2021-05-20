const path = require('path');
const fse = require('fs-extra');
const fsutil = require('../fs.util');

describe('Fs util', () => {
  const app = { dir: process.cwd() };
  const resp = fsutil(app);

  test('Should return appFs', () => {
    expect(Object.keys(resp)).toEqual([
      'writeAppFile',
      'writePluginFile',
      'removeAppFile',
    ]);
  });

  test('Should write app file', async () => {
    const optPath = ['app-fs-test', 'test.txt'];
    const content = 'Hello World!!!';
    await resp.writeAppFile(optPath, content);
    const getContent = await fse.readFile(
      path.resolve(process.cwd(), 'app-fs-test', 'test.txt'),
      'utf8'
    );
    expect(getContent).toEqual(content);
  });

  test('Should write app plugin file', async () => {
    const pluginName = 'app-fs-test';
    const optPath = ['test.txt'];
    const content = 'Hello World!!!';
    await resp.writePluginFile(pluginName, optPath, content);
    const getContent = await fse.readFile(
      path.resolve(process.cwd(), 'extensions', 'app-fs-test', 'test.txt'),
      'utf8'
    );
    expect(getContent).toEqual(content);
  });

  test('Should delete app file', async () => {
    const optPath = ['app-fs-test'];
    const optPluginPath = ['extensions', 'app-fs-test'];
    await resp.removeAppFile(optPath);
    await resp.removeAppFile(optPluginPath);
    expect(
      fse.existsSync(path.resolve(process.cwd(), 'app-fs-test'))
    ).toBeFalsy();
    expect(
      fse.existsSync(path.resolve(process.cwd(), 'extensions', 'app-fs-test'))
    ).toBeFalsy();
  });
});
