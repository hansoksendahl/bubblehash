BubbleHash.prototype._bindDataConnection = function _bindDataConnection (dataConnection) {
  var self = this;
  
  ["Data", "Open", "Close"].forEach(function (e) {
    dataConnection.on(
      e.toLowerCase(),
      self._raiseEvent(
        "connection"+e,
        dataConnection
      )
    );
  });
}