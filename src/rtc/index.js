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
      , dataChannel
    
    connection.ondatachannel = log(0x0000);
    connection.createDataChannel("BH", { reliable: false });
    connection.onicecandidate = addIceCandidate;
    
    // Initialize the data channel.
    function dataChannel (event) {
      dataChannel = event.channel
      dataChannel.onmessage = message;
    }
    
    // Parse messages send over the data channel.
    function message (event) {
      var signal = JSON.parse(event.data);
      
      console.log(signal);
    }
    
    // Add ICE candidates.
    function addIceCandidate (event) {
      if (event.candidate) {
        connection.addIceCandidate(event.candidate);
      }
    }
    
    // Create an offer.
    function createOffer (success) {
      success = success || log(0x0001);
      connection.createOffer(success, log.error(0x2001), {mandatory: {OfferToReceiveVideo: false, OfferToReceiveAudio: false}});
    }
    
    // Create an answer.
    function createAnswer (success) {
      success = success || log(0x0002);
      connection.createAnswer(success, log.error(0x2002), {mandatory: {OfferToReceiveVideo: false, OfferToReceiveAudio: false}});
    }
    
    // Set the local description.
    function setLocalDescription (description, success) {
      success = success || log(0x0003);
      connection.setLocalDescription(description, function () { success(description) }, log.error(0x2000));
    }
  
    // Set the remote description.
    function setRemoteDescription (description, success) {
      description = (typeof description === "string" ? JSON.parse(description) : description);
      success = success || log(0x0004)
      var dict = new sessionDescription(description);
      connection.setRemoteDescription(dict, function () { success(description) }, log.error(0x2003));
    }

import "call";
import "answer";
    
    return out;
  }
}())