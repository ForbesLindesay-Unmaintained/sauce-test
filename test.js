'use strict';

var assert = require('assert');
var run = require('./');


var USER = 'then-jsonp';
var ACCESS_KEY = 'beb60500-a585-440c-82e9-0888d716570d';

run(__dirname + '/empty.js', 'chromedriver', {
  testComplete: 'return true;',
  testPassed: 'return true;'
}).done(function (result) {
  assert(result.passed === true);
  console.dir(result);
});

run(__dirname + '/empty.js', 'saucelabs', {
  username: USER,
  accessKey: ACCESS_KEY,
  testComplete: 'return true;',
  testPassed: 'return true;',
  filterPlatforms: function (platform) {
    return platform.browserName === 'chrome' && platform.version === '34';
  },
  choosePlatforms: function (platforms) {
    return [platforms[0]];
  },
  bail: true,
  timeout: '15s'
}).done(function (results) {
  console.dir(results);
});
