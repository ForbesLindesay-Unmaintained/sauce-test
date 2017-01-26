'use strict';

var path = require('path');
var chalk = require('chalk');
var ms = require('ms');

var handlers = {
  onPublish: onPublish,
  onResult: onResult,
  onBrowserResults: onBrowserResults,
  onAllResults: onAllResults,
  onQueue: noop,
  onStart: noop
};
module.exports = addDefaultLoggingAndName;
function addDefaultLoggingAndName(options) {
  options.name = options.name || path.basename(process.cwd());

  var colorName = options.nameColor ?
      chalk[options.nameColor](options.name) :
      chalk.magenta(options.name);
  var start = Date.now();

  Object.keys(handlers).forEach(function (key) {
    if (options[key] === false || options.silent) {
      options[key] = noop;
    } else if (!options[key]) {
      options[key] = handlers[key].bind(null, colorName, start);
    }
  });
}

function noop() {}

function onPublish(name, start, url) {
  console.log(
    'To view ' + name +
    ' tests in a browser, navigate to: ' +
    chalk.magenta(url)
  );
}
function onResult(name, start, res) {
  if (res.passed) {
    console.log(name + ' ' +
                chalk.green(' passed ') +
                res.browserName + ' ' +
                res.version + ' ' +
                res.platform +
                (res.duration ? chalk.cyan(' (' + ms(res.duration) + ')') : ''));
  } else {
    console.log(name + ' ' +
                chalk.red(' failed ') +
                res.browserName + ' ' +
                res.version + ' ' +
                res.platform +
                (res.duration ? chalk.cyan(' (' + ms(res.duration) + ')') : ''));
    if (res.err) {
      console.error(res.err.stack || res.err.message || res.err);
    }
  }
}
function onBrowserResults(name, start, browser, results) {
  if (results.every(function (result) { return result.passed; })) {
    console.log(name + ' ' +
                chalk.green(browser + ' all passsed'));
  } else {
    console.log(name + ' ' +
                chalk.red(browser + ' some failures'));
  }
}
function onAllResults(name, start, results) {
  var duration = Date.now() - start;
  if (results.passedBrowsers && results.failedBrowsers) {
    if (results.failedBrowsers.length) {
      console.log(name + ' ' + chalk.red('failed browsers'));
      console.log('');
      results.failedBrowsers.forEach(function (res) {
        console.log(' - ' +
                    res.browserName + ' ' +
                    res.version + ' ' +
                    res.platform +
                    (res.duration ? chalk.cyan(' (' + ms(res.duration) + ')') : ''));
      });
      console.log('');
      console.log(
        name + ' ' +
        chalk.red('all tests failed ') +
        (duration ? chalk.cyan(' (' + ms(duration) + ')') : '')
      );
    } else {
      console.log(
        name + ' ' +
        chalk.green('all tests passed ') +
        (duration ? chalk.cyan(' (' + ms(duration) + ')') : '')
      );
    }
  } else if (typeof results.passed === 'boolean') {
    if (results.passed) {
      console.log(
        name + ' ' +
        chalk.green('tests passed ') +
        (duration ? chalk.cyan(' (' + ms(duration) + ')') : '')
      );
    } else {
      console.log(
        name + ' ' +
        chalk.red('tests failed ') +
        (duration ? chalk.cyan(' (' + ms(duration) + ')') : '')
      );
    }
  }
}
