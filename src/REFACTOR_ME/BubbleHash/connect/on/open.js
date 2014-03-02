// DataChannel open event.
dc.on("open", function () {
  // Add the data channel to the connections list
  self.connections.push(dc);
});