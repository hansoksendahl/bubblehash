var peerOpen = function (id) {
  // Request the peer manifest from mudb.org
  manifest.get(log.success("success:manifestGet", function () {
    var data = (this.responseText !== "") ? JSON.parse(this.responseText) : {}
      , list;

    // Initialize the manifest array
    data.manifest = data.manifest || [];
    
    // Filter out any duplicates
    data.manifest = data.manifest.filter(function (e) {
      return e !== id;
    });
    
    manifest.set(
      { manifest: [id].concat(data.manifest) },
      log.info("info:manifestUpdate")
    );
    
    function initialConnection () {
      // Attempt to establish a data connection
      var dataConnection = bubblehash.peer.connect(
        data.manifest[0],
        { metadata: bubblehash.metadata }
      );
      
      // Bind an event listenener to the open event on the dataConnection
      dataConnection.on(
        "open",
        log.success("success:createConnection", peerConnection)
      );
      
      // Perform pruning on the manifest list as neccesary and traverse
      // the manifest for connections.
      bubblehash.peer.once("error", function () {
        data.manifest = data.manifest.slice(1)
        manifest.set(
          { manifest: [id].concat(data.manifest) },
          log.info("info:manifestUpdate")
        );
        
        if (bubblehash.connections.length === 0  && data.manifest.length > 0) {
          initialConnection();
        };
      });
      
      // Hide the form fields and update status if connections list is empty.
      dataConnection.once("close", connectClose);
    }
    
    if (data.manifest.length > 0 ) {
      initialConnection();
    }
  }));
};