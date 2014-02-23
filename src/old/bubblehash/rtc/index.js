var rtc = (function rtc () {
  // Shim for inter-browser compatibility
  var peerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection
    , iceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate
    , sessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription
    , getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia
  // Dev variables
    , logMessages = {};

import "messages";

  // Create a logger callback object
  var log = logger(logMessages, "RTC")
  
  // Initialize the connection
  return function init (server, options) {
    var connection = new peerConnection(server, options)
      , out = {}
    
    // Expose the peer connection object
    out.connection = connection;
    
    // Create an offer.
    function createOffer (success, options) {
      success = log.message(0x0001, success);
      options = options || {};
      connection.createOffer(success, log.error(0x2001), options);
    }
    
    // Create an answer.
    function createAnswer (success, options) {
      success = log.message(0x0002, success);
      options = options || {}
      connection.createAnswer(success, log.error(0x2002), options);
    }
    
    // Set the local description.
    function setLocalDescription (description, success) {
      description = (typeof description === "string" ? JSON.parse(description) : description);
      success = log.message(0x0003, success);
      var dict = new sessionDescription(description);
      connection.setLocalDescription(dict, function () { success(dict) }, log.error(0x2000));
    }
  
    // Set the remote description.
    function setRemoteDescription (description, success) {
      description = (typeof description === "string" ? JSON.parse(description) : description);
      success = log.message(0x0004, success);
      var dict = new sessionDescription(description);
      connection.setRemoteDescription(dict, function () { success(dict) }, log.error(0x2003));
    }

import "open";
import "call";
import "answer";
import "addIceCandidate";
    
    return out;
  }
}())