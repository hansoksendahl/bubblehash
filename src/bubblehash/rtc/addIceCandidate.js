out.function addIceCandidate (candidate, success) {
  success = log.warning(0x0005, success);
  connection.addIceCandidate(new iceCandidate({
    sdpMLineIndex: candidate.sdpMLineINdex,
    candidate: candidate.candidate
  }), success, log.warning(0x1000));
}