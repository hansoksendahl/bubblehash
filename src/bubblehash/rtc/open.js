// Produce a WebRTC offer
out.open = function (callback) {
  createOffer(function(description) {
    setLocalDescription(description, callback);
  }, options);
};