// Detect if the client has the required APIs
if (
  ! (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB) &&
  ! (JSON) &&
  ! (window.mozRTCPeerConnection || window.webkitRTCPeerConnection)
) {
  alert("BubbleHash requires technology not present in your web browser.\n\nPlease download one of the latest versions of Chrome, Firefox, or Opera for an optimal compatibility.");
  window.location = "https://www.google.com/intl/en/chrome/browser/";
}

var iface
  , comm
  , commServer
  , commOptions
  , signalServer;
  
signalServer = "http://mudb.org";
  
commServer = {
  iceServers: [
    {url: "stun:stun4.l.google.com:19302"},
    {url: "turn:numb.viagenie.ca", username: "hansoksendahl@gmail.com", credential: "num0mg!!"}
  ]
};

commOptions = {
  optional: [
    {RtpDataChannels: true}
  ]
};

comm = rtc(commServer, commOptions);

comm.call(function (description) {
  xhr(signalServer+"/set/json")
      .data(description)
      .post(function () {
        var data = (JSON.parse(this.responseText));
        document.getElementById("offer").value = data.url;
      })
});
