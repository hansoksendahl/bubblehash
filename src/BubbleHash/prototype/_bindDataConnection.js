BubbleHash.prototype._bindDataConnection = function _bindDataConnection (dataConnection) {
  var self = this;
  
  // Bind event listeners for each named `event` to `dataConnection`.
  ["Data", "Open", "Close"].forEach(function (event) {
    dataConnection.on(
      event.toLowerCase(),
      self._raiseEvent(
        "connection"+event,
        dataConnection
      )
    );
  });
  
  return dataConnection;
};