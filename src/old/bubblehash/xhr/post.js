// Send an asynchronous HTTP POST request
out.post = function (callback) {
  send("post", callback);
  return out;
};