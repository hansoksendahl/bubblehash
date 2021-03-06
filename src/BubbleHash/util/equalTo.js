// Checks to see that `h_1` is equal to `h_2`
// Assumes that murmurhash values are little endian with the least significant
// digit in the first block.
util.equalTo = function (h_1, h_2) {
  var i;
  
  for (i = h_1.length - 1; i >= 0; i -= 1) {
    if (h_1[i] !== h_2[i]) return false;
  }
  
  return true;
};