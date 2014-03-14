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
