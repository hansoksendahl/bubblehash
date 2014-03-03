this.on("connectionClose", function (dataConnection) {
  if (this._finger.length === 0) {
    this.emit("empty");
  }
});