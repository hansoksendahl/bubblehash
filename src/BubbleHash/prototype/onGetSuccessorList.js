BubbleHash.prototype.onGetSuccessorList = function onGetSuccessorList (dataConnection, data) {
  dataConnection.send({
    type: this.types.GOT_SUCCESSOR_LIST,
    list: this.successorList,
    peer: this.self.peer,
    hash: this.self.hash
  });
};