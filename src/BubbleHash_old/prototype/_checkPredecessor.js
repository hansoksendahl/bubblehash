// periodically check whecher predecessor has failed
//
//     if (predecessor has failed)
//       predecssor := nil;
BubbleHash.prototype._checkPredecessor = function _checkPredecessor () {
  if (this.predecessor && this.predecessor.open === false) {
    this.predecssor = null;
  }
};