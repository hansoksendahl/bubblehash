// xhr
var xhr = (function xhr () {
  var logMessages = {}
  
  logMessages[0x0000] = "We get signal!";
  logMessages[0x0001] = "Opening connection...";
  logMessages[0x2000] = "Connction attempt timed out.";
  logMessages[0x2001] = "Lost signal.";
  
  log = logger(logMessages, "Signal");
  
  return function init (url) {
    var request = new XMLHttpRequest()
      , out = {}
      , headers = {}
      , data;
    
    request.ontimeout = log(0x2000);
    request.onerror = log(0x2001);
    
    // Send the request
    function send (type, callback) {
      var queryString = ""
        , queryIndex
        , key;
      
      if (data) {
        queryString = "json="+JSON.stringify(data);
        
        if (type === "get") {
          queryIndex = url.indexOf("?");
          
          if (queryIndex !== -1) {
            url.replace("?", "?"+queryString+"&");
          }
        }
      }
      
      request.open(type, url);
      
      for (key in headers) {
        request.setRequestHeader(key, headers[key]);
      }
      
      request.onload = callback;
      
      if (type === "post") {
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.send(queryString);
      }
      else {
        request.send();
      }
    }
    
    // Set some headres takes either a pair of arguments `key` and `value` or
    // optionally takes a dictionary containing pairs of keys and values.
    out.headers = function headers (key, value) {
      if (arguments.length < 2) {
        if (typeof key === "string") {
          return headers[key];
        }
        
        for (value in key) {
          headers[value] = key[value];
        }
      }
      else {
        headers[key] = value;
      }
    };
    
    // Set some data
    out.data = function dataSetter (obj) {
      if (arguments.length === 0) {
        return data;
      }
      
      data = obj;
      return out;
    };
    
    out.get = function get (callback) {
      send("get", callback);
      return out;
    };
    
    out.post = function (callback) {
      send("post", callback);
      return out;
    };
    
    return out;
  };
}());