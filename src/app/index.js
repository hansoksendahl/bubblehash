(function (exports) {
  var cache, bubblehash, bubblehashOptions, notify, xhr
    , manifest = [];
    
import "dependencyCheck.js";

import "XHR/";

import "cache.js";

import "bubblehashOptions.js";

import "notify/";

import "updateStatus.js";

import "xhr/";

import "peerOpen.js";

import "manifestGet.js"

  // Bind some generic UI events.
  (function () {
    // Enable tooltips on form elements.
    $('[rel="tooltip"]').tooltip();
  }());

  bubblehash = new BubbleHash(bubblehashOptions);
  
  bubblehash.peer.on("open", function () {
    notify("success", "socket");
    updateStatus("connecting");
    peerOpen();
  });
  
  bubblehash.peer.once("connection", function () {
    notify("success", "recvConnection");
    updateStatus("on");
  });
  
  exports.bubblehash = bubblehash;
  
  notify("info", "welcome");
}(this));