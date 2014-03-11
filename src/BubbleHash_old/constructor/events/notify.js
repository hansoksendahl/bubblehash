// notify s to be s's predecessor
//
//     if (predecssor = nil or n ∈ (predecssor, s))
//       predecessor := n;
this.on("notify", function (dataChannel, data) {
  var predecessorID = util.hash(data.peer);
  
  if (
    this.predecessor === null &&
    util.lessThan(this.predecessor.hash, predecessorID) &&
    util.lessThan(predecessorID, this.self.hash)
  ) {
    this.predecessor = this._connect(data.peer);
  }
});