BubbleHash.prototype._raiseEvent = function _raiseEvent () {
  var self = this
    , args = util.args(arguments);
  
  return function () {
    self.emit.apply(self, args.concat(util.args(arguments)));
  };
};