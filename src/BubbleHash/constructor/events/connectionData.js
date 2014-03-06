this.on("connectionData", function (dataConnection, data) {
  var event;
  
  console.log(data);
  
  switch (data.type) {
    case this._types.NOTIFY_SUCCESSOR:
      event = "notifySuccessor";
      this.emit()
      break;
    case this._types.FIND_SUCCESSOR:
      event = "findSuccessor";
      break;
    case this._types.FOUND_SUCCESSOR:
      event = "foundSuccessor";
      break;
    case this._types.MESSAGE:
      event = "message";
      break;
    default:
      event = "error"
      break;
  }
  
  if (event === "error") {
    this._raiseError("messageType");
  }
  else {
    this.emit(event, dataConnection, data);
  }
});