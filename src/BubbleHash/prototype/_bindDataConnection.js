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
  
  // From my understanding peer.js dataConnection objects do not report a type
  // on their error objects.  As such we just pass them directly to the
  // BubbleHash error handler.
  dataConnection.on("error", function (err) {
    this._raiseError(err);
  });
  
  return dataConnection;
}