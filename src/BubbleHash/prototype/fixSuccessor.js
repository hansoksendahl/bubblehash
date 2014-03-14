// periodically update failed successor
//
//     n.fixSuccessor()
//       if (successor.open = false)
//         successor := smallest alive node in successorList
BubbleHash.prototype.fixSuccessor = function (interval) {
  var self = this;
  
  if (! this.processes.fixSuccessor) {
    this.processes.fixSuccessor = setInterval(function () {
      var successor
        , smallest
        , i;
      
      if (
        self.successor === null ||
        self.successor.open === false
      ) {
        if (self.successorList.length > 0) {
          smallest = self.successorList[0]
          
          for (i = 1; i < self.successorList.length; i += 1) {
            successor = self.successorList[i];
            
            if (util.lessThan(successor[1], smallest)) {
              smallest = successor;
            }
          }
          
          successor = self.connect(smallest[0]);
          
          successor.once("open", function () {
            self.successor = successor;
          });
        }
      }
    }, interval * 1000);
  }
};