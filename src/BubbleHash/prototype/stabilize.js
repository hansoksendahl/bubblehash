// periodically probe n's successor s and inform s of n
//
// Pseudocode:
//
//     n.stabilize()
//       checkPredecessor();
//       x := successor.predecessor;
//       if (x ∈ (n, successor))
//         successor := x;
//       successor.notify(n);
BubbleHash.prototype.stabilize = function stabilize (interval) {
  var self;
  
  this.log("stabilize");
  
  if (! this.processes.stabilize) {
    self = this;
    
    this.processes.stabilize = setInterval(function () {
      var x;
      
      self.checkPredecessor();
      
      if (self.successor) {
        self.log("findPredecessor", {node: self.self.hash})
        self.successor.send({
          type: self.types.FIND_PREDECESSOR,
          hash: self.self.hash,
          peer: self.self.peer
        });
        
        self.successor.once("dataFoundPredecessor", function (dataConnection1, data1) {
          var successor;
          
          if (
            util.lessThan(self.self.hash, data1.hash) &&
            util.lessThan(data1.hash, self.successor.hash)
          ) {
            self.log("newSuccessor", {node: self.self.hash, successor: data1.hash});
            successor = self.connect(data1.peer);
            successor.once("open", function (dataConnection2, data2) {
              self.successor = successor;
              self.log("notify", {node: self.self.hash, successor: successor.hash});
              successor.send({
                type: self.types.NOTIFY,
                peer: self.self.peer,
                hash: self.self.hash
              });
            });
          }
        });
        
        self.log("notify", {node: self.self.hash, successor: self.successor.hash});
        self.successor.send({
          type: self.types.NOTIFY,
          peer: self.self.peer,
          hash: self.self.hash
        });
      }
    }, interval * 1000);
  }
};