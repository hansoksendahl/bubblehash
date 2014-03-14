// n notifies s to be s's predecessor
//
// Pseudocode:
//
//     s.notify(n)
//       if (predecessor = nil or n ∈ (predecessor, s))
//         predecessor := n;
BubbleHash.prototype.onNotify = function onNotify (dataChannel, data) {
  var self = this
    , predecessor;
  
  if (
    this.predecessor === null ||
    (
      util.lessThan(this.predecessor.hash, data.hash) &&
      util.lessThan(data.hash, this.self.hash)
    )
  ) {
    predecessor = this.connect(data.peer);
    
    predecessor.once("open", function () {
      self.predecessor = predecessor;
    });
  }
};