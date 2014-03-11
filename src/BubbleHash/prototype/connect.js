BubbleHash.prototype.connect = function connect (id, options) {
  var dataConnection = this.peer.connect(id, options);
    
  dataConnection.hash = util.hash(id);
  
  this.bindDataConnection(dataConnection);
  
  return dataConnection;
};
