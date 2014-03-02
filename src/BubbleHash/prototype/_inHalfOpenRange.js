// Is key in (low, high]
BubbleHash.prototype._inHalfOpenRange = function _inHalfOpenRange (key, low, high) {
  //return (low < high && key > low && key <= high) ||
  //    (low > high && (key > low || key <= high)) ||
  //    (low == high);
  return (this._lessThan(low, high) && this._lessThan(low, key) && this._lessThanOrEqual(key, high)) || (this._lessThan(high, low) && (this._lessThan(low, key) || this._lessThanOrEqual(key, high))) || (this._equalTo(low, high));
}