// periodically reconcile with successors's successor list
//
// Pseudocode:
//     n.fixSuccessorList()
//       ⟨s₁,…,sᵣ⟩ := successor.successorList;
//       successorList := ⟨successor,s₁,…,sᵣ₋₁⟩;
BubbleHash.prototype.fixSuccessorList = function fixSuccessorList (interval) {
  var self;
  
  if (! this.processes.fixSuccessorList) {
    self = this;
    
    this.processes.fixSuccessorList = setInterval(function () {
      if (self.successor) {
        self.successor.send({
          type: self.types.GET_SUCCESSOR_LIST,
          peer: self.self.peer,
          hash: self.self.hash
        });
        
        self.successor.once("dataGotSuccessorList", function (dataConnection, data) {
          self.successorList = [[self.successor.peer, self.successor.hash]].concat(data.list.slice(-1));
        });
      }
    }, interval * 1000);
  }
};