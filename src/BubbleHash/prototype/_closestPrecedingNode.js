BubbleHash.prototype._closestPrecedingNode = function _closestPrecedingNode (id) {
  var i
    
  for (i = this._fingers.length - 1; i >= 0; i -= 1) {
    if (
      this._inRange(this._id("finger", i), this._id("self"), id)
    ) {
        return this._finger[i];
    }
  }

  if (this._inRange(this._id("successor"), this._id("self"), id)) {
    return this._successor;
  }
  else {
    return this._self;
  }
}