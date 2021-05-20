/**
 * The event hub is App's event control center.
 */

const EventEmitter = require('events');

class EventHub extends EventEmitter {}

/**
 * Expose a factory function instead of the class
 */
module.exports = function createEventHub(opts) {
  return new EventHub(opts);
};
