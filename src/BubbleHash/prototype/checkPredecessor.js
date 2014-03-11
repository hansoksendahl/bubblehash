// periodically check whecher predecessor has failed
//
//     if (predecessor has failed)
//       predecssor := nil;
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