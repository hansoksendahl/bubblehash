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
  
  function bindDataChannelEvents (channel) {
    channel.onmessage = log.message(0x0011);
    channel.onopen = log.message(0x0010);
    channel.onerror = log.error(0x2010);
    channel.onclose = log.message(0x0012);
  }
  
  // Initialize the connection
  return function init (server, options) {
    var connection = new peerConnection(server, options)
      , out = {}
    
    // Expose the peer connection object
    out.connection = connection;
    
    connection.onicecandidate = addIceCandidate;
    
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
      if (out.datachannel && out.datachannel.readyState === "open") {
        out.dataChannel.send(JSON.stringify({type: "iceCandidate", candidate: event.candidate}))
      }
    }
    
    // Create an offer.
    function createOffer (success) {
      // Expose the datachannel object
      var datachannel = connection.createDataChannel("BH", { reliable: false });
      
      bindDataChannelEvents(datachannel);
      
      out.datachannel = datachannel;
      
      success = log.message(0x0001, success);
      connection.createOffer(success, log.error(0x2001), {mandatory: {OfferToReceiveVideo: false, OfferToReceiveAudio: false}});
    }
    
    // Create an answer.
    function createAnswer (success) {
      connection.ondatachannel = function (event) {
        var datachannel = event.channel;
        
        bindDataChannelEvents(datachannel);
        
        out.datachannel = datachannel;
      }
      
      success = log.message(0x0002, success);
      connection.createAnswer(success, log.error(0x2002), {mandatory: {OfferToReceiveVideo: false, OfferToReceiveAudio: false}});
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
    
    return out;
  }
}())