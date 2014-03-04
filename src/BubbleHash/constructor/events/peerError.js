this.on("peerError", function () {
  if (this._finger.length === 0) {
    this.emit("empty");
  }
});