BubbleHash.prototype.bindDataConnection = function bindDataConnection (dataConnection) {
  var self = this;
  
  dataConnection.on("data", function (data) {
    console.log(data);
    
    switch (data.type) {
      case self.types.NOTIFY:
        this.emit("dataNotify", dataConnection, data)
        break;
      case self.types.FIND_SUCCESSOR:
        this.emit("dataFindSuccessor", dataConnection, data);
        break;
      case self.types.FOUND_SUCCESSOR:
        this.emit("dataFoundSuccessor", dataConnection, data);
        break;
      case self.types.FIND_PREDECESSOR:
        this.emit("dataFindPredecessor", dataConnection, data);
        break;
      case self.types.FOUND_PREDECESSOR:
        this.emit("dataFoundPredecessor", dataConnection, data);
        break;
      case self.types.GET_SUCCESSOR_LIST:
        this.emit("dataGetSuccessorList", dataConnection, data);
        break;
      case self.types.GOT_SUCCESSOR_LIST:
        this.emit("dataGotSuccessorList", dataConnection, data);
        break;
      case self.types.MESSAGE:
        self.emit("dataMessage", data.message);
        break;
      default:
        this.emit("error", new Error("Unrecognized message type."))
        break;
    }
  });
  
  dataConnection.on("dataNotify", function (dataConnection, data) {
    self.onNotify(dataConnection, data);
  });
  
  dataConnection.on("dataFindSuccessor", function (dataConnection, data) {
    self.onFindSuccessor(dataConnection, data);
  });
  
  // dataConnection.on("dataFoundSuccessor", function (dataConnection, data) {
  //   self.onFoundSuccessor(dataConnection, data);
  // });
  
  dataConnection.on("dataFindPredecessor", function (dataConnection, data) {
    self.onFindPredecessor(dataConnection, data);
  });
  
  // dataConnection.on("dataFoundPredecessor", function (dataConnection, data) {
  //   self.onFoundPredecessor(dataConnection, data);
  // });
  
  dataConnection.on("dataGetSuccessorList", function (dataConnection, data) {
    self.onGetSuccessorList(dataConnection, data);
  });
  
  // dataConnection.on("dataGotSuccessorList", function (dataConnection, data) {
  //   self.onGotSuccessorList(dataConnection, data);
  // });
  
  dataConnection.on("dataMessage", function (dataConnection, data) {
    self.onMessage(dataConnection, data);
  });
};