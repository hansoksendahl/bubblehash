// ask node n to ﬁnd the successor of x
//
//     n.findSuccessor(x)
//       if (x ∈ (n,n.successor])
//         return n.successor;
//       else
//         n' := closestPrecedingNode(x);
//         return n'.ﬁndSuccessor(x);
N.prototype.findSuccessor = function findSuccessor (x) {
  if (util.lessThan(this.hash)) {
    
  }
  this.dataChannel.send({
    
  });
  this.on(this.types.FOUND_SUCCESSOR)
}