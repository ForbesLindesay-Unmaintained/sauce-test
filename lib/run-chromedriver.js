'use strict';

var assert = require('assert');
var chromedriver = require('./chromedriver');
var runSingleBrowser = require('./run-single-browser');

module.exports = runChromedriver;
/**
 * Run a test using chromedriver, then stops chrome driver and returns the result
 *
 * @option {Function}        throttle
 * @option {Object}          platform|capabilities
 * @option {Boolean}         debug
 * @option {Boolean}         allowExceptions
 * @option {String|Function} testComplete
 * @option {String|Function} testPassed
 * @option {String}          timeout
 * @option {Boolean}         chromedriverStarted
 * @option {Boolean}         keepChromedriverAlive
 *
 * Returns:
 *
 * ```js
 * { "passed": true, "duration": "3000" }
 * ```
 *
 * @param {Location} location
 * @param {Object}   remote
 * @param {Object}   platform
 * @param {Options}  options
 * @returns {Promise}
 */
function runChromedriver(location, remote, options) {
  assert(remote === 'chromedriver', 'expected remote to be chromedriver');
  if (!options.chromedriverStarted) {
    chromedriver.start();
  }
  var throttle = options.throttle || function (fn) { return fn(); };
  return throttle(function () {
    return runSingleBrowser(location, 'http://localhost:9515/',
                            options.platform || options.capabilities || {}, {
      name: options.name,
      debug: options.debug,
      httpDebug: options.httpDebug,
      allowExceptions: options.allowExceptions,
      testComplete: options.testComplete,
      testPassed: options.testPassed,
      timeout: options.timeout
    });
  }).then(function (result) {
    if (!options.keepChromedriverAlive) {
      chromedriver.stop();
    }
    return result;
  }, function (err) {
    if (!options.keepChromedriverAlive) {
      chromedriver.stop();
    }
    throw err;
  });
}
