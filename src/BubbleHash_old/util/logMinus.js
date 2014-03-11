util.logMinus = function (h_1, h_2) {
  var a = []
    , log_2 = Math.log(2)
    , sum = 0
    , carry = 0
    , sub
    , i;
  
  for (i = h_1.length - 1; i >= 0; i -= 1) {
    sub = Math.abs(h_1[i]) - Math.abs(h_2[i]);
    
    if (sub < 0) {
      sub = (i < h_1.length - 1 && a[i + 1] > 0) ? 0x100000000 - sub : 0;
      carry = -1;
    }
    else {
      carry = 0;
    }
    
    a[i] = sub;
    sum += sub ? Math.log(sub) : 0;
  }
  
  return sum ? Math.floor(sum / log_2) : 0;
};