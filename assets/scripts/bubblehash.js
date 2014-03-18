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
    var util = util || {};

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

    // Checks to see that h₁ is less than h₂
    // Assumes that murmurhash values are little endian with the least significant
    // digit in the first block.
    util.lessThan = function(h_1, h_2) {
        var i;

        for (i = h_1.length - 1; i >= 0; i -= 1) {
            if (h_1[i] < h_2[i]) {
                return true;
            } else if (h_2[i] < h_1[i]) {
                return false;
            }
        }

        // h₁ ≡ h₂
        return false;
    };

    // Checks to see that `h_1` is equal to `h_2`
    // Assumes that murmurhash values are little endian with the least significant
    // digit in the first block.
    util.equalTo = function(h_1, h_2) {
        var i;

        for (i = h_1.length - 1; i >= 0; i -= 1) {
            if (h_1[i] !== h_2[i]) return false;
        }

        return true;
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

    // Since `(h₁ - h₂) ∈ {x|0≤x<2¹²⁸-1}` and we are restricted to 32 bit unsigned
    // integers we cannot easily calculate the actual value of h₁ - h₂.
    //
    // While the following may be true by careful manipulation of string based
    // exponential notation we can represent these values with enough precision to
    // accurately calculate the value of `log(h₁ - h₂)`.
    //
    // The method currently used is a bit of a hack.  It takes the most significant
    // chunk not equal to zero from h₁-h₂ and uses Javascript exponential notation
    // to come as close to the actual value as our 32bit values will allow.
    // It has some rounding errors due to loss of precision.
    //
    // Better approaches could be based on factorization but these approaches would
    // not work for primes.  As prime numbers are only divisible by one and
    // themselves.
    //
    // It is unknown whether there exists a Javascript Bigint library which provides
    // a `log` member function.  Greater precision could be established with a 
    // library that supports integer types with higher levels of precision.
    util.logMinus = function(h_1, h_2) {
        var a = [],
            buffer = "",
            carry = 0,
            sub = 0,
            i, enc = 0,
            encL = 0,
            hex, e = 0;

        // If h₁ < h₂ swap h₁ and h₂.
        if (util.lessThan(h_1, h_2)) {
            sub = h_1;
            h_1 = h_2;
            h_2 = sub;
        }

        // Subtract h₂ from h₁
        for (i = 0; i < h_1.length; i += 1) {
            a[i] = h_1[i] - h_2[i];
        }

        for (i = 0; i < h_1.length; i += 1) {
            a[i] += carry;
            if (a[i] < 0) {
                a[i] += 0x100000000;
                if (a.slice(i + 1, a.length).some(function(e) {
                    return e !== 0
                })) {
                    carry = -1;
                } else {
                    carry = 0;
                }
            } else {
                carry = 0;
            }
        }

        // Capture a buffer of hexadecimal characters and calculate the exponent.
        // Changing the exponent from base₂ to base₁₀.
        for (i = a.length - 1; i >= 0; i -= 1) {
            if (a[i] > 0 || buffer.length > 0) {
                // Convert the zero-padded number to hclexadecimal and add it to the
                // buffer.
                hex = (buffer.length ? ("00000000" + a[i]).toString(16).slice(-8) : a[i].toString(16));
                buffer = (buffer + hex).slice(0, 8);
                // Record the index of the first encountered non-zero 32 bit chunk.
                enc = enc || i;
                // Record the length of the hexadecimal value in the first non-zero
                // chunk
                encL = encL || buffer.length;
            }

            if (buffer.length >= 8 || i === 0) {
                // Calculate the exponent which the buffer would need to be raised to
                // to equal the originating value for a keyspace broken into 32 bit
                // chunks.
                e = Math.round(((32 * enc)) * (Math.LN2 / Math.LN10));
                break;
            }
        }

        sub = 0;
        // Initialize the buffer to zero if nothing else is recorded.
        //
        // TODO
        // Initializing to a value of `"1"` might be a better choice here.
        buffer = (buffer.length) ? buffer : "0";
        // Convert to decimals in the for 0.00000001
        buffer = parseInt(buffer, 16).toString();
        buffer = buffer[0] + "." + buffer.slice(1);
        // Use exponential notation to represent the value of the largest chunk
        sub = Number("" + buffer + "e" + e);

        // Return the log₂ value of the exponential number descibed by `sub`
        return Math.floor(Math.log(sub || 1) / Math.LN2) || 0;
    };

    util.addExp = function addExp(key, exponent) {
        exponent = exponent % 128

        var result = key.concat() // copy array
            ,
            index = Math.floor(exponent / 32),
            carry

            result[index] += 1 << (exponent % 32);

        carry = 0;
        while (index < key.length) {
            result[index] += carry;
            carry = 0;
            if (result[index] > 0xffffffff) {
                result[index] -= 0x100000000;
                carry = 1;
            }
            index += 1;
        }

        return result;
    };

    // Returns the hexadecimal hash value defined by `x`.
    util.hashHex = function(x) {
        var s = "",
            i;

        for (i = 0; i < x.length; i += 1) {
            s += x[i].toString(16);
        }

        return s;
    };

    // ox.describe from the [OX-Tools library](https://github.com/OX-Design/OX-Tools).
    util.describe = (function __ox_describe() {
        var typeDescription = (/([A-Z][a-z]+)\]$/i),
            nullType = "[object Null]";

        return function ox_describe(x) {
            var type;

            if (x === null) {
                type = nullType;
            } else if (x && x.constructor.prototype.type) {
                type = x.constructor.prototype.type;
            } else {
                type = Object.prototype.toString.call(x);
            }
            return type.match(typeDescription)[1].toLowerCase();
        }
    }());

    // ox.interpolate from the [OX-Tools library](https://github.com/OX-Design/OX-Tools).
    util.interpolate = (function __ox_interpolate() {
        var r = (/#\{([^\{\}]+)\}/g);

        function stringify(a) {
            var b = String(a);

            return (util.describe(a) === "regexp") ? b.slice(1, -1) : b
        }

        return function ox_interpolate(a, b) {
            var aType = util.describe(a),
                aString = stringify(a);

            function ox_interpolate__(b) {
                var z = aString.replace(r, function(c, d) {
                    var e = b[d];

                    return (e !== void(0)) ? stringify(e) : "";
                });

                return (aType === "regexp") ? new RegExp(z) : z;
            }

            return b ? ox_interpolate__(b) : ox_interpolate__;
        };
    }());

    var messages = {
        findSuccessor: {
            message: "Finding successor of #{node}.",
            node: util.hashHex
        },
        foundSuccessor: {
            message: "The successor of #{node} is #{successor}.",
            node: util.hashHex,
            successor: util.hashHex
        },
        onFindSuccessor: {
            message: "The peer #{requestor} is requesting the successor of #{node}.",
            node: util.hashHex,
            requestor: util.hashHex
        },
        stabilize: {
            message: "Running the stabilization routine."
        },
        buildFingers: {
            message: "Running the buildFingers routine."
        },
        findPredecessor: {
            message: "Finding predecessor of #{node}",
            node: util.hashHex
        },
        newSuccessor: {
            message: "Found a new successor #{successor} for #{node}",
            node: util.hashHex,
            successor: util.hashHex
        },
        notify: {
            message: "Notifying #{successor} to set predecessor to #{node}",
            node: util.hashHex,
            successor: util.hashHex
        }
    };

    /**
     * Light EventEmitter. Ported from Node.js/events.js
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
        };

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
            if (list.length == 0)
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
        var type = arguments[0];
        var handler = this._events[type];
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
                    var l = arguments.length;
                    var args = new Array(l - 1);
                    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                    handler.apply(this, args);
            }
            return true;

        } else if (isArray(handler)) {
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

            var listeners = handler.slice();
            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(this, args);
            }
            return true;
        } else {
            return false;
        }
    };

    // BubbleHash
    // ==========
    //
    // This class implements a Chord distributed hash table with the help of the
    // peerjs WebRTC library.
    //
    //     var peer = new Peer([id], [options]);
    //
    // Arguments
    // ---------
    //
    // [id]: (_string_) if no id is provided one will be assigned by the server
    // [options]: (_object_)
    //
    // * peer (_object_) - see the [PeerJS Documentation](http://peerjs.com/docs/#api)
    //    for details
    // * processes (_object_)
    //   * fixFingers - interval (in seconds) for bubblehash.fixFingers
    //   * stabilization - interval (in seconds) for bubblehash.stabilization
    //   * checkPredecessor - interval (in seconds) for bubblehash.checkPredecessor
    //   * fixSuccessorList - interval (in seconds) for bubbelhash.fixSuccessorList
    function BubbleHash(id, options) {
        EventEmitter.call(this);

        if (arguments.length === 1) {
            options = id;
            id = void(0);
        }

        options = options || {};
        options.interval = options.interval || {};

        var self = this;

        this.peer = new Peer(id, options.peer);
        this.self = null;
        this.predecessor = null;
        this.successor = null;
        this.fingers = [];
        this.successorList = [];
        this.processes = {};
        this.options = options;

        this.peer.on("connection", function(dataConnection) {
            self.bindDataConnection(dataConnection);
            dataConnection.hash = util.hash(dataConnection.peer);
        });

        this.peer.on("error", function() {
            var peer, i, dataConnection;

            // Perform aggressive pruning of peer.js connections Fire the close event
            // on any failed connections.
            for (peer in this.connections) {
                this.connections[peer] = this.connections[peer].filter(function(dc) {
                    if (dc.open === false) {
                        dc.emit("error");
                        dc.close();
                    }
                    return dc.open;
                });

                if (this.connections[peer].length === 0) {
                    delete this.connections[peer];
                }
            }

            // Empty event emitter
            if (!(bubblehash.fingers.some(function(f) {
                    return f.open
                })) &&
                (!self.successor || self.successor.open === false) &&
                (!self.predecessor || self.predecessor.open === false)
            ) {
                self.emit("empty");
            }
        });

        // The Ouroboros - a pseudo data connection which ties into the BubbleHash
        // data connection event listeners
        this.peer.once("open", function(id) {
            self.self = (function() {
                function Ouroboros() {
                    EventEmitter.call(this);

                    this.peer = id;
                    this.hash = util.hash(id);
                    self.bindDataConnection(this);
                }

                util.inherits(Ouroboros, EventEmitter);

                Ouroboros.prototype.send = function send(data) {
                    this.emit("data", data);
                };

                return new Ouroboros();
            }());

            // Start processes
            self.fixFingers(options.interval.fixFingers || 10);
            self.stabilize(options.interval.stabilize || 10);
            self.checkPredecessor(options.interval.checkPredecessor || 10);
            self.fixSuccessorList(options.interval.fixSuccessorList || 10);
            self.fixSuccessor(options.interval.fixSuccessor || 10);
        });
    }

    util.inherits(BubbleHash, EventEmitter);

    BubbleHash.prototype.types = {
        "NOTIFY": 0,
        "FIND_SUCCESSOR": 1,
        "FOUND_SUCCESSOR": 2,
        "FIND_PREDECESSOR": 3,
        "FOUND_PREDECESSOR": 4,
        "GET_SUCCESSOR_LIST": 5,
        "GOT_SUCCESSOR_LIST": 6,
        "MESSAGE": 7
    };

    // If we are already connected to a node return that connection otherwise
    // establish a new connection.
    BubbleHash.prototype.connect = function connect(id, options) {
        var finger;

        if (this.successor && id === this.successor.peer) {
            return this.successor;
        } else if (this.predecessor && id === this.predecessor.peer) {
            return this.predecessor;
        } else if (this.fingers.some(function(f) {
            if (f.peer === id) {
                finger = f;
                return true;
            }
        })) {
            return finger;
        } else {
            var dataConnection = this.peer.connect(id, options);

            dataConnection.hash = util.hash(id);

            this.bindDataConnection(dataConnection);

            return dataConnection;
        }
    };

    // node n joins through node n'
    //
    // Pseudocode:
    //
    //     n.join(n')
    //       predecessor:= nil;
    //       s:= n'.ﬁndSuccessor(n);
    //       successor:= s;
    //       buildFingers(s);
    BubbleHash.prototype.join = function join(id, options) {
        // Create a data connection
        var dataConnection = this.connect(id, options),
            self = this;

        // Clear the predecessor
        this.predecessor = null;

        dataConnection.once("open", function() {
            // Message the peer specified by `id` to find its successor
            self.log("findSuccessor", {
                node: dataConnection.hash
            });

            dataConnection.send({
                type: self.types.FIND_SUCCESSOR,
                hash: self.self.hash,
                peer: self.self.peer,
                empty: true
            });

            // On response set the successor and build the finger table
            dataConnection.once("dataFoundSuccessor", function(dataConnection, data) {
                self.log("foundSuccessor", {
                    node: dataConnection.hash,
                    successor: data.hash
                });

                var successor = self.connect(data.peer);
                successor.once("open", function() {
                    self.successor = successor;
                    self.buildFingers(successor);
                });
            });
        });

        return dataConnection;
    };

    BubbleHash.prototype.bindDataConnection = function bindDataConnection(dataConnection) {
        var self = this;

        dataConnection.on("data", function(data) {
            switch (data.type) {
                case self.types.NOTIFY:
                    this.emit("dataNotify", dataConnection, data);
                    break;
                case self.types.FIND_SUCCESSOR:
                    this.emit("dataFindSuccessor", dataConnection, data);
                    break;
                case self.types.FOUND_SUCCESSOR:
                    this.emit("dataFoundSuccessor", dataConnection, data);
                    break;
                case self.types.FIND_PREDECESSOR:
                    this.emit("dataFindPredecessor", dataConnection, data);
                    break;
                case self.types.FOUND_PREDECESSOR:
                    this.emit("dataFoundPredecessor", dataConnection, data);
                    break;
                case self.types.GET_SUCCESSOR_LIST:
                    this.emit("dataGetSuccessorList", dataConnection, data);
                    break;
                case self.types.GOT_SUCCESSOR_LIST:
                    this.emit("dataGotSuccessorList", dataConnection, data);
                    break;
                case self.types.MESSAGE:
                    self.emit("message", data.message);
                    break;
                default:
                    this.emit("error", new Error("Unrecognized message type."))
                    break;
            }
        });

        dataConnection.on("dataNotify", function(dataConnection, data) {
            self.onNotify(dataConnection, data);
        });

        dataConnection.on("dataFindSuccessor", function(dataConnection, data) {
            self.onFindSuccessor(dataConnection, data);
        });

        dataConnection.on("dataFindPredecessor", function(dataConnection, data) {
            self.onFindPredecessor(dataConnection, data);
        });

        dataConnection.on("dataGetSuccessorList", function(dataConnection, data) {
            self.onGetSuccessorList(dataConnection, data);
        });

        dataConnection.on("dataMessage", function(dataConnection, data) {
            self.onMessage(dataConnection, data);
        });
    };

    BubbleHash.prototype.log = function log(message, obj) {
        var message, key;

        if (messages[message] !== void(0)) {
            message = messages[message];
            for (key in obj) {
                if (message[key] !== void(0)) {
                    obj[key] = message[key](obj[key]);
                }
            }
            message = util.interpolate(message.message);
            message = (obj) ? message(obj) : message();
        }

        if (/Error/.test(Object.prototype.toString.call(message))) {
            console.error(message);
        } else if (this.options.log === true) {
            console.log(message);
        }
    };

    // n notifies s to be s's predecessor
    //
    // Pseudocode:
    //
    //     s.notify(n)
    //       if (predecessor = nil or n ∈ (predecessor, s))
    //         predecessor := n;
    BubbleHash.prototype.onNotify = function onNotify(dataChannel, data) {
        var self = this,
            predecessor;

        if (
            this.predecessor === null ||
            (
                util.lessThan(this.predecessor.hash, data.hash) &&
                util.lessThan(data.hash, this.self.hash)
            )
        ) {
            predecessor = this.connect(data.peer);

            predecessor.once("open", function() {
                self.predecessor = predecessor;
            });
        }
    };

    // ask node n to ﬁnd the successor of x
    //
    //     if (x ∈ (n,n.successor])
    //       return n.successor;
    //     else
    //       n' := closestPrecedingNode(x);
    //       return n'.ﬁndSuccessor(x);
    BubbleHash.prototype.onFindSuccessor = function onFindSuccessor(dataConnection1, data1) {
        var self = this,
            closestPrecedingNode;

        this.log("onFindSuccessor", {
            requestor: dataConnection1.hash,
            node: data1.hash
        });

        if (
            this.successor &&
            util.lessThan(this.self.hash, data1.hash) &&
            (
                util.lessThan(data1.hash, this.successor.hash) ||
                util.equalTo(data1.hash, this.successor.hash)
            )
        ) {
            self.log("foundSuccessor", {
                node: data1.hash,
                successor: this.successor.hash
            });
            // We found the succesor! Send it back on the active data connection
            dataConnection1.send({
                type: this.types.FOUND_SUCCESSOR,
                peer: this.successor.peer,
                hash: this.successor.hash
            });
        } else {
            closestPrecedingNode = this.closestPrecedingNode(data1.hash);

            // FIXME
            // This catches the situation in which the closestPrecedingNode is self
            // Usually this happens when there is no other node to connect to it
            // this conditional statement prevents the messaging system from creating
            // an infinite loop for successor lookups.
            if (closestPrecedingNode === this.self) {
                self.log("foundSuccessor", {
                    node: data1.hash,
                    successor: this.self.hash
                });

                // XXX
                // Create a reciprocal link between the joining node and this node since
                // we have no other links
                if (
                    data1.empty === true &&
                    this.fingers.length === 0 &&
                    this.successor === null &&
                    this.predecessor === null
                ) {
                    this.successor = dataConnection1;
                }

                dataConnection1.send({
                    type: this.types.FOUND_SUCCESSOR,
                    peer: self.self.peer,
                    hash: self.self.hash
                });
            } else {
                // Tell the closest preceeding node to find its successor
                closestPrecedingNode.send({
                    type: this.types.FIND_SUCCESSOR,
                    hash: data1.hash,
                    peer: data1.peer
                });

                // Once found report the successor to the requesting node
                closestPrecedingNode.once("dataFoundSuccessor", function(dataConnection2, data2) {
                    self.log("foundSuccessor", {
                        node: data1.hash,
                        successor: data2.hash
                    });
                    dataConnection1.send({
                        type: self.types.FOUND_SUCCESSOR,
                        peer: data2.peer,
                        hash: data2.hash
                    });
                });
            }
        }
    };

    BubbleHash.prototype.onFindPredecessor = function onFindPredecessor(dataConnection, data) {
        if (this.predecessor) {
            dataConnection.send({
                type: this.types.FOUND_PREDECESSOR,
                peer: this.predecessor.peer,
                hash: this.predecessor.hash
            });
        }
    }

    BubbleHash.prototype.onGetSuccessorList = function onGetSuccessorList(dataConnection, data) {
        dataConnection.send({
            type: this.types.GOT_SUCCESSOR_LIST,
            list: this.successorList,
            peer: this.self.peer,
            hash: this.self.hash
        });
    };

    // search finger table for the highest predecessor of x
    //
    //     n.closentPrecedingNode(x)
    //       for i := m - 1 downto 1
    //         if (finger[i] ∈ (n, x))
    //           return finger[i];
    //         return n;
    BubbleHash.prototype.closestPrecedingNode = function closestPrecedingNode(x) {
        var i, finger;

        this.log("Looking for closest preceding node of " + util.hashHex(x) + ".");

        for (i = this.fingers.length - 1; i >= 1; i -= 1) {
            finger = this.fingers[i];

            if (finger) {
                if (
                    util.lessThan(this.self.hash, finger.hash) &&
                    util.lessThan(finger.hash, x)
                ) {
                    return finger;
                }
            }
        }

        return this.self;
    };

    // build finger table
    //
    // Pseudocode:
    //
    //     n.buildFingers(s)
    //       i₀ := ⌊log(successor - n)⌋ + 1;
    //       for i₀ ≤ i < m - 1
    //         finger[i] := s.findSuccessor(n + 2ⁱ);
    BubbleHash.prototype.buildFingers = function buildFingers(s) {
        var self = this,
            i_0, i;

        if (this.successor) {
            i_0 = util.logMinus(this.successor.hash, this.self.hash) + 1;

            this.log("buildFingers");

            for (i = i_0; i < 128 - 1; i += 1) {
                s.send({
                    type: this.types.FIND_SUCCESSOR,
                    hash: util.addExp(this.self.hash, i),
                    peer: self.self.peer
                });
                // closure to bind i
                (function(i) {
                    s.once("dataFoundSuccessor", function(dataConnection, data) {
                        self.fingers[i] = self.connect(data.peer);
                    });
                }(i));
            }
        }
    };

    // periodically refresh finger table entries
    //
    // Pseudocode:
    //
    //     n.fixFingers()
    //       buildFingers(n);
    BubbleHash.prototype.fixFingers = function fixFingers(interval) {
        var self

        if (!this.processes.fixFingers) {
            self = this;

            this.processes.fixFingers = setInterval(function() {
                if (self.successor !== self.self) {
                    self.buildFingers(self.self);
                }
            }, interval * 1000);
        }
    }

    // periodically probe n's successor s and inform s of n
    //
    // Pseudocode:
    //
    //     n.stabilize()
    //       checkPredecessor();
    //       x := successor.predecessor;
    //       if (x ∈ (n, successor))
    //         successor := x;
    //       successor.notify(n);
    BubbleHash.prototype.stabilize = function stabilize(interval) {
        var self;

        this.log("stabilize");

        if (!this.processes.stabilize) {
            self = this;

            this.processes.stabilize = setInterval(function() {
                var x;

                self.checkPredecessor();

                if (self.successor) {
                    self.log("findPredecessor", {
                        node: self.self.hash
                    })
                    self.successor.send({
                        type: self.types.FIND_PREDECESSOR,
                        hash: self.self.hash,
                        peer: self.self.peer
                    });

                    self.successor.once("dataFoundPredecessor", function(dataConnection1, data1) {
                        var successor;

                        if (
                            util.lessThan(self.self.hash, data1.hash) &&
                            util.lessThan(data1.hash, self.successor.hash)
                        ) {
                            self.log("newSuccessor", {
                                node: self.self.hash,
                                successor: data1.hash
                            });
                            successor = self.connect(data1.peer);
                            successor.once("open", function(dataConnection2, data2) {
                                self.successor = successor;
                                self.log("notify", {
                                    node: self.self.hash,
                                    successor: successor.hash
                                });
                                successor.send({
                                    type: self.types.NOTIFY,
                                    peer: self.self.peer,
                                    hash: self.self.hash
                                });
                            });
                        }
                    });

                    self.log("notify", {
                        node: self.self.hash,
                        successor: self.successor.hash
                    });
                    self.successor.send({
                        type: self.types.NOTIFY,
                        peer: self.self.peer,
                        hash: self.self.hash
                    });
                }
            }, interval * 1000);
        }
    };

    // periodically check whecher predecessor has failed
    //
    //     n.checkPredecessor()
    //       if (predecessor.open = false)
    //         predecessor := nil;
    BubbleHash.prototype.checkPredecessor = function checkPredecessor(interval) {
        var self;

        if (!this.processes.checkPredecessor) {
            self = this;

            this.processes.checkPredecessor = setInterval(function() {
                if (this.predecessor && this.predecessor.open === false) {
                    this.predecssor = null;
                }
            }, interval * 1000);
        }
    };

    // periodically reconcile with successors's successor list
    //
    // Pseudocode:
    //     n.fixSuccessorList()
    //       ⟨s₁,…,sᵣ⟩ := successor.successorList;
    //       successorList := ⟨successor,s₁,…,sᵣ₋₁⟩;
    BubbleHash.prototype.fixSuccessorList = function fixSuccessorList(interval) {
        var self;

        if (!this.processes.fixSuccessorList) {
            self = this;

            this.processes.fixSuccessorList = setInterval(function() {
                if (self.successor) {
                    self.successor.send({
                        type: self.types.GET_SUCCESSOR_LIST,
                        peer: self.self.peer,
                        hash: self.self.hash
                    });

                    self.successor.once("dataGotSuccessorList", function(dataConnection, data) {
                        self.successorList = [
                            [self.successor.peer, self.successor.hash]
                        ].concat(data.list.slice(-1));
                    });
                }
            }, interval * 1000);
        }
    };

    // periodically update failed successor
    //
    //     n.fixSuccessor()
    //       if (successor.open = false)
    //         successor := smallest alive node in successorList
    BubbleHash.prototype.fixSuccessor = function(interval) {
        var self = this;

        if (!this.processes.fixSuccessor) {
            this.processes.fixSuccessor = setInterval(function() {
                var successor, smallest, i;

                if (
                    self.successor === null ||
                    self.successor.open === false
                ) {
                    if (self.successorList.length > 0) {
                        smallest = self.successorList[0]

                        for (i = 1; i < self.successorList.length; i += 1) {
                            successor = self.successorList[i];

                            if (util.lessThan(successor[1], smallest)) {
                                smallest = successor;
                            }
                        }

                        successor = self.connect(smallest[0]);

                        successor.once("open", function() {
                            self.successor = successor;
                        });
                    }
                }
            }, interval * 1000);
        }
    };

    BubbleHash.prototype.destroy = function destroy() {
        var key;

        this.peer.destroy();

        for (key in this.processes) {
            clearInterval(this.processes[key]);
        }
    };

    exports.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    exports.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.RTCPeerConnection;
    exports.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
    exports.BubbleHash = BubbleHash;
    exports.util = util;
})(this);
