BubbleHash.prototype.onFindPredecessor = function onFindPredecessor (dataConnection, data) {
  if (this.predecessor) {
    dataConnection.send({
      type: this.types.FOUND_PREDECESSOR,
      peer: this.predecessor.peer,
      hash: this.predecessor.hash
    });
  }
}