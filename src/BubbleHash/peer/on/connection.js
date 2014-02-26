// The connection event fires when a data channel is established.
pc.on("connection", function (dataConnection) {
  self.connections.push(dataConnection);
  
  // Remove the received dataConnection if it closes.
  dataConnection.on("close", function () {
    self.connections = self.connections.filter(function(rc) {
      return rc.peer !== dataConnection.peer;
    });
  })
});