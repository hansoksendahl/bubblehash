this.on("foundPredecessor", function (dataConnection, data) {
  var self = this
    , predecessorID = util.hash(data);
  
  if (
    util.lessThan(this.self.hash, predecessorID) &&
    util.lessThan(predecessorID, this.successor)
  ) {
    this.successor = this._connect(predecessorID);
  }
  
  this.successor.once("open", function (dataChannel) {
    dataChannel.send({
      self._types.NOTIFY,
      self.self.peer
    });
  });
});