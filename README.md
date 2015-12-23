# sauce-test

The easy way to run unit tests on sauce-labs and in chromedriver

[![Build Status](https://img.shields.io/travis/ForbesLindesay/sauce-test/master.svg)](https://travis-ci.org/ForbesLindesay/sauce-test)
[![Dependency Status](https://img.shields.io/david/ForbesLindesay/sauce-test.svg)](https://david-dm.org/ForbesLindesay/sauce-test)
[![NPM version](https://img.shields.io/npm/v/sauce-test.svg)](https://www.npmjs.org/package/sauce-test)

## Installation

    npm install sauce-test

## Usage

For basic usage, see test.js in this repo.  For more advanced usage, see test/browser.js in https://github.com/then/then-jsonp

```js
var runTests = require('sauce-test');

runTests(entries, remote, options).done(function (results) {
  console.dir(results);
});
```

### entries

Entries should be an array of file names or JavaScript code.  e.g.

```js
runTests(__dirname + '/test.js', remote, options).done(function (results) {
  console.dir(results);
});
```

```js
runTests('TESTS_PASSED = 40 + 2 === 42;TESTS_COMPLETE = true;', remote, options).done(function (results) {
  console.dir(results);
});
```

```js
runTests([__dirname + '/assert.js', 'assert(40 + 2 === 42);TESTS_PASSED = true;TESTS_COMPLETE = true;'], remote, options).done(function (results) {
  console.dir(results);
});
```

See also the `browserify` option.

### remote

Remote is the url of the selenium web driver server you want to run your tests on.  You can also enter `'chromedriver'` to automatically start up chromedriver and run your tests in google chrome or `'saucelabs'` (along with the `username` and `accessKey` options) to run your tests on saucelabs.

### options

#### Publishing code

sauce-test publishes your code to https://tempjs.org automatically for you.  You can control how the code is served using these options.

 - **browserify** - set this to true to browserify the scripts before sending them to tempjs.org (set it to an object to pass options to browserify).

 - **libraries** - an array of urls to load as script tags on the page before the JavaScript to be tested

 - **style** - a string of css to include on the web page

 - **stylesheets** - an array of urls or file paths to css stylesheets

 - **html** - a string to override the default html template (should contain `{{styles}}` and `{{scripts}}` placeholders

 - **disableSSL** - set this to true to use `http://` instead of `https://` to load the tests

You can also manually just publish code (without running any tests) via:

```js
var test = require('sauce-test');
test.publishCode(__dirname + '/test.js', options).done(function (res) {
  console.log('To view tests in a browser, navigate to: ' + res.url);
});
```

#### Sauce Labs options

The following options are specific to saucelabs and are ignored by other remotes:

 - **username** - your sauce labs username

 - **accessKey** - your sauce labs access key

 - **filterPlatforms** - if you don't specify a set of platforms, sauce-test will automatically load the complete list of platforms. You can filter these by providng a `filterPlatforms` function. e.g.

  ```js
  filterPlatforms: (platform, defaultFilter) => platform.browserName === 'chrome' && defaultFilter(platform)
  ```

  The default is to omit development and beta browsers, and only test every 5th version of chrome and firefox below 35 and 30 respectively.

 - **choosePlatforms** - if you don't specify a set of platforms, sauce-test will automatically load the complete list of platforms.  The `choosePlatforms` function takes an array of identical browsers for different operating systems and allows you to return just the platforms you actually want to test on. By default, a random platform is selected using code like:

  ```js
  choosePlatforms: (platforms) => [platforms[Math.floor(Math.random() * platforms.length)]]
  ```

 - **jobInfo** - jobInfo to send to sauce labs.  Can be either an object or a function that takes a plaform and returns the jobInfo object.  Defaults to:

  ```js
  {
    name: path.basename(process.cwd()),
    build: process.env.TRAVIS_JOB_ID
  }
  ```

#### Other options

 - **testComplete** - a string that to execute on the web browser to determine whether tests have finished or a function that takes the cabbie driver and returns a Promise for either `true` or `false`.  The default is `'return window.TESTS_COMPLETE'` (which works great with the [test-result](https://www.npmjs.com/package/test-result) library).

 - **testPassed** - a string that to execute on the web browser to determine whether tests have passed or a function that takes the cabbie driver and returns a Promise for either `true` or `false`.  The default is `'return window.TESTS_PASSED && !window.TESTS_FAILED'` (which works great with the [test-result](https://www.npmjs.com/package/test-result) library).

 - **parallel** - the maximum number of tests to run in parallel (defaults to `3`)

 - **throttle** - overrides parallel e.g.

  ```js
  throttle: require('throat')(3)
  ```

 - **capabilities** - an object to be mixed in with each platform to set additional capabilities e.g.

  ```js
  capabilities: {
    'record-video': false,
    'record-screenshots': true,
    'capture-html': false
  }
  ```

 - **bail** - run tests one at a time (or one at a time per browser) and stop running new tests when one version fails.

 - **allowExceptions** - by default, tests are considered to have failed if `window.onError` is called, set this to `true` to disable that behaviour.

 - **debug** - enable debugging output for the underlying cabbie driver

 - **timeout** - defaults to `'20s'` and is passed to the [ms](https://www.npmjs.com/package/ms) library

 - **platforms** - the set of platforms to test on

 - **onQueue** - function to be called when a new test is queued (given the platform object) - defaults to a no-op

 - **onStart** - function to be called when a new test is started (given the platform object) - defaults to a no-op

 - **onResult** - function to be called when a test is finished (given the platform object along with a `passed` property) - defaults to a function that logs the result, pass `false` or `{silent: true}` to disable.

 - **onBrowserResults** - given an array of platforms once a given browser has finished - defaults to a function that logs the results, pass `false` or `{silent: true}` to disable.

 - **onAllResults** - called once all tests have completed, and passed the end results - defaults to a function that logs the results, pass `false` or `{silent: true}` to disable.

## License

  MIT
