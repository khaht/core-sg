const WorkerQueue = require('../worker-queue');
const logger = require('utils/logger.util');

describe('Create worker queue', () => {
  test('Should return constructor object', () => {
    const workerQueue = new WorkerQueue();
    workerQueue.enqueue([]);

    expect(Object.keys(workerQueue)).toEqual([
      'logger',
      'worker',
      'concurrency',
      'running',
      'queue',
    ]);
  });

  test('Should subscribe', () => {
    const workerQueue = new WorkerQueue();
    workerQueue.subscribe('worker');

    expect(workerQueue.worker).toBe('worker');
  });

  test('Should pop worker queue and execute', () => {
    const workerQueue = new WorkerQueue({ concurrency: 0 });
    workerQueue.enqueue([{ event: 'test', info: 'info' }]);
    workerQueue.pop();
    expect(workerQueue.queue).toEqual([]);
  });

  test('Should log error after call execute', async () => {
    const workerQueue = new WorkerQueue({ concurrency: 0, logger });
    workerQueue.worker = jest.fn(() => {
      throw new Error('error');
    });
    workerQueue.logger.error = jest.fn((error) => error);
    await workerQueue.execute();
    expect(workerQueue.worker).toHaveBeenCalledTimes(1);
    expect(workerQueue.logger.error).toHaveBeenCalledTimes(1);
  });
});
