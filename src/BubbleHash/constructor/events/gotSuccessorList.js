this.on("gotSuccessorList", function (dataConnection, data) {
  var succesorList = [this.successor, data.list.slice(-1)]
    , peer
    , i;
  
  for (i = 0; i < successorList.length; i += 1) {
    peer = successorList[i];
    this.successorList[peer] = this._connect(peer);
  }
});