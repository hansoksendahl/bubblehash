// The [murmur3-128](https://github.com/aggregateknowledge/js-murmur3-128)
// library placed in a closure along with its dependencies.
murmur3 = (function() {
import "goog_math_long.js";
import "murmur3_128.js";
import "base64.js";

  function hash (str) {
    // The first argument to hash128 expected to be of type Array Buffer. The
    // second argument is a seed (which defaults to 0).
    return murmur3.hash128(strToUTF8Arr(str));
  }

  // Is key in (low, high)
  hash.inRange = function inRange (key, low, high) {
    //return (low < high && key > low && key < high) ||
    //    (low > high && (key > low || key < high)) ||
    //    (low === high && key !== low);
    return (lessThan(low, high) && lessThan(low, key) && lessThan(key, high)) || (lessThan(high, low) && (lessThan(low, key) || lessThan(key, high))) || (equalTo(low, high) && !equalTo(key, low));
  };

  // Is key in (low, high]
  hash.inHalfOpenRange = function inHalfOpenRange (key, low, high) {
    //return (low < high && key > low && key <= high) ||
    //    (low > high && (key > low || key <= high)) ||
    //    (low == high);
    return (lessThan(low, high) && lessThan(low, key) && lessThanOrEqual(key, high)) || (lessThan(high, low) && (lessThan(low, key) || lessThanOrEqual(key, high))) || (equalTo(low, high));
  };

  // Key comparison
  hash.lessThan = function lessThan (low, high) {
    var i;
    
    if (low.length !== high.length) {
      // Arbitrary comparison
      return low.length < high.length;
    }

    for (i = 0; i < low.length; ++i) {
      if (low[i] < high[i]) {
        return true;
      }
      else if (low[i] > high[i]) {
        return false;
      }
    }

    return false;
  };

  hash.lessThanOrEqual = function lessThanOrEqual (low, high) {
    var i;
    
    if (low.length !== high.length) {
      // Arbitrary comparison
      return low.length <= high.length;
    }

    for (i = 0; i < low.length; ++i) {
      if (low[i] < high[i]) {
        return true;
      }
      else if (low[i] > high[i]) {
        return false;
      }
    }

    return true;
  };

  hash.equalTo = function equalTo (a, b) {
    var i;
    
    if (a.length !== b.length) {
      return false;
    }

    for (i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  };

  return hash;
}());