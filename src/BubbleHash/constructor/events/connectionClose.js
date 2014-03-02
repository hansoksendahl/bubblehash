this.on("connectionClose", function (dataConnection) {
  var key;
  
  for (key in this.connections) {
    if (this.connections[key].open === false) {
      delete this.connections[key];
    }
  }
  
  if (Object.keys(this.connections).length === 0) {
    this.emit("empty");
  }
});