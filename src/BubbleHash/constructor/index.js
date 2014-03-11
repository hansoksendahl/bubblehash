// BubbleHash
// ==========
//
// This class implements a Chord distributed hash table with the help of the
// peerjs WebRTC library.
//
//     var peer = new Peer([id], [options]);
//
// Arguments
// ---------
//
// [id]: (_string_) if no id is provided one will be assigned by the server
// [options]: (_object_)
//
// * peer (_object_) - see the [PeerJS Documentation](http://peerjs.com/docs/#api)
//    for details
// * processes (_object_)
//   * fixFingers - interval (in seconds) for bubblehash.fixFingers
//   * stabilization - interval (in seconds) for bubblehash.stabilization
//   * checkPredecessor - interval (in seconds) for bubblehash.checkPredecessor
//   * fixSuccessorList - interval (in seconds) for bubbelhash.fixSuccessorList
function BubbleHash (id, options) {
  if (arguments.length === 1) {
    options = id;
    id = void(0);
  }
  
  options = options || {};
  options.interval = options.interval || {};
  
  var self = this;
  
  this.peer = new Peer(id, options.peer);
  this.self = null;
  this.predecessor = null;
  this.successor = this.self;
  this.fingers = [];
  this.successorList = [];
  this.processes = {};
  this.options = options;
  
  this.peer.on("connection", function (dataConnection) {
    self.bindDataConnection(dataConnection);
    dataConnection.hash = util.hash(dataConnection.peer);
  });
  
  // The Ouroboros - the peer first connects to itself since some of the
  // stabilization routines require a dataConnection to communicate across.
  //
  // This is perhaps a less than optimal solution but it will only arise
  // when the client has no other peers to connect to.
  this.peer.on("open", function (id) {
    self.self = self.join(id);
    self.self.hash = util.hash(id);
    self.successor = self.self;
    
    // Start processes
    self.fixFingers(options.interval.fixFingers || 10);
    // self.stabilization(options.interval.stabilization || 10);
    // self.checkPredecessor(options.interval.checkPredecessor || 10);
    // self.fixSuccessorList(options.interval.fixSuccessorList || 10);
  });
}