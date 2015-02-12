'use strict';

var fs = require('fs');
var Promise = require('promise');
var browserify = require('browserify');
var request = require('then-request');
var sourceMapper = require('source-mapper');
var readFile = Promise.denodeify(fs.readFile);

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
  var code = compileCode(entries, options.browserify);
  var style = loadStyles(options.stylesheets || [], {styles: options.styles});
  var html = options.html ? loadHtml(options.html) : null;
  return Promise.all([code, style, html]).then(function (compiled) {
    return request('POST', 'https://tempjs.org/create', {
      json: {
        script: compiled[0].src,
        libraries: [
          'https://cdn.rawgit.com/ForbesLindesay/log-to-screen/c95691617af794f738826145f3f2498d4f4cab09/index.js'
        ].concat(options.libraries || []),
        stylesheets: compiled[1].stylesheets,
        style: compiled[1].styles,
        html: compiled[2]
      }
    }).getBody('utf8').then(JSON.parse).then(function (res) {
      return {
        url: (options.disableSSL ? 'http' : 'https') + '://tempjs.org' + res.path,
        getOriginalLocation: compiled[0].getOriginalLocation
      };
    });
  });
}

function compileCode(entries, browserifyOpt) {
  var getOriginalLocation = function (source, line) {
    return {source: source, line: line};
  };
  if (browserifyOpt) {
    return new Promise(function (resolve, reject) {
      var browserifyOptions = {
        entries: Array.isArray(entries) ? entries : [entries],
        debug: true
      };
      if (typeof browserifyOpt === 'object') {
        Object.keys(browserifyOpt).forEach(function (key) {
          browserifyOptions[key] = browserifyOpt[key];
        });
      }
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
        }
        resolve({src: src, getOriginalLocation: getOriginalLocation});
      });
    });
  } else {
    return Promise.all(entries.map(function (entry) {
      return readFile(entry, 'utf8').then(null, function (err) {
        if (err.code === 'ENOENT') return entry;
        else throw err;
      });
    })).then(function (src) {
      return {
        src: src.join(';'),
        getOriginalLocation: getOriginalLocation
      };
    });
  }
}

function loadStyles(stylesheets, options) {
  var styles = [];
  var stylesheets = [];
  return Promise.all(stylesheets.map(function (entry) {
    return readFile(entry, 'utf8').then(function (style) {
      styles.push(style);
    }, function (err) {
      if (err.code === 'ENOENT') return stylesheets.push(entry);
      else throw err;
    });
  })).then(function (src) {
    return {
      style: styles.concat(options.style ? [options.style] : []).join('\n'),
      stylesheets: stylesheets
    };
  });
}
function loadHtml(html) {
  return readFile(html, 'utf8').then(null, function (err) {
    if (err.code === 'ENOENT') return html;
    else throw err;
  });
}
