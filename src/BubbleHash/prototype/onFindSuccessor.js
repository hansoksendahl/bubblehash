// ask node n to ﬁnd the successor of x
//
//     if (x ∈ (n,n.successor])
//       return n.successor;
//     else
//       n' := closestPrecedingNode(x);
//       return n'.ﬁndSuccessor(x);
BubbleHash.prototype.onFindSuccessor = function onFindSuccessor (dataConnection1, data1) {
  var self = this
    , closestPrecedingNode;
  
  this.log("onFindSuccessor", { requestor: dataConnection1.hash, node: data1.hash });
  
  if (
    this.successor &&
    util.lessThan(this.self.hash, data1.hash) &&
    (
      util.lessThan(data1.hash, this.successor.hash) ||
      util.equalTo(data1.hash, this.successor.hash)
    )
  ) {
    self.log("foundSuccessor", {node: data1.hash, successor: this.successor.hash});
    // We found the succesor! Send it back on the active data connection
    dataConnection1.send({
      type: this.types.FOUND_SUCCESSOR,
      peer: this.successor.peer,
      hash: this.successor.hash
    });
  }
  else {
    closestPrecedingNode = this.closestPrecedingNode(data1.hash);
    
    // FIXME
    // This catches the situation in which the closestPrecedingNode is self
    // Usually this happens when there is no other node to connect to it
    // this conditional statement prevents the messaging system from creating
    // an infinite loop for successor lookups.
    if (closestPrecedingNode === this.self) {
      self.log("foundSuccessor", { node: data1.hash, successor: this.self.hash });
      
      // XXX
      // Create a reciprocal link between the joining node and this node since
      // we have no other links
      if (
        data1.empty === true &&
        this.fingers.length === 0 &&
        this.successor === null &&
        this.predecessor === null
      ) {
        this.successor = dataConnection1;
      }
      
      dataConnection1.send({
        type: this.types.FOUND_SUCCESSOR,
        peer: self.self.peer,
        hash: self.self.hash
      });
    }
    else {
      // Tell the closest preceeding node to find its successor
      closestPrecedingNode.send({
        type: this.types.FIND_SUCCESSOR,
        hash: data1.hash,
        peer: data1.peer
      });
      
      // Once found report the successor to the requesting node
      closestPrecedingNode.once("dataFoundSuccessor", function (dataConnection2, data2) {
        self.log("foundSuccessor", { node: data1.hash, successor: data2.hash });
        dataConnection1.send({
          type: self.types.FOUND_SUCCESSOR,
          peer: data2.peer,
          hash: data2.hash
        });
      });
    }
  }
};