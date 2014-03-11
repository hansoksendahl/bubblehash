// ask node n to ﬁnd the successor of x
//
//     if (x ∈ (n,n.successor])
//       return n.successor;
//     else
//       n' := closestPrecedingNode(x);
//       return n'.ﬁndSuccessor(x);
BubbleHash.prototype.onFindSuccessor = function onFindSuccessor (dataConnection, data) {
  var self = this
    , successorHash = this.successor.hash
    , closestPrecedingNode
    , requestingPeer = data.peer;
    
  if (
    util.lessThan(this.self.hash, data.hash) &&
    (
      util.lessThan(data.hash, successorHash) ||
      util.equalTo(data.hash, successorHash)
    )
  ) {
    self.log("The successor of "+requestingPeer+" is "+this.successor.peer+".");
    // We found the succesor! Send it back on the active dataConnection
    dataConnection.send({
      type: this.types.FOUND_SUCCESSOR,
      peer: this.successor.peer,
      hash: this.successor.hash
    });
  }
  else {
    closestPrecedingNode = this.closestPrecedingNode(data.hash);
    
    this.log("Finding successor of "+closestPrecedingNode.peer+".");
    
    // Tell the closest preceeding node to find its successor
    closestPrecedingNode.send({
      type: this.types.FIND_SUCCESSOR,
      hash: data.hash,
      peer: data.peer
    });
    
    // Once found report the successor to the requesting node
    closestPrecedingNode.once("dataFoundSuccessor", function (dataConnection, data) {
      self.log("The successor of "+requestingPeer+" is "+data.peer+".");
      dataConnection.send({
        type: self.types.FOUND_SUCCESOR,
        peer: data.peer,
        hash: data.hash
      });
    });
  }
};