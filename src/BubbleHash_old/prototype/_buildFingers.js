// build finger table
//
//     i₀ := ⌊log(successor - n)⌋ + 1;
//     for i₀ ≤ i < m - 1
//       finger[i] := s.findSuccessor(n + 2ⁱ);
BubbleHash.prototype._buildFingers = function _buildFingers (s) {
  var self = this
    , i_0
    , i;
  
  i_0 = util.logMinus(this.successor.hash, this.self.hash) + 1;
  
  console.log(i_0)

  for (i = i_0; i < 128 - 1; i += 1) {
    if (s.peer !== this.peer.id) {
      s.send({
        type: this._types.FIND_SUCCESSOR,
        peer: this._addExp(this.self.hash, i)
      });
      // closure to bind i
      (function (i) {
        s.once("foundSuccessor", function (dataConnection, data) {
          self.fingers[i] = self.connect(data.peer);
        });
      }(i));
    }
  }
};