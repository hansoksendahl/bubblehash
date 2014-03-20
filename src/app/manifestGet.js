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
    
    if (data.manifest.length > 0) {
      if (bubblehash.running === false) {
        updateStatus("connecting");
        notify("info", "searching");
        initialConnection();
      }
    }
    else if (bubblehash.running === false) {
      updateStatus("connecting");
      peerOpen();
    }
  }
  
  function initialConnection () {
    var dataConnection = bubblehash.join(data.manifest[0]);
    
    // Retry if the data connection fails.
    bubblehash.peer.once("error", retry);
    
    // If the data connection opens stop listening for retry messages.
    dataConnection.once("open", function () {
      dataConnection.removeListener("error", retry);
    });
  }
  
  initialConnection();
};