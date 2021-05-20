const filepathToPropPath = require('../filepath-to-prop-path');

describe('Filepath To Prop Path', () => {
  test('Should returns a path (as an array) from a file path with useFileNameAsKey=true', async () => {
    const resp = filepathToPropPath('home/controllers/home.js');
    expect(resp).toEqual(['home', 'controllers', 'home']);
  });

  test('Should returns a path (as an array) from a file path with useFileNameAsKey=true and filePath startsWith "./"', async () => {
    const resp = filepathToPropPath('./home/controllers/home.js');
    expect(resp).toEqual(['home', 'controllers', 'home']);
  });

  test('Should returns a path (as an array) from a file path with useFileNameAsKey=false', async () => {
    const resp = filepathToPropPath('home/config/routes.json', false);
    expect(resp).toEqual(['home', 'config']);
  });

  test('should return list of paths', () => {
    const resp = filepathToPropPath('home/config/routes.json');
    expect(resp).toEqual(['home', 'config', 'routes']);
  });
});
