BubbleHash.prototype._connect = function _connect (id, options) {
  if (! this.peer.connections[id]) {
    options = options || {}
    
    // Create a data connection
    var dataConnection = this.peer.connect(id, options);
    
    dataConnection.hash = util.hash(id);
    
    return this._bindDataConnection(dataConnection);
  }
};