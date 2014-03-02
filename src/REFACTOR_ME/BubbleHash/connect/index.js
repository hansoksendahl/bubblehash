Bubblehash.prototype.connect = function (id, options) {
  var self = this
    , dc = this.peer.connect(id, options);
  
import "on/";
  
  return dc;
}