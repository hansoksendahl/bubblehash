function rtc () {
  // Shim for inter-browser compatibility
  var peerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection
    , iceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate
    , sessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription
    , getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia
  // Dev variables
    , pcIn, pcOut
    , ch;
    

  // Init function establishes a connection
  function init (server, options) {
    pcIn = new peerConnection(server, options);
    pcOut = new peerConnection(server, options);
    
    ch = pcIn.createDataChannel("BubbleHash", { reliable: false });
    
    pcIn.onicecandidate = connectionGetLocalCandidate;
    
    ch.onopen = channelStateChange;
    ch.onclose = channelStateChange;
    
    init.ch = ch
    
    pcOut.onicecandidate = connectionGetRemoteCandidate;
    pcOut.ondatachannel = connectionGetChannel;
    
    pcIn.createOffer(connectionGetLocalDescription, void(0), logError);
  }
  
  // Change the channel state
  function channelStateChange () {
    logMessage(ch.readyState);
  }
  
  function channelGetMessage (event) {
    logMessage(event.data);
  }
  
  // Handle messages received through the data channel
  function connectionGetChannel (event) {
    event.channel.onmessage = channelGetMessage;
    event.channel.onopen = channelStateChange;
    event.channel.onclose = channelStateChange;
    
    init.ck = event.channel
  }
  
  // Get the local description
  function connectionGetLocalDescription (desc) {
    init.offer = JSON.stringify(desc);
    pcIn.setLocalDescription(desc, void(0), logError);
    pcOut.setRemoteDescription(desc, void(0), logError);
    pcOut.createAnswer(connectionGetRemoteDescription, void(0), logError);
  }
  
  // Get the remote description
  function connectionGetRemoteDescription (desc) {
    init.answer = JSON.stringify(desc);
    pcOut.setLocalDescription(desc, void(0), logError);
    pcIn.setRemoteDescription(desc, void(0), logError);
  }
  
  // Add a candidate to the signalling loop
  function connectionGetLocalCandidate (event) {
    if (event.candidate) {
      pcOut.addIceCandidate(event.candidate);
    }
  }
  
    // Add a candidate to the signalling loop
  function connectionGetRemoteCandidate (event) {
    if (event.candidate) {
      pcIn.addIceCandidate(event.candidate);
    }
  }
  
  function logMessage (msg) {
    console.log(msg);
  }
  
  function logError (e) {
    console.error(e);
  }
  
  return init;
}