this.on("connectionData", function (dataConnection, data) {
  console.log(this._types, this._types[data.type], data);
  
  switch (data.type) {
    case this._types.FIND_SUCCESSOR:
      if (this._inHalfOpenRange(data.id, this._id("self"), this._id("successor"))) {
        data.type = this._types.FOUND_SUCCESSOR;
        dataConnection.send(data);
      } else {
        this._closestPrecedingNode(data.id).send(data)
      }
      break;
    
    case this._types.FOUND_SUCCESSOR:
      break;
      
  }
});