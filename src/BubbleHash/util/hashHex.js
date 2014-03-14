// Returns the hexadecimal hash value defined by `x`.
util.hashHex = function (x) {
  var s = ""
    , i;
  
  for (i = 0; i < x.length; i += 1) {
    s += x[i].toString(16);
  }
  
  return s;
};