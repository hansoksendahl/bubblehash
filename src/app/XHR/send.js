// Send the request
XHR.prototype.send = function send (type, url, callback) {
  var queryString = ""
    , queryIndex
    , key;
  
  if (this.__data) {
    queryString = JSON.stringify(this.__data);
    
    if (type === "get") {
      queryIndex = url.indexOf("?");
      
      if (queryIndex !== -1) {
        url.replace("?", "?"+queryString+"&");
      }
    }
  }
  
  this.request.open(type, url);
  
  for (key in this.__header) {
    this.request.setRequestHeader(key, this.__header[key]);
  }
  
  this.request.onload = callback;
  
  if (type === "post") {
    this.request.send(queryString);
  }
  else {
    this.request.send();
  }
}
