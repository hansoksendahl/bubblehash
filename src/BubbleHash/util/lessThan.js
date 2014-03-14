// Checks to see that h₁ is less than h₂
// Assumes that murmurhash values are little endian with the least significant
// digit in the first block.
util.lessThan = function (h_1, h_2) {
  var i;
  
  for (i = h_1.length - 1; i >= 0; i -= 1) {
    if (h_1[i] < h_2[i]) {
      return true;
    }
    else if (h_2[i] < h_1[i]) {
      return false;
    }
  }
  
  // h₁ ≡ h₂
  return false;
};