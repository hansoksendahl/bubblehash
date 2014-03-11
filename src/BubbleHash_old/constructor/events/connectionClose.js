this.on("connectionClose", function _cleanUp () {
  var id
    , live;
  
  // TODO
  // Remove this code and delegate to `_fixFingers`
  this.fingers = this.fingers.filter(function (dataConnection) {
    if (dataConnection.open) {
      return true;
    }
  });
  
  for (id in this.peer.connections) {
    this.peer.connections[id] = this.peer.connections[id].filter(function (dataConnection) {
      if (dataConnection.open) {
        return true;
      }
    });
    if (this.peer.connections[id].length === 0) {
      delete this.peer.connections[id];
    }
    else {
      live = true;
    }
  }
  
  if (! live) {
    this.emit("empty");
  }
});