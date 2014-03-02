// DataChannel close event.
dc.on("close", function () {
  // Filter out any instances of the DataChannel from the connections list.
  self.connections = self.connections.filter(function(rc) {
    return rc.peer !== dc.peer;
  });
});