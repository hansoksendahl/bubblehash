// Log a message or error
function logger (messages, prefix) {
  prefix = (prefix ? prefix+": " : "");
  
  // General function for creating log messages.
  function log (code, type) {
    return function (err) {
      type = type || "log";
      err = err || "";
      
      var message = prefix+messages[code];
      
      if (err) {
        message += "\n\n"+err;
      }
      
      console[type](message);
    };
  }

import "warning";
import "error";
  
  return log;
}