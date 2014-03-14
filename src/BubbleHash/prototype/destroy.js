BubbleHash.prototype.destroy = function destroy () {
  var key;
  
  this.peer.destroy();
  
  for (key in this.processes) {
    clearInterval(this.processes[key]);
  }
};