const createWebhookRunner = require('../webhook-runner');
const createEventHub = require('../event-hub');
const logger = require('utils/logger.util');
const _ = require('lodash');

jest.mock('node-fetch', () =>
  jest
    .fn()
    .mockImplementationOnce(() =>
      Promise.resolve({
        ok: 'Ok',
        status: 200,
        text: jest.fn(() => Promise.resolve('text')),
      })
    )
    .mockImplementationOnce(() =>
      Promise.resolve({
        status: 200,
        text: jest.fn(() => Promise.resolve('text')),
      })
    )
    .mockImplementationOnce(() =>
      Promise.reject(false)
    )
);

describe('Create webhook runner', () => {
  test('Should return constructor object', () => {
    const opts = { eventHub: createEventHub(), logger };
    const _webhookRunner = createWebhookRunner(opts);
    _webhookRunner.queue.enqueue([]);

    expect(Object.keys(_webhookRunner)).toEqual([
      'eventHub',
      'logger',
      'webhooksMap',
      'listeners',
      'config',
      'queue',
    ]);
  });

  test('Should pop worker queue and execute', () => {
    const opts = { eventHub: createEventHub(), logger, configuration: {} };
    const _webhookRunner = createWebhookRunner(opts);
    _webhookRunner.queue.concurrency = 0;
    _webhookRunner.queue.enqueue([{ event: 'test', info: 'info' }]);
    _webhookRunner.queue.pop();
    expect(_webhookRunner.queue.queue).toEqual([]);
  });

  test('Should configuration does not object', () => {
    const opts = {
      eventHub: createEventHub(),
      logger,
      configuration: 'configuration',
    };
    expect(() => createWebhookRunner(opts)).toThrow();
  });

  test('Should create or delete event', () => {
    const opts = { eventHub: createEventHub(), logger, configuration: {} };
    const _webhookRunner = createWebhookRunner(opts);

    _webhookRunner.createListener('test');
    _webhookRunner.eventHub._events.test();
    expect(_webhookRunner.listeners.has('test')).toBe(true);

    _webhookRunner.deleteListener('test');
    _webhookRunner.deleteListener('test');// else branch
    expect(_webhookRunner.listeners.has('test')).toBe(false);
  });

  test('Should not create event if existed', () => {
    const opts = { eventHub: createEventHub(), logger, configuration: {} };
    const _webhookRunner = createWebhookRunner(opts);

    _webhookRunner.createListener('test');
    expect(_webhookRunner.listeners.has('test')).toBe(true);

    const resp = _webhookRunner.createListener('test');
    expect(resp).toBeUndefined();
  });

  test('Should add update delete executeListener a webhook', async () => {
    const opts = { eventHub: createEventHub(), logger, configuration: {} };
    const _webhookRunner = createWebhookRunner(opts);

    _webhookRunner.add({ id: 'webhookId', events: ['test', 'test'] });
    expect(_webhookRunner.webhooksMap.has('test')).toBe(true);

    _webhookRunner.add({ id: 'webhookId1', events: ['test1'] });
    _webhookRunner.remove({ id: 'webhookId1', events: ['test1'] });
    expect(_webhookRunner.webhooksMap.has('test1')).toBe(false);

    _webhookRunner.update({
      id: 'webhookId',
      events: ['test1'],
      isEnabled: true,
      url: 'url',
      headers: {},
    });
    expect(_webhookRunner.webhooksMap.has('test1')).toBe(true);

    await _webhookRunner.executeListener({ event: 'test1' });
    expect(require('node-fetch')).toHaveBeenCalledTimes(1);
    await _webhookRunner.executeListener({ event: 'test1', info: 'info' });
    expect(require('node-fetch')).toHaveBeenCalledTimes(2);
    await _webhookRunner.executeListener({ event: 'test1', info: 'info' });
    expect(require('node-fetch')).toHaveBeenCalledTimes(3);
  });

  test('Should log error after executeListener', async () => {
    const opts = { eventHub: createEventHub(), logger, configuration: {} };
    const _webhookRunner = createWebhookRunner(opts);
    _webhookRunner.add({ id: 'webhookId', events: ['test'] });
    _webhookRunner.update({
      id: 'webhookId',
      events: ['test1'],
      isEnabled: true,
      url: 'url',
      headers: {},
    });
    _webhookRunner.run = jest.fn(() => Promise.reject(false));
    await _webhookRunner.executeListener({ event: 'test1', info: 'info' });
    expect(_webhookRunner.run).toHaveBeenCalledTimes(1);
  });
});
