// Log a message or error
function logger (messages, prefix) {
  prefix = (prefix ? prefix+": " : "");

  var out = {};
  
  function log (type, message) {
    console[type](message);
  }
  
  // General function for creating log messages.
  function logCode (code, type, callback) {
    var message = prefix+messages[code];
    
    return function () {
      log(type, message);
      if (callback) {
        callback.apply(this, arguments);
      }
    };
  }

import "warning";
import "error";
import "message";
  
  return out;
}