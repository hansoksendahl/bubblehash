// periodically check whecher predecessor has failed
//
//     n.checkPredecessor()
//       if (predecessor.open = false)
//         predecessor := nil;
BubbleHash.prototype.checkPredecessor = function checkPredecessor (interval) {
  var self;
  
  if (! this.processes.checkPredecessor) {
    self = this;
    
    this.processes.checkPredecessor = setInterval(function () {
      if (this.predecessor && this.predecessor.open === false) {
        this.predecssor = null;
      }
    }, interval * 1000);
  }
};