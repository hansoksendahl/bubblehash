(function(exports) {
    var cache, bubblehash, bubblehashOptions, notify, xhr, manifest = [];

    // Detect if the client has the required APIs
    if (!(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB) && !(JSON) && !(window.mozRTCPeerConnection || window.webkitRTCPeerConnection)) {
        alert("BubbleHash requires technology not present in your web browser.\n\nPlease download one of the latest versions of Chrome, Firefox, or Opera for an optimal compatibility.");
        window.location = "https://www.google.com/intl/en/chrome/browser/";
    }

    // xhr
    var XHR = (function() {
        function XHR() {
            this.request = new XMLHttpRequest();
            this.__header = {};
            this.__data = {};
        }

        // Set some headers takes either a pair of arguments `key` and `value` or
        // optionally takes a dictionary containing pairs of keys and values.
        XHR.prototype.header = function headers(key, value) {
            if (arguments.length < 2) {
                if (typeof key === "string") {
                    return this.__header[key];
                }

                for (value in key) {
                    this.__header[value] = key[value];
                }
            } else {
                this.__header[key] = value;
                return this;
            }
        };
        // Set some data
        XHR.prototype.data = function dataSetter(obj) {
            if (arguments.length === 0) {
                return this.__data;
            }

            this.__data = obj;
            return this;
        };
        // Send an asynchronous HTTP GET request
        XHR.prototype.get = function get(url, callback) {
            this.send("get", url, callback);
            return this;
        };
        // Send an asynchronous HTTP POST request
        XHR.prototype.post = function(url, callback) {
            this.send("post", url, callback);
            return this;
        };
        // Send the request
        XHR.prototype.send = function send(type, url, callback) {
            var queryString = "",
                queryIndex, key;

            if (this.__data) {
                queryString = "json=" + JSON.stringify(this.__data);

                if (type === "get") {
                    queryIndex = url.indexOf("?");

                    if (queryIndex !== -1) {
                        url.replace("?", "?" + queryString + "&");
                    }
                }
            }

            this.request.open(type, url);

            for (key in this.__header) {
                this.request.setRequestHeader(key, this.__header[key]);
            }

            this.request.onload = callback;

            if (type === "post") {
                this.request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                this.request.send(queryString);
            } else {
                this.request.send();
            }
        }

        return XHR;
    }());

    // Cache jQuery selectors for any element with an id prefixed by "ui-"
    cache = (function() {
        var elements = {};

        // Use the jQuery prefix selector
        $('[id|="ui"]').each(function() {
            var key = this.id.match(/^ui-(.+)$/)[1];

            elements[key] = $(this);
        });

        return elements;
    }());

    bubblehashOptions = {};
    bubblehashOptions.peer = {};
    bubblehashOptions.peer.key = "mbv2swgd5tztcsor";
    bubblehashOptions.peer.config = {
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
    bubblehashOptions.peer.debug = 0;
    bubblehashOptions.log = true;

    notify = (function() {
        var i = 0,
            messages = {};

        messages.welcome = "BubbleHash by OX-Design.";
        messages.socket = "Connected to websocket.";
        messages.manifestUpdate = "Updated peer manifest.";
        messages.searching = "Searching for peers.";
        messages.general = "An error occured.\n\n";
        messages.recvConnection = "Remote dataconnection received!";
        messages.xhrError = "Could not request manifest file.";
        messages.xhrTimeout = "Timed out while requesting manifest file.";
        messages.manifestGet = "Got peer manifest.";
        messages.connection = "Connected to BubbleHash!";
        messages.empty = "Lost connection to BubbleHash!";

        return function(type, message) {
            message = messages[message] || message;

            var alertBox = cache[type].clone(),
                displayMessage = message;

            alertBox.attr("id", type + i);
            alertBox.find(".message").html(displayMessage);
            cache.alertContainer.prepend(alertBox);
            alertBox.show().alert();

            window.setTimeout(function() {
                alertBox.fadeTo(500, 0).slideUp(500, function() {
                    alertBox.remove();
                });
            }, 3000);

            i += 1;
        };
    }());

    var updateStatus = (function() {
        var statuses = $("[id^=ui-status]");

        return function statusUpdate(status) {
            statuses.hide();
            cache["status" + status[0].toUpperCase() + status.slice(1)].show();

            // Toggle form fields
            if (status === "on") {
                cache.search.removeAttr("disabled");
                cache.searchQuery.removeAttr("disabled");
            } else {
                cache.search.attr("disabled", "disabled");
                cache.searchQuery.attr("disabled", "disabled");
            }
        };
    }());

    xhr = (function() {
        var domain = "http://mudb.org",
            length = 25,
            key = "ZZZZ",
            out = {}, xhr;

        xhr = new XHR();

        out.get = function(callback) {
            xhr
                .get(domain + "/get/" + key, callback);
        };

        out.set = function(manifest, callback) {
            manifest.__id = key;

            xhr
                .data(manifest)
                .post(domain + "/set/json", callback);
        };

        out.request = xhr.request;

        return out;
    }());

    var peerOpen = function(id) {
        // Request the peer manifest from mudb.org
        xhr.get(manifestGet);
    };

    var manifestGet = function() {
        var data = (this.responseText !== "") ? JSON.parse(this.responseText) : {};

        notify("success", "manifestGet");

        // Initialize the manifest array
        data.manifest = data.manifest || [];

        // Filter out any duplicates
        data.manifest =
            data.manifest.filter(function(error) {
                return error !== bubblehash.peer.id;
            });

        // TODO
        // Put the trim length outside the scope of this function

        // Trim the list size to 20 minus the current peer
        data.manifest = data.manifest.slice(0, 19)

        xhr.set({
                manifest: [bubblehash.peer.id].concat(data.manifest)
            },
            function() {
                notify("info", "manifestUpdate");
            }
        );

        (function initialConnection() {
            var dataConnection = bubblehash.join(data.manifest[0]);

            // // FIXME
            // // This is a hack since Peer.js does note currently pass connection
            // // errors to the Data Connection object.
            function retry(error) {
                data.manifest = data.manifest.slice(1);
                updateStatus("connecting");

                if (data.manifest.length > 0) {
                    notify("info", "searching");
                    initialConnection();
                } else {
                    peerOpen();
                }
            }

            dataConnection.once("close", retry);

            dataConnection.once("open", function() {
                updateStatus("on");
                notify("success", "connection");
            });
        }());
    };

    // Bind some generic UI events.
    (function() {
        // Enable tooltips on form elements.
        $('[rel="tooltip"]').tooltip();
    }());

    bubblehash = new BubbleHash(bubblehashOptions);

    bubblehash.peer.once("open", function() {
        notify("success", "socket");
        updateStatus("connecting");
        peerOpen();
    });

    bubblehash.peer.once("connection", function() {
        notify("success", "recvConnection");
        updateStatus("on");
    });

    // bubblehash.on("error", function (err) {
    //   console.error(err);
    // });

    exports.bubblehash = bubblehash;

    notify("info", "welcome");
}(this));
