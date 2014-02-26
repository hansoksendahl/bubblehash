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

// BubbleHash Chord² Implementation
// --------------------------------

// Functions
var BubbleHash = (function() {
    var Chord = (function() {
        var hash;

        hash = murmurHash3.x64.hash128;

        // Is key in (low, high)
        function inRange(key, low, high) {
            //return (low < high && key > low && key < high) ||
            //    (low > high && (key > low || key < high)) ||
            //    (low === high && key !== low);
            return (lessThan(low, high) && lessThan(low, key) && lessThan(key, high)) || (lessThan(high, low) && (lessThan(low, key) || lessThan(key, high))) || (equalTo(low, high) && !equalTo(key, low));
        }

        // Is key in (low, high]
        function inHalfOpenRange(key, low, high) {
            //return (low < high && key > low && key <= high) ||
            //    (low > high && (key > low || key <= high)) ||
            //    (low == high);
            return (lessThan(low, high) && lessThan(low, key) && lessThanOrEqual(key, high)) || (lessThan(high, low) && (lessThan(low, key) || lessThanOrEqual(key, high))) || (equalTo(low, high));
        }

        // Key comparison
        function lessThan(low, high) {
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

        function lessThanOrEqual(low, high) {
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

        function equalTo(a, b) {
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
        function addExp(key, exponent) {
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

        function next_key(key) {
            return addExp(key, 0);
        }

        function Chord(version) {
            this.version = version;
            this.successor = null;
            this.predecessor = null;
        }

        // Shared Procedures

        Chord.prototype.findSuccessor = function findSuccessor(x) {
            // ask node n to ﬁnd the successor of x
            //
            //     if (x ∈ (n,n.successor])
            //       return n.successor;
            //     else
            //       n' := closestPrecedingNode(x);
            //       return n'.ﬁndSuccessor(x);
        };

        Chord.prototype.closestPrecedingNode = function closestPrecedingNode(x) {
            // search finger table for the highest predecessor of x
            //
            //     for i := m - 1 downto 1
            //       if (finger[i] ∈ (n, x))
            //         return finger[i];
            //       return n;
        };

        Chord.prototype.buildFingers = function buildFingers(s) {
            // build finger table
            //
            //     i₀ := ⌊log(successor - n)⌋ + 1;
            //     for i₀ ≤ i < m - 1
            //       finger[i] := s.findSuccessor(n + 2ⁱ);
        };

        Chord.prototype.fixFingers = function fixFingerl() {
            // periodically refresh finger table entries
            //
            //     buildFingers(n);
        };

        Chord.prototype.checkPredecessor = function checkPredecessor() {
            // periodically check whecher predecessor has failed
            //
            //     if (predecessor has failed)
            //       predecssor := nil;
        };

        Chord.prototype.fixSuccssorList = function fixSuccssorList() {
            // periodically reconcile with successors's successor list
            //
            //     ⟨s₁,…,sᵣ⟩ := successor.successorList
            //     successorList := ⟨successor,s₁,…,sᵣ₋₁⟩;
        };

        Chord.prototype.fixSuccssor = function fixSuccssor() {
            // periodically update failed successor
            //
            //     if (successor has failed)
            //       successor := smallest alive node in successorList
        };

        // Create dispatcher functions for join, stabilization, and notify

        ["join", "stabilization", "notify"].forEach(function(name) {
            Chord.prototype[name] = function() {
                this[name + this.version].apply(this, arguments);
            };
        });

        // Chord1 procedures

        Chord.prototype.join1 = function join(n_prime) {
            // node n joins through node n'
            //
            //     predecessor:= nil;
            //     s:= n'.ﬁndSuccessor(n);
            //     successor:= s;
            //     buildFngers(s);
        };

        Chord.prototype.stabilization1 = function stabilization() {
            // periodically probe n's successor s and inform s of n
            //
            //     checkPredecessor();
            //     x := successor.prdecessor;
            //
            // sucessor has changed due to new joining
            //
            //     if (x ∈ (n, successor))
            //       successor := x;
            //     successor.notify(n);
        };

        Chord.prototype.notify1 = function(n) {
            // notify s to be s's predecessor
            //
            //     if (predecssor = nil or n ∈ (predecssor, s))
            //       predecessor := n;
        };

        // Chord procedures

        Chord.prototype.join2 = function join2() {
            // node n joins through node n'
            //
            //     predecessor := nil;
            //     s := n'.findSuccessor(n);
            //     successor := s;
            //     buildFingers(s);
            //
            // find super peer responsible for n via s
            //
            //     x :=s.Superpeer(n);
            //
            // insert link object into super peer
            //
            //     x.insertLinkObj(⟨n, s, nil⟩);
            //
            // insert finger objects into super peers responsible for them
            //
            //     for i := 1 to m - 1
            //     x.insertFingerObj(⟨finger[i], i, n⟩);
        };

        Chord.prototype.stabilization2 = function stabilization2() {
            // node n periodically probes its successor link
            //
            //     Succₒ := successor;
            //     checkPredecessor();
            //
            // check if successor is alive
            //
            //     n.fixSuccessor();
            //     x := successor.predecessor;
            //     if (x ∈ (n, successor))
            //       successor:= x;
            //     successor.notify2(n);
            //     Succₙ := successor
            //     if (Succₙ ≠ Succₒ);
            //       Superpeer(n).linkUpdate(⟨n, Succₙ, predecessor⟩);
            //     if Succₒ ∈ (n, Succₙ)
            //       Superpeer(Succₒ).notifyLeave(Succₒ, Succₙ);
        };

        Chord.prototype.notify2 = function notify2() {
            // n' nontifies n to be n's predecessor
            //
            //     Predₒ := predecessor;
            //     if n' ≠ Predₒ
            //       Superpeer(n).linkUpdate(⟨n,successor,n'⟩)
            //     if (predecessor = nil or n' ∈ (predecessor, n))
            //       predecessor := n';
            //       Superpeer(n).notifyJoin(Predₒ, n')
        };

        Chord.prototype.notifyJoin = function notifyJoin(Pred_o, Pred_n) {
            // notify Superpeer(n) the joining of Predₙ with Predₒ being the old
            // predecessor of n, where Predₙ ∈ (Predₒ, Predₙ]
            //
            // find super peer of Predₙ
            //
            //     let y = Superpeer(Predₙ)
            //     for each stored finger object obj = ⟨target, level, owner⟩
            //       if owner + 2ˡᵉᵛᵉˡ ∈ ⟨Predₒ, Predₙ⟩
            //         obj := ⟨Predₙ, level, owner⟩;
            //         transfer obj to y;
            //         owner.fixFinger(level, Predₙ);
        }

        Chord.prototype.fixFinger = function fixFinger(i, target) {
            // notify node n to fix its _i_th finger
            //
            //    finger[i] := target;
        };


        Chord.prototype.notifyLeave = function notifyLeave(Succ_o, Succ_n) {
            // notify super peer x the leave of Succₒ with Succₙ being the new successor
            // of Succₒ
            //
            // remove link object of key Succₒ
            //
            //     remove linkObject(Succₒ);
            //
            // find super peer of Succₙ
            //
            //     y = Superpeer(Succₙ);
            //     for each stored finger object obj = ⟨target, level, owner⟩
            //       if target = Succₒ
            //         obj := ⟨Succₙ, level, owner⟩;
            //         owner.fixFinger(level, target);
        };


        return Chord;
    }());

    function BubbleHash(options) {
        var self = this;

        // Create a peer connection
        function peer(options) {
            var pc = new Peer(options);

            // The connection event fires when a data channel is established.
            pc.on("connection", function(dataConnection) {
                self.connections.push(dataConnection);

                // Remove the received dataConnection if it closes.
                dataConnection.on("close", function() {
                    self.connections = self.connections.filter(function(rc) {
                        return rc.peer !== dataConnection.peer;
                    });
                })
            });

            return pc;
        }

        this.connections = [];
        this.peer = peer(options);
    }

    return BubbleHash;
}());

(function(exports) {
    // BubbleHash User Interface
    // -------------------------

    // Variables

    var ui, bubblehash, log, manifest, socketNumber = 50;

    bubblehash = (function() {
        var options = {};

        options.key = "mbv2swgd5tztcsor";
        options.config = {
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
        options.debug = 3

        return new BubbleHash(options);
    }());

    manifest = (function() {
        var domain = "http://mudb.org",
            length = 25,
            key = "ZZZZ",
            out = {}, xhr;

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
                return out;
            };
            // Send an asynchronous HTTP POST request
            XHR.prototype.post = function(url, callback) {
                this.send("post", url, callback);
                return out;
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

    // Cache jQuery selectors for any element with an id prefixed by "ui-"
    var ui = (function() {
        var elements = {};

        // Use the jQuery prefix selector
        $('[id|="ui"]').each(function() {
            var key = this.id.match(/^ui-(.+)$/)[1];

            elements[key] = $(this);
        });

        return elements;
    }());

    log = (function() {
        var Logger = (function() {
            function Logger(types, messages, prefix) {
                this.prefix = (prefix ? prefix + ": " : "");
                this.messages = messages;

                var self = this,
                    i;

                function typeCallback(type) {
                    return function(code, callback) {
                        return this.onmessage(type, this.getMessage(code), callback);
                    };
                }

                for (var i = 0; i < types.length; i += 1) {
                    this[types[i]] = typeCallback(types[i]);
                }
            }

            Logger.prototype.getMessage = function(code) {
                return this.prefix + this.messages[code];
            };

            return Logger;
        }());

        var logger, messages = {}, i = 0;

        messages["info:welcome"] = "BubbleHash by OX-Design.";
        messages["success:connected"] = "Connected to websocket.";
        messages["info:searching"] = "Searching for peers.";
        messages["error:general"] = "An error occured.\n\n";
        messages["success:recvConnection"] = "Remote dataconnection received!";
        messages["danger:xhrError"] = "Could not request manifest file.";
        messages["danger:xhrTimeout"] = "Timed out while requesting manifest file.";
        messages["success:manifestGet"] = "Got peer manifest.";
        messages["info:manifestUpdate"] = "Updated peer manifest.";
        messages["success:createConnection"] = "Connected to BubbleHash!";
        messages["danger:browser-incompatible"] = "Your browser incompatible with BubbleHash.";
        messages["danger:invalid-key"] = "Invalid key for Peer.js cloud.";
        messages["danger:invalid-id"] = "Invalid ID specified for websocket.";
        messages["danger:unavailable-id"] = "Specified ID is already taken.";
        messages["danger:ssl-unavailable"] = "The Peer.js cloud does not use SSL.";
        messages["danger:server-disconnected"] = "The server is disconnected.";
        messages["danger:server-error"] = "Unable to reach the server.";
        messages["danger:socket-error"] = "Unable to communicate on socket.";
        messages["danger:socket-closed"] = "The socket closed unexpectedly.";

        logger = new Logger(
            ["success", "info", "warning", "danger"],
            messages
        );

        logger.onmessage = function(type, message, callback) {
            message = message.replace(/\n/g, "<br>");

            function show(e) {
                var alertBox = ui[type].clone(),
                    displayMessage = message

                if (Object.prototype.toString.call(e).indexOf("Error") !== -1) {
                    displayMessage += e.message;
                }

                alertBox.attr("id", type + i);
                alertBox.find(".message").html(displayMessage);
                ui.alertContainer.prepend(alertBox);
                alertBox.show().alert();

                window.setTimeout(function() {
                    alertBox.fadeTo(500, 0).slideUp(500, function() {
                        alertBox.remove();
                    });
                }, 3000);

                if (callback) {
                    callback.apply(this, arguments);
                }

                i += 1;
            }

            return show;
        };

        return logger;
    }());

    var peerOpen = function(id) {
        // Request the peer manifest from mudb.org
        manifest.get(log.success("success:manifestGet", function() {
            var data = (this.responseText !== "") ? JSON.parse(this.responseText) : {}, list;

            // Initialize the manifest array
            data.manifest = data.manifest || [];

            // Filter out any duplicates
            data.manifest = data.manifest.filter(function(e) {
                return e !== id;
            });

            manifest.set({
                    manifest: [id].concat(data.manifest)
                },
                log.info("info:manifestUpdate")
            );

            function initialConnection() {
                // Attempt to establish a data connection
                var dataConnection = bubblehash.peer.connect(
                    data.manifest[0], {
                        metadata: bubblehash.metadata
                    }
                );

                // Bind an event listenener to the open event on the dataConnection
                dataConnection.on(
                    "open",
                    log.success("success:createConnection", peerConnection)
                );

                // Perform pruning on the manifest list as neccesary and traverse
                // the manifest for connections.
                bubblehash.peer.once("error", function() {
                    data.manifest = data.manifest.slice(1)
                    manifest.set({
                        manifest: [id].concat(data.manifest)
                    }, log.info("info:manifestUpdate"));

                    if (bubblehash.connections.length === 0 && data.manifest.length > 0) {
                        initialConnection();
                    };
                });

                // Hide the form fields and update status if connections list is empty.
                dataConnection.once("close", connectClose);
            }

            if (data.manifest.length > 0) {
                initialConnection();
            }
        }));
    };

    function peerConnection(dataConnection) {
        ui.statusOff.hide();
        ui.statusOn.show();
        ui.search.removeAttr("disabled");
        ui.searchQuery.removeAttr("disabled");

        if (bubblehash.connections.length === 1) {
            ui.searchQuery.tooltip("show");
        }

        // Hide the form fields and update status if connections list is empty.
        dataConnection.once("close", connectClose);
    }

    function connectClose() {
        if (bubblehash.connections.length === 0) {
            ui.statusOn.hide();
            ui.statusOff.show();
            ui.search.attr("disabled", "disabled");
            ui.searchQuery
                .attr("disabled", "disabled")
                .tooltip("hide");

            // Try again
            peerOpen(bubblehash.peer.id);
        }
    }

    // Bind some generic UI events.
    (function() {
        // Enable tooltips on form elements.
        $('[rel="tooltip"]').tooltip();
    }());

    // Bind some events to the peer.
    bubblehash.peer.on("open", log.success("success:connected", peerOpen));

    bubblehash.peer.on("connection", log.success("success:recvConnection", peerConnection));

    bubblehash.peer.on("error", function(err) {
        switch (err.type) {
            case "browser-incompatible":
                log.danger("danger:" + err.type)();
                break;
            case "invalid-key":
                log.danger("danger:" + err.type)();
                break;
            case "invalid-id":
                log.danger("danger:" + err.type)();
                break;
            case "unavailable-id":
                log.danger("danger:" + err.type)();
                break;
            case "ssl-unavailable":
                log.danger("danger:" + err.type)();
                break;
            case "server-disconnected":
                log.danger("danger:" + err.type)();
                break;
            case "server-error":
                log.danger("danger:" + err.type)();
                break;
            case "socket-error":
                log.danger("danger:" + err.type)();
                break;
            case "socket-closed":
                log.danger("danger:" + err.type)();
                break;
        }
    });

    // Bind some BubbleHash UI events.
    ui.search.click(function() {

    });

    manifest.request.onerror = log.danger("danger:xhrError");
    manifest.request.ontimeout = log.danger("danger:xhrTimeout");

    log.info("info:welcome")();
}(this));
