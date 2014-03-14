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