// Detect if the client has the required APIs
if (
  ! (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB) &&
  ! (JSON) &&
  ! (window.mozRTCPeerConnection || window.webkitRTCPeerConnection)
) {
  alert("BubbleHash requires technology not present in your web browser.\n\nPlease download one of the latest versions of Chrome, Firefox, or Opera for an optimal compatibility.");
  window.location = "https://www.google.com/intl/en/chrome/browser/";
}

// Initialize variables used in the app
var iFace = {}
  , commServer
  , commOptions
  , commSilo
  , pc
  , dc
  , dataChannelName = "BubbleHash";

// Create jQuery selectors for each of the following ids
[
  "fldLocalOffer",
  "fldRemoteOffer",
  "fldRemoteAnswer",
  "fldLocalAnswer",
  "modLocalOffer",
  "modLocalAnswer",
  "modRemoteOffer",
  "modRemoteAnswer",
  "btnInvite",
  "btnJoin",
  "btnCreateOffer",
  "btnAcceptAnswer",
  "btnCreateAnswer"
].forEach(function (e) {
  iFace[e] = $("#"+e);
});

// Specify the communications Silo
commSilo = "http://mudb.org";
  
// Specify the WebRTC ICE servers
commServer = {
  iceServers: [
    {url: "stun:stun4.l.google.com:19302"},
    {url: "stun:stun.l.google.com:19302"},
    {url: "stun:stun1.l.google.com:19302"},
    {url: "stun:stun2.l.google.com:19302"},
    {url: "stun:stun3.l.google.com:19302"},
    {url: "stun:stun01.sipphone.com"},
    {url: "stun:stun.ekiga.net"},
    {url: "stun:stun.fwdnet.net"},
    {url: "stun:stun.ideasip.com"},
    {url: "stun:stun.iptel.org"},
    {url: "stun:stun.rixtelecom.se"},
    {url: "stun:stun.schlund.de"},
    {url: "stun:stunserver.org"},
    {url: "stun:stun.softjoys.com"},
    {url: "stun:stun.voiparound.com"},
    {url: "stun:stun.voipbuster.com"},
    {url: "stun:stun.voipstunt.com"},
    {url: "stun:stun.voxgratia.org"},
    {url: "stun:stun.xten.com"},
    {url: "turn:numb.viagenie.ca:3478", username: "hansoksendahl@gmail.com", credential: "num0mg!!"}
  ]
};

// Specify the WebRTC options
commOptions = {
  optional: [
    {DtlsSrtpKeyAgreement: true},
    {RtpDataChannels: true}
  ]
};

// Create a peer connection object
pc = bubblehash.rtc(commServer, commOptions);

// Bind message handler when datachannel is created
pc.connection.ondatachannel = function (event) {
  dc = event.channel;
  
  // Bind handlers to the data channel
  bindDataChannelHandlers(dc);
};

// Create an Invite URL and show the local offer modal window
function setOffer () {
  // Create a data channel
  dc = pc.connection.createDataChannel(dataChannelName);
  
  // Bind handlers to the data channel
  bindDataChannelHandlers(dc);
  
  // Initialize a WebRTC offer.
  pc.open(function (description) {
    // Put the WebRTC offer in the communications silo
    bubblehash.xhr(commSilo+"/set/json")
      .data(description)
      .post(function () {
        var data = JSON.parse(this.responseText);
        iFace.fldLocalOffer.val(data.url);
        iFace.modLocalOffer.modal();
        iFace.fldLocalOffer.focus();
        iFace.btnCreateOffer.click(getAnswer);
      });
  });
}

// Get the answer sent from a peer
function getAnswer () {
  iFace.modRemoteAnswer.modal();
  iFace.fldRemoteAnswer.val("").focus();
  iFace.btnAcceptAnswer.click(acceptAnswer);
}

// Establish the connection
function acceptAnswer () {
  bubblehash.xhr(iFace.fldRemoteAnswer.val()).get(function () {
    var data = JSON.parse(this.responseText);
    
    pc.answer(data);
    iFace.modRemoteAnswer.modal("hide");
  });
}

// Get the offer sent from a host
function getOffer () {
  iFace.modRemoteOffer.modal();
  iFace.fldRemoteOffer.val("").focus();
  iFace.btnCreateAnswer.click(setAnswer);
}

// Create an RSVP URL and show the local answer modal window
function setAnswer () {
  // Get the offer associated with the url.
  bubblehash.xhr(iFace.fldRemoteOffer.val()).get(function () {
    var data = JSON.parse(this.responseText);
    
    // Initialize a WebRTC answer
    pc.call(data, function (description) {
      // Put the WebRTC answer in the communications silo
      bubblehash.xhr(commSilo+"/set/json")
        .data(description)
        .post(function () {
            var data = JSON.parse(this.responseText);
            iFace.fldLocalAnswer.val(data.url);
            iFace.modLocalAnswer.modal();
            iFace.fldLocalAnswer.focus();
          });
        });
  });
}

// Bind the messaging protcol to the data channel once established.
function bindDataChannelHandlers (channel) {
  channel.onopen = function () { iFace.modLocalAnswer.modal("hide") };
  channel.onclose = function () { console.log("Data channel closed.") };
  channel.onmessage = function (event) { console.log(event.data) };
  channel.onerror = function (err) { console.error(err) };
  
  // Add ICE candidates and share with peers
  pc.connection.onicecandidate = function (event) {
    if (event.candidate) {
      pc.connection.addIceCandidate(event.candidate);
      
      channel.send(JSON.stringify({type: "iceCandidace", candidate: event.candidate}));
    }
  }
}


// Make text selected on focus
iFace.fldLocalOffer
    .focus(function () { this.select(); })
    .mouseover(function () { this.select(); })
    .mouseup(function () { return false; })
iFace.fldLocalAnswer
    .focus(function () { this.select(); })
    .mouseover(function () { this.select(); })
    .mouseup(function () { return false; })

iFace.btnInvite.click(setOffer);
iFace.btnJoin.click(getOffer);