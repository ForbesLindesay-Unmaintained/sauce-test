'use strict';

var Promise = require('promise');
var ms = require('ms');
var retry = require('./retry');

module.exports = waitForJobToFinish;

/**
 * Wait for a driver that has a running job to finish its job
 *
 * @option {Boolean}         allowExceptions Set to `true` to skip the check for `window.onerror`
 * @option {String|Function} testComplete    A function to test if the job is complete
 * @option {String}          timeout         The timeout (gets passed to ms)
 *
 * @param {Cabbie}  driver
 * @param {Options} options
 * @returns {Promise}
 */
function waitForJobToFinish(driver, options) {
  return new Promise(function (resolve, reject) {
    var start = Date.now();
    var timingOut = false;
    function check() {
      var checkedForExceptions;
      if (options.allowExceptions) {
        checkedForExceptions = Promise.resolve(null);
      } else {
        checkedForExceptions = driver.browser().activeWindow()
          .execute('return window.ERROR_HAS_OCCURED;').then(function (errorHasOcucured) {
            if (!errorHasOcucured) return;
            return driver.browser().activeWindow()
              .execute('return window.FIRST_ERROR;').then(function (err) {
                var loc = location.getOriginalLocation(err.url, err.line);
                var clientError = new Error(err.msg + ' (' + loc.source + ' line ' + loc.line + ')');
                clientError.isClientError = true;
                throw clientError;
              }, function () {
                throw new Error('Unknown error was thrown and not caught in the browser.');
              });
          }, function () {});
      }
      checkedForExceptions.then(function () {
        return retry(function () {
          if (typeof options.testComplete === 'string') {
            return driver.browser().activeWindow().execute(options.testComplete);
          } else {
            return options.testComplete(driver);
          }
        }, 5, '500ms');
      }).done(function (complete) {
        if (complete) resolve();
        else {
          if (timingOut) return reject(new Error('Test timed out'));
          if (Date.now() - start > ms('' + (options.timeout || '20s'))) timingOut = true;
          setTimeout(check, 500);
        }
      }, reject);
    }
    check();
  });
}
