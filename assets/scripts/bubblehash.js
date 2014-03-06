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
            return listener.apply(this, arguments);
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
                if (listeners[i].apply(this, args) === false) {
                    break;
                }
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

    // Checks to see that `h_1` is less than `h_2`
    // Assumes that murmurhash values are little endian with the least significant
    // digit in the first block.
    util.lessThan = function(h_1, h_2) {
        var i;

        for (i = h_1.length - 1; i >= 0; i -= 1) {
            if (h_1[i] < h_2[i]) return true;
        }

        return false;
    };

    // Checks to see that `h_1` is equal to `h_2`
    // Assumes that murmurhash values are little endian with the least significant
    // digit in the first block.
    util.equalTo = function(h_1, h_2) {
        var i;

        for (i = h_1.length - 1; i >= 0; i -= 1) {
            if (h_1[i] == h_2[i]) return true;
        }

        return false;
    };

    util.hash = function hash(key, seed) {
        var h, i;

        h = murmurHash3.x86.hash128(key, seed)
            .match(/([a-f0-9]{8})([a-f0-9]{8})([a-f0-9]{8})([a-f0-9]{8})/)
            .slice(1, 5);

        for (i = 0; i < 4; i += 1) {
            h[i] = parseInt(h[i], 16);
        }

        return h;
    };

    util.logMinus = function(h_1, h_2) {
        var a = [],
            log_2 = Math.log(2),
            sum = 0,
            carry = 0,
            sub, i;

        for (i = h_1.length - 1; i >= 0; i -= 1) {
            sub = Math.abs(h_1[i]) - Math.abs(h_2[i]);

            if (sub < 0) {
                sub = (i < h_1.length - 1 && a[i + 1] > 0) ? 0x100000000 - sub : 0;
                carry = -1;
            } else {
                carry = 0;
            }

            a[i] = sub;
            sum += sub ? Math.log(sub) : 0;
        }

        console.log(a, sum)

        return sum ? Math.floor(sum / log_2) : 0;
    };

    function BubbleHash(id, options) {
        var self = this;

        this.peer = new Peer(id, options);
        this.self = {
            peer: null,
            hash: null
        }
        this.predecessor = null;
        this.successor = this.self;
        this.fingers = [];

        this.peer.on("error", function(error) {
            self._raiseError(error.type ? "peer-" + error.type : error);
        });

        EventEmitter.call(this);

        // Bind the following peer.js events to their corresponding BubbleHash event
        // handlers.
        ["Open", "Connection", "Call", "Close"].forEach(function(e) {
            self.peer.on(e.toLowerCase(), self._raiseEvent("peer" + e));
        });

        this.on("peerOpen", function(id) {
            this.self.peer = id;
            this.self.hash = util.hash(id);
        });

        this.on("peerConnection", function(dataConnection) {
            dataConnection.hash = util.hash(dataConnection.peer);
            this._bindDataConnection(dataConnection);
        });

        this.on("peerClose", function() {
            this.fingers = [];
        });

        this.on("connectionClose", function _cleanUp() {
            var id, live;

            for (id in this.peer.connections) {
                this.fingers = this.fingers.filter(function(dataConnection) {
                    if (dataConnection.open) {
                        return true;
                    }
                });
                this.peer.connections[id] = this.peer.connections[id].filter(function(dataConnection) {
                    if (dataConnection.open) {
                        return true;
                    }
                });
                if (this.peer.connections[id].length === 0) {
                    delete this.peer.connections[id];
                } else {
                    live = true;
                }
            }

            if (!live) {
                this.emit("empty");
            }
        });

        this.on("connectionData", function(dataConnection, data) {
            var event;

            console.log(data);

            switch (data.type) {
                case this._types.NOTIFY_SUCCESSOR:
                    event = "notifySuccessor";
                    this.emit()
                    break;
                case this._types.FIND_SUCCESSOR:
                    event = "findSuccessor";
                    break;
                case this._types.FOUND_SUCCESSOR:
                    event = "foundSuccessor";
                    break;
                case this._types.MESSAGE:
                    event = "message";
                    break;
                default:
                    event = "error"
                    break;
            }

            if (event === "error") {
                this._raiseError("messageType");
            } else {
                this.emit(event, dataConnection, data);
            }
        });

        this.on("connectionOpen", function(dataConnection) {
            dataConnection.hash = util.hash(dataConnection.peer);
            this._fixFingers();
        });

        // ask node n to ﬁnd the successor of x
        //
        //     if (x ∈ (n,n.successor])
        //       return n.successor;
        //     else
        //       n' := closestPrecedingNode(x);
        //       return n'.ﬁndSuccessor(x);
        this.on("findSuccessor", function(dataConnection, data) {
            var successorID = this.successor.hash,
                successor;

            if (
                util.lessThan(this.self.hash, dataConnection.hash) &&
                (
                    util.lessThan(dataConnection.hash, successorID) ||
                    util.equalTo(dataConnection.hash, successorID)
                )
            ) {
                successor = this.successor
            } else {
                successor = this._closestPrecedingNode(dataConnection.peer);
            }

            dataConnection.send({
                type: this._types.FOUND_SUCCESSOR,
                peer: successor.peer
            });
        });

        this.on("foundSuccessor", function(dataConnection, data) {
            this.fingers[data.peer] = this._connect(data.peer);
        });

        this.on("error", function _cleanUp() {
            var id, live;

            for (id in this.peer.connections) {
                this.fingers = this.fingers.filter(function(dataConnection) {
                    if (dataConnection.open) {
                        return true;
                    }
                });
                this.peer.connections[id] = this.peer.connections[id].filter(function(dataConnection) {
                    if (dataConnection.open) {
                        return true;
                    } else {
                        dataConnection.emit("error");
                    }
                });
                if (this.peer.connections[id].length === 0) {
                    delete this.peer.connections[id];
                } else {
                    live = true;
                }
            }

            if (!live) {
                this.emit("empty");
            }
        });

        return this;
    }

    util.inherits(BubbleHash, EventEmitter);

    BubbleHash.prototype._raiseError = function _raiseError(code) {
        this.emit("error", new Error(this._errorMessages[code] || code));
    };

    BubbleHash.prototype._raiseEvent = function _raiseEvent() {
        var self = this,
            args = util.args(arguments);

        return function() {
            self.emit.apply(self, args.concat(util.args(arguments)));
        };
    };

    BubbleHash.prototype._errorMessages = {
        "peer-browser-incompatible": "Your browser incompatible with BubbleHash.",
        "peer-invalid-key": "Invalid key for Peer.js cloud.",
        "peer-invalid-id": "Invalid ID specified for websocket.",
        "peer-unavailable-id": "Specified ID is already taken.",
        "peer-ssl-unavailable": "The Peer.js cloud does not use SSL.",
        "peer-server-disconnected": "The server is disconnected.",
        "peer-server-error": "Unable to reach the server.",
        "peer-socket-error": "Unable to communicate on socket.",
        "peer-socket-closed": "The socket closed unexpectedly.",
        "messageType": "Received an unrecognized message type."
    };

    BubbleHash.prototype._connect = function _connect(id, options) {
        options = options || {}

        // Create a data connection
        var dataConnection = this.peer.connect(id, options);

        dataConnection.hash = util.hash(id);

        return this._bindDataConnection(dataConnection);
    };

    BubbleHash.prototype.join = function join(id, options) {
        // Create a data connection
        var dataConnection = this._connect(id, options),
            self = this;

        // Clear the predecessor
        this.predecessor = null;

        // Bing an event to the data connection's `open` event which will send a Chord
        // `FIND_SUCCESSOR` event.
        dataConnection.once("open", function() {
            dataConnection.send({
                type: self._types.FIND_SUCCESSOR
            });

            self.once("foundSuccessor", function(dataConnection, data) {
                self.successor = self._connect(data.peer);
                self._buildFingers(self.successor);
                self._fixFingers();
            });
        });

        return dataConnection;
    };

    BubbleHash.prototype._bindDataConnection = function _bindDataConnection(dataConnection) {
        var self = this;

        // Bind event listeners for each named `event` to `dataConnection`.
        ["Data", "Open", "Close"].forEach(function(event) {
            dataConnection.on(
                event.toLowerCase(),
                self._raiseEvent(
                    "connection" + event,
                    dataConnection
                )
            );
        });

        return dataConnection;
    };

    // search finger table for the highest predecessor of x
    //
    //     for i := m - 1 downto 1
    //       if (finger[i] ∈ (n, x))
    //         return finger[i];
    //       return n;
    BubbleHash.prototype._closestPrecedingNode = function _closestPrecedingNode(x) {
        var i, finger;

        for (i = this.fingers.length - 1; i >= 1; i -= 1) {
            finger = this.fingers[i];

            if (
                util.lessThan(this.self.hash, finger.hash) &&
                util.lessThan(finger.hash, x.hash)
            ) {
                return finger;
            }
        }

        return this.self;
    };

    BubbleHash.prototype._types = {
        "NOTIFY_SUCCESSOR": 0,
        "FIND_SUCCESSOR": 1,
        "FOUND_SUCCESSOR": 2,
        "MESSAGE": 3
    };

    // build finger table
    //
    //     i₀ := ⌊log(successor - n)⌋ + 1;
    //     for i₀ ≤ i < m - 1
    //       finger[i] := s.findSuccessor(n + 2ⁱ);
    BubbleHash.prototype._buildFingers = function _buildFingers(s) {
        var i_0, i;

        i_0 = util.logMinus(this.successor.hash, this.self.hash) + 1;

        console.log(i_0)

        for (i = i_0; i < this.fingers.length - 1; i += 1) {
            if (s.peer !== this.peer.id) {
                s.send({
                    type: this._types.FIND_SUCCESSOR,
                    peer: this._addExp(this.self.hash, i)
                });
            }
        }
    };

    // Computes a new key equal to key + 2 ^ exponent.
    // Assumes key is a 4 element array of 32 bit words, least significant word first.
    BubbleHash.prototype._addExp = function _addExp(key, exponent) {
        var result = key.concat(); // copy array
        var index = Math.floor(exponent / 32);

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

    BubbleHash.prototype._fixFingers = function _fixFingers() {
        var self

        // FIXME
        // Make this interval into a configurable option
        if (!this.fixFingers) {
            self = this;

            this.fixFingers = setInterval(function() {
                self._buildFingers(self.self);
            }, 600);
        }
    }

    exports.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    exports.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.RTCPeerConnection;
    exports.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
    exports.BubbleHash = BubbleHash;
})(this);

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
    bubblehashOptions.debug = 0;

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

            // FIXME
            // This is a hack since Peer.js does note currently pass connection
            // errors to the Data Connection object.
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

            bubblehash.once("empty", retry);

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

    bubblehash.on("peerOpen", function() {
        notify("success", "socket");
        updateStatus("connecting");
        peerOpen();
    });

    bubblehash.on("peerConnection", function() {
        notify("success", "recvConnection");
        updateStatus("on");
    });

    bubblehash.on("error", function(err) {
        console.error(err);
    });

    exports.bubblehash = bubblehash;

    notify("info", "welcome");
}(this));
