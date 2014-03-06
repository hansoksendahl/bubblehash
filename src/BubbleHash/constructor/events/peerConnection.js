this.on("peerConnection", function (dataConnection) {
  dataConnection.hash = util.hash(dataConnection.peer);
  this._bindDataConnection(dataConnection);
});