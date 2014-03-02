this.on("peerOpen", function (id) {
  this.self = { id: id, hash: this.hash(id) };
  this.successor = this.self;
});