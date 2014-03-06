// ask node n to ﬁnd the successor of x
//
//     if (x ∈ (n,n.successor])
//       return n.successor;
//     else
//       n' := closestPrecedingNode(x);
//       return n'.ﬁndSuccessor(x);
this.on("findSuccessor", function (dataConnection, data) {
  var successorID = this.successor.hash
    , successor;
  
  if (
    util.lessThan(this.self.hash, dataConnection.hash) &&
    (
      util.lessThan(dataConnection.hash, successorID) ||
      util.equalTo(dataConnection.hash, successorID)
    )
  ) {
    successor = this.successor
  }
  else {
    successor = this._closestPrecedingNode(dataConnection.peer);
  }
  
  dataConnection.send({
    type: this._types.FOUND_SUCCESSOR,
    peer: successor.peer
  });
});