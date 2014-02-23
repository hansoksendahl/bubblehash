var Logger = (function () {
  function Logger (types, messages, prefix) {
    this.prefix = (prefix ? prefix+": " : "");
    this.messages = messages;
    
    var self = this
      , i;
      
    function typeCallback (type) {
      return function (code, callback) {
        return this.onmessage(type, this.getMessage(code), callback);
      };
    }
      
    for (var i = 0; i < types.length; i += 1) {
      this[types[i]] = typeCallback(types[i]);
    }
  }
  
  Logger.prototype.getMessage = function (code) {
    return this.prefix + this.messages[code];
  };
  
  return Logger;
}());