util.addExp = function addExp(key, exponent) {
  exponent = exponent % 128
  
  var result = key.concat() // copy array
    , index = Math.floor(exponent / 32)
    , carry

  result[index] += 1 << (exponent % 32);

  carry = 0;
  while (index < key.length) {
    result[index] += carry;
    carry = 0;
    if (result[index] > 0xffffffff) {
      result[index] -= 0x100000000;
      carry = 1;
    }
    index += 1;
  }

  return result;
};