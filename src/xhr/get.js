// Send an asynchronous HTTP GET request
out.get = function get (callback) {
  send("get", callback);
  return out;
};