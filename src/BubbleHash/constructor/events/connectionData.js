this.on("connectionData", function (dataConnection, data) {
  switch(data.type) {
    case NOTIFY_SUCCESSOR:
      break;
      
    case NOTIFY_PREDECESSOR:
      break;
      
    case FIND_SUCCESSOR:
      if (inHalfOpenRange(message.id, this.self.hash, successor.id)) {
        data.type = FOUND_SUCCESSOR;
        dataConnection.send(data);
      }
      break;
      
    case FOUND_SUCCESSOR:
      break;
    case MESSAGE:
      if (message.id) {
        if (inHalfOpenRange(message.hash, id, successor.id)) {
          delete message.id;
          send(this.successor)
        } else {
          
        }
      }
      else {
        
      }
      break;
      
    default:
      this._raiseError("messageType");
      break;
  }
});