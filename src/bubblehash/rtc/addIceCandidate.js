out.addIceCandidate = function (candidate, success) {
  // Success and failure functions are not currently supported in chrome
  success = log.message(0x0005, success)();
  connection.addIceCandidate(new iceCandidate(candidate));
}