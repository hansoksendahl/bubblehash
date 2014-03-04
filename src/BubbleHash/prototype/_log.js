// The floored log of 
BubbleHash.prototype._flog = function _flog () {
  var succ = this._id("successor")
    , self = this._id("self")
    , sum;
  
  for (i = 0; i < succ.length; i += 1) {
    sum += (Math.floor((succ[i] - self[i]) / Math.log(2)) * (8 * i))
  }
  
  return sum + 1;
};