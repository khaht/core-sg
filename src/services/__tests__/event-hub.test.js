const createEventHub = require('../event-hub');

const EventEmitter = require('events');
class EventHub extends EventEmitter { }

describe('Create event hub', () => {
  test('Should return constructor eventHub', () => {
    const _createEventHub = createEventHub();

    const fn = jest.fn().mockImplementation((opts) => {
      return new EventHub(opts);
    });
    const _EventHubJest = fn();

    expect(fn).toHaveBeenCalled();
    expect(_createEventHub).toEqual(_EventHubJest);
  });
});
