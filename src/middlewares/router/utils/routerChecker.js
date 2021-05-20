/**
 * Module dependencies
 */

// Public node modules.
const _ = require('lodash');

// sgApp utilities.
const policyUtils = require('../../../utils/policy.util');
const finder = require('../../../utils/finder.util');

const getMethod = (route) => _.trim(_.toLower(route.method));
const getEndpoint = (route) => _.trim(route.path);

module.exports = (sgApp) =>
  function routerChecker(route) {
    const method = getMethod(route);
    const endpoint = getEndpoint(route);

    // Define controller and action names.
    const [controllerName, actionName] = _.trim(route.handler).split('.');
    const controllerKey = _.toLower(controllerName);

    // let controller;
    // if (plugin) {
    //   controller = plugin === 'admin' ?
    // sgApp.admin.controllers[controllerKey] : sgApp.plugins[plugin].controllers[controllerKey];
    // } else {
    // } // not using plugin yet
    const controller = sgApp.controllers[controllerKey];

    if (!controller) {
      sgApp.stopWithError(
        new Error(
          `Controller '${controllerKey}' does not exist. Check route config: ${JSON.stringify(
            route
          )}`
        )
      );
    }

    if (!_.isFunction(controller[actionName])) {
      sgApp.stopWithError(
        `Error creating endpoint [${method}] ${endpoint}: handler not found "${controllerKey}.${actionName}"`
      );
    }

    controller.log = sgApp.log.child({
      controller: controllerKey,
      action: actionName,
    });
    const action = controller[actionName].bind(controller);

    // Retrieve the API's name where the controller is located
    // to access to the right validators
    // sgApp.plugins[plugin] || sgApp.api || sgApp.admin
    const currentApiName = finder(sgApp.api, controller);

    // Add the `globalPolicy`.
    const globalPolicy = policyUtils.globalPolicy({
      controller: controllerKey,
      action: actionName,
      method,
      endpoint,
      // plugin,
    });

    // Init policies array.
    const policies = [globalPolicy];

    let policyOption = _.get(route, 'config.policies');

    // Allow string instead of array of policies.
    if (_.isString(policyOption) && !_.isEmpty(policyOption)) {
      // eslint-disable-next-line
      policyOption = [policyOption];
    }

    if (_.isArray(policyOption)) {
      policyOption.forEach((policyName) => {
        try {
          policies.push(policyUtils.get(policyName, currentApiName));
        } catch (error) {
          sgApp.stopWithError(
            `Error creating endpoint [${method}] ${endpoint}: ${error.message}`
          );
        }
      });
    }

    return {
      method,
      endpoint,
      policies,
      action,
    };
  };
