function peerConnection (dataConnection) {
  ui.statusOff.hide();
  ui.statusOn.show();
  ui.search.removeAttr("disabled");
  ui.searchQuery.removeAttr("disabled");
  
  ui.searchQuery.tooltip("show");
  
  // Hide the form fields and update status if connections list is empty.
  dataConnection.once("close", connectClose);
}