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
}())
