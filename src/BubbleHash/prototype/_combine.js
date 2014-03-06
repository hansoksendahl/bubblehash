BubbleHash.prototype._compare = function _combine (f) {
  return function (h_1, h_2) {
    var a = []
      , i;
      
    for (i = 0; i < h_1.length; i += 1) {
      a[i] = g(h_1[i], h_2[i]);
    }

    return a;
  }
};