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
    if (options.onQueue) options.onQueue(platform);
    return throttle(function () {
      if (options.onStart) options.onStart(platform);
      return runSingleBrowser(location, remote, platform, {
        name: options.name,
        capabilities: options.capabilities,
        debug: options.debug,
        httpDebug: options.httpDebug,
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
  })).then(function (results) {
    results.failedBrowsers = results.filter(function (res) {
      return !res.passed;
    });
    results.passedBrowsers = results.filter(function (res) {
      return res.passed;
    });
    return results;
  });
}
