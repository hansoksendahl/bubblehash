BubbleHash.prototype.log = function log (message) {
  if (/Error/.test(Object.prototype.toString.call(message))) {
    console.error(message);
  }
  else if (this.options.log === true) {
    console.log(message);
  }
};