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

import "manifestGet.js";

import "dbConnection.js";

import "searchSubmit.js";

  // Bind some generic UI events.
  (function () {
    // Enable tooltips on form elements.
    $('[rel="tooltip"]').tooltip();
  }());

  bubblehash = new BubbleHash(bubblehashOptions);
  
  // Make the search button fire the submit event.
  cache.searchBtn.on("click", function () {
    $(this).closest("form").trigger("submit")
  });
  
  cache.search.on("submit", function () {
    searchSubmit();
    
    // Prevent default
    return false;
  });
  
  (function () {
    var hashTags = ["#test", "#awesome", "#sandbox"];
    
    cache.searchQuery.attr("placeholder", hashTags[Math.floor(Math.random() * hashTags.length)]);
  }());
  
  bubblehash.peer.on("open", function () {
    notify("success", "socket");
    updateStatus("connecting");
    peerOpen();
  });
  
  bubblehash.peer.once("connection", function () {
    notify("success", "recvConnection");
    updateStatus("on");
  });
  
  exports.queries = queries;
  exports.bubblehash = bubblehash;
  
  notify("info", "welcome");
}(this));