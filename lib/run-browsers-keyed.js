'use strict';

var Promise = require('promise');
var throat = require('throat');
var runBail = require('./run-browsers-bail');
var runParallel = require('./run-browsers-parallel');

module.exports = runBrowsersKeyed;
/**
 * Run a test in a collection of browsers and return an array of the results
 *
 * @option {Number}          parallel
 * @option {Function}        throttle
 * @option {Object}          capabilities
 * @option {Boolean}         debug
 * @option {Object|Function} jobInfo
 * @option {Boolean}         allowExceptions
 * @option {String|Function} testComplete
 * @option {String|Function} testPassed
 * @option {String}          timeout
 * @option {Function.<Result>} onResult
 * @option {Function.<String,Array.<Result>>} onBrowserResults
 *
 * Returns:
 *
 * ```js
 * [{ "passed": true, "duration": "3000", ...Platform }, ...]
 * ```
 *
 * @param {Location}         location
 * @param {Object}           remote
 * @param {Array.<Platform>} platforms
 * @param {Options}          options
 * @returns {Promise}
 */
function runBrowsersKeyed(location, remote, platforms, options) {
  var throttle = options.throttle || throat(options.parallel || 3);
  var results = {};
  return Promise.all(Object.keys(platforms).map(function (key) {
    var run = options.bail ? runBail : runParallel;
    return run(location, remote, platforms[key], {
      throttle: throttle,
      capabilities: options.capabilities,
      debug: options.debug,
      jobInfo: options.jobInfo,
      allowExceptions: options.allowExceptions,
      testComplete: options.testComplete,
      testPassed: options.testPassed,
      timeout: options.timeout,
      onStart: options.onStart,
      onQueue: options.onQueue,
      onResult: options.onResult
    }).then(function (result) {
      if (options.onBrowserResults) options.onBrowserResults(key, result);
      results[key] = result;
    });
  })).then(function () { return results; });
}
