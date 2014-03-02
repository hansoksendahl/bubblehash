// Computes a new key equal to key + 2 ^ exponent.
// Assumes key is a 4 element array of 32 bit words, most significant word first.
BubbleHash.prototype._addExp = function _addExp (key, exponent) {
  var result = key.concat(); // copy array
  var index = key.length - Math.floor(exponent / 32) - 1;

  result[index] += 1 << (exponent % 32);

  var carry = 0;
  while (index >= 0) {
    result[index] += carry;
    carry = 0;
    if (result[index] > 0xffffffff) {
      result[index] -= 0x100000000;
      carry = 1;
    }--index;
  }

  return result;
}