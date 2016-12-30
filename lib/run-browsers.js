'use strict';

var runBrowsersBail = require('./run-browsers-bail');
var runBrowsersKeyed = require('./run-browsers-keyed');
var runBrowsersParallel = require('./run-browsers-parallel');
var runSingleBrowser = require('./run-single-browser');

module.exports = runBrowsers;
/**
 * Run a test in a collection of browsers
 *
 * @option {Number}           parallel
 * @option {Array.<Platform>} platforms
 * @option {Platform}         platform  - only if `platforms` is undefined
 * @option {Function}         throttle  - overrides `parallel`
 * @option {Object}           capabilities
 * @option {Boolean}          debug
 * @option {Object|Function}  jobInfo
 * @option {Boolean}          allowExceptions
 * @option {String|Function}  testComplete
 * @option {String|Function}  testPassed
 * @option {String}           timeout
 * @option {Function.<Result>} onResult
 * @option {Function.<String,Array.<Result>>} onBrowserResults
 *
 * Returns:
 *
 * ```js
 * [{ "passed": true, "duration": "3000", ...Platform }, ...]
 * ```
 *
 * or
 *
 * ```js
 * {
 *   "chrome": [{ "passed": true, "duration": "3000", ...Platform }, ...],
 *   ...
 * }
 * ```
 *
 * @param {Location}         location
 * @param {Object}           remote
 * @param {Options}          options
 * @returns {Promise}
 */
function runBrowsers(location, remote, options) {
  var platforms = options.platforms;
  if (Array.isArray(platforms)) {
    if (options.bail) {
      return runBrowsersBail(location, remote, platforms, {
        name: options.name,
        throttle: options.throttle,
        capabilities: options.capabilities,
        debug: options.debug,
        httpDebug: options.httpDebug,
        jobInfo: options.jobInfo,
        allowExceptions: options.allowExceptions,
        testComplete: options.testComplete,
        testPassed: options.testPassed,
        timeout: options.timeout,
        onStart: options.onStart,
        onQueue: options.onQueue,
        onResult: options.onResult
      });
    } else {
      return runBrowsersParallel(location, remote, platforms, {
        name: options.name,
        throttle: options.throttle,
        parallel: options.parallel,
        capabilities: options.capabilities,
        debug: options.debug,
        httpDebug: options.httpDebug,
        jobInfo: options.jobInfo,
        allowExceptions: options.allowExceptions,
        testComplete: options.testComplete,
        testPassed: options.testPassed,
        timeout: options.timeout,
        onStart: options.onStart,
        onQueue: options.onQueue,
        onResult: options.onResult
      });
    }
  } else if (Object.keys(platforms).every(function (key) { return Array.isArray(platforms[key]); })) {
    return runBrowsersKeyed(location, remote, platforms, {
      name: options.name,
      throttle: options.throttle,
      parallel: options.parallel,
      capabilities: options.capabilities,
      debug: options.debug,
      httpDebug: options.httpDebug,
      jobInfo: options.jobInfo,
      allowExceptions: options.allowExceptions,
      testComplete: options.testComplete,
      testPassed: options.testPassed,
      timeout: options.timeout,
      bail: options.bail,
      onStart: options.onStart,
      onQueue: options.onQueue,
      onResult: options.onResult,
      onBrowserResults: options.onBrowserResults
    });
  } else {
    return (options.throttle ? options.throttle : function (fn) { return fn(); })(function () {
      return runSingleBrowser(location, remote, (options.platform || {}), {
        name: options.name,
        capabilities: options.capabilities,
        debug: options.debug,
        httpDebug: options.httpDebug,
        jobInfo: options.jobInfo,
        allowExceptions: options.allowExceptions,
        testComplete: options.testComplete,
        testPassed: options.testPassed,
        timeout: options.timeout
      });
    });
  }
}
