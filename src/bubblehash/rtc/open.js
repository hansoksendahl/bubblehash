// Produce a WebRTC offer
out.open = function (callback, options) {
  createOffer(function(description) {
    setLocalDescription(description, callback);
  }, log.error(0x2012), options);
};