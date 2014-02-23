// BubbleHash Chord² Implementation
// --------------------------------

// Functions
var BubbleHash = (function () {
  var chord;
  
import "chord/";
  
import "peer/";

  function BubbleHash (options) {
    this.connections = [];
    this.peer = peer(options.peer || {});
  }
  
  return BubbleHash;
}());