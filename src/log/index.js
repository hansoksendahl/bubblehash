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
    
    return function (e) {
      console.log(type, Object.prototype.toString.call(e), Object.prototype.toString.call(e).indexOf("Error"), e)
      if ((type === "error" || type === "warning") && Object.prototype.toString.call(e).indexOf("Error") !== -1) {
        alert("blah")
        message += "\n\n"+e.stack
      }
      
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