const sysinfo = require('../sysinfo.util');

describe('System info util', () => {
  test('Should log system info', () => {
    const resp = sysinfo();
    expect(resp).toBeUndefined();
  });
});
