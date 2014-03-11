// periodically refresh finger table entries
//
// Pseudocode:
//
//     n.fixFingers()
//       buildFingers(n);
BubbleHash.prototype.fixFingers = function fixFingers (interval) {
  var self
  
  if (! this.processes.fixFingers) {
    self = this;
    
    this.processes.fixFingers = setInterval(function () {
      self.buildFingers(self.self);
    }, interval * 1000);
  }
}