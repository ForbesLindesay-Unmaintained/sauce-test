'use strict';

var assert = require('assert');
var Promise = require('promise');
var jsdom = require('jsdom');
var runDriver = require('./run-driver');

module.exports = runJsdom;
/**
 * Run a test using chromedriver, then stops chrome driver and returns the result
 *
 * @option {String}          name
 * @option {Function}        throttle
 * @option {Boolean}         debug
 * @option {Boolean}         allowExceptions
 * @option {String|Function} testComplete
 * @option {String|Function} testPassed
 * @option {String}          timeout
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
function runJsdom(location, remote, options) {
  assert(remote === 'jsdom', 'expected remote to be jsdom');
  var throttle = options.throttle || function (fn) { return fn(); };
  return throttle(function () {
    return new Promise(function (resolve, reject) {
      jsdom.env(location.url, {
        virtualConsole: options.debug ? jsdom.createVirtualConsole().sendTo(console) : false,
        features: {
          FetchExternalResources: ["script", "img", "css", "frame", "iframe", "link"],
          ProcessExternalResources: ["script"]
        }
      }, function (errors, window) {
        if (errors) return reject(errors[0]);
        else resolve(window);
      });
    }).then(function (window) {
      var driver = {
        sauceJobUpdate: function () {
          return Promise.resolve(null);
        },
        browser: function () {
          return {
            activeWindow: function () {
              return {
                navigator: function () {
                  return {
                    navigateTo: function (url) {
                      return Promise.resolve(null).then(function () {
                        assert(url === location.url, 'jsdom does not support navigation');
                      });
                  };
                },
                execute: function (str) {
                  return (new Promise(function (resolve) { setTimeout(resolve, 100); })).then(function () {
                    return window.Function('', str)();
                  });
                }
              };
            }
          };
        },
        dispose: function () {
          return Promise.resolve(null).then(function () {
            window.close();
          });
        }
      };
      return runDriver(location, driver, {
        name: options.name,
        allowExceptions: options.allowExceptions,
        testComplete: options.testComplete,
        testPassed: options.testPassed,
        timeout: options.timeout
      });
    });
  });
}
