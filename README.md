         ____
         /   )          /      /      /         /    /               /
        /__ /          /__    /__    /  ___    /___ /  ___    __    /__
       /    )  /   /  /   )  /   )  /  /___)  /    /  ____)  (_ `  /   )
     _/____/  (___(  (___/  (___/  /  (___   /    /  (___(  '__)  /   /

Overview
--------

Bubble Hash is a distributed hash-table implemented in HTML5.  It employes the
WebRTC Application Programming Interface (API) to establish peer-to-peer
connections between connected clients.

The software consists of a server component and a client component.  Which
implement a protocol over which to distribute data stored as Javascript Object
Notation (JSON).

## Servers

BubbleHash does not technically require a server of any kind.  However, the
following servers are used to faciltate connections and provide a more stream
lined user experience for users behind Network Address Translation (NAT)
devices.

* HTTP server - responds with the static files needed to run BubbleHash.
* Signalling server - temporarily stores JSON data facilitating connections
   between peers.
* STUN servers - enable peers to learn their public Internet Protocol (IP)
   addresses.
* TURN server - act as relays between peers if both peers are behind NAT
   devices.

### Servers: HTTP

The Hypertext Transfer Protocol (HTTP) Server included as part of the BubbleHash
protcol is based on Node.js.Any static HTTP server would work just as well.

### Servers: Signaling

It is possible to establish WebRTC connections without a server and so run
BubbleHash. However, a user must be able to exchange their WebRTC offer and
answer information with other peers therefore there must be some signalling
mechanism to establish the connection.  BubbleHash uses the
[μDB web API](http://mudb.org/) to reduce the data which must be exchanged down
to an ordinary URL.

### Servers: STUN

Session Traversal Utilities for NAT (STUN) servers provide IP address lookup for
connecting clients so that they can determine how their IP address appears to
the rest of the world.

### Servers: TURN

Traversal Using Relays around NAT (TURN) servers provide a relay in the case
that two peers cannot connect due to both peers being behind a NAT device.

## Client

The client software is implemented in Javascript it uses the WebRTC API to
establish peer-to-peer communication between clients.

Build Instructions
------------------

The following command will build the vendor directory downloading and
configuring all third-party dependencies.  This command should only need to be
run once.

_Note: This command will take an extremely long time to execute._

    $ make vendor

To build the server software run the following make rule.

    $ make build