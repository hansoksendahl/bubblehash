// ask node n to ﬁnd the successor of x
//
//     if (x ∈ (n,n.successor])
//       return n.successor;
//     else
//       n' := closestPrecedingNode(x);
//       return n'.ﬁndSuccessor(x);
this.on("findSuccessor", function (dataConnection, data) {
  var self = this
    , successorID = this.successor.hash
    , xID = util.hash(data.peer)
    , closestPrecedingNode;
  
  if (
    util.lessThan(this.self.hash, xID) &&
    (
      util.lessThan(xID, successorID) ||
      util.equalTo(xID, successorID)
    )
  ) {
    // We found the succesor! Send it back on the active dataConnection
    dataConnection.send({
      type: this._types.FOUND_SUCCESSOR,
      peer: this.successor.peer
    });
  }
  else {
    // Look for the successor on the closest preceding node
    closestPrecedingNode = this._closestPrecedingNode(xID);
    
    if (closestPrecedingNode = this.self) {
      
    }
    else {
      closestPrecedingNode.send({
        type: this._types.FIND_SUCCESSOR,
        peer: data.peer
      });
      // Once found report the successor to the requesting node
      closestPrecedingNode.once("foundSuccessor", function (dataConnection, data) {
        dataConnection.send({
          type: self._types.FOUND_SUCCESOR,
          peer: data.peer
        });
      });
    }
  }
});