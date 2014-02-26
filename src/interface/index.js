(function (exports) {
  // BubbleHash User Interface
  // -------------------------

  // Variables
  
  var ui, bubblehash, log, manifest
    , socketNumber = 50;

import "bubblehash/";

import "manifest/";

import "ui/";
  
  // Bind some generic UI events.
  (function () {
    // Enable tooltips on form elements.
    $('[rel="tooltip"]').tooltip();
  }());
  
  // Bind some events to the peer.
  bubblehash.peer.on("open", log.success("success:connected", peerOpen));
  
  bubblehash.peer.on("connection", log.success("success:recvConnection", peerConnection));
  
  bubblehash.peer.on("error", function (err) {
    switch (err.type) {
      case "browser-incompatible":
        log.danger("danger:"+err.type)();
        break;
      case "invalid-key":
        log.danger("danger:"+err.type)();
        break;
      case "invalid-id":
        log.danger("danger:"+err.type)();
        break;
      case "unavailable-id":
        log.danger("danger:"+err.type)();
        break;
      case "ssl-unavailable":
        log.danger("danger:"+err.type)();
        break;
      case "server-disconnected":
        log.danger("danger:"+err.type)();
        break;
      case "server-error":
        log.danger("danger:"+err.type)();
        break;
      case "socket-error":
        log.danger("danger:"+err.type)();
        break;
      case "socket-closed":
        log.danger("danger:"+err.type)();
        break;
    }
  });
  
  // Bind some BubbleHash UI events.
  ui.search.click(function () {
    
  });
  
  manifest.request.onerror = log.danger("danger:xhrError");
  manifest.request.ontimeout = log.danger("danger:xhrTimeout");
  
  log.info("info:welcome")();
}(this));
