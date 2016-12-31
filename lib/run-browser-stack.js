'use strict';

var Promise = require('promise');
var getPlatforms = require('./get-browser-stack-platforms');
var runBrowsers = require('./run-browsers');

module.exports = runSauceLabs;
/**
 * Run a test in a collection of browsers on sauce labs
 *
 * @option {String}           username
 * @option {String}           accessKey
 * @option {Function}         filterPlatforms
 * @option {Function}         choosePlatforms
 * @option {Number}           parallel
 * @option {PlatformsInput}   platforms
 * @option {Function}         throttle  - overrides `parallel`
 * @option {Object}           capabilities
 * @option {Boolean}          debug
 * @option {Object|Function}  jobInfo
 * @option {Boolean}          allowExceptions
 * @option {String|Function}  testComplete
 * @option {String|Function}  testPassed
 * @option {Boolean}          bail
 * @option {String}           timeout
 * @option {Function.<Result>} onResult
 * @option {Function.<String,Array.<Result>>} onBrowserResults
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
function runSauceLabs(location, remote, options) {
  var capabilities = options.capabilities;
  if (remote === 'browserstack') {
    var user = options.username || process.env.BROWSER_STACK_USERNAME;
    var key = options.accessKey || process.env.BROWSER_STACK_ACCESS_KEY;
    if (!user || !key) {
      return Promise.reject(new Error('You must provide `username` and `accessKey` as options ' +
                                      'or set "BROWSER_STACK_USERNAME" and "BROWSER_STACK_ACCESS_KEY" in your ' +
                                      'environment variables.'));
    }
    remote = 'http://hub-cloud.browserstack.com/wd/hub';
    capabilities = function (platform) {
      var result = {};
      Object.keys(options.capabilities || {}).forEach(function (key) {
        result[key] = options.capabilities[key];
      });
      Object.keys(platform).forEach(function (key) {
        result[key] = platform[key];
      });
      result['browserstack.user'] = user;
      result['browserstack.key'] = key;
      return result;
    };
  }
  return (options.platforms ? Promise.resolve(options.platforms) : getPlatforms({
    filterPlatforms: options.filterPlatforms,
    choosePlatforms: options.choosePlatforms
  })).then(function (platforms) {
    return runBrowsers(location, remote, {
      name: options.name,
      parallel: options.parallel || 3,
      platforms: platforms,
      throttle: options.throttle,
      capabilities: capabilities,
      debug: options.debug,
      httpDebug: options.httpDebug,
      jobInfo: options.jobInfo,
      allowExceptions: options.allowExceptions,
      testComplete: options.testComplete,
      testPassed: options.testPassed,
      bail: options.bail,
      timeout: options.timeout,
      onStart: options.onStart,
      onQueue: options.onQueue,
      onResult: options.onResult,
      onBrowserResults: options.onBrowserResults
    });
  });
}
