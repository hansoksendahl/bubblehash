// periodically refresh finger table entries
//
//     buildFingers(n);
BubbleHash.prototype._fixFingers = function _fixFingers () {
  var self
  
  // FIXME
  // Make this interval into a configurable option
  if (! this.fixFingers) {
    self = this;
    
    this.fixFingers = setInterval(function () {
      self._buildFingers(self.self);
    }, 600);
  }
}