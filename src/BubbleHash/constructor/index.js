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
  EventEmitter.call(this);
  
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
  this.successor = null;
  this.fingers = [];
  this.successorList = [];
  this.processes = {};
  this.options = options;
  
  this.peer.on("connection", function (dataConnection) {
    self.bindDataConnection(dataConnection);
    dataConnection.hash = util.hash(dataConnection.peer);
  });
  
  this.peer.on("error", function () {
    var peer
      , i
      , dataConnection;
    
    // Perform aggressive pruning of peer.js connections Fire the close event
    // on any failed connections.
    for (peer in this.connections) {
      this.connections[peer] = this.connections[peer].filter(function (dc) {
        if (dc.open === false) {
          dc.emit("error");
          dc.close();
        }
        return dc.open;
      });
      
      if (this.connections[peer].length === 0) {
        delete this.connections[peer];
      }
    }
    
    // Empty event emitter
    if (
      ! (bubblehash.fingers.some(function (f) { return f.open })) &&
      (! self.successor || self.successor.open === false) &&
      (! self.predecessor || self.predecessor.open === false)
    ) {
      self.emit("empty");
    }
  });
  
  // The Ouroboros - a pseudo data connection which ties into the BubbleHash
  // data connection event listeners
  this.peer.once("open", function (id) {
    self.self = (function () {
      function Ouroboros () {
        EventEmitter.call(this);
        
        this.peer = id;
        this.hash = util.hash(id);
        self.bindDataConnection(this);
      }
      
      util.inherits(Ouroboros, EventEmitter);
      
      Ouroboros.prototype.send = function send (data) {
        this.emit("data", data);
      };
      
      return new Ouroboros();
    }());
    
    // Start processes
    self.fixFingers(options.interval.fixFingers || 10);
    self.stabilize(options.interval.stabilize || 10);
    self.checkPredecessor(options.interval.checkPredecessor || 10);
    self.fixSuccessorList(options.interval.fixSuccessorList || 10);
    self.fixSuccessor(options.interval.fixSuccessor || 10);
  });
}

util.inherits(BubbleHash, EventEmitter);