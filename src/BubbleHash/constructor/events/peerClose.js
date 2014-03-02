this.on("peerClose", function () {
  this.self = null;
  this.successor = self;
});