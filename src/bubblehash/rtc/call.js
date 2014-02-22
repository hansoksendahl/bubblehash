// Answer a WebRTC offer
out.call = function (remoteDescription, callback, options) {
  setRemoteDescription(remoteDescription);
  createAnswer(function (localDescription) {
    setLocalDescription(localDescription);
    callback(localDescription);
  }, log.error(0x2011), options)
}