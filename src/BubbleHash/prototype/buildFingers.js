// build finger table
//
// Pseudocode:
//
//     n.buildFingers(s)
//       i₀ := ⌊log(successor - n)⌋ + 1;
//       for i₀ ≤ i < m - 1
//         finger[i] := s.findSuccessor(n + 2ⁱ);
BubbleHash.prototype.buildFingers = function buildFingers (s) {
  var self = this
    , i_0
    , i;
  
  i_0 = util.logMinus(this.successor.hash, this.self.hash) + 1;
  
  this.log("Refreshing finger table entries.");
  
  this.log("LogMinus = "+i_0);
  
  for (i = i_0; i < 128 - 1; i += 1) {
    s.send({
      type: this.types.FIND_SUCCESSOR,
      hash: util.addExp(this.self.hash, i),
      peer: self.self.peer
    });
    // closure to bind i
    (function (i) {
      s.once("dataFoundSuccessor", function (dataConnection, data) {
        self.fingers[i] = self.connect(data.peer);
      });
    }(i));
  }
};