'use strict';

var ms = require('ms');
var Promise = require('promise');

module.exports = retry;
function retry(fn, timeout, delay) {
  return new Promise(function (resolve, reject) {
    var count = 0;
    var start = Date.now();
    var timedOut = false;
    function attempt(err) {
      if (typeof timeout === 'number' && count >= timeout) {
        err.message = 'Maximum number of retries (' + timeout + ') reached\n' + err.message;
        return reject(err);
      }
      if (timedOut) {
        err.message = 'Timed out after ' + ms(Date.now() - start, {long: true}) + '\n' + err.message;
        return reject(err);
      }
      if (typeof timeout === 'string' && (Date.now() - start) > ms(timeout)) {
        timedOut = true;
      }
      count++;
      try {
        fn().done(resolve, function (err) {
          setTimeout(attempt.bind(null, err), typeof delay === 'function' ?
                     delay(count) :
                     (typeof delay === 'string' ?
                     ms(delay) :
                     200));
        });
      } catch (ex) {
        return reject(ex);
      }
    }
    attempt();
  });
}
