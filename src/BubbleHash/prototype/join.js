// node n joins through node n'
//
// Pseudocode:
//
//     n.join(n')
//       predecessor:= nil;
//       s:= n'.ﬁndSuccessor(n);
//       successor:= s;
//       buildFingers(s);
BubbleHash.prototype.join = function join (id, options) {
  // Create a data connection
  var dataConnection = this.connect(id, options)
    , self = this;
  
  // Clear the predecessor
  this.predecessor = null;
  
  dataConnection.once("open", function () {
    // Message the peer specified by `id` to find its successor
    self.log("Finding successor of "+dataConnection.peer+".");
    dataConnection.send({
      type: self.types.FIND_SUCCESSOR,
      hash: self.self.hash,
      peer: self.self.peer
    });
    
    // On response set the successor and build the finger table
    dataConnection.once("dataFoundSuccessor", function (dataConnection, data) {
      self.log("The successor of "+dataConnection.peer+" is "+data.peer+".");
      self.successor = self.connect(data.peer);
      self.buildFingers(self.successor);
    });
  });
    
  return dataConnection;
};