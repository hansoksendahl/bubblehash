(function (exports) {
  // BubbleHash User Interface
  // -------------------------

import "Logger/";
  
  // Variables
  
  var ui, bubblehash, log;

import "ui/";
  
  // Bind some generic UI events.
  (function () {
    function select () {
      document.getSelection().removeAllRanges();
      this.select();
    }
    
    // Make it easy to copy che client ID.
    ui.clientID.mousedown(function () { return false; });
    ui.clientID.mouseenter(select);
    ui.clientID.mouseleave(function () {
      document.getSelection().removeAllRanges();
    });
    
    // Enable tooltips on form elements.
    $('[rel="tooltip"]').tooltip();
  }());
  
import "bubblehash/";
  
  // Bind some events to the peer.
  bubblehash.peer.on("open", log.info("info:welcome", function (id) {
    ui.clientID.val(id);
  }));
  
  bubblehash.peer.on("connection", log.success("success:dataConnection"));
  
  bubblehash.peer.on("error", log.danger("error:general"))
  
  // Bind some BubbleHash UI events.
  ui.connect.click(function () {
    
  });
}(this));
