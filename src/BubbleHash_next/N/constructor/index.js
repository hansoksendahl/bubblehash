function N (chord, dataChannel) {
  EventEmitter.call(this);
  
  this.chord = chord;
  this.dataChannel = dataChannel;
  
  var self = this;
  
  // Data channel `open` event.
  dataChannel.onopen = function () {
    if (! chord.running) {
      chord.emit("open");
    }
  };
  
  // Data channel `close` event.
  dataChannel.onclose = function () {
    if (chord.running) {
      chord.emit("close");
    }
  };
  
  // Data channel `message` event.
  dataChannel.onmessage = function (data) {
    switch (data.type) {
      case self.types.FIND_SUCCESSOR:
        self.emit("findSuccessor", data);
        break;
      case self.types.FOUND_SUCCESSOR:
        self.emit("foundSuccessor", data);
        break;
      case self.types.FIND_PREDECESSOR:
        self.emit("findPredecessor", data);
        break;
      case self.types.FOUND_PREDECESSOR:
        self.emit("foundPredecessor", data);
        break;
      case self.types.GET_SUCCESSOR_LIST:
        self.emit("getSuccessorList", data);
        break;
      case self.types.GOT_SUCCESSOR_LIST:
        self.emit("gotSuccessorList", data);
        break;
      case self.types.NOTIFY:
        self.emit("notify", data);
        break;
      case self.types.MESSAGE:
        self.emit("message", data);
        break;
      default:
        chord.emit("error", data);
        break;
    }
  };
}

util.inherits(N, EventEmitter);