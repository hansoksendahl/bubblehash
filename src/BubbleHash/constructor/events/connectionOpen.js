this.on("connectionOpen", function (dataConnection) {
  this.connections[dataConnection.peer] = dataConnection;
});