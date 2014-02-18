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