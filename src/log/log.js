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
  
  log.warning = function (code) {
    return log(code, "warning");
  };
  
  log.error = function (code) {
    return log(code, "error");
  };
  
  return log;
}