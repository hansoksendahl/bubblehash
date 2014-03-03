this.on("peerClose", function () {
  this._self = { metadata: { id: null }};
  this._successor = this._self;
  this._predecessor = null;
  this._finger = [];
});