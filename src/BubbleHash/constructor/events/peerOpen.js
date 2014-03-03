this.on("peerOpen", function (id) {
  this._self.metadata.id = this._hash(id);
  this._successor = this._self;
});