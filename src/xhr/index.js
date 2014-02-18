// xhr
var xhr = (function xhr () {
  var logMessages = {}
    , log;
  
import "messages"
  
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
    
import "headers";
import "data";
import "get";
import "post";
    
    return out;
  };
}());