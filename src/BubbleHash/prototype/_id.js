BubbleHash.prototype._id = function _id (string, i) {
  return (
    (arguments.length > 1) ? this["_"+string][i] : this["_"+string]
  ).metadata.id;
};