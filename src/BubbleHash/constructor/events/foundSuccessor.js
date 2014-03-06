this.on("foundSuccessor", function (dataConnection, data) {
  this.fingers[data.peer] = this._connect(data.peer);
});