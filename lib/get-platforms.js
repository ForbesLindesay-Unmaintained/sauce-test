'use strict';

var request = require('then-request');

module.exports = getPlatforms;
/**
 * Get an object containing the platforms supported by sauce labs
 *
 * Platforms:
 *
 * ```js
 * {
 *   "chrome": [{"browserName": "chrome", "version": "34", platform:" Mac 10.9"}, ...]
 *   ...
 * }
 * ```
 *
 * @option {Function.<Platform,Boolean>}                  filterPlatforms
 *     Return `true` to include the platform in the resulting set.
 * @option {Function.<Array.<Platform>,Array.<Platform>>} choosePlatforms
 *     Return an array of platforms of a given version to include
 *     in the output.  This lets you choose only one operating
 *     system for each browser version.
 *
 * @param {Options} options
 * @returns {Promise.<Platforms>}
 */
function getPlatforms(options) {
  return request('GET', 'https://saucelabs.com/rest/v1/info/platforms/webdriver')
  .getBody('utf8').then(JSON.parse).then(function (platforms) {
    var obj = {};
    platforms.map(function (platform) {
      return {
        browserName: platform.api_name,
        version: platform.short_version,
        platform: platform.os
      };
    }).forEach(function (platform) {
      if (platform.browserName === 'lynx') return;
      if (options.filterPlatforms && !options.filterPlatforms(platform)) return;
      obj[platform.browserName] = obj[platform.browserName] || {};
      obj[platform.browserName][platform.version] = obj[platform.browserName][platform.version] || [];
      obj[platform.browserName][platform.version].push(platform);
    });
    var result = {};
    Object.keys(obj).forEach(function (browser) {
      result[browser] = [];
      Object.keys(obj[browser]).sort(function (versionA, versionB) {
        if (isNaN(versionA) && isNaN(versionB)) return versionA < versionB ? -1 : 1;
        if (isNaN(versionA)) return -1;
        if (isNaN(versionB)) return 1;
        return (+versionB) - (+versionA);
      }).forEach(function (version, index) {
        var platforms = obj[browser][version];
        if (options.choosePlatforms) {
          result[browser] = result[browser].concat(options.choosePlatforms(platforms));
        } else {
          result[browser] = result[browser].concat(platforms);
        }
      });
    });
    return result;
  });
}
