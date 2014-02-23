dataConnection.on("close", function () {
  delete self.connections[self.connections.indexOf(dataConnection)];
});