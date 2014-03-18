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

        // FIXME
        // This is a hack since Peer.js does note currently pass connection
        // errors to the Data Connection object.
        function retry() {
            data.manifest = data.manifest.slice(1);
            updateStatus("connecting");

            if (data.manifest.length > 0) {
                notify("info", "searching");
                initialConnection();
            } else {
                peerOpen();
            }
        }

        function initialConnection() {
            var dataConnection = bubblehash.join(data.manifest[0]);

            dataConnection.once("error", retry);

            dataConnection.once("open", function() {
                bubblehash.peer.removeListener("error", retry);
                dataConnection.removeListener("close", retry);

                bubblehash.once("empty", function() {
                    updateStatus("connecting");
                    peerOpen();
                });

                updateStatus("on");
                notify("success", "connection");
            });
        }

        initialConnection();
    };

    var queries = (function() {
        var out = {}, store;

        // Bubblehash uses the following schema
        //
        // * id: (number) [autoincrement]
        // * created: (Date)
        // * modified: (Date)
        // * key: (string)
        // * value: (?)
        db.open({
            server: "BubbleHashDemo",
            version: 1,
            schema: {
                bubbles: {
                    key: {
                        keyPath: "id",
                        autoIncrement: true
                    },
                    indexes: {
                        created: { /*...*/ },
                        modified: { /*...*/ },
                        hash: { /*...*/ }
                    }
                }
            }
        }).done(function(s) {
            store = s;
        });

        out.read = function(key, callback) {
            store.bubbles.query()
                .filter("hash", murmurHash3.x86.hash128(key))
                .execute()
                .done(callback);
        };

        out.create = function(key, value, callback) {
            store.bubbles.add({
                hash: murmurHash3.x86.hash128(key),
                created: new Date().getTime(),
                modified: new Date().getTime(),
                value: value
            }).done(callback);
        };

        out.update = function(key, value, callback) {
            store.bubbles.update({
                hash: murmurHash3.x86.hash128(key),
                created: value.created,
                modified: new Date().getTime(),
                value: value.value
            });
        };

        // NOTE
        // Delete is a keyword in Javascript.
        out.destroy = function(key, callback) {
            store.bubbles.remove(key).done(callback);
        };

        return out;
    }());

    var searchSubmit = (function() {
        // Twitter's official hashtag verifier.

        // Creates a Unicode Regular Expression range
        function regexRange(from, to) {
            to = to || 0;

            from = from.toString(16);
            fromLen = (from.length > 4) ? from.length : 4;
            to = to.toString(16);
            toLen = (to.length > 4) ? to.length : 4;

            if (to !== "0") {
                return "\\u" + ("0000" + from).slice(-fromLen) + "-\\u" + ("0000" + to).slice(-toLen) + "";
            } else {
                "\\u{" + ("0000" + from).slice(-fromLen) + "}";
            }
        }

        LATIN_ACCENTS = [
            regexRange(0xc0, 0xd6),
            regexRange(0xd8, 0xf6),
            regexRange(0xf8, 0xff),
            regexRange(0x0100, 0x024f),
            regexRange(0x0253, 0x0254),
            regexRange(0x0256, 0x0257),
            regexRange(0x0259),
            regexRange(0x025b),
            regexRange(0x0263),
            regexRange(0x0268),
            regexRange(0x026f),
            regexRange(0x0272),
            regexRange(0x0289),
            regexRange(0x028b),
            regexRange(0x02bb),
            regexRange(0x0300, 0x036f),
            regexRange(0x1e00, 0x1eff)
        ].join("")

        NON_LATIN_HASHTAG_CHARS = [
            // Cyrillic (Russian, Ukrainian, etc.)
            regexRange(0x0400, 0x04ff), // Cyrillic
            regexRange(0x0500, 0x0527), // Cyrillic Supplement
            regexRange(0x2de0, 0x2dff), // Cyrillic Extended A
            regexRange(0xa640, 0xa69f), // Cyrillic Extended B
            regexRange(0x0591, 0x05bf), // Hebrew
            regexRange(0x05c1, 0x05c2),
            regexRange(0x05c4, 0x05c5),
            regexRange(0x05c7),
            regexRange(0x05d0, 0x05ea),
            regexRange(0x05f0, 0x05f4),
            regexRange(0xfb12, 0xfb28), // Hebrew Presentation Forms
            regexRange(0xfb2a, 0xfb36),
            regexRange(0xfb38, 0xfb3c),
            regexRange(0xfb3e),
            regexRange(0xfb40, 0xfb41),
            regexRange(0xfb43, 0xfb44),
            regexRange(0xfb46, 0xfb4f),
            regexRange(0x0610, 0x061a), // Arabic
            regexRange(0x0620, 0x065f),
            regexRange(0x066e, 0x06d3),
            regexRange(0x06d5, 0x06dc),
            regexRange(0x06de, 0x06e8),
            regexRange(0x06ea, 0x06ef),
            regexRange(0x06fa, 0x06fc),
            regexRange(0x06ff),
            regexRange(0x0750, 0x077f), // Arabic Supplement
            regexRange(0x08a0), // Arabic Extended A
            regexRange(0x08a2, 0x08ac),
            regexRange(0x08e4, 0x08fe),
            regexRange(0xfb50, 0xfbb1), // Arabic Pres. Forms A
            regexRange(0xfbd3, 0xfd3d),
            regexRange(0xfd50, 0xfd8f),
            regexRange(0xfd92, 0xfdc7),
            regexRange(0xfdf0, 0xfdfb),
            regexRange(0xfe70, 0xfe74), // Arabic Pres. Forms B
            regexRange(0xfe76, 0xfefc),
            regexRange(0x200c, 0x200c), // Zero-Width Non-Joiner
            regexRange(0x0e01, 0x0e3a), // Thai
            regexRange(0x0e40, 0x0e4e), // Hangul (Korean)
            regexRange(0x1100, 0x11ff), // Hangul Jamo
            regexRange(0x3130, 0x3185), // Hangul Compatibility Jamo
            regexRange(0xA960, 0xA97F), // Hangul Jamo Extended-A
            regexRange(0xAC00, 0xD7AF), // Hangul Syllables
            regexRange(0xD7B0, 0xD7FF), // Hangul Jamo Extended-B
            regexRange(0xFFA1, 0xFFDC) // Half-width Hangul
        ].join("");

        CJ_HASHTAG_CHARACTERS = [
            regexRange(0x30A1, 0x30FA), regexRange(0x30FC, 0x30FE), // Katakana (full-width)
            regexRange(0xFF66, 0xFF9F), // Katakana (half-width)
            regexRange(0xFF10, 0xFF19), regexRange(0xFF21, 0xFF3A), regexRange(0xFF41, 0xFF5A), // Latin (full-width)
            regexRange(0x3041, 0x3096), regexRange(0x3099, 0x309E), // Hiragana
            regexRange(0x3400, 0x4DBF), // Kanji (CJK Extension A)
            regexRange(0x4E00, 0x9FFF), // Kanji (Unified)
            regexRange(0x20000, 0x2A6DF), // Kanji (CJK Extension B)
            regexRange(0x2A700, 0x2B73F), // Kanji (CJK Extension C)
            regexRange(0x2B740, 0x2B81F), // Kanji (CJK Extension D)
            regexRange(0x2F800, 0x2FA1F), regexRange(0x3003), regexRange(0x3005), regexRange(0x303B) // Kanji (CJK supplement)
        ].join("");

        // A hashtag must contain latin characters, numbers and underscores, but not all numbers.
        HASHTAG_ALPHA = "[a-z_" + LATIN_ACCENTS + NON_LATIN_HASHTAG_CHARS + CJ_HASHTAG_CHARACTERS + "]";
        HASHTAG_ALPHANUMERIC = "[a-z0-9_" + LATIN_ACCENTS + NON_LATIN_HASHTAG_CHARS + CJ_HASHTAG_CHARACTERS + "]";

        HASHTAG = new RegExp("(#|＃)(" + HASHTAG_ALPHANUMERIC + "*" + HASHTAG_ALPHA + HASHTAG_ALPHANUMERIC + "*)", "i");

        return function() {
            var val = cache.searchQuery.val(),
                tags = [],
                match;

            if (HASHTAG.test(val)) {
                match = HASHTAG.exec(val);

                if (match !== null) {
                    cache.search.data("hashtag", match[1]);
                }
            } else {
                notify("danger", "OMG! Invalid hashtag.")
            }
        }
    }());


    // Bind some generic UI events.
    (function() {
        // Enable tooltips on form elements.
        $('[rel="tooltip"]').tooltip();
    }());

    bubblehash = new BubbleHash(bubblehashOptions);

    // Make the search button fire the submit event.
    cache.searchBtn.on("click", function() {
        $(this).closest("form").trigger("submit")
    });

    cache.search.on("submit", function() {
        searchSubmit();

        // Prevent default
        return false;
    });

    (function() {
        var hashTags = ["#test", "#awesome", "#sandbox"];

        cache.searchQuery.attr("placeholder", hashTags[Math.floor(Math.random() * hashTags.length)]);
    }());

    bubblehash.peer.on("open", function() {
        notify("success", "socket");
        updateStatus("connecting");
        peerOpen();
    });

    bubblehash.peer.once("connection", function() {
        notify("success", "recvConnection");
        updateStatus("on");
    });

    exports.queries = queries;
    exports.bubblehash = bubblehash;

    notify("info", "welcome");
}(this));
