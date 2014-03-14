// If we are already connected to a node return that connection otherwise
// establish a new connection.
BubbleHash.prototype.connect = function connect (id, options) {
  var finger;
  
  if (this.successor && id === this.successor.peer) {
    return this.successor;
  }
  else if (this.predecessor && id === this.predecessor.peer) {
    return this.predecessor;
  }
  else if (this.fingers.some(function (f) { if (f.peer === id) { finger = f; return true; } })) {
    return finger;
  }
  else {
    var dataConnection = this.peer.connect(id, options);
      
    dataConnection.hash = util.hash(id);
    
    this.bindDataConnection(dataConnection);
    
    return dataConnection;
  }
};
