function BubbleHash (id, options) {
  var self = this;
  
  this.peer = new Peer(id, options);
  this._predecessor = null;
  this._self = { metadata: { id: null } };
  this._successor = this._self;
  this._finger = [];
  
  this.peer.on("error", function (err) {
    self._raiseError("peer-"+err.type);
  });
  
  EventEmitter.call(this);
  
  ["Open", "Connection", "Call", "Close"].forEach(function (e) {
    self.peer.on(e.toLowerCase(), self._raiseEvent("peer"+e));
  });
  
import "events/";

  setInterval(function fix_fingers() {
      send(successor, {type: FIND_SUCCESSOR, id: addExp(id, nextFinger + 1), next: nextFinger});
      nextFinger += 13;
      if (nextFinger >= 127) {
          nextFinger -= 127;
      }
  }, 600).unref();

  return this;
}

util.inherits(BubbleHash, EventEmitter);