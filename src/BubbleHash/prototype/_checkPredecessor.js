BubbleHash.prototype._checkPredecessor = function _checkPredecessor () {
  if (this.predecessor.open === false) {
    this.predecssor = null;
  }
};