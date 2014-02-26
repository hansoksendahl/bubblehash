bubblehash = (function () {
  var options = {};

import "options";
  
  if (localStorage.socketId !== void(0)) {
    return new BubbleHash(localStorage.socketId, options);  
  }
  else {
    return new BubbleHash(options); 
  }
}());