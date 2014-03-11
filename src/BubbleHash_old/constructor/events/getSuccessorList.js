this.on("getSuccessorList", function (dataConnection, data) {
  dataConnection.send({
    type: this._types.GOT_SUCCESSOR_LIST,
    list: Object.keys(this.successorList)
  });
});