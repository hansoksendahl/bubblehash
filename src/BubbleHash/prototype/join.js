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
    self.log("findSuccessor", { node: dataConnection.hash });
    
    dataConnection.send({
      type: self.types.FIND_SUCCESSOR,
      hash: self.self.hash,
      peer: self.self.peer,
      empty: true
    });
    
    // On response set the successor and build the finger table
    dataConnection.once("dataFoundSuccessor", function (dataConnection, data) {
      self.log("foundSuccessor", { node: dataConnection.hash, successor: data.hash });
      
      var successor = self.connect(data.peer);
      successor.once("open", function () {
        self.successor = successor;
        self.buildFingers(successor);
      });
    });
  });
    
  return dataConnection;
};