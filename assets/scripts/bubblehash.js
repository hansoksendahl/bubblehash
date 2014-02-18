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

        // General function for creating log messages.
        function log(code, type) {
            return function(err) {
                type = type || "log";
                err = err || "";

                var message = prefix + messages[code];

                if (err) {
                    message += "\n\n" + err;
                }

                console[type](message);
            };
        }

        // Log a warning message
        log.warning = function(code) {
            return log(code, "warning");
        };
        // Log an error message
        log.error = function(code) {
            return log(code, "error");
        };

        return log;
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

            request.ontimeout = log(0x2000);
            request.onerror = log(0x2001);

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


        // Create a logger callback object
        var log = logger(logMessages, "RTC")

        // Initialize the connection
        return function init(server, options) {
                var connection = new peerConnection(server, options),
                    out = {}, dataChannel

                    connection.ondatachannel = log(0x0000);
                connection.createDataChannel("BH", {
                    reliable: false
                });
                connection.onicecandidate = addIceCandidate;

                // Initialize the data channel.
                function dataChannel(event) {
                    dataChannel = event.channel
                    dataChannel.onmessage = message;
                }

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
                    success = success || log(0x0001);
                    connection.createOffer(success, log.error(0x2001), {
                        mandatory: {
                            OfferToReceiveVideo: false,
                            OfferToReceiveAudio: false
                        }
                    });
                }

                // Create an answer.
                function createAnswer(success) {
                    success = success || log(0x0002);
                    connection.createAnswer(success, log.error(0x2002), {
                        mandatory: {
                            OfferToReceiveVideo: false,
                            OfferToReceiveAudio: false
                        }
                    });
                }

                // Set the local description.
                function setLocalDescription(description, success) {
                    success = success || log(0x0003);
                    connection.setLocalDescription(description, function() {
                        success(description)
                    }, log.error(0x2000));
                }

                // Set the remote description.
                function setRemoteDescription(description, success) {
                    description = (typeof description === "string" ? JSON.parse(description) : description);
                    success = success || log(0x0004)
                    var dict = new sessionDescription(description);
                    connection.setRemoteDescription(dict, function() {
                        success(description)
                    }, log.error(0x2003));
                }

                // Produce a WebRTC offer
                out.call = function(callback) {
                    createOffer(function(description) {
                        setLocalDescription(description, callback);
                    });
                };
                // Answer a WebRTC offer
                out.answer = function(description, callback) {
                    setRemoteDescription(description);
                    createAnswer(function() {
                        setLocalDescription(callback);
                    })
                }

                return out;
            }
    }())
    out.rtc = rtc;
    return out;
}())
