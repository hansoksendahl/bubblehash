var manifestGet = function () {
  var data = (this.responseText !== "") ? JSON.parse(this.responseText) : {};

  notify("success", "manifestGet");

  // Initialize the manifest array
  data.manifest = data.manifest || [];
  
  // Filter out any duplicates
  data.manifest =
  data.manifest.filter(function (error) {
    return error !== bubblehash.peer.id;
  });
  
  // TODO
  // Put the trim length outside the scope of this function
  
  // Trim the list size to 20 minus the current peer
  data.manifest = data.manifest.slice(0, 19)
  
  xhr.set(
    { manifest: [bubblehash.peer.id].concat(data.manifest) },
    function () {
      notify("info", "manifestUpdate");
    }
  );
  
  // FIXME
  // This is a hack since Peer.js does note currently pass connection
  // errors to the Data Connection object.
  function retry () {
    data.manifest = data.manifest.slice(1);
    updateStatus("connecting");
    
    if (data.manifest.length > 0) {
      notify("info", "searching");
      initialConnection();
    }
    else {
      peerOpen();
    }
  }
  
  function initialConnection () {
    var dataConnection = bubblehash.join(data.manifest[0]);
    
    dataConnection.once("error", retry);
    
    dataConnection.once("open", function () {
      bubblehash.peer.removeListener("error", retry);
      dataConnection.removeListener("close", retry);
      
      bubblehash.once("empty", function () {
        updateStatus("connecting");
        peerOpen();
      });
      
      updateStatus("on");
      notify("success", "connection");
    });
  }
  
  initialConnection();
};