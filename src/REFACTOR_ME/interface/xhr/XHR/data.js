// Set some data
XHR.prototype.data = function dataSetter (obj) {
  if (arguments.length === 0) {
    return this.__data;
  }
  
  this.__data = obj;
  return this;
};