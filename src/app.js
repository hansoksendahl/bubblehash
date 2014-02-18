function bubblehash (offer) {

  
  bh.lookup = function (key) {
    var hash = hash(key),
      , successor =
  };
  
  function hash (key) {
    return Sha1.hash(key);
  }
  
  // Bubblehash read method
  bh.get = function (key) {
    var hash = hash(key);
      , successor = bh.lookup(hash);
  };
  
  bh.set = function (key, value) {
    var hash = hash(key);
  }
}