this.on("peerOpen", function (id) {
  var hash = this._hash(id);
  
  this.self = {
    id: id,
    hash: hash,
    this.chunks: this._splitHash(hash)
  };
  
  this.successor = this.self;
});