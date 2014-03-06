// search finger table for the highest predecessor of x
//
//     for i := m - 1 downto 1
//       if (finger[i] ∈ (n, x))
//         return finger[i];
//       return n;
BubbleHash.prototype._closestPrecedingNode = function _closestPrecedingNode (x) {
  var i
    , finger;
  
  for (i = this.fingers.length - 1; i >= 1; i -= 1) {
    finger = this.fingers[i];
    
    if (
      util.lessThan(this.self.hash, finger.hash) &&
      util.lessThan(finger.hash, x.hash)
    ) {
      return finger;
    }
  }
  
  return this.self;
};