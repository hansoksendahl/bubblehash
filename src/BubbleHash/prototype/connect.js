BubbleHash.prototype.connect = function connect (id, options) {
  var dataConnection = this.peer.connect(id, options)
    , self = this;
  
  this._bindDataConnection(dataConnection);
  
  return dataConnection;
};