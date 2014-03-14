var messages = {
  findSuccessor: {
    message: "Finding successor of #{node}.",
    node: util.hashHex
  },
  foundSuccessor: {
    message: "The successor of #{node} is #{successor}.",
    node: util.hashHex,
    successor: util.hashHex
  },
  onFindSuccessor: {
    message: "The peer #{requestor} is requesting the successor of #{node}.",
    node: util.hashHex,
    requestor: util.hashHex
  },
  stabilize: {
    message: "Running the stabilization routine."
  },
  buildFingers: {
    message: "Running the buildFingers routine."
  },
  findPredecessor: {
    message: "Finding predecessor of #{node}",
    node: util.hashHex
  },
  newSuccessor: {
    message: "Found a new successor #{successor} for #{node}",
    node: util.hashHex,
    successor: util.hashHex
  },
  notify: {
    message: "Notifying #{successor} to set predecessor to #{node}",
    node: util.hashHex,
    successor: util.hashHex
  }
};