// Is key in (low, high)
BubbleHash.prototype._inRange = function _inRange (key, low, high) {
  //return (low < high && key > low && key < high) ||
  //    (low > high && (key > low || key < high)) ||
  //    (low === high && key !== low);
  return (this._lessThan(low, high) && this._lessThan(low, key) && this._lessThan(key, high)) || (this._lessThan(high, low) && (this._lessThan(low, key) || this._lessThan(key, high))) || (this._equalTo(low, high) && !this._equalTo(key, low));
}