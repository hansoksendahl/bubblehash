this.on("findPredecesor", function (dataConnection, data) {
  if (this.predecessor) {
    dataConnection.send({
      type: this._types.FOUND_PREDECESSOR,
      peer: this.predecessor.peer
    });
  }
});