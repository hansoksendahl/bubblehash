BubbleHash.prototype._stabilization = function _stabilization () {
  var self = this;
  
  this._checkPredecessor();
  
  this.successor.send({
    type: this._types.FIND_PREDECESSOR
  });
};