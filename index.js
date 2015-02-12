'use strict';

var chalk = require('chalk');
var chromedriver = require('./lib/chromedriver');
var publishCode = require('./lib/publish-code');
var runChromedriver = require('./lib/run-chromedriver');
var runSauceLabs = require('./lib/run-sauce-labs');
var runBrowsers = require('./lib/run-browsers');

module.exports = runTests;
module.exports.publishCode = publishCode;
function runTests(entries, remote, options) {
  if (remote === 'chromedriver') {
    chromedriver.start();
  }
  return publishCode(entries, {
    browserify: options.browserify,
    libraries: options.libraries,
    style: options.style,
    stylesheets: options.stylesheets,
    html: options.html,
    disableSSL: options.disableSSL
  }).then(function (location) {
    if (!options.silent) {
      console.log('To view tests in a browser, navigate to: ' + chalk.magenta(location.url));
    }
    if (remote === 'chromedriver') {
      return runChromedriver(location, remote, {
        throttle: options.throttle,
        platform: options.platform,
        capabilities: options.capabilities,
        debug: options.debug,
        allowExceptions: options.allowExceptions,
        testComplete: options.testComplete,
        testPassed: options.testPassed,
        timeout: options.timeout,
        chromedriverStarted: true,
        keepChromedriverAlive: false
      });
    } else if (remote.indexOf('saucelabs') !== -1) {
      return runSauceLabs(location, remote, {
        username: options.username,
        accessKey: options.accessKey,
        filterPlatforms: options.filterPlatforms,
        choosePlatforms: options.choosePlatforms,
        parallel: options.parallel,
        platforms: options.platforms,
        throttle: options.throttle,
        capabilities: options.capabilities,
        debug: options.debug,
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
    } else {
      return runBrowsers(location, remote, {
        parallel: options.parallel,
        platforms: options.platforms,
        platform: options.platform,
        throttle: options.throttle,
        capabilities: options.capabilities,
        debug: options.debug,
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
    }
  });
}
