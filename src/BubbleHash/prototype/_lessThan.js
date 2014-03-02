// Key comparison
BubbleHash.prototype._lessThan = function _lessThan (low, high) {
  if (low.length !== high.length) {
    // Arbitrary comparison
    return low.length < high.length;
  }

  for (var i = 0; i < low.length; ++i) {
    if (low[i] < high[i]) {
      return true;
    }
    else if (low[i] > high[i]) {
      return false;
    }
  }

  return false;
}