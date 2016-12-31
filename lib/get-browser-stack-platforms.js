var Promise = require('promise');

function getPlatforms(options) {
  // {platform, browserName, version}
  // see https://www.browserstack.com/automate/capabilities and
  // https://www.browserstack.com/list-of-browsers-and-platforms?product=automate
  return Promise.resolve([
    {browserName: 'internet explorer', version: '11'},
    {browserName: 'internet explorer', version: '10'},
    {browserName: 'internet explorer', version: '9'},
    {browserName: 'firefox', version: '50'},
    {browserName: 'firefox', version: '45'},
    {browserName: 'firefox', version: '40'},
    {browserName: 'chrome', version: '55'},
    {browserName: 'chrome', version: '50'},
    {browserName: 'safari', version: '10'},
    {browserName: 'safari', version: '9.1'},
    {browserName: 'safari', version: '8'},
    {browserName: 'safari', version: '7.1'},
    {browserName: 'edge', version: '14'},
    {browserName: 'edge', version: '13'},
    {browserName: 'iPad', version: '9.1'},
    {browserName: 'iPad', version: '8.3'},
    {browserName: 'iPhone', version: '9.1'},
    {browserName: 'iPhone', version: '8.3'},
    {browserName: 'android', version: '5'},
    {browserName: 'android', version: '4'},
  ].filter(options.filterPlatforms || function () { return true; }));
}
module.exports = getPlatforms;
