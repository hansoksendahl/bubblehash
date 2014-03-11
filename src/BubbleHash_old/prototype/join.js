BubbleHash.prototype.join = function join (id, options) {
  // Create a data connection
  var dataConnection = this._connect(id, options)
    , self = this;
  
  // Clear the predecessor
  this.predecessor = null;
  
  // Bing an event to the data connection's `open` event which will send a Chord
  // `FIND_SUCCESSOR` event.
  dataConnection.once("open", function () {
    dataConnection.send({
      type: self._types.FIND_SUCCESSOR
    });
    
    self.once("foundSuccessor", function (dataConnection, data) {
      self.successor = dataConnection
      self._buildFingers(self.successor);
    });
  });
    
  return dataConnection;
};