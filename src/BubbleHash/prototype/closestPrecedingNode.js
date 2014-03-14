// search finger table for the highest predecessor of x
//
//     n.closentPrecedingNode(x)
//       for i := m - 1 downto 1
//         if (finger[i] ∈ (n, x))
//           return finger[i];
//         return n;
BubbleHash.prototype.closestPrecedingNode = function closestPrecedingNode (x) {
  var i
    , finger;
  
  this.log("Looking for closest preceding node of "+util.hashHex(x)+".");
  
  for (i = this.fingers.length - 1; i >= 1; i -= 1) {
    finger = this.fingers[i];
    
    if (finger) {
      if (
        util.lessThan(this.self.hash, finger.hash) &&
        util.lessThan(finger.hash, x)
      ) {
        return finger;
      }
    }
  }
  
  return this.self;
};