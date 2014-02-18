function idb() {
  var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    , IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction
    , IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  
  if (! indexedDB) {
    throw("Your browser does not support IndexedDB.");
  }
  
  return function init (name, version) {
    version = (arguments.length === 1) ? 1 : version;
    
    var request = indexedDB.open(name, version);
    
    request.onerror = function (error) {
      throw(error);
    };
    
    request.onsuccess = function (event) {
      var db = request.result;
    };
    
    request.onupgradeneeded = function(event) { 
      var db = event.target.result;
    
      var objectStore = db.createObjectStore("data", { keyPath: "uuid" });
      
      objectStore.createIndex("uuid", "uuid", { unique: true })
    };
  }
  
  
}

