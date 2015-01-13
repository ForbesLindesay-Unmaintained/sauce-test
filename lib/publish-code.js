'use strict';

var Promise = require('promise');
var browserify = require('browserify');
var request = require('then-request');
var sourceMapper = require('source-mapper');

module.exports = publishCode;
/**
 * Browserify some code and publish it to https://tempjs.org
 *
 * @option {Object}         browserify
 * @option {Array.<String>} libraries
 * @option {Boolean}        disableSSL
 *
 * Returns:
 *
 * ```js
 * {
 *   url: "https://tempjs.org/file/###########/index.html",
 *   getOriginalLocation: function (source, line) {
 *     // transform according to source map then:
 *     return {source, line};
 *   }
 * }
 * ```
 *
 * @param {String|Array.<String>} entries The list of filenames to include in the bundle
 * @param {Options}               options
 * @returns {Promise}
 */
function publishCode(entries, options) {
  var getOriginalLocation;
  return new Promise(function (resolve, reject) {
    var browserifyOptions = {
      entries: Array.isArray(entries) ? entries : [entries],
      debug: true
    };
    Object.keys(options.browserify || {}).forEach(function (key) {
      browserifyOptions[key] = options.browserify[key];
    });
    browserify(browserifyOptions).bundle(function (err, res) {
      if (err) return reject(err);
      var src = res.toString();
      if (browserifyOptions.debug) {
        var extracted = sourceMapper.extract(src);
        var consumer = sourceMapper.consumer(extracted.map);
        getOriginalLocation = function (source, line) {
          var res = consumer.originalPositionFor({line: line, column: 0});
          if (res.source === null || res.line === null) {
            return {source: source, line: line};
          } else {
            return {source: res.source, line: res.line};
          }
        };
      } else {
        getOriginalLocation = function (source, line) {
          return {source: res.source, line: res.line};
        };
      }
      resolve(src);
    });
  }).then(function (bundle) {
    return request('POST', 'https://tempjs.org/create', {
      json: {
        body: bundle,
        libraries: [
          'https://cdn.rawgit.com/ForbesLindesay/log-to-screen/c95691617af794f738826145f3f2498d4f4cab09/index.js'
        ].concat(options.libraries || [])
      }
    }).getBody('utf8').then(JSON.parse);
  }).then(function (res) {
    return {
      url: (options.disableSSL ? 'http' : 'https') + '://tempjs.org' + res.path,
      getOriginalLocation: getOriginalLocation
    };
  });
}
