'use strict';

exports.filterPlatforms = filterPlatforms;
function filterPlatforms(platform) {
  var browser = platform.browserName;
  var version = platform.version;
  if (version === 'dev' || version === 'beta') return false;
  version = +version;
  if (browser === 'chrome') {
    return version >= 53 || version % 5 === 0;
  }
  if (browser === 'firefox') {
    return version >= 47 || version % 5 === 0 || version === 3.6;
  }
  return true;
}

exports.choosePlatforms = choosePlatforms;
function choosePlatforms(platforms) {
  return [platforms[Math.floor(Math.random() * platforms.length)]];
}
