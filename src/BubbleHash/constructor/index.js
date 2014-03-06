function BubbleHash (id, options) {
  var self = this;
  
  this.peer = new Peer(id, options);
  this.self = {
    peer: null,
    hash: null
  }
  this.predecessor = null;
  this.successor = this.self;
  this.fingers = [];
  
  this.peer.on("error", function (error) {
    self._raiseError(error.type ? "peer-"+error.type : error);
  });
  
  EventEmitter.call(this);
  
  // Bind the following peer.js events to their corresponding BubbleHash event
  // handlers.
  ["Open", "Connection", "Call", "Close"].forEach(function (e) {
    self.peer.on(e.toLowerCase(), self._raiseEvent("peer"+e));
  });
  
import "events/";

  return this;
}

util.inherits(BubbleHash, EventEmitter);