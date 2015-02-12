'use strict';

var path = require('path');
var Promise = require('promise');
var retry = require('./retry');
var waitForJobToFinish = require('./wait-for-job-to-finish');

module.exports = runDriver;
/**
 * Run a test against a given location with the suplied driver
 *
 * @option {Object}          jobInfo         An object that gets passed to Sauce Labs
 * @option {Boolean}         allowExceptions Set to `true` to skip the check for `window.onerror`
 * @option {String|Function} testComplete    A function to test if the job is complete
 * @option {String|Function} testPassed      A function to test if the job has passed
 * @option {String}          timeout
 *
 * @param {Location} location
 * @param {Cabbie}   driver
 * @param {Options}  options
 * @returns {Promise.<TestResult>}
 */
function runDriver(location, driver, options) {
  options.testComplete = options.testComplete || 'return window.TESTS_COMPLETE';
  options.testPassed = options.testPassed || 'return window.TESTS_PASSED && !window.TESTS_FAILED';
  var startTime = Date.now();
  var jobInfo = {
    name: path.basename(process.cwd()),
    build: process.env.TRAVIS_JOB_ID
  };
  Object.keys(options.jobInfo || {}).forEach(function (key) {
    jobInfo[key] = options.jobInfo[key];
  });
  return Promise.resolve(null).then(function () {
    return retry(function () {
      return driver.sauceJobUpdate(jobInfo);
    }, 3, '500ms')
  }).then(function () {
    return retry(function () {
      return driver.browser().activeWindow().navigator().navigateTo(location.url)
    }, 3, '500ms');
  }).then(function () {
    return waitForJobToFinish(driver, {
      allowExceptions: options.allowExceptions,
      testComplete: options.testComplete,
      timeout: options.timeout
    });
  }).then(function () {
    return retry(function () {
      if (typeof options.testPassed === 'string') {
        return driver.browser().activeWindow().execute(options.testPassed);
      } else {
        return options.testPassed(driver);
      }
    }, 5, '500ms');
  }).then(function (result) {
    result = {passed: result, duration: Date.now() - startTime};
    return retry(function () { return driver.dispose({passed: result.passed}); }, 5).then(function () {
      return result;
    });
  }, function (err) {
    err.duration = Date.now() - startTime;
    return retry(function () { return driver.dispose({passed: false}); }, 2).then(function () {
      throw err;
    }, function () {
      throw err;
    });
  });
}
