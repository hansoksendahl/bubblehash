// Send an asynchronous HTTP GET request
XHR.prototype.get = function get (url, callback) {
  this.send("get", url, callback);
  return out;
};