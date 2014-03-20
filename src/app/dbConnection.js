var queries = (function () {
  var out = {}
    , store;
  
  // Bubblehash uses the following schema
  //
  // * id: (number) [autoincrement]
  // * created: (Date)
  // * modified: (Date)
  // * key: (string)
  // * value: (?)
  db.open({
    server: "BubbleHashDemo",
    version: 1,
    schema: {
      bubbles: {
        key: {
          keyPath: "id",
          autoIncrement: true
        },
        indexes: {
          created: { /*...*/ },
          modified: { /*...*/ },
          hash: { /*...*/ }
        }
      }
    }
  }).done(function (s) {
    store = s;
  });
  
  out.read = function (key, callback) {
    var transaction = store.bubbles.query()
      .filter("hash", murmurHash3.x86.hash128(key))
      .execute();
      
    if (arguments.length > 1) {
      transaction.done(callback);
    }
  };
  
  out.create = function (key, value, callback) {
    var transaction = store.bubbles.add({
      hash: murmurHash3.x86.hash128(key),
      created: new Date().getTime(),
      modified: new Date().getTime(),
      value: value
    });
    
    if (arguments.length > 1) {
      transaction.done(callback);
    }
  };
  
  out.update = function (key, value, callback) {
    var transaction = store.bubbles.update({
      hash: murmurHash3.x86.hash128(key),
      created: value.created,
      modified: new Date().getTime(),
      value: value.value
    });
    
    if (arguments.length > 1) {
      transaction.done(callback);
    }
  };
  
  // NOTE
  // Delete is a keyword in Javascript.
  out.destroy = function (key, callback) {
    store.bubbles.remove(key).done(callback);
  };
  
  return out;
}());