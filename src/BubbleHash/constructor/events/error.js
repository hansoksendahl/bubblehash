this.on("error", function _cleanUp () {
  var id
    , live;
  
  for (id in this.peer.connections) {
    this.fingers = this.fingers.filter(function (dataConnection) {
      if (dataConnection.open) {
        return true;
      }
    });
    this.peer.connections[id] = this.peer.connections[id].filter(function (dataConnection) {
      if (dataConnection.open) {
        return true;
      }
      else {
        dataConnection.emit("error");
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