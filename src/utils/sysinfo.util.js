const os = require('os');
const clui = require('clui');
const pretty = require('pretty-bytes');
const logger = require('./logger.util');

module.exports = () => {
  const { Gauge } = clui;
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const human = pretty(free);

  logger.info(`CPU:\t\tArch: ${os.arch()}, Cores: ${os.cpus().length}`);
  logger.info(`Memory:\t\t${Gauge(used, total, 20, total * 0.8, `${human} free`)}`);
  logger.info(`OS:\t\t${os.platform()} (${os.type()})`);
};
