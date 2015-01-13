'use strict';

var Promise = require('promise');
var throat = require('throat');
var runSingleBrowser = require('./run-single-browser');

module.exports = runBrowsersParallel;
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
function runBrowsersParallel(location, remote, platforms, options) {
  var throttle = options.throttle || throat(options.parallel || 3);
  return Promise.all(platforms.map(function (platform) {
    return throttle(function () {
      return runSingleBrowser(location, remote, platform, {
        capabilities: options.capabilities,
        debug: options.debug,
        jobInfo: options.jobInfo,
        allowExceptions: options.allowExceptions,
        testComplete: options.testComplete,
        testPassed: options.testPassed,
        timeout: options.timeout
      }).then(function (result) {
        Object.keys(platform).forEach(function (key) {
          result[key] = platform[key];
        });
        if (options.onResult) options.onResult(result);
        return result;
      }, function (err) {
        var result = {passed: false, duration: err.duration, err: err};
        Object.keys(platform).forEach(function (key) {
          result[key] = platform[key];
        });
        if (options.onResult) options.onResult(result);
        return result;
      });
    });
  }));
}
