xhr = (function () {
  var domain = "http://mudb.org"
    , length = 25
    , key = "ZZZZ"
    , out = {}
    , xhr;
  
  xhr = new XHR();
  
  out.get = function (callback) {
    xhr
        .get(domain+"/get/"+key, callback);
  };
  
  out.set = function (manifest, callback) {
    manifest.__id = key;
    
    xhr
        .data(manifest)
        .post(domain+"/set/json", callback);
  };
  
  out.request = xhr.request;
  
  return out;
}());