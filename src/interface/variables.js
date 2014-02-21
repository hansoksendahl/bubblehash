// Initialize variables used in the app
var iFace = {}
  , server
  , options
  , commSilo
  , dataChannelName = "BubbleHash";

// Create jQuery selectors for each of the following ids
[
  "glfStatusOn",
  "glfStatusOff",
  "fldLocalOffer",
  "fldRemoteOffer",
  "fldRemoteAnswer",
  "fldLocalAnswer",
  "modLocalOffer",
  "modLocalAnswer",
  "modRemoteOffer",
  "modRemoteAnswer",
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