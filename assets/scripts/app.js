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
                cache.searchBtn.removeAttr("disabled");
                cache.searchQuery.removeAttr("disabled");
            } else {
                cache.searchBtn.attr("disabled", "disabled");
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

            if (data.manifest.length > 0) {
                if (bubblehash.running === false) {
                    updateStatus("connecting");
                    notify("info", "searching");
                    initialConnection();
                }
            } else if (bubblehash.running === false) {
                updateStatus("connecting");
                peerOpen();
            }
        }

        function initialConnection() {
            var dataConnection = bubblehash.join(data.manifest[0]);

            // Retry if the data connection fails.
            bubblehash.peer.once("error", retry);

            // If the data connection opens stop listening for retry messages.
            dataConnection.once("open", function() {
                dataConnection.removeListener("error", retry);
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
            var transaction = store.bubbles.query()
                .filter("hash", murmurHash3.x86.hash128(key))
                .execute();

            if (arguments.length > 1) {
                transaction.done(callback);
            }
        };

        out.create = function(key, value, callback) {
            var transaction = store.bubbles.add({
                hash: murmurHash3.x86.hash128(key),
                created: new Date().getTime(),
                modified: new Date().getTime(),
                value: value
            });

            if (arguments.length > 1) {
                transaction.done(callback);
            }
        };

        out.update = function(key, value, callback) {
            var transaction = store.bubbles.update({
                hash: murmurHash3.x86.hash128(key),
                created: value.created,
                modified: new Date().getTime(),
                value: value.value
            });

            if (arguments.length > 1) {
                transaction.done(callback);
            }
        };

        // NOTE
        // Delete is a keyword in Javascript.
        out.destroy = function(key, callback) {
            store.bubbles.remove(key).done(callback);
        };

        return out;
    }());

    var searchSubmit = (function() {
        // Twitter's official hashtag verifier. It's ungodly
        HASHTAG = /(#|＃)([a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*[a-z_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f][a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*)/ig;

        return function(callback) {
            // NOTE
            // Since we reuse the `HASHTAG` regular expression we need to reset the
            // search index.
            HASHTAG.lastIndex = 0;

            var val = cache.searchQuery.val(),
                tags = [],
                match;

            if ((match = HASHTAG.exec(val)) !== null) {
                queries.read(match[2], function(results) {
                    callback(results.map(function(row) {
                        return row.value
                    }));
                });
            } else {
                notify("danger", "OMG! Invalid hashtag.")
            }
        };
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

    cache.addColumnBtn.on("click", function() {
        var columnNum = cache.tableColumns.find("th").length + 1;

        cache.tableColumns.append($("<th>").append("<input type=\"text\">"));

        cache.tableRows.find("tr").each(function() {
            var row = $(this),
                cellNum = row.find("td").length,
                i;

            if (cellNum < columnNum) {
                for (i = cellNum; i < columnNum; i += 1) {
                    row.append($("<td>").append("<input type=\"text\">"));
                }
            }
        })
    });

    cache.addRowBtn.on("click", function() {
        var cellNum = cache.tableColumns.find("th").length,
            row = $("<tr>"),
            i;

        cellNum = cellNum || 1;

        for (i = 0; i < cellNum; i += 1) {
            row.append($("<td>").append("<input type=\"text\">"));
        }

        cache.tableRows.append(row);
    });

    cache.search.on("submit", function() {
        var results = searchSubmit(function(results) {
            // Empty the table
            cache.tableColumns.empty();
            cache.tableRows.empty();

            // Create the table
            var data = apTable(results);

            data[0].forEach(function(column) {
                cache.tableColumns.append($("<th>").text(column));
            });

            data[1].forEach(function(entry) {
                var row = $("<tr>"),
                    i, column, cell;

                for (i = 0; i < data[0].length; i += 1) {
                    column = data[0][i];
                    cell = $("<td>");

                    if (entry[column] !== void(0)) {
                        cell.text(entry[column]);
                    }

                    row.append(cell);
                }

                cache.tableRows.append(row);
            });
        });

        // console.log(apTable(results));

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

    bubblehash.on("chord", function() {
        updateStatus("on");
        notify("success", "connection");
    });

    exports.queries = queries;
    exports.bubblehash = bubblehash;

    notify("info", "welcome");
}(this));
