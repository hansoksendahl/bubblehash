// periodically probe n's successor s and inform s of n
//
// Pseudocode:
//
//     n.stabilization()
//       checkPredecessor();
//       x := successor.prdecessor;
//       if (x ∈ (n, successor))
//         successor := x;
//       successor.notify(n);
BubbleHash.prototype.stabilization = function stabilization (interval) {
  var self;
  
  this.log("Stabilizing...");
  
  if (! this.processes.stabilization) {
    self = this;
    
    this.processes.stabilization = setInterval(function () {
      var x;
      
      self.checkPredecessor();
      
      self.successor.send({
        type: self.types.FIND_PREDECESSOR,
        hash: self.self.hash,
        peer: self.self.peer
      });
      
      self.successor.once("dataFoundPredecessor", function (dataConnection, data) {
        if (
          util.lessThan(self.self.hash, data.hash) &&
          util.lessThan(data.hash, self.successor.hash)
        ) {
          self.successor = self.connect(data.peer);
        }
      });
      
      self.successor.once("open", function (dataChannel) {
        dataChannel.send({
          type: self.types.NOTIFY,
          peer: self.self.peer,
          hash: self.self.hash
        });
      });
    }, interval * 1000);
  }
};