function connectClose () {
  if (bubblehash.connections.length === 0) {
    ui.statusOn.hide();
    ui.statusOff.show();
    ui.search.attr("disabled", "disabled");
    ui.searchQuery
        .attr("disabled", "disabled")
        .tooltip("hide");
        
    // Try again
    peerOpen(bubblehash.peer.id);
  }
}