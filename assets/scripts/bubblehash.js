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
var bubblehash = (function bubblehash() {
    var out = {};
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
                    alert("blah")
                    message += "\n\n" + e.stack
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
    out.logger = logger;
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
    out.xhr = xhr;
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

            function bindDataChannelEvents(channel) {
                channel.onmessage = log.message(0x0011);
                channel.onopen = log.message(0x0010);
                channel.onerror = log.error(0x2010);
                channel.onclose = log.message(0x0012);
            }

            // Initialize the connection
        return function init(server, options) {
            var connection = new peerConnection(server, options),
                out = {}

                // Expose the peer connection object
            out.connection = connection;

            connection.onicecandidate = addIceCandidate;

            // Parse messages send over the data channel.
            function message(event) {
                var signal = JSON.parse(event.data);

                console.log(signal);
            }

            // Add ICE candidates.
            function addIceCandidate(event) {
                if (event.candidate) {
                    connection.addIceCandidate(event.candidate);
                }
            }

            // Create an offer.
            function createOffer(success) {
                // Expose the datachannel object
                var datachannel = connection.createDataChannel("BH", {
                    reliable: false
                });

                bindDataChannelEvents(datachannel);

                out.datachannel = datachannel;

                success = log.message(0x0001, success);
                connection.createOffer(success, log.error(0x2001), {
                    mandatory: {
                        OfferToReceiveVideo: false,
                        OfferToReceiveAudio: false
                    }
                });
            }

            // Create an answer.
            function createAnswer(success) {
                connection.ondatachannel = function(event) {
                    var datachannel = event.channel;

                    bindDataChannelEvents(datachannel);

                    out.datachannel = datachannel;
                }

                success = log.message(0x0002, success);
                connection.createAnswer(success, log.error(0x2002), {
                    mandatory: {
                        OfferToReceiveVideo: false,
                        OfferToReceiveAudio: false
                    }
                });
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
                });
            };
            // Answer a WebRTC offer
            out.call = function(remoteDescription, callback) {
                setRemoteDescription(remoteDescription);
                createAnswer(function(localDescription) {
                    setLocalDescription(localDescription);
                    callback(localDescription);
                })
            }
            out.answer = function(description) {
                setRemoteDescription(description);
            }

            return out;
        }
    }())
    out.rtc = rtc;
    return out;
}())
