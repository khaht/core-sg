/**
 * Policies util
 */

const _ = require('lodash');

const GLOBAL_PREFIX = 'global::';
const PLUGIN_PREFIX = 'plugins::';
const ADMIN_PREFIX = 'admin::';
const APPLICATION_PREFIX = 'application::';

const isPolicyFactory = _.isArray;

const getPolicyIn = (container, policy) =>
  _.get(container, ['config', 'policies', _.toLower(policy)]);

const policyExistsIn = (container, policy) =>
  !_.isUndefined(getPolicyIn(container, policy));

const stripPolicy = (policy, prefix) => policy.replace(prefix, '');

const createPolicy = (policyName, ...args) => ({ policyName, args });

const resolveHandler = (policy) =>
  _.isFunction(policy) ? policy : policy.handler;

const policyResolvers = [
  {
    name: 'api',
    is(policy) {
      return _.startsWith(policy, APPLICATION_PREFIX);
    },
    exists(policy) {
      return this.is(policy) && !_.isUndefined(this.get(policy));
    },
    get: (policy) => {
      const [, policyWithoutPrefix] = policy.split('::');
      const [api = '', policyName = ''] = policyWithoutPrefix.split('.');
      return getPolicyIn(_.get(sgApp, ['api', api]), policyName);
    },
  },
  {
    name: 'admin',
    is(policy) {
      return _.startsWith(policy, ADMIN_PREFIX);
    },
    exists(policy) {
      return this.is(policy) && !_.isUndefined(this.get(policy));
    },
    get: (policy) =>
      getPolicyIn(_.get(sgApp, 'admin'), stripPolicy(policy, ADMIN_PREFIX)),
  },
  {
    name: 'plugin',
    is(policy) {
      return _.startsWith(policy, PLUGIN_PREFIX);
    },
    exists(policy) {
      return this.is(policy) && !_.isUndefined(this.get(policy));
    },
    get(policy) {
      const [plugin = '', policyName = ''] = stripPolicy(
        policy,
        PLUGIN_PREFIX
      ).split('.');
      return getPolicyIn(_.get(sgApp, ['plugins', plugin]), policyName);
    },
  },
  {
    name: 'global',
    is(policy) {
      return _.startsWith(policy, GLOBAL_PREFIX);
    },
    exists(policy) {
      return this.is(policy) && !_.isUndefined(this.get(policy));
    },
    get(policy) {
      return getPolicyIn(sgApp, stripPolicy(policy, GLOBAL_PREFIX));
    },
  },
];

// eslint-disable-next-line max-len
const parsePolicy = (policy) =>
  isPolicyFactory(policy) ? createPolicy(...policy) : createPolicy(policy);

const resolvePolicy = (policyName) => {
  const resolver = policyResolvers.find((r) => r.exists(policyName));

  return resolver ? resolveHandler(resolver.get)(policyName) : undefined;
};

const searchLocalPolicy = (policy, apiName) => {
  const [absoluteApiName, policyName] = policy.split('.');
  const absoluteApi = _.get(sgApp.api, absoluteApiName);

  if (policyExistsIn(absoluteApi, policyName)) {
    return resolveHandler(getPolicyIn(absoluteApi, policyName));
  }

  const api = _.get(sgApp.api, apiName);
  if (api && policyExistsIn(api, policy)) {
    return resolveHandler(getPolicyIn(api, policy));
  }

  return undefined;
};

const globalPolicy = ({
  method,
  endpoint,
  controller,
  action,
  plugin,
}) => async (req, _res, next) => {
  req.route = {
    endpoint: `${method} ${endpoint}`,
    controller: _.toLower(controller),
    action: _.toLower(action),
    verb: _.toLower(method),
    plugin,
  };

  req.params = _.defaults({}, req.query, req.params, req.body);

  await next();
};

const get = (policy, apiName) => {
  const { policyName, args } = parsePolicy(policy);

  const resolvedPolicy = resolvePolicy(policyName);

  if (resolvedPolicy !== undefined) {
    return isPolicyFactory(policy) ? resolvedPolicy(...args) : resolvedPolicy;
  }

  const localPolicy = searchLocalPolicy(policy, apiName);

  if (localPolicy !== undefined) {
    return localPolicy;
  }

  throw new Error(`Could not find policy "${policy}"`);
};

const createPolicyFactory = (factoryCallback, options) => {
  const { validator, name = 'unnamed' } = options;

  const validate = (...args) => {
    try {
      validator(...args);
    } catch (e) {
      throw new Error(`Invalid objects submitted to "${name}" policy.`);
    }
  };

  return (...args) => {
    if (validator) {
      validate(...args);
    }

    return factoryCallback(...args);
  };
};

module.exports = {
  get,
  globalPolicy,
  createPolicyFactory,
};
