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
  , pc;

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
  "btnCreateAnswer",
  "btnAcceptOffer"
].forEach(function (e) {
  iFace[e] = $("#"+e);
});

// Specify the communications Silo
commSilo = "http://mudb.org";
  
// Specify the WebRTC ICE servers
commServer = {
  iceServers: [
    {url: "stun:stun4.l.google.com:19302"},
    {url: "turn:numb.viagenie.ca", username: "hansoksendahl@gmail.com", credential: "num0mg!!"}
  ]
};

// Specify the WebRTC options
commOptions = {
  optional: [
    {RtpDataChannels: true}
  ]
};

// Initialize a PeerConnection
function initPeer () {
  pc = bubblehash.rtc(commServer, commOptions);
}

// Create an Invite URL and show the local offer modal window
function setOffer () {
  initPeer();
  
  // Initialize a WebRTC offer.
  pc.call(function (description) {
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
  iFace.fldRemoteAnswer.focus();
  iFace.btnAcceptAnswer.click(acceptAnswer);
}

// Establish the connection
function acceptAnswer () {
  var pcAnswer = bubblehash.rtc(commServer, commOptions);
  
}

// Get the offer sent from a host
function getOffer () {
  iFace.modRemoteOffer.modal();
  iFace.fldRemoteOffer.focus();
  iFace.btnCreateAnswer.click(setAnswer);
}

// Create an RSVP URL and show the local answer modal window
function setAnswer () {
  // Get the offer associated with the url.
  bubblehash.xhr(iFace.fldRemoteOffer.val()).get(function () {
    var data = JSON.parse(this.responseText);
    
    initPeer();
    
    pc.answer(new RTCSessionDescription(data.sdp, data.type), function (description) {
      bubblehash.xhr(commSilo+"/set/json")
        .data(description)
        .post(function () {
            var data = JSON.parse(this.responseText);
            console.log(data);
          });
        });
  });
}

// Check that the connection has been established
function acceptOffer () {
  
}


// Make text selected on focus
iFace.fldLocalOffer
    .focus(function () { this.select(); })
    .mouseup(function (){ return false; })

iFace.btnInvite.click(setOffer);
iFace.btnJoin.click(getOffer);