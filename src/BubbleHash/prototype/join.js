BubbleHash.prototype.join = function join (id, options) {
  // Create a data connection
  var dataConnection = this._connect(id, options)
    , self = this;
  
  // Clear the predecessor
  this._predecessor = null;
  
  // Bing an event to the data connection's `open` event which will send a Chord
  // `FIND_SUCCESSOR` event.
  dataConnection.once("open", function () {
    dataConnection.send({
      type: self._types.FIND_SUCCESSOR,
      id: self._id("self")
    });
  });
  
  
  return dataConnection;
};