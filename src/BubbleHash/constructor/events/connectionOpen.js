this.on("connectionOpen", function (dataConnection) {
  dataConnection.hash = util.hash(dataConnection.peer);
  this._fixFingers();
});