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

    // FIXME
    // Since `log₂(h₁-h₂) ∈ {x|0<x<2¹²⁸}` and we are restricted to 32 bit unsigned
    // integers we cannot easily calculate the actual value of log₂(h₁-h₂).
    //
    // The method currently used is a bit of a hack.  It takes the most significant
    // chunk not equal to zero from h₁-h₂ and uses Javascript exponential notation
    // to come as close to the actual value as our 32bit values will allow.
    // It has some rounding errors due to loss of precision.
    //
    // This function is a disgustingly inaccurate method of calculating logarithms
    // by summation of the log of each chunk incremented by the reading frame.
    //
    // Better approaches could be based on factorization but these approaches would
    // not work for primes.
    //
    // It is unknown whether there exists a Javascript Bigint library which provides
    // a `log` member function.
    util.logMinus = function(h_1, h_2) {
        var a = [],
            buffer = "",
            carry = 0,
            sub = 0,
            i, enc = 0,
            encL = 0,
            hex, e = 0;

        // Swap if h_1 is less than h_2
        if (util.lessThan(h_1, h_2)) {
            sub = h_1;
            h_1 = h_2;
            h_2 = sub;
        }

        // Subtract h_2 from h_1
        sub = 0;
        for (i = 0; i < h_1.length; i += 1) {
            sub = Math.abs(h_1[i]) - Math.abs(h_2[i]) + carry;

            if (sub < 0 && i < h_1.length - 1) {
                sub = (i < h_1.length - 1 && a[i + 1] > 0) ? 0x100000000 - sub : 0;
                carry = -1;
            } else {
                carry = 0;
            }

            a[i] = sub;
        }

        // Capture a buffer of hexadecimal characters and calculate the exponent.
        sub = 0;
        for (i = a.length - 1; i >= 0; i -= 1) {
            if (a[i] > 0 || buffer.length > 0) {
                // Convert the zero-padded number to hclexadecimal and add it to the buffer.
                hex = (buffer.length ? (a[i]).toString(16).slice(-8) : a[i].toString(16));
                buffer = (buffer + hex).slice(0, 8);
                enc = enc || i;
                encL = encL || buffer.length;
            }

            if (buffer.length >= 8 || i === 0) {
                // e = Math.floor(((32 * enc) + (4 * encL)) * (Math.LN2 / Math.LN10)) - buffer.length
                e = Math.floor(((32 * enc) + 4 * encL) * Math.LN2 / Math.LN10);
                break;
            }
        }

        buffer = (buffer.length) ? buffer : "0";
        // Convert to decimal
        buffer = parseInt(buffer, 16).toString();
        buffer = buffer[0] + "." + buffer.slice(1);
        // Use exponential notation to represent the value of the largest chunk
        sub = Number("" + buffer + "e" + e);

        return Math.round(Math.log(sub || 1) / Math.LN2) || 0
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
        this.successor = this.self;
        this.fingers = [];
        this.successorList = [];
        this.processes = {};
        this.options = options;

        this.peer.on("connection", function(dataConnection) {
            self.bindDataConnection(dataConnection);
            dataConnection.hash = util.hash(dataConnection.peer);
        });

        // The Ouroboros - the peer first connects to itself since some of the
        // stabilization routines require a dataConnection to communicate across.
        //
        // This is perhaps a less than optimal solution but it will only arise
        // when the client has no other peers to connect to.
        this.peer.on("open", function(id) {
            self.self = self.join(id);
            self.self.hash = util.hash(id);
            self.successor = self.self;

            // Start processes
            self.fixFingers(options.interval.fixFingers || 10);
            // self.stabilization(options.interval.stabilization || 10);
            // self.checkPredecessor(options.interval.checkPredecessor || 10);
            // self.fixSuccessorList(options.interval.fixSuccessorList || 10);
        });
    }

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

    BubbleHash.prototype.connect = function connect(id, options) {
        var dataConnection = this.peer.connect(id, options);

        dataConnection.hash = util.hash(id);

        this.bindDataConnection(dataConnection);

        return dataConnection;
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
            self.log("Finding successor of " + dataConnection.peer + ".");
            dataConnection.send({
                type: self.types.FIND_SUCCESSOR,
                hash: self.self.hash,
                peer: self.self.peer
            });

            // On response set the successor and build the finger table
            dataConnection.once("dataFoundSuccessor", function(dataConnection, data) {
                self.log("The successor of " + dataConnection.peer + " is " + data.peer + ".");
                self.successor = self.connect(data.peer);
                self.buildFingers(self.successor);
            });
        });

        return dataConnection;
    };

    BubbleHash.prototype.bindDataConnection = function bindDataConnection(dataConnection) {
        var self = this;

        dataConnection.on("data", function(data) {
            console.log(data);

            switch (data.type) {
                case self.types.NOTIFY:
                    this.emit("dataNotify", dataConnection, data)
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
                    self.emit("dataMessage", data.message);
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

        // dataConnection.on("dataFoundSuccessor", function (dataConnection, data) {
        //   self.onFoundSuccessor(dataConnection, data);
        // });

        dataConnection.on("dataFindPredecessor", function(dataConnection, data) {
            self.onFindPredecessor(dataConnection, data);
        });

        // dataConnection.on("dataFoundPredecessor", function (dataConnection, data) {
        //   self.onFoundPredecessor(dataConnection, data);
        // });

        dataConnection.on("dataGetSuccessorList", function(dataConnection, data) {
            self.onGetSuccessorList(dataConnection, data);
        });

        // dataConnection.on("dataGotSuccessorList", function (dataConnection, data) {
        //   self.onGotSuccessorList(dataConnection, data);
        // });

        dataConnection.on("dataMessage", function(dataConnection, data) {
            self.onMessage(dataConnection, data);
        });
    };

    BubbleHash.prototype.log = function log(message) {
        if (/Error/.test(Object.prototype.toString.call(message))) {
            console.error(message);
        } else if (this.options.log === true) {
            console.log(message);
        }
    };

    // import "onNotify.js";

    // ask node n to ﬁnd the successor of x
    //
    //     if (x ∈ (n,n.successor])
    //       return n.successor;
    //     else
    //       n' := closestPrecedingNode(x);
    //       return n'.ﬁndSuccessor(x);
    BubbleHash.prototype.onFindSuccessor = function onFindSuccessor(dataConnection, data) {
        var self = this,
            successorHash = this.successor.hash,
            closestPrecedingNode, requestingPeer = data.peer;

        if (
            util.lessThan(this.self.hash, data.hash) &&
            (
                util.lessThan(data.hash, successorHash) ||
                util.equalTo(data.hash, successorHash)
            )
        ) {
            self.log("The successor of " + requestingPeer + " is " + this.successor.peer + ".");
            // We found the succesor! Send it back on the active dataConnection
            dataConnection.send({
                type: this.types.FOUND_SUCCESSOR,
                peer: this.successor.peer,
                hash: this.successor.hash
            });
        } else {
            closestPrecedingNode = this.closestPrecedingNode(data.hash);

            this.log("Finding successor of " + closestPrecedingNode.peer + ".");

            // Tell the closest preceeding node to find its successor
            closestPrecedingNode.send({
                type: this.types.FIND_SUCCESSOR,
                hash: data.hash,
                peer: data.peer
            });

            // Once found report the successor to the requesting node
            closestPrecedingNode.once("dataFoundSuccessor", function(dataConnection, data) {
                self.log("The successor of " + requestingPeer + " is " + data.peer + ".");
                dataConnection.send({
                    type: self.types.FOUND_SUCCESOR,
                    peer: data.peer,
                    hash: data.hash
                });
            });
        }
    };

    // import "onFoundSuccessor";

    // import "onFindPredecessor.js";

    // // import "onFoundPredecessor";

    // import "onGetSuccessorList.js";

    // // import "onGotSuccessorList";

    // import "onMessage.js";

    // search finger table for the highest predecessor of x
    //
    //     for i := m - 1 downto 1
    //       if (finger[i] ∈ (n, x))
    //         return finger[i];
    //       return n;
    BubbleHash.prototype.closestPrecedingNode = function closestPrecedingNode(x) {
        var i, finger;

        this.log("Looking for closest preceding node of " + x.join("") + ".");

        for (i = 128 - 1; i >= 1; i -= 1) {
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

        i_0 = util.logMinus(this.successor.hash, this.self.hash) + 1;

        this.log("Refreshing finger table entries.");

        this.log("LogMinus = " + i_0);

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
                self.buildFingers(self.self);
            }, interval * 1000);
        }
    }

    // periodically probe n's successor s and inform s of n
    //
    // Pseudocode:
    //
    //     n.stabilization()
    //       checkPredecessor();
    //       x := successor.prdecessor;
    //       if (x ∈ (n, successor))
    //         successor := x;
    //       successor.notify(n);
    BubbleHash.prototype.stabilization = function stabilization(interval) {
        var self;

        this.log("Stabilizing...");

        if (!this.processes.stabilization) {
            self = this;

            this.processes.stabilization = setInterval(function() {
                var x;

                self.checkPredecessor();

                self.successor.send({
                    type: self.types.FIND_PREDECESSOR,
                    hash: self.self.hash,
                    peer: self.self.peer
                });

                self.successor.once("dataFoundPredecessor", function(dataConnection, data) {
                    if (
                        util.lessThan(self.self.hash, data.hash) &&
                        util.lessThan(data.hash, self.successor.hash)
                    ) {
                        self.successor = self.connect(data.peer);
                    }
                });

                self.successor.once("open", function(dataChannel) {
                    dataChannel.send({
                        type: self.types.NOTIFY,
                        peer: self.self.peer,
                        hash: self.self.hash
                    });
                });
            }, interval * 1000);
        }
    };

    // import "checkPredecessor.js";

    // import "fixSuccessorList.js";

    exports.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    exports.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.RTCPeerConnection;
    exports.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
    exports.BubbleHash = BubbleHash;
})(this);
