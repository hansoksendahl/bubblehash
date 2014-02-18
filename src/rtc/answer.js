// Answer a WebRTC offer
out.answer = function (description, callback) {
  setRemoteDescription(description);
  createAnswer(function () {
    setLocalDescription(callback);
  })
}