'use strict';

var addDefaultLoggingAndName = require('./lib/default-logging');
var chromedriver = require('./lib/chromedriver');
var publishCode = require('./lib/publish-code');
var runChromedriver = require('./lib/run-chromedriver');
var runSauceLabs = require('./lib/run-sauce-labs');
var runBrowsers = require('./lib/run-browsers');

module.exports = runTests;
module.exports.publishCode = publishCode;
module.exports.runTestsAtLocation = runTestsAtLocation;
function runTestsAtLocation(location, remote, options, _chromedriverStarted) {
  addDefaultLoggingAndName(options);
  if (remote === 'chromedriver') {
    if (!_chromedriverStarted) {
      chromedriver.start();
    }
    return runChromedriver(location, remote, {
      name: options.name,
      throttle: options.throttle,
      platform: options.platform,
      capabilities: options.capabilities,
      debug: options.debug,
      httpDebug: options.httpDebug,
      allowExceptions: options.allowExceptions,
      testComplete: options.testComplete,
      testPassed: options.testPassed,
      timeout: options.timeout,
      chromedriverStarted: true,
      keepChromedriverAlive: false
    }).then(function (result) {
      options.onAllResults(result);
      return result;
    });
  } else if (remote.indexOf('saucelabs') !== -1) {
    return runSauceLabs(location, remote, {
      name: options.name,
      username: options.username,
      accessKey: options.accessKey,
      filterPlatforms: options.filterPlatforms,
      choosePlatforms: options.choosePlatforms,
      parallel: options.parallel,
      platforms: options.platforms,
      throttle: options.throttle,
      capabilities: options.capabilities,
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
    }).then(function (results) {
      if (results.passedBrowsers && results.failedBrowsers) {
        results.passed = results.failedBrowsers.length === 0;
      }
      options.onAllResults(results);
      return results;
    });
  } else {
    return runBrowsers(location, remote, {
      name: options.name,
      parallel: options.parallel,
      platforms: options.platforms,
      platform: options.platform,
      throttle: options.throttle,
      capabilities: options.capabilities,
      debug: options.debug,
      httpDebug: options.httpDebug,
      allowExceptions: options.allowExceptions,
      testComplete: options.testComplete,
      testPassed: options.testPassed,
      bail: options.bail,
      timeout: options.timeout,
      onStart: options.onStart,
      onQueue: options.onQueue,
      onResult: options.onResult,
      onBrowserResults: options.onBrowserResults
    }).then(function (results) {
      if (results.passedBrowsers && results.failedBrowsers) {
        results.passed = results.failedBrowsers.length === 0;
      }
      options.onAllResults(results);
      return results;
    });
  }
}
function runTests(entries, remote, options) {
  if (remote === 'chromedriver' && !options.chromedriverStarted) {
    chromedriver.start();
  }
  addDefaultLoggingAndName(options);

  return publishCode(entries, {
    browserify: options.browserify,
    libraries: options.libraries,
    style: options.style,
    stylesheets: options.stylesheets,
    html: options.html,
    disableSSL: options.disableSSL
  }).then(location => {
    options.onPublish(location.url);
    return runTestsAtLocation(location, remote, options, options.chromedriverStarted || remote === 'chromedriver');
  });
}
