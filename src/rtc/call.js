// Produce a WebRTC offer
out.call = function (callback) {
  createOffer(function(description) {
    setLocalDescription(description, callback);
  });
};