BubbleHash.prototype._connect = function _connect (id, options) {
  options = options || {}
  options.metadata = options.metadata || {};
  console.log(this._id("self"));
  options.metadata.id = this._id("self");
  
  // Create a data connection
  var dataConnection = this.peer.connect(id, options)
  
  return this._bindDataConnection(dataConnection);
};