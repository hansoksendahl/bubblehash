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

(function(exports) {
    /**
     * Light EventEmitter. Ported from Node.js/events.js
     *
     * Eric Zhang
     */

    /**
     * EventEmitter class
     * Creates an object with event registering and firing methods
     */
    function EventEmitter() {
        // Initialise required storage variables
        this._events = {};
    }

    var isArray = Array.isArray;


    EventEmitter.prototype.addListener = function(type, listener, scope, once) {
        if ('function' !== typeof listener) {
            throw new Error('addListener only takes instances of Function');
        }

        // To avoid recursion in the case that type == "newListeners"! Before
        // adding it to the listeners, first emit "newListeners".
        this.emit('newListener', type, typeof listener.listener === 'function' ?
            listener.listener : listener);

        if (!this._events[type]) {
            // Optimize the case of one listener. Don't need the extra array object.
            this._events[type] = listener;
        } else if (isArray(this._events[type])) {

            // If we've already got an array, just append.
            this._events[type].push(listener);

        } else {
            // Adding the second element, need to change to array.
            this._events[type] = [this._events[type], listener];
        }
        return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function(type, listener, scope) {
        if ('function' !== typeof listener) {
            throw new Error('.once only takes instances of Function');
        }

        var self = this;

        function g() {
            self.removeListener(type, g);
            listener.apply(this, arguments);
        }

        g.listener = listener;
        self.on(type, g);

        return this;
    };

    EventEmitter.prototype.removeListener = function(type, listener, scope) {
        if ('function' !== typeof listener) {
            throw new Error('removeListener only takes instances of Function');
        }

        // does not use listeners(), so no side effect of creating _events[type]
        if (!this._events[type]) return this;

        var list = this._events[type];

        if (isArray(list)) {
            var position = -1;
            for (var i = 0, length = list.length; i < length; i++) {
                if (list[i] === listener ||
                    (list[i].listener && list[i].listener === listener)) {
                    position = i;
                    break;
                }
            }

            if (position < 0) return this;
            list.splice(position, 1);
            if (list.length === 0)
                delete this._events[type];
        } else if (list === listener ||
            (list.listener && list.listener === listener)) {
            delete this._events[type];
        }

        return this;
    };


    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;


    EventEmitter.prototype.removeAllListeners = function(type) {
        if (arguments.length === 0) {
            this._events = {};
            return this;
        }

        // does not use listeners(), so no side effect of creating _events[type]
        if (type && this._events && this._events[type]) this._events[type] = null;
        return this;
    };

    EventEmitter.prototype.listeners = function(type) {
        if (!this._events[type]) this._events[type] = [];
        if (!isArray(this._events[type])) {
            this._events[type] = [this._events[type]];
        }
        return this._events[type];
    };

    EventEmitter.prototype.emit = function(type) {
        type = arguments[0];
        var handler = this._events[type],
            l, args, i;

        if (!handler) return false;

        if (typeof handler == 'function') {
            switch (arguments.length) {
                // fast cases
                case 1:
                    handler.call(this);
                    break;
                case 2:
                    handler.call(this, arguments[1]);
                    break;
                case 3:
                    handler.call(this, arguments[1], arguments[2]);
                    break;
                    // slower
                default:
                    l = arguments.length;
                    args = new Array(l - 1);
                    for (i = 1; i < l; i++) args[i - 1] = arguments[i];
                    handler.apply(this, args);
            }
            return true;

        } else if (isArray(handler)) {
            l = arguments.length;
            args = new Array(l - 1);
            for (i = 1; i < l; i++) args[i - 1] = arguments[i];

            var listeners = handler.slice();
            for (i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(this, args);
            }
            return true;
        } else {
            return false;
        }
    };

    var util = {};

    util.inherits = function(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    };

    util.args = function(args) {
        return Array.prototype.slice.call(args);
    };

    function BubbleHash(id, options) {
        var self = this;

        this.peer = new Peer(id, options);
        this.connections = {};
        this.predecessor = null;
        this.predecessorTTL = 0;
        this.self = null;
        this.successor = this.self;
        this.successorTTL = 0;
        this.fingers = [];

        this.peer.on("error", function(err) {
            self._raiseError("peer-" + err.type);
        });

        EventEmitter.call(this);

        ["Open", "Connection", "Call", "Close"].forEach(function(e) {
            self.peer.on(e.toLowerCase(), self._raiseEvent("peer" + e));
        });

        this.on("peerOpen", function(id) {
            this.self = {
                id: id,
                hash: this.hash(id)
            };
            this.successor = this.self;
        });

        this.on("peerConnection", function(dataConnection) {
            this._bindDataConnection(dataConnection);
        });

        this.on("connectionOpen", function(dataConnection) {
            this.connections[dataConnection.peer] = dataConnection;
        });

        this.on("connectionClose", function(dataConnection) {
            var key;

            for (key in this.connections) {
                if (this.connections[key].open === false) {
                    delete this.connections[key];
                }
            }

            if (Object.keys(this.connections).length === 0) {
                this.emit("empty");
            }
        });

        this.on("connectionData", function(dataConnection, data) {
            switch (data.type) {
                case NOTIFY_SUCCESSOR:
                    break;

                case NOTIFY_PREDECESSOR:
                    break;

                case FIND_SUCCESSOR:
                    if (inHalfOpenRange(message.id, this.self.hash, successor.id)) {
                        data.type = FOUND_SUCCESSOR;
                        dataConnection.send(data);
                    }
                    break;

                case FOUND_SUCCESSOR:
                    break;
                case MESSAGE:
                    if (message.id) {
                        if (inHalfOpenRange(message.hash, id, successor.id)) {
                            delete message.id;
                            send(this.successor)
                        } else {

                        }
                    } else {

                    }
                    break;

                default:
                    this._raiseError("messageType");
                    break;
            }
        });

        return this;
    }

    util.inherits(BubbleHash, EventEmitter);

    BubbleHash.prototype._raiseError = function _raiseError(code) {
        this.emit("error", new Error(this._messages[code] || code));
    };
    BubbleHash.prototype._raiseEvent = function _raiseEvent() {
        var self = this,
            args = util.args(arguments);

        return function() {
            self.emit.apply(self, args.concat(util.args(arguments)));
        };
    };
    BubbleHash.prototype._messages = {
        "peer-browser-incompatible": "Your browser incompatible with BubbleHash.",
        "peer-invalid-key": "Invalid key for Peer.js cloud.",
        "peer-invalid-id": "Invalid ID specified for websocket.",
        "peer-unavailable-id": "Specified ID is already taken.",
        "peer-ssl-unavailable": "The Peer.js cloud does not use SSL.",
        "peer-server-disconnected": "The server is disconnected.",
        "peer-server-error": "Unable to reach the server.",
        "peer-socket-error": "Unable to communicate on socket.",
        "peer-socket-closed": "The socket closed unexpectedly.",
        "messageMype": "Received an unrecognized message type."
    };
    BubbleHash.prototype.hash = function _hash(key, seed) {
        var h, i;

        h = murmurHash3.x86.hash128(key, seed)
            .match(/([a-f0-9]{8})([a-f0-9]{8})([a-f0-9]{8})([a-f0-9]{8})/)
            .slice(1, 5);

        for (i = 0; i < 4; i += 1) {
            h[i] = parseInt(h[i], 16);
        }

        return h;
    }
    // Is key in (low, high)
    BubbleHash.prototype._inRange = function _inRange(key, low, high) {
        //return (low < high && key > low && key < high) ||
        //    (low > high && (key > low || key < high)) ||
        //    (low === high && key !== low);
        return (this._lessThan(low, high) && this._lessThan(low, key) && this._lessThan(key, high)) || (this._lessThan(high, low) && (this._lessThan(low, key) || this._lessThan(key, high))) || (this._equalTo(low, high) && !this._equalTo(key, low));
    }
    // Is key in (low, high]
    BubbleHash.prototype._inHalfOpenRange = function _inHalfOpenRange(key, low, high) {
        //return (low < high && key > low && key <= high) ||
        //    (low > high && (key > low || key <= high)) ||
        //    (low == high);
        return (this._lessThan(low, high) && this._lessThan(low, key) && this._lessThanOrEqual(key, high)) || (this._lessThan(high, low) && (this._lessThan(low, key) || this._lessThanOrEqual(key, high))) || (this._equalTo(low, high));
    }
    // Key comparison
    BubbleHash.prototype._lessThan = function _lessThan(low, high) {
        if (low.length !== high.length) {
            // Arbitrary comparison
            return low.length < high.length;
        }

        for (var i = 0; i < low.length; ++i) {
            if (low[i] < high[i]) {
                return true;
            } else if (low[i] > high[i]) {
                return false;
            }
        }

        return false;
    }
    BubbleHash.prototype._lessThanOrEqual = function _lessThanOrEqual(low, high) {
        if (low.length !== high.length) {
            // Arbitrary comparison
            return low.length <= high.length;
        }

        for (var i = 0; i < low.length; ++i) {
            if (low[i] < high[i]) {
                return true;
            } else if (low[i] > high[i]) {
                return false;
            }
        }

        return true;
    }
    BubbleHash.prototype._equalTo = function _equalTo(a, b) {
        if (a.length !== b.length) {
            return false;
        }

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) {
                return false;
            }
        }

        return true;
    }
    // Computes a new key equal to key + 2 ^ exponent.
    // Assumes key is a 4 element array of 32 bit words, most significant word first.
    BubbleHash.prototype._addExp = function _addExp(key, exponent) {
        var result = key.concat(); // copy array
        var index = key.length - Math.floor(exponent / 32) - 1;

        result[index] += 1 << (exponent % 32);

        var carry = 0;
        while (index >= 0) {
            result[index] += carry;
            carry = 0;
            if (result[index] > 0xffffffff) {
                result[index] -= 0x100000000;
                carry = 1;
            }--index;
        }

        return result;
    }
    BubbleHash.prototype._nextKey = function _nextKey(key) {
        return this._addExp(key, 0);
    }
    BubbleHash.prototype.connect = function connect(id, options) {
        var dataConnection = this.peer.connect(id, options),
            self = this;

        this._bindDataConnection(dataConnection);

        return dataConnection;
    };
    BubbleHash.prototype._bindDataConnection = function _bindDataConnection(dataConnection) {
        var self = this;

        ["Data", "Open", "Close"].forEach(function(e) {
            dataConnection.on(
                e.toLowerCase(),
                self._raiseEvent(
                    "connection" + e,
                    dataConnection
                )
            );
        });
    }

    exports.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    exports.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.RTCPeerConnection;
    exports.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
    exports.BubbleHash = BubbleHash;
})(this);

(function(exports) {
    var cache, bubblehash, bubblehashOptions, notify, xhr, manifest = [];

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
    bubblehashOptions.key = "mbv2swgd5tztcsor";
    bubblehashOptions.config = {
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
    bubblehashOptions.debug = 3;

    notify = (function() {
        var i = 0,
            messages = {};

        messages.welcome = "BubbleHash by OX-Design.";
        messages.connected = "Connected to websocket.";
        messages.manifestUpdate = "Searching for peers.";
        messages.general = "An error occured.\n\n";
        messages.recvConnection = "Remote dataconnection received!";
        messages.xhrError = "Could not request manifest file.";
        messages.xhrTimeout = "Timed out while requesting manifest file.";
        messages.manifestGet = "Got peer manifest.";
        messages.createConnection = "Connected to BubbleHash!";
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
        var data = (this.responseText !== "") ? JSON.parse(this.responseText) : {}, dataConnection;

        notify("success", "manifestGet")

        // Initialize the manifest array
        data.manifest = data.manifest || [];

        // Filter out any duplicates
        data.manifest =
            data.manifest.filter(function(e) {
                return e !== bubblehash.self.id;
            });

        manifest = data.manifest;

        xhr.set({
                manifest: [bubblehash.self.id].concat(manifest)
            },
            function() {
                notify("info", "manifestUpdate");
            }
        );

        (function initialConnection() {
            dataConnection = bubblehash.connect(manifest[0]);

            dataConnection.once("open", function() {
                updateStatus("on");
                notify("success", "createConnection");
            });

            bubblehash.on("error", function(e) {
                data.manifest = data.manifest.slice(1);

                if (Object.keys(this.connections).length === 0) {
                    xhr.set({
                            manifest: [bubblehash.self.id].concat(data.manifest)
                        },
                        function() {
                            notify("info", "manifestUpdate");
                        }
                    );

                    if (data.manifest.length > 0) {
                        initialConnection();
                    }
                }
            });
        }());
    };

    // Bind some generic UI events.
    (function() {
        // Enable tooltips on form elements.
        $('[rel="tooltip"]').tooltip();
    }());

    bubblehash = new BubbleHash(bubblehashOptions);

    bubblehash.on("peerOpen", function() {
        notify("success", "connected");
        updateStatus("connecting");
        peerOpen();
    });

    bubblehash.on("peerConnection", function() {
        notify("success", "recvConnection");
        updateStatus("on");
    });

    bubblehash.on("peerError", function() {
        notify("danger", "general");
        updateStatus("off");
    });

    bubblehash.on("empty", function() {
        notify("danger", "empty")
        updateStatus("connecting");
        peerOpen();
    })

    exports.bubblehash = bubblehash;

    notify("info", "welcome");
}(this));
