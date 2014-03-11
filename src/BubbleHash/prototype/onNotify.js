// notify s to be s's predecessor
//
// Pseudocode:
//
//     s.notify(n)
//       if (predecssor = nil or n ∈ (predecssor, s))
//         predecessor := n;
BubbleHash.prototype.onNotify = function onNotify (dataChannel, data) {
if (
    this.predecessor === null &&
    util.lessThan(this.predecessor.hash, data.hash) &&
    util.lessThan(data.hash, this.self.hash)
  ) {
    this.predecessor = this.connect(data.peer);
  }
};