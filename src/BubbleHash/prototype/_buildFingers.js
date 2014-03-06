// build finger table
//
//     i₀ := ⌊log(successor - n)⌋ + 1;
//     for i₀ ≤ i < m - 1
//       finger[i] := s.findSuccessor(n + 2ⁱ);
BubbleHash.prototype._buildFingers = function _buildFingers (s) {
  var i_0
    , i;
    
  i_0 = util.logMinus(this.successor.hash, this.self.hash) + 1;
  
  console.log(i_0)

  for (i = i_0; i < this.fingers.length - 1; i += 1) {
    if (s.peer !== this.peer.id) {
      s.send({
        type: this._types.FIND_SUCCESSOR,
        peer: this._addExp(this.self.hash, i)
      });
    }
  }
};