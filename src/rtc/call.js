// Answer a WebRTC offer
out.call = function (remoteDescription, callback) {
  setRemoteDescription(remoteDescription);
  createAnswer(function (localDescription) {
    setLocalDescription(localDescription);
    callback(localDescription);
  })
}