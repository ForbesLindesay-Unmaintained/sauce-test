'use strict';

var chromedriver = require('chromedriver');

var chromedrivers = 0;
exports.start = function () {
  if (chromedrivers === 0) chromedriver.start();
  chromedrivers++;
}
exports.stop = function () {
  chromedrivers--;
  if (chromedrivers === 0) chromedriver.stop();
}
