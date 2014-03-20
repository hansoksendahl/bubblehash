Bubblehash.prototype.lookup = function lookup (key, value) {
  this.successor.send({
    type: this.types.FIND_SUCCESSOR,
    peer: this.self.peer,
    hash: util.hash(key)
  });
};