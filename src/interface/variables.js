// Initialize variables used in the app
var iFace = {}
  , server
  , options
  , commSilo
  , dataChannelName
  , leaseTime
  , heartbeatTime
  , timer;

dataChannelName = "BubbleHash";

// Create jQuery selectors for each of the following ids
[
  "glfStatusOn",
  "glfStatusOff",
  "fldLocalOffer",
  "fldRemoteOffer",
  "fldRemoteAnswer",
  "fldLocalAnswer",
  "modLocalOffer",
  "modRemoteOffer",
  "navInvite",
  "navJoin",
  "btnCreateOffer",
  "btnAcceptAnswer",
  "btnCreateAnswer",
  "btnCancel"
].forEach(function (e) {
  iFace[e] = $("#"+e);
});

// Specify the communications Silo
commSilo = "http://mudb.org";

// Lease is 10 minutes on mudb
leaseTime = 600000

heartbeatTime = 10000