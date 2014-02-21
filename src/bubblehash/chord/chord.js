// Bubblehash Chord Implementation
//
// Adapted from code by [Brian Ollenberger](https://www.github.com/bollenberger).
//

// TODO: remove references
// (X) rm net
// (X) rm dgram
// (X) rm Buffer
// ( ) Evaluate whether we must send objects or strings
// (X) rm exports
// (X) decide which functions if any should be public
// (X) Wrap this code in a function
// ( ) Remove require statements;
// ( ) Replace cals to required libraries with front end equivalent operations

//var dgram = require('dgram'),

var uuid = require('uuid'),
    murmur = require('murmurhash3');

var hash = murmur.murmur128Sync;

// Todo: Decide whether this in neccesary
// Note: This work is likely done by WebRTC for free
//
// var serialize = function serialize(message) {
//     return new Buffer(JSON.stringify(message));
// };
// var deserialize = JSON.parse;

// Is key in (low, high)
function inRange(key, low, high) {
    //return (low < high && key > low && key < high) ||
    //    (low > high && (key > low || key < high)) ||
    //    (low === high && key !== low);
    return (lessThan(low, high) && lessThan(low, key) && lessThan(key, high)) ||
        (lessThan(high, low) && (lessThan(low, key) || lessThan(key, high))) ||
        (equalTo(low, high) && !equalTo(key, low));
}

// Is key in (low, high]
function inHalfOpenRange(key, low, high) {
    //return (low < high && key > low && key <= high) ||
    //    (low > high && (key > low || key <= high)) ||
    //    (low == high);
    return (lessThan(low, high) && lessThan(low, key) && lessThanOrEqual(key, high)) ||
        (lessThan(high, low) && (lessThan(low, key) || lessThanOrEqual(key, high))) ||
        (equalTo(low, high));
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
        }
        --index;
    }

    return result;
}

function next_key(key) {
    return addExp(key, 0);
};

// Chord message types
var NOTIFY_PREDECESSOR = 0;
var NOTIFY_SUCCESSOR = 1;
var FIND_SUCCESSOR = 2;
var FOUND_SUCCESSOR = 3;
var MESSAGE = 4;

function Node(id, onMessage, send) {
    var predecessor = null;
    var predecessor_ttl = 0;
    var self = {id: id};
    var successor = self;
    var successor_ttl = 0;
    var fingers = [];

    function closest_preceding_node(find_id) {
        for (var i = fingers.length - 1; i >= 0; --i) {
            if (fingers[i] && inRange(fingers[i].id, id, find_id)) {
                return fingers[i];
            }
        }

        if (inRange(successor.id, id, find_id)) {
            return successor;
        } else {
            return self;
        }
    }

    self.receive = function receive(from, message) {
        switch (message.type) {
            case NOTIFY_PREDECESSOR:
                if (predecessor === null || inRange(from.id, predecessor.id, id)) {
                    predecessor = from;
                }

                self.send(from, {type: NOTIFY_SUCCESSOR}, predecessor);

                predecessor_ttl = 12; // Some significant number of check/stabilize cycles to wait until declaring a predecessor dead
                break;

            case FOUND_SUCCESSOR:
                if (message.hasOwnProperty('next')) {
                    fingers[message.next] = from;
                }
                // Fall through
            case NOTIFY_SUCCESSOR:
                if (message.type === NOTIFY_SUCCESSOR) {
                    successor_ttl = 12;
                }

                if (inRange(from.id, id, successor.id)) {
                    successor = from;
                }
                break;

            case FIND_SUCCESSOR:
                if (inHalfOpenRange(message.id, id, successor.id)) {
                    message.type = FOUND_SUCCESSOR;
                    send(from, message, successor);
                } else {
                    send(closest_preceding_node(message.id), message, from);
                }
                break;

            case MESSAGE:
                if (message.id) {
                    if (inHalfOpenRange(message.id, id, successor.id)) {
                        //console.log('delivering message ' + JSON.stringify(message) + ' to its final destination: ' + successor.id[0]);
                        delete message.id;
                        send(successor, message, from);
                    } else {
                        //console.log('forwarding message ' + JSON.stringify(message) + ' from ' + id[0] + ' to ' + closest_preceding_node(message.id).id[0]);
                        send(closest_preceding_node(message.id), message, from);
                    }
                } else if (onMessage) {
                    onMessage(from, id, message.message, function reply(message, to, replyTo) {
                        send(to ? to : from, {type: MESSAGE, message: message}, replyTo);
                    });
                }
                break;

            default:
                // ignore any messages that we don't recognize
                console.error('Unknown Chord message type ' + message.type);
                break;
        }

        /*
        message.type_name = ({
            0: 'notify_predecessor',
            1: 'notify_successor',
            2: 'find_successor',
            3: 'found_successor',
            4: 'message'
        })[message.type];
        var pred = '?';
        if (predecessor) {
            pred = '' + predecessor.id[0] + ' (' + predecessor_ttl + ')';
        }
        console.log(from.id[0] + ' -> ' + id[0] + ' (' + pred + '-' + successor.id[0] + '): ' + JSON.stringify(message))
        */
    };

    var nextFinger = 0;
    setInterval(function fix_fingers() {
        send(successor, {type: FIND_SUCCESSOR, id: addExp(id, nextFinger + 1), next: nextFinger});
        nextFinger += 13;
        if (nextFinger >= 127) {
            nextFinger -= 127;
        }
    }, 600).unref();

    setInterval(function checkPredecessorAndStabilize() {
        if (--predecessor_ttl < 1) { // if predecessor has failed to stabilize for "long" time, it has failed
            predecessor = null;
            predecessor_ttl = 1;
        }

        if (--successor_ttl < 1) {
            successor = self;
            successor_ttl = 1;
        }

        send(successor, {type: NOTIFY_PREDECESSOR});

        // Periodically log node state

        //var pred = '?';
        //if (predecessor) {
        //    pred = '' + predecessor.id[0] + ' (' + predecessor_ttl + ')';
        //}
        //console.info(pred + ' < ' + id[0] + ' < ' + successor.id[0] + ': ' +  fingers.map(function (finger) {
        //    return finger.id[0];
        //}));
        //console.info(pred + ' < ' + id[0] + ' < ' + successor.id[0]);

    }, 700).unref();

    var joinRetry;
    self.join = function join(remote) {
        predecessor = null;
        function tryToJoin() {
            send(remote, {type: FIND_SUCCESSOR, id: id});
        }
        joinRetry = setInterval(tryToJoin, 2000).unref();
        tryToJoin();
    };

    self.send_hash = function send_id(id, message, to, replyTo) {
        send(to, {type: MESSAGE, message: message, id: id}, replyTo);
    };

    self.send = function send(key, message, to, replyTo) {
        var key_hash = hash(key);
        self.send_hash(key_hash, message, to, replyTo);
    };

    return self;
}

// Returns a function for sending messages into the chord. Takes some parameters:
// to - node to send to {address: '1.2.3.4', port: 1234}; if null, sends to the local node
//      which is not useful for client-only nodes
// id - the ID (hash) whose successor should receive the message; if null, sends to a
//      representative virtual node on that physical node
// message - the message to send; must be msgpack-able
// replyTo - optional; the node to reply to; useful for forwarding messages
Chord = function Chord(listen_port, virtual_nodes, joinExistingOrOnMessage, onMessage) {
    var join_existing;

    if (joinExistingOrOnMessage) {
        if (joinExistingOrOnMessage.hasOwnProperty('port')) {
            join_existing = joinExistingOrOnMessage;
        } else if (!onMessage) {
            onMessage = joinExistingOrOnMessage;
        }
    }

    // Todo: Establish WebRTC call here.
    //
    //var server = dgram.createSocket('udp4');
    //server.bind(listen_port);

    var nodes = {};
    var lastNode = null;
    var lastNodeSend = null;

    // Todo: Bind function to WebRTC onmessage event.
    //
    // server.on('message', function (packet, remote) {
    //     var message = deserialize(packet);
    //
    //     if (message.version !== 1) {
    //         console.error("Unexpected Chord transport version " + message.version);
    //         return;
    //     }
    //
    //     var to = lastNode;
    //     if (message.to) {
    //         to = nodes[message.to];
    //     }
    //     if (to) {
    //         var from = message.from;
    //         if (!from.address) {
    //             from = {
    //                 address: remote.address,
    //                 port: remote.port,
    //                 id: from
    //             };
    //         }
    //         to.receive(from, message.message);
    //     }
    // });

    // Create and connect local nodes.
    for (var i = 0; i < virtual_nodes; ++i) {
        (function () {
            var id = hash(uuid.v4());

            lastNodeSend = function send(to, message, replyTo) {
                if (!to) {
                    to = node;
                }
                if (to.receive) {
                    setImmediate(to.receive, replyTo ? reply_to : node, message);
                } else {
                    var from = replyTo ? (replyTo.receive ? replyTo.id : replyTo) : id;
                    // Todo: We may be able to just send the object
                    // Note: WebRTC may do this work for us.
                    //
                    // var packet = serialize({
                    //     version: 1,
                    //     from: from,
                    //     to: to.id,
                    //     message: message
                    // });
                    
                    // Todo: WebRTC send message
                    //
                    // server.send(packet, 0, packet.length, to.port, to.address);
                }
            }

            var node = Node(id, onMessage, lastNodeSend);

            if (lastNode || join_existing) {
                node.join(lastNode || join_existing);
            }
            lastNode = nodes[id] = node;
        })();
    }

    // Returns a function for sending application messages over the Chord router.
    var chordSendMessage = function chordSendMessage(to, id, message, replyTo) {
        return lastNodeSend(to ? to : lastNode, {type: MESSAGE, id: id, message: message}, replyTo);
    };

    chordSendMessage.close = function chord_close() {
      // TODO: WebRTC call takedown
      //
      // server.unref();
    };

    return chordSendMessage;
};