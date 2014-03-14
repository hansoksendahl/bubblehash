BubbleHash.prototype.log = function log (message, obj) {
  var message
    , key;
  
  if (messages[message] !== void(0)) {
    message = messages[message];
    for (key in obj) {
      if (message[key] !== void(0)) {
        obj[key] = message[key](obj[key]);
      }
    }
    message = util.interpolate(message.message);
    message = (obj) ? message(obj) : message();
  }
  
  if (/Error/.test(Object.prototype.toString.call(message))) {
    console.error(message);
  }
  else if (this.options.log === true) {
    console.log(message);
  }
};