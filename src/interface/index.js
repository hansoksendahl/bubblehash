import "dependencyCheck.js";
import "variables.js";

// Specify the WebRTC ICE servers
server = {
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
options = {
  optional: [
    {DtlsSrtpKeyAgreement: true},
    {RtpDataChannels: true}
  ]
};

pc = rtc(server, options);
dc = pc.connection.createDataChannel(dataChannelName);

function shutdown () {
  dc.close();
  pc.connection.close();
  dc = void(0);
  pc = void(0);
}

// Create an Invite URL and show the local offer modal window
function setOffer () {
  shutdown();
  
  // Create a peer connection object
  pc = rtc(server, options);
  
  // Create a data channel
  dc = pc.connection.createDataChannel(dataChannelName);
  
  // Bind handlers to the data channel
  bindDataChannelHandlers(dc);
  
  // Initialize a WebRTC offer.
  pc.open(function (description) {
    // Put the WebRTC offer in the communications silo
    xhr(commSilo+"/set/json")
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
  xhr(iFace.fldRemoteAnswer.val()).get(function () {
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
  shutdown();
  
  // Create a peer connection object
  pc = rtc(server, options);
  
  // Bind handlers to the peer connection
  bindPeerConnectionHandlers(pc);
  
  // Get the offer associated with the url.
  xhr(iFace.fldRemoteOffer.val()).get(function () {
    var data = JSON.parse(this.responseText);
    
    // Initialize a WebRTC answer
    pc.call(data, function (description) {
      // Put the WebRTC answer in the communications silo
      xhr(commSilo+"/set/json")
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

function bindPeerConnectionHandlers (connection) {
  // Bind message handler when datachannel is created
  connection.connection.ondatachannel = function (event) {
    dc = event.channel;
    
    // Bind handlers to the data channel
    bindDataChannelHandlers(dc);
  };
}

// Bind the messaging protcol to the data channel once established.
function bindDataChannelHandlers (channel) {
  channel.onopen = function () {
    console.log("Data channel opened.");
    iFace.glfStatusOff.hide();
    iFace.glfStatusOn.show();
    iFace.modLocalAnswer.modal("hide");
    
  };
  channel.onclose = function () {
    console.log("Data channel closed.");
    iFace.glfStatusOn.hide();
    iFace.glfStatusOff.show();
  };
  channel.onmessage = function (event) { console.log(event.data) };
  channel.onerror = function (err) { console.error(err) };
  
  // Add ICE candidates and share with peers
  pc.connection.onicecandidate = function (event) {
    if (event.candidate) {
      pc.connection.addIceCandidate(event.candidate);
      
      if (dc.readyState === "open") {
        dc.send(JSON.stringify({type: "iceCandidace", candidate: event.candidate}));
      }
    }
  };
}

// Some helper functions for the form fields

function fldSelect() {
  this.select();
}

function fldMouseOver () {
  this.focus();
  return false;
}

function fldMouseUp () {
  return false;
}


// Bind events to 
iFace.fldLocalOffer
    .focus(fldSelect)
    .mouseover(fldMouseOver)
    .mouseup(fldMouseUp);
iFace.fldLocalAnswer
    .focus(fldSelect)
    .mouseover(fldMouseOver)
    .mouseup(fldMouseUp);

iFace.navInvite.click(setOffer);
iFace.navJoin.click(getOffer);
iFace.btnCancel.click(shutdown);