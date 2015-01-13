'use strict';

var Promise = require('promise');
var runSingleBrowser = require('./run-single-browser');

module.exports = runBrowsersBail;
/**
 * Run a test in a series of browsers, one at at time until one of them fails
 *
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
function runBrowsersBail(location, remote, platforms, options) {
  var throttle = options.throttle || function (fn) { return fn(); };
  var results = [];
  return new Promise(function (resolve) {
    function next(i) {
      if (i >= platforms.length) {
        return resolve(results);
      }
      var platform = platforms[i];
      throttle(function () {
        return runSingleBrowser(location, remote, platform, {
          capabilities: options.capabilities,
          debug: options.debug,
          jobInfo: options.jobInfo,
          allowExceptions: options.allowExceptions,
          testComplete: options.testComplete,
          testPassed: options.testPassed,
          timeout: options.timeout
        });
      }).done(function (result) {
        Object.keys(platform).forEach(function (key) {
          result[key] = platform[key];
        });
        results.push(result);
        if (options.onResult) options.onResult(result);
        if (result.passed) {
          next(i + 1);
        } else {
          resolve(results);
        }
      }, function (err) {
        var result = {passed: false, duration: err.duration, err: err};
        Object.keys(platform).forEach(function (key) {
          result[key] = platform[key];
        });
        results.push(result);
        if (options.onResult) options.onResult(result);
        resolve(results);
      });
    }
    next(0);
  });
}
