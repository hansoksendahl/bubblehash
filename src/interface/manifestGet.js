var manifestGet = function () {
  var data = (this.responseText !== "") ? JSON.parse(this.responseText) : {}
    , dataConnection;

  notify("success", "manifestGet")

  // Initialize the manifest array
  data.manifest = data.manifest || [];
  
  // Filter out any duplicates
  data.manifest =
  data.manifest.filter(function (e) {
    return e !== bubblehash.self.id;
  });
  
  manifest = data.manifest;
  
  xhr.set(
    { manifest: [bubblehash.self.id].concat(manifest) },
    function () {
      notify("info", "manifestUpdate");
    }
  );
  
  (function initialConnection () {
    dataConnection = bubblehash.connect(manifest[0]);
    
    dataConnection.once("open", function () {
      updateStatus("on");
      notify("success", "createConnection");
    });
    
    bubblehash.on("error", function (e) {
      data.manifest = data.manifest.slice(1);
      
      if (Object.keys(this.connections).length === 0) {
        xhr.set(
          { manifest: [bubblehash.self.id].concat(data.manifest) },
          function () {
            notify("info", "manifestUpdate");
          }
        );
      
        if (data.manifest.length > 0) {
          initialConnection();
        }
      }
    });
  }());
};