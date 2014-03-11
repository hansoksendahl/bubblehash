// periodically probe n's successor s and inform s of n
//
//     checkPredecessor();
//     x := successor.prdecessor;
//
// sucessor has changed due to new joining
//
//     if (x ∈ (n, successor))
//       successor := x;
//     successor.notify(n);
BubbleHash.prototype._stabilization = function _stabilization () {
  var self;
  
    // FIXME
  // Make this interval into a configurable option
  if (! this.stabilization) {
    self = this;
    
    this.stabilization = setInterval(function () {
      self._checkPredecessor();
      
      if (self.successor.send) {
        self.successor.send({
          type: self._types.FIND_PREDECESSOR
        });
      }
    }, 600);
  }
};