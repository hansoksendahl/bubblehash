//      _____________________________________________________________________
//     /  ____                                                               /\
//    /   /   )          /      /      /         /    /               /     / /
//   /   /__ /          /__    /__    /  ___    /___ /  ___    __    /__   / /
//  /   /    )  /   /  /   )  /   )  /  /___)  /    /  ____)  (_ `  /   ) / /
// /  _/____/  (___(  (___/  (___/  /  (___   /    /  (___(  '__)  /   / / /
// \_____________________________________________________________________\/
//                                 ▄▄▄▄▄▄
//                              ▄██▀▀▀▀▀▀██▄
//                            ▄█▀          ▀█▄
//                           ██              ██
//                          ██ ▄▀▀▀▄ ▀▄ ▄▀    ██
//                          ██ █   █   █   █████
//                          ██ ▀▄▄▄▀ ▄▀ ▀▄    ██
//                           ██              ██
//                            ▀█▄          ▄█▀
//                              ▀██▄▄▄▄▄▄██▀
//                                 ▀▀▀▀▀▀
//            BubbleHash is developed and maintained by OX-Design
//                          MIT user license 2014
// Log a message or error
function logger(messages, prefix) {
    prefix = (prefix ? prefix + ": " : "");

    var out = {};

    function log(type, message) {
        console[type](message);
    }

    // General function for creating log messages.
    function logCode(code, type, callback) {
        var message = prefix + messages[code];

        return function(e) {

            if (
                (type === "error" || type === "warning") &&
                (Object.prototype.toString.call(e).indexOf("Error") !== -1 ||
                    typeof e === "string")
            ) {
                message += "\n\n" + (e.stack ? e.stack : e)
            }

            log(type, message);
            if (callback) {
                callback.apply(this, arguments);
            }
        };
    }

    // Log a warning message
    out.warning = function(code, callback) {
        return logCode(code, "warning", callback);
    };
    // Log an error message
    out.error = function(code, callback) {
        return logCode(code, "error", callback);
    };
    // Log a message
    out.message = function(code, callback) {
        return logCode(code, "log", callback);
    };

    return out;
}
// xhr
var xhr = (function xhr() {
    var logMessages = {}, log;

    logMessages[0x0000] = "We get signal!";
    logMessages[0x0001] = "Opening connection...";
    logMessages[0x2000] = "Connction attempt timed out.";
    logMessages[0x2001] = "Lost signal.";

    log = logger(logMessages, "Signal");

    return function init(url) {
        var request = new XMLHttpRequest(),
            out = {}, headers = {}, data;

        request.ontimeout = log.message(0x2000);
        request.onerror = log.message(0x2001);

        // Send the request
        function send(type, callback) {
            var queryString = "",
                queryIndex, key;

            if (data) {
                queryString = "json=" + JSON.stringify(data);

                if (type === "get") {
                    queryIndex = url.indexOf("?");

                    if (queryIndex !== -1) {
                        url.replace("?", "?" + queryString + "&");
                    }
                }
            }

            request.open(type, url);

            for (key in headers) {
                request.setRequestHeader(key, headers[key]);
            }

            request.onload = callback;

            if (type === "post") {
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.send(queryString);
            } else {
                request.send();
            }
        }

        // Set some headres takes either a pair of arguments `key` and `value` or
        // optionally takes a dictionary containing pairs of keys and values.
        out.headers = function headers(key, value) {
            if (arguments.length < 2) {
                if (typeof key === "string") {
                    return headers[key];
                }

                for (value in key) {
                    headers[value] = key[value];
                }
            } else {
                headers[key] = value;
            }
        };
        // Set some data
        out.data = function dataSetter(obj) {
            if (arguments.length === 0) {
                return data;
            }

            data = obj;
            return out;
        };
        // Send an asynchronous HTTP GET request
        out.get = function get(callback) {
            send("get", callback);
            return out;
        };
        // Send an asynchronous HTTP POST request
        out.post = function(callback) {
            send("post", callback);
            return out;
        };

        return out;
    };
}());
var rtc = (function rtc() {
    // Shim for inter-browser compatibility
    var peerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
        iceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate,
        sessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription,
        getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia
        // Dev variables
        ,
        logMessages = {};

    // Various log messages used in the RTC stack
    logMessages[0x0000] = "Data channel established.";
    logMessages[0x0001] = "Creating an offer.";
    logMessages[0x0002] = "Creating an answer.";
    logMessages[0x0003] = "Setting local description.";
    logMessages[0x0004] = "Setting remote description.";
    logMessages[0x2000] = "An error occured while setting the local description.";
    logMessages[0x2001] = "An error occured creating an offer.";
    logMessages[0x2002] = "An error occured creating an answer.";
    logMessages[0x2003] = "An error occured while setting the remote description.";
    logMessages[0x0010] = "Data channel opened.";
    logMessages[0x0011] = "Data channel message received.";
    logMessages[0x0012] = "Data channel closed.";
    logMessages[0x2010] = "Error on data channel."

    // Create a logger callback object
    var log = logger(logMessages, "RTC")

    // Initialize the connection
    return function init(server, options) {
            var connection = new peerConnection(server, options),
                out = {}

                // Expose the peer connection object
            out.connection = connection;

            // Create an offer.
            function createOffer(success, options) {
                success = log.message(0x0001, success);
                options = options || {};
                connection.createOffer(success, log.error(0x2001), options);
            }

            // Create an answer.
            function createAnswer(success, options) {
                success = log.message(0x0002, success);
                options = options || {}
                connection.createAnswer(success, log.error(0x2002), options);
            }

            // Set the local description.
            function setLocalDescription(description, success) {
                description = (typeof description === "string" ? JSON.parse(description) : description);
                success = log.message(0x0003, success);
                var dict = new sessionDescription(description);
                connection.setLocalDescription(dict, function() {
                    success(dict)
                }, log.error(0x2000));
            }

            // Set the remote description.
            function setRemoteDescription(description, success) {
                description = (typeof description === "string" ? JSON.parse(description) : description);
                success = log.message(0x0004, success);
                var dict = new sessionDescription(description);
                connection.setRemoteDescription(dict, function() {
                    success(dict)
                }, log.error(0x2003));
            }

            // Produce a WebRTC offer
            out.open = function(callback) {
                createOffer(function(description) {
                    setLocalDescription(description, callback);
                }, options);
            };
            // Answer a WebRTC offer
            out.call = function(remoteDescription, callback, options) {
                setRemoteDescription(remoteDescription);
                createAnswer(function(localDescription) {
                    setLocalDescription(localDescription);
                    callback(localDescription);
                }, options)
            }
            out.answer = function(description) {
                setRemoteDescription(description);
            }

            return out;
        }
}())
// Detect if the client has the required APIs
if (!(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB) && !(JSON) && !(window.mozRTCPeerConnection || window.webkitRTCPeerConnection)) {
    alert("BubbleHash requires technology not present in your web browser.\n\nPlease download one of the latest versions of Chrome, Firefox, or Opera for an optimal compatibility.");
    window.location = "https://www.google.com/intl/en/chrome/browser/";
}
// Initialize variables used in the app
var iFace = {}, server, options, commSilo, dataChannelName, leaseTime, heartbeatTime, timer;

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
].forEach(function(e) {
    iFace[e] = $("#" + e);
});

// Specify the communications Silo
commSilo = "http://mudb.org";

// Lease is 10 minutes on mudb
leaseTime = 600000

heartbeatTime = 10000

// Specify the WebRTC ICE servers
server = {
    iceServers: [{
        url: "stun:stun4.l.google.com:19302"
    }, {
        url: "stun:stun.l.google.com:19302"
    }, {
        url: "stun:stun1.l.google.com:19302"
    }, {
        url: "stun:stun2.l.google.com:19302"
    }, {
        url: "stun:stun3.l.google.com:19302"
    }, {
        url: "stun:stun01.sipphone.com"
    }, {
        url: "stun:stun.ekiga.net"
    }, {
        url: "stun:stun.fwdnet.net"
    }, {
        url: "stun:stun.ideasip.com"
    }, {
        url: "stun:stun.iptel.org"
    }, {
        url: "stun:stun.rixtelecom.se"
    }, {
        url: "stun:stun.schlund.de"
    }, {
        url: "stun:stunserver.org"
    }, {
        url: "stun:stun.softjoys.com"
    }, {
        url: "stun:stun.voiparound.com"
    }, {
        url: "stun:stun.voipbuster.com"
    }, {
        url: "stun:stun.voipstunt.com"
    }, {
        url: "stun:stun.voxgratia.org"
    }, {
        url: "stun:stun.xten.com"
    }, {
        url: "turn:numb.viagenie.ca:3478",
        username: "hansoksendahl@gmail.com",
        credential: "num0mg!!"
    }]
};

// Specify the WebRTC options
options = {
    optional: [{
        DtlsSrtpKeyAgreement: true
    }, {
        RtpDataChannels: true
    }]
};

pc = rtc(server, options);
dc = pc.connection.createDataChannel(dataChannelName);

function shutdown() {
    dc.close();
    pc.connection.close();
    dc = void(0);
    pc = void(0);
}

// Create an Invite URL and show the local offer modal window
function setOffer() {
    shutdown();

    // Create a peer connection object
    pc = rtc(server, options);

    // Create a data channel
    dc = pc.connection.createDataChannel(dataChannelName);

    // Bind handlers to the data channel
    bindDataChannelHandlers(dc);

    // Initialize a WebRTC offer.
    pc.open(function(description) {
        // Put the WebRTC offer in the communications silo
        xhr(commSilo + "/set/json")
            .data(description)
            .post(function() {
                var data = JSON.parse(this.responseText);
                iFace.fldLocalOffer.val(data.url);
                iFace.modLocalOffer.modal();
                iFace.fldLocalOffer.focus();
                timer = setInterval(listenForAnswer(data), heartbeatTime);
            });
    });
}

function listenForAnswer(originalData) {
    return function() {
        xhr(originalData.url).get(function() {
            var data = JSON.parse(this.responseText);

            if (data.__timestamp !== originalData.__timestamp) {
                clearInterval(timer);
                pc.answer(data);
            }
        });
    }
}

// Establish the connection
function acceptAnswer(val) {
    xhr(val).get(function() {
        var data = JSON.parse(this.responseText);

        pc.answer(data);
    });
}

// Get the offer sent from a host
function getOffer() {
    iFace.modRemoteOffer.modal();
    iFace.fldRemoteOffer.val("").focus();
    iFace.btnCreateAnswer.click(setAnswer);
}


// Create an RSVP URL and show the local answer modal window
function setAnswer() {
    shutdown();

    // Create a peer connection object
    pc = rtc(server, options);

    // Bind handlers to the peer connection
    bindPeerConnectionHandlers(pc);

    // Get the offer associated with the url.
    xhr(iFace.fldRemoteOffer.val()).get(function() {
        var data = JSON.parse(this.responseText);

        // Initialize a WebRTC answer
        pc.call(data, function(description) {
            description.__id = data.__id;

            console.log(description)

            // Put the WebRTC answer in the communications silo
            xhr(commSilo + "/set/json")
                .data(description)
                .post();
        });
    });
}

function bindPeerConnectionHandlers(connection) {
    // Bind message handler when datachannel is created
    connection.connection.ondatachannel = function(event) {
        dc = event.channel;

        // Bind handlers to the data channel
        bindDataChannelHandlers(dc);
    };
}

// Bind the messaging protcol to the data channel once established.
function bindDataChannelHandlers(channel) {
    channel.onopen = function() {
        console.log("Data channel opened.");
        iFace.glfStatusOff.hide();
        iFace.glfStatusOn.show();
        iFace.modLocalAnswer.modal("hide");

    };
    channel.onclose = function() {
        console.log("Data channel closed.");
        iFace.glfStatusOn.hide();
        iFace.glfStatusOff.show();
    };
    channel.onmessage = function(event) {
        console.log(event.data)
    };
    channel.onerror = function(err) {
        console.error(err)
    };

    // Add ICE candidates and share with peers
    pc.connection.onicecandidate = function(event) {
        if (event.candidate) {
            pc.connection.addIceCandidate(event.candidate);

            if (dc.readyState === "open") {
                dc.send(JSON.stringify({
                    type: "iceCandidace",
                    candidate: event.candidate
                }));
            }
        }
    };
}

// Some helper functions for the form fields

function fldSelect() {
    this.select();
}

function fldMouseOver() {
    this.focus();
    return false;
}

function fldMouseUp() {
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
