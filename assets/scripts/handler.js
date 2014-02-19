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
var commServer
  , commOptions
  , commSilo
  , pcOffer
  , offer
  , answers
  , offer;

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

// Create a new PeerConnection object
pcOffer = bubblehash.rtc(commServer, commOptions);

// Initialize a WebRTC offer.
pcOffer.call(function (description) {
  offer = description;
});

function shareOffer (callback) {
  bubblehash.xhr(commSilo+"/set/json")
    .data(offer)
    .post(function () {
      var data = (JSON.parse(this.responseText));
      $("#offerURL").val(data.url).focus();
      $("#showLocalOffer").modal();
    });
}

$("#host").click(shareOffer);