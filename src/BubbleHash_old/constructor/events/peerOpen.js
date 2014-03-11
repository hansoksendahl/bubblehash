this.on("peerOpen", function (id) {
  this.self.peer = id;
  this.self.hash = util.hash(id);
});