// Set some headers takes either a pair of arguments `key` and `value` or
// optionally takes a dictionary containing pairs of keys and values.
XHR.prototype.header = function headers (key, value) {
  if (arguments.length < 2) {
    if (typeof key === "string") {
      return this.__header[key];
    }
    
    for (value in key) {
      this.__header[value] = key[value];
    }
  }
  else {
    this.__header[key] = value;
    return this;
  }
};