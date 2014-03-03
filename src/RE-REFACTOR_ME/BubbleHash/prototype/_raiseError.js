BubbleHash.prototype._raiseError = function _raiseError (code) {
  this.emit("error", new Error(this._messages[code] || code));
};