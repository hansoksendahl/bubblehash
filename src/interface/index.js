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
  
  bubblehash.on("peerOpen", function () {
    notify("success", "socket");
    updateStatus("connecting");
    peerOpen();
  });
  
  bubblehash.on("peerConnection", function () {
    notify("success", "recvConnection");
    updateStatus("on");
  });
  
  bubblehash.on("error", function (err) {
    console.error(err);
  });
  
  exports.bubblehash = bubblehash;
  
  notify("info", "welcome");
}(this));