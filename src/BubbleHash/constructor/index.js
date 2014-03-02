function BubbleHash (id, options) {
  var self = this;
  
  this.peer = new Peer(id, options);
  this.connections = {};
  this.predecessor = null;
  this.predecessorTTL = 0;
  this.self = null;
  this.successor = this.self;
  this.successorTTL = 0;
  this.fingers = [];
  
  this.peer.on("error", function (err) {
    self._raiseError("peer-"+err.type);
  });
  
  EventEmitter.call(this);
  
  ["Open", "Connection", "Call", "Close"].forEach(function (e) {
    self.peer.on(e.toLowerCase(), self._raiseEvent("peer"+e));
  });
  
import "events/";

  return this;
}

util.inherits(BubbleHash, EventEmitter);