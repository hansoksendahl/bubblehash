var manifestGet = function () {
  var data = (this.responseText !== "") ? JSON.parse(this.responseText) : {};

  notify("success", "manifestGet");

  // Initialize the manifest array
  data.manifest = data.manifest || [];
  
  // Filter out any duplicates
  data.manifest =
  data.manifest.filter(function (e) {
    return e !== bubblehash.peer.id;
  });
  
  (function initialConnection () {
    var dataConnection = bubblehash.join(data.manifest[0]);
    
    xhr.set(
      { manifest: [bubblehash.peer.id].concat(data.manifest) },
      function () {
        notify("info", "manifestUpdate");
      }
    );
    
    dataConnection.once("open", function () {
      updateStatus("on");
      notify("success", "createConnection");
    });
    
    bubblehash.once("error", function (e) {
      if (
        this._finger.length === 0 &&
        data.manifest.length > 0
      ) {
        data.manifest = data.manifest.slice(1);
        initialConnection();
      }
    });
  }());
};