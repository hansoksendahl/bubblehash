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
    var chord;


    var Chord = (function() {
        var hash;

        // The [murmur3-128](https://github.com/aggregateknowledge/js-murmur3-128)
        // library placed in a closure along with its dependencies.
        murmur3 = (function() {
            // Taken from the Closure Library (113dc062a790). [https://code.google.com/p/closure-library/]
            // Code has been modified to be stand-alone from Closure. (See "NOTE"s)

            // Copyright 2009 The Closure Library Authors. All Rights Reserved.
            //
            // Licensed under the Apache License, Version 2.0 (the "License");
            // you may not use this file except in compliance with the License.
            // You may obtain a copy of the License at
            //
            //      http://www.apache.org/licenses/LICENSE-2.0
            //
            // Unless required by applicable law or agreed to in writing, software
            // distributed under the License is distributed on an "AS-IS" BASIS,
            // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            // See the License for the specific language governing permissions and
            // limitations under the License.

            /**
             * @fileoverview Defines a Long class for representing a 64-bit two's-complement
             * integer value, which faithfully simulates the behavior of a Java "long". This
             * implementation is derived from LongLib in GWT.
             *
             */

            // NOTE: commented out from original source
            //goog.provide('goog.math.Long');

            // NOTE:  added to original source to define the namespace
            if (goog === undefined) var goog = {};
            if (goog.math === undefined) goog.math = {};


            /**
             * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
             * values as *signed* integers.  See the from* functions below for more
             * convenient ways of constructing Longs.
             *
             * The internal representation of a long is the two given signed, 32-bit values.
             * We use 32-bit pieces because these are the size of integers on which
             * Javascript performs bit-operations.  For operations like addition and
             * multiplication, we split each number into 16-bit pieces, which can easily be
             * multiplied within Javascript's floating-point representation without overflow
             * or change in sign.
             *
             * In the algorithms below, we frequently reduce the negative case to the
             * positive case by negating the input(s) and then post-processing the result.
             * Note that we must ALWAYS check specially whether those values are MIN_VALUE
             * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
             * a positive number, it overflows back into a negative).  Not handling this
             * case would often result in infinite recursion.
             *
             * @param {number} low  The low (signed) 32 bits of the long.
             * @param {number} high  The high (signed) 32 bits of the long.
             * @constructor
             */
            goog.math.Long = function(low, high) {
                /**
                 * @type {number}
                 * @private
                 */
                this.low_ = low | 0; // force into 32 signed bits.

                /**
                 * @type {number}
                 * @private
                 */
                this.high_ = high | 0; // force into 32 signed bits.
            };


            // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
            // from* methods on which they depend.


            /**
             * A cache of the Long representations of small integer values.
             * @type {!Object}
             * @private
             */
            goog.math.Long.IntCache_ = {};


            /**
             * Returns a Long representing the given (32-bit) integer value.
             * @param {number} value The 32-bit integer in question.
             * @return {!goog.math.Long} The corresponding Long value.
             */
            goog.math.Long.fromInt = function(value) {
                if (-128 <= value && value < 128) {
                    var cachedObj = goog.math.Long.IntCache_[value];
                    if (cachedObj) {
                        return cachedObj;
                    }
                }

                var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
                if (-128 <= value && value < 128) {
                    goog.math.Long.IntCache_[value] = obj;
                }
                return obj;
            };


            /**
             * Returns a Long representing the given value, provided that it is a finite
             * number.  Otherwise, zero is returned.
             * @param {number} value The number in question.
             * @return {!goog.math.Long} The corresponding Long value.
             */
            goog.math.Long.fromNumber = function(value) {
                if (isNaN(value) || !isFinite(value)) {
                    return goog.math.Long.ZERO;
                } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
                    return goog.math.Long.MIN_VALUE;
                } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
                    return goog.math.Long.MAX_VALUE;
                } else if (value < 0) {
                    return goog.math.Long.fromNumber(-value).negate();
                } else {
                    return new goog.math.Long(
                        (value % goog.math.Long.TWO_PWR_32_DBL_) | 0, (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
                }
            };


            /**
             * Returns a Long representing the 64-bit integer that comes by concatenating
             * the given high and low bits.  Each is assumed to use 32 bits.
             * @param {number} lowBits The low 32-bits.
             * @param {number} highBits The high 32-bits.
             * @return {!goog.math.Long} The corresponding Long value.
             */
            goog.math.Long.fromBits = function(lowBits, highBits) {
                return new goog.math.Long(lowBits, highBits);
            };


            /**
             * Returns a Long representation of the given string, written using the given
             * radix.
             * @param {string} str The textual representation of the Long.
             * @param {number=} opt_radix The radix in which the text is written.
             * @return {!goog.math.Long} The corresponding Long value.
             */
            goog.math.Long.fromString = function(str, opt_radix) {
                if (str.length == 0) {
                    throw Error('number format error: empty string');
                }

                var radix = opt_radix || 10;
                if (radix < 2 || 36 < radix) {
                    throw Error('radix out of range: ' + radix);
                }

                if (str.charAt(0) == '-') {
                    return goog.math.Long.fromString(str.substring(1), radix).negate();
                } else if (str.indexOf('-') >= 0) {
                    throw Error('number format error: interior "-" character: ' + str);
                }

                // Do several (8) digits each time through the loop, so as to
                // minimize the calls to the very expensive emulated div.
                var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

                var result = goog.math.Long.ZERO;
                for (var i = 0; i < str.length; i += 8) {
                    var size = Math.min(8, str.length - i);
                    var value = parseInt(str.substring(i, i + size), radix);
                    if (size < 8) {
                        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
                        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
                    } else {
                        result = result.multiply(radixToPower);
                        result = result.add(goog.math.Long.fromNumber(value));
                    }
                }
                return result;
            };


            // NOTE: the compiler should inline these constant values below and then remove
            // these variables, so there should be no runtime penalty for these.


            /**
             * Number used repeated below in calculations.  This must appear before the
             * first call to any from* function below.
             * @type {number}
             * @private
             */
            goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


            /**
             * @type {number}
             * @private
             */
            goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


            /**
             * @type {number}
             * @private
             */
            goog.math.Long.TWO_PWR_32_DBL_ =
                goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


            /**
             * @type {number}
             * @private
             */
            goog.math.Long.TWO_PWR_31_DBL_ =
                goog.math.Long.TWO_PWR_32_DBL_ / 2;


            /**
             * @type {number}
             * @private
             */
            goog.math.Long.TWO_PWR_48_DBL_ =
                goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


            /**
             * @type {number}
             * @private
             */
            goog.math.Long.TWO_PWR_64_DBL_ =
                goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


            /**
             * @type {number}
             * @private
             */
            goog.math.Long.TWO_PWR_63_DBL_ =
                goog.math.Long.TWO_PWR_64_DBL_ / 2;


            /** @type {!goog.math.Long} */
            goog.math.Long.ZERO = goog.math.Long.fromInt(0);


            /** @type {!goog.math.Long} */
            goog.math.Long.ONE = goog.math.Long.fromInt(1);


            /** @type {!goog.math.Long} */
            goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


            /** @type {!goog.math.Long} */
            goog.math.Long.MAX_VALUE =
                goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


            /** @type {!goog.math.Long} */
            goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


            /**
             * @type {!goog.math.Long}
             * @private
             */
            goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


            /** @return {number} The value, assuming it is a 32-bit integer. */
            goog.math.Long.prototype.toInt = function() {
                return this.low_;
            };


            /** @return {number} The closest floating-point representation to this value. */
            goog.math.Long.prototype.toNumber = function() {
                return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
                    this.getLowBitsUnsigned();
            };


            /**
             * @param {number=} opt_radix The radix in which the text should be written.
             * @return {string} The textual representation of this value.
             * @override
             */
            goog.math.Long.prototype.toString = function(opt_radix) {
                var radix = opt_radix || 10;
                if (radix < 2 || 36 < radix) {
                    throw Error('radix out of range: ' + radix);
                }

                if (this.isZero()) {
                    return '0';
                }

                if (this.isNegative()) {
                    if (this.equals(goog.math.Long.MIN_VALUE)) {
                        // We need to change the Long value before it can be negated, so we remove
                        // the bottom-most digit in this base and then recurse to do the rest.
                        var radixLong = goog.math.Long.fromNumber(radix);
                        var div = this.div(radixLong);
                        var rem = div.multiply(radixLong).subtract(this);
                        return div.toString(radix) + rem.toInt().toString(radix);
                    } else {
                        return '-' + this.negate().toString(radix);
                    }
                }

                // Do several (6) digits each time through the loop, so as to
                // minimize the calls to the very expensive emulated div.
                var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

                var rem = this;
                var result = '';
                while (true) {
                    var remDiv = rem.div(radixToPower);
                    var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
                    var digits = intval.toString(radix);

                    rem = remDiv;
                    if (rem.isZero()) {
                        return digits + result;
                    } else {
                        while (digits.length < 6) {
                            digits = '0' + digits;
                        }
                        result = '' + digits + result;
                    }
                }
            };


            /** @return {number} The high 32-bits as a signed value. */
            goog.math.Long.prototype.getHighBits = function() {
                return this.high_;
            };


            /** @return {number} The low 32-bits as a signed value. */
            goog.math.Long.prototype.getLowBits = function() {
                return this.low_;
            };


            /** @return {number} The low 32-bits as an unsigned value. */
            goog.math.Long.prototype.getLowBitsUnsigned = function() {
                return (this.low_ >= 0) ?
                    this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
            };


            /**
             * @return {number} Returns the number of bits needed to represent the absolute
             *     value of this Long.
             */
            goog.math.Long.prototype.getNumBitsAbs = function() {
                if (this.isNegative()) {
                    if (this.equals(goog.math.Long.MIN_VALUE)) {
                        return 64;
                    } else {
                        return this.negate().getNumBitsAbs();
                    }
                } else {
                    var val = this.high_ != 0 ? this.high_ : this.low_;
                    for (var bit = 31; bit > 0; bit--) {
                        if ((val & (1 << bit)) != 0) {
                            break;
                        }
                    }
                    return this.high_ != 0 ? bit + 33 : bit + 1;
                }
            };


            /** @return {boolean} Whether this value is zero. */
            goog.math.Long.prototype.isZero = function() {
                return this.high_ == 0 && this.low_ == 0;
            };


            /** @return {boolean} Whether this value is negative. */
            goog.math.Long.prototype.isNegative = function() {
                return this.high_ < 0;
            };


            /** @return {boolean} Whether this value is odd. */
            goog.math.Long.prototype.isOdd = function() {
                return (this.low_ & 1) == 1;
            };


            /**
             * @param {goog.math.Long} other Long to compare against.
             * @return {boolean} Whether this Long equals the other.
             */
            goog.math.Long.prototype.equals = function(other) {
                return (this.high_ == other.high_) && (this.low_ == other.low_);
            };


            /**
             * @param {goog.math.Long} other Long to compare against.
             * @return {boolean} Whether this Long does not equal the other.
             */
            goog.math.Long.prototype.notEquals = function(other) {
                return (this.high_ != other.high_) || (this.low_ != other.low_);
            };


            /**
             * @param {goog.math.Long} other Long to compare against.
             * @return {boolean} Whether this Long is less than the other.
             */
            goog.math.Long.prototype.lessThan = function(other) {
                return this.compare(other) < 0;
            };


            /**
             * @param {goog.math.Long} other Long to compare against.
             * @return {boolean} Whether this Long is less than or equal to the other.
             */
            goog.math.Long.prototype.lessThanOrEqual = function(other) {
                return this.compare(other) <= 0;
            };


            /**
             * @param {goog.math.Long} other Long to compare against.
             * @return {boolean} Whether this Long is greater than the other.
             */
            goog.math.Long.prototype.greaterThan = function(other) {
                return this.compare(other) > 0;
            };


            /**
             * @param {goog.math.Long} other Long to compare against.
             * @return {boolean} Whether this Long is greater than or equal to the other.
             */
            goog.math.Long.prototype.greaterThanOrEqual = function(other) {
                return this.compare(other) >= 0;
            };


            /**
             * Compares this Long with the given one.
             * @param {goog.math.Long} other Long to compare against.
             * @return {number} 0 if they are the same, 1 if the this is greater, and -1
             *     if the given one is greater.
             */
            goog.math.Long.prototype.compare = function(other) {
                if (this.equals(other)) {
                    return 0;
                }

                var thisNeg = this.isNegative();
                var otherNeg = other.isNegative();
                if (thisNeg && !otherNeg) {
                    return -1;
                }
                if (!thisNeg && otherNeg) {
                    return 1;
                }

                // at this point, the signs are the same, so subtraction will not overflow
                if (this.subtract(other).isNegative()) {
                    return -1;
                } else {
                    return 1;
                }
            };


            /** @return {!goog.math.Long} The negation of this value. */
            goog.math.Long.prototype.negate = function() {
                if (this.equals(goog.math.Long.MIN_VALUE)) {
                    return goog.math.Long.MIN_VALUE;
                } else {
                    return this.not().add(goog.math.Long.ONE);
                }
            };


            /**
             * Returns the sum of this and the given Long.
             * @param {goog.math.Long} other Long to add to this one.
             * @return {!goog.math.Long} The sum of this and the given Long.
             */
            goog.math.Long.prototype.add = function(other) {
                // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

                var a48 = this.high_ >>> 16;
                var a32 = this.high_ & 0xFFFF;
                var a16 = this.low_ >>> 16;
                var a00 = this.low_ & 0xFFFF;

                var b48 = other.high_ >>> 16;
                var b32 = other.high_ & 0xFFFF;
                var b16 = other.low_ >>> 16;
                var b00 = other.low_ & 0xFFFF;

                var c48 = 0,
                    c32 = 0,
                    c16 = 0,
                    c00 = 0;
                c00 += a00 + b00;
                c16 += c00 >>> 16;
                c00 &= 0xFFFF;
                c16 += a16 + b16;
                c32 += c16 >>> 16;
                c16 &= 0xFFFF;
                c32 += a32 + b32;
                c48 += c32 >>> 16;
                c32 &= 0xFFFF;
                c48 += a48 + b48;
                c48 &= 0xFFFF;
                return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
            };


            /**
             * Returns the difference of this and the given Long.
             * @param {goog.math.Long} other Long to subtract from this.
             * @return {!goog.math.Long} The difference of this and the given Long.
             */
            goog.math.Long.prototype.subtract = function(other) {
                return this.add(other.negate());
            };


            /**
             * Returns the product of this and the given long.
             * @param {goog.math.Long} other Long to multiply with this.
             * @return {!goog.math.Long} The product of this and the other.
             */
            goog.math.Long.prototype.multiply = function(other) {
                if (this.isZero()) {
                    return goog.math.Long.ZERO;
                } else if (other.isZero()) {
                    return goog.math.Long.ZERO;
                }

                if (this.equals(goog.math.Long.MIN_VALUE)) {
                    return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
                } else if (other.equals(goog.math.Long.MIN_VALUE)) {
                    return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
                }

                if (this.isNegative()) {
                    if (other.isNegative()) {
                        return this.negate().multiply(other.negate());
                    } else {
                        return this.negate().multiply(other).negate();
                    }
                } else if (other.isNegative()) {
                    return this.multiply(other.negate()).negate();
                }

                // If both longs are small, use float multiplication
                if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
                    other.lessThan(goog.math.Long.TWO_PWR_24_)) {
                    return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
                }

                // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
                // We can skip products that would overflow.

                var a48 = this.high_ >>> 16;
                var a32 = this.high_ & 0xFFFF;
                var a16 = this.low_ >>> 16;
                var a00 = this.low_ & 0xFFFF;

                var b48 = other.high_ >>> 16;
                var b32 = other.high_ & 0xFFFF;
                var b16 = other.low_ >>> 16;
                var b00 = other.low_ & 0xFFFF;

                var c48 = 0,
                    c32 = 0,
                    c16 = 0,
                    c00 = 0;
                c00 += a00 * b00;
                c16 += c00 >>> 16;
                c00 &= 0xFFFF;
                c16 += a16 * b00;
                c32 += c16 >>> 16;
                c16 &= 0xFFFF;
                c16 += a00 * b16;
                c32 += c16 >>> 16;
                c16 &= 0xFFFF;
                c32 += a32 * b00;
                c48 += c32 >>> 16;
                c32 &= 0xFFFF;
                c32 += a16 * b16;
                c48 += c32 >>> 16;
                c32 &= 0xFFFF;
                c32 += a00 * b32;
                c48 += c32 >>> 16;
                c32 &= 0xFFFF;
                c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
                c48 &= 0xFFFF;
                return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
            };


            /**
             * Returns this Long divided by the given one.
             * @param {goog.math.Long} other Long by which to divide.
             * @return {!goog.math.Long} This Long divided by the given one.
             */
            goog.math.Long.prototype.div = function(other) {
                if (other.isZero()) {
                    throw Error('division by zero');
                } else if (this.isZero()) {
                    return goog.math.Long.ZERO;
                }

                if (this.equals(goog.math.Long.MIN_VALUE)) {
                    if (other.equals(goog.math.Long.ONE) ||
                        other.equals(goog.math.Long.NEG_ONE)) {
                        return goog.math.Long.MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
                    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
                        return goog.math.Long.ONE;
                    } else {
                        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                        var halfThis = this.shiftRight(1);
                        var approx = halfThis.div(other).shiftLeft(1);
                        if (approx.equals(goog.math.Long.ZERO)) {
                            return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
                        } else {
                            var rem = this.subtract(other.multiply(approx));
                            var result = approx.add(rem.div(other));
                            return result;
                        }
                    }
                } else if (other.equals(goog.math.Long.MIN_VALUE)) {
                    return goog.math.Long.ZERO;
                }

                if (this.isNegative()) {
                    if (other.isNegative()) {
                        return this.negate().div(other.negate());
                    } else {
                        return this.negate().div(other).negate();
                    }
                } else if (other.isNegative()) {
                    return this.div(other.negate()).negate();
                }

                // Repeat the following until the remainder is less than other:  find a
                // floating-point that approximates remainder / other *from below*, add this
                // into the result, and subtract it from the remainder.  It is critical that
                // the approximate value is less than or equal to the real value so that the
                // remainder never becomes negative.
                var res = goog.math.Long.ZERO;
                var rem = this;
                while (rem.greaterThanOrEqual(other)) {
                    // Approximate the result of division. This may be a little greater or
                    // smaller than the actual value.
                    var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

                    // We will tweak the approximate result by changing it in the 48-th digit or
                    // the smallest non-fractional digit, whichever is larger.
                    var log2 = Math.ceil(Math.log(approx) / Math.LN2);
                    var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

                    // Decrease the approximation until it is smaller than the remainder.  Note
                    // that if it is too large, the product overflows and is negative.
                    var approxRes = goog.math.Long.fromNumber(approx);
                    var approxRem = approxRes.multiply(other);
                    while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
                        approx -= delta;
                        approxRes = goog.math.Long.fromNumber(approx);
                        approxRem = approxRes.multiply(other);
                    }

                    // We know the answer can't be zero... and actually, zero would cause
                    // infinite recursion since we would make no progress.
                    if (approxRes.isZero()) {
                        approxRes = goog.math.Long.ONE;
                    }

                    res = res.add(approxRes);
                    rem = rem.subtract(approxRem);
                }
                return res;
            };


            /**
             * Returns this Long modulo the given one.
             * @param {goog.math.Long} other Long by which to mod.
             * @return {!goog.math.Long} This Long modulo the given one.
             */
            goog.math.Long.prototype.modulo = function(other) {
                return this.subtract(this.div(other).multiply(other));
            };


            /** @return {!goog.math.Long} The bitwise-NOT of this value. */
            goog.math.Long.prototype.not = function() {
                return goog.math.Long.fromBits(~this.low_, ~this.high_);
            };


            /**
             * Returns the bitwise-AND of this Long and the given one.
             * @param {goog.math.Long} other The Long with which to AND.
             * @return {!goog.math.Long} The bitwise-AND of this and the other.
             */
            goog.math.Long.prototype.and = function(other) {
                return goog.math.Long.fromBits(this.low_ & other.low_,
                    this.high_ & other.high_);
            };


            /**
             * Returns the bitwise-OR of this Long and the given one.
             * @param {goog.math.Long} other The Long with which to OR.
             * @return {!goog.math.Long} The bitwise-OR of this and the other.
             */
            goog.math.Long.prototype.or = function(other) {
                return goog.math.Long.fromBits(this.low_ | other.low_,
                    this.high_ | other.high_);
            };


            /**
             * Returns the bitwise-XOR of this Long and the given one.
             * @param {goog.math.Long} other The Long with which to XOR.
             * @return {!goog.math.Long} The bitwise-XOR of this and the other.
             */
            goog.math.Long.prototype.xor = function(other) {
                return goog.math.Long.fromBits(this.low_ ^ other.low_,
                    this.high_ ^ other.high_);
            };


            /**
             * Returns this Long with bits shifted to the left by the given amount.
             * @param {number} numBits The number of bits by which to shift.
             * @return {!goog.math.Long} This shifted to the left by the given amount.
             */
            goog.math.Long.prototype.shiftLeft = function(numBits) {
                numBits &= 63;
                if (numBits == 0) {
                    return this;
                } else {
                    var low = this.low_;
                    if (numBits < 32) {
                        var high = this.high_;
                        return goog.math.Long.fromBits(
                            low << numBits, (high << numBits) | (low >>> (32 - numBits)));
                    } else {
                        return goog.math.Long.fromBits(0, low << (numBits - 32));
                    }
                }
            };


            /**
             * Returns this Long with bits shifted to the right by the given amount.
             * @param {number} numBits The number of bits by which to shift.
             * @return {!goog.math.Long} This shifted to the right by the given amount.
             */
            goog.math.Long.prototype.shiftRight = function(numBits) {
                numBits &= 63;
                if (numBits == 0) {
                    return this;
                } else {
                    var high = this.high_;
                    if (numBits < 32) {
                        var low = this.low_;
                        return goog.math.Long.fromBits(
                            (low >>> numBits) | (high << (32 - numBits)),
                            high >> numBits);
                    } else {
                        return goog.math.Long.fromBits(
                            high >> (numBits - 32),
                            high >= 0 ? 0 : -1);
                    }
                }
            };


            /**
             * Returns this Long with bits shifted to the right by the given amount, with
             * the new top bits matching the current sign bit.
             * @param {number} numBits The number of bits by which to shift.
             * @return {!goog.math.Long} This shifted to the right by the given amount, with
             *     zeros placed into the new leading bits.
             */
            goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
                numBits &= 63;
                if (numBits == 0) {
                    return this;
                } else {
                    var high = this.high_;
                    if (numBits < 32) {
                        var low = this.low_;
                        return goog.math.Long.fromBits(
                            (low >>> numBits) | (high << (32 - numBits)),
                            high >>> numBits);
                    } else if (numBits == 32) {
                        return goog.math.Long.fromBits(high, 0);
                    } else {
                        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
                    }
                }
            };
            /*
             * Copyright 2013 Aggregate Knowledge, Inc.
             *
             * Licensed under the Apache License, Version 2.0 (the "License");
             * you may not use this file except in compliance with the License.
             * You may obtain a copy of the License at
             *
             *     http://www.apache.org/licenses/LICENSE-2.0
             *
             * Unless required by applicable law or agreed to in writing, software
             * distributed under the License is distributed on an "AS IS" BASIS,
             * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
             * See the License for the specific language governing permissions and
             * limitations under the License.
             */

            /**
             * @fileoverview A JavaScript implementation of the 128bit version of MurmurHash3
             * whose intent is to produce hashes that are binary equivalent to:
             * <ul>
             *   <li>{@link https://code.google.com/p/smhasher/source/browse/trunk/MurmurHash3.cpp}</li>
             *   <li>{@link http://guava-libraries.googlecode.com/git/guava/src/com/google/common/hash/Murmur3_128HashFunction.java}</a>
             * </ul>
             *
             * {@link https://code.google.com/p/closure-library/source/browse/closure/goog/math/long.js goog.math.Long}
             * from {@link https://code.google.com/p/closure-library/ Closure} is required.
             *
             * Example usage:
             * <pre>
             *     var seed = 0;
             *     var rawKey = new ArrayBuffer(1);
             *         var byteView = new Int8Array(rawKey);
             *             byteView[0] = 0xDE;
             *     var hashed = murmur3.hash128(rawKey, seed);
             *     console.log(hashed);
             * </pre>
             *
             * {@link http://en.wikipedia.org/wiki/MurmurHash}
             */
            // NOTE:  https://github.com/zmarcantel/murmur3/blob/master/murmur3.js deviated
            //        from the Java Guava results so this version was written.
            if (murmur3 === undefined) {
                var murmur3 = {
                    version: "1.0.0"
                };
            }
            (function() {
                'use strict';

                // ***************************************************************************
                function rotl(number, bits) {
                    return (number.shiftLeft(bits)).or(number.shiftRightUnsigned(-bits));
                }

                // =========================================================================
                var FMIX1 = new goog.math.Long(0xED558CCD, 0xFF51AFD7),
                    FMIX2 = new goog.math.Long(0x1A85EC53, 0xC4CEB9FE);

                function fmix(number) {
                    number = number.xor(number.shiftRightUnsigned(33));
                    number = number.multiply(FMIX1);
                    number = number.xor(number.shiftRightUnsigned(33));
                    number = number.multiply(FMIX2);
                    number = number.xor(number.shiftRightUnsigned(33));
                    return number;
                }

                // .........................................................................
                var C1 = new goog.math.Long(0x114253D5, 0x87C37B91),
                    C2 = new goog.math.Long(0x2745937F, 0x4CF5AD43);

                function mixk1(k1) {
                    k1 = k1.multiply(C1);
                    k1 = rotl(k1, 31);
                    return k1.multiply(C2);
                }

                function mixk2(k2) {
                    k2 = k2.multiply(C2);
                    k2 = rotl(k2, 33);
                    return k2.multiply(C1);
                }

                // *************************************************************************
                // NOTE:  the chunk (or block) size is 16 bytes (for the 128bit Murmur3)
                var CHUNK_SIZE_INTS = 4 /*ints = 16bytes*/ ;
                var ZERO = new goog.math.Long.fromInt(0) /*for convenience*/ ,
                    FIVE = new goog.math.Long.fromInt(5) /*for convenience*/ ;
                var BMIX1 = new goog.math.Long.fromInt(0x52DCE729),
                    BMIX2 = new goog.math.Long.fromInt(0x38495AB5);

                // =========================================================================
                /**
                 * @param {ArrayBuffer} [key=0] the key (as an <code>ArrayBuffer</code>)
                 *        that is to be hashed.
                 * @param {Number} [seed=0] a 32bit seed value.
                 * @returns {goog.math.Long} the first 8 bytes of the hash result as a
                 *          <code>goog.math.Long</code> (to match that of
                 *          {@link http://guava-libraries.googlecode.com/git/guava/src/com/google/common/hash/Murmur3_128HashFunction.java Guava's}
                 *          <code>asLong()</code>).
                 */
                murmur3.hash128 = function(key, seed) {
                    key = key || new ArrayBuffer(0 /*by contract*/ ) /*default*/ ;
                    seed = seed || 0 /*default*/ ;

                    var byteBuffer = new Uint8Array(key);
                    var chunkCount = byteBuffer.length >> 4 /*div by CHUNK_SIZE_BYTES*/ ;
                    var chunkCountInInts = chunkCount << 2 /*4 ints per chunk*/ ;

                    var lengthLong = new goog.math.Long.fromInt(byteBuffer.length);

                    var seedLong = new goog.math.Long.fromInt(seed);
                    var h1 = seedLong,
                        h2 = seedLong;

                    var k1, k2;

                    var intBuffer = new Uint32Array(key, 0 /*offset*/ , chunkCountInInts /*length*/ );
                    for (var i = 0; i < chunkCountInInts; i += CHUNK_SIZE_INTS) {
                        k1 = new goog.math.Long(intBuffer[i + 0], intBuffer[i + 1]);
                        k2 = new goog.math.Long(intBuffer[i + 2], intBuffer[i + 3]);

                        h1 = h1.xor(mixk1(k1));

                        h1 = rotl(h1, 27);
                        h1 = h1.add(h2);
                        h1 = h1.multiply(FIVE).add(BMIX1);

                        h2 = h2.xor(mixk2(k2));

                        h2 = rotl(h2, 31);
                        h2 = h2.add(h1);
                        h2 = h2.multiply(FIVE).add(BMIX2);
                    }

                    k1 = ZERO;
                    k2 = ZERO;

                    var byteRemainder = byteBuffer.length & 0x0F /*mask that is CHUNK_SIZE_BYTES - 1*/ ;
                    var remainderBuffer = new Uint8Array(key, (chunkCount << 4 /*mult by CHUNK_SIZE_BYTES*/ ), byteRemainder) /*points to just remainder*/ ;
                    switch (byteRemainder) { // NOTE:  all cases fall through
                        // TODO:  determine if the constructor or .fromInt() is more performant
                        //        (.fromInt() does a hash lookup on each call to determine
                        //        if a cached version of the object already exists)
                        case 15:
                            k2 = k2.xor((new goog.math.Long.fromInt(remainderBuffer[14])).shiftLeft(48));
                        case 14:
                            k2 = k2.xor((new goog.math.Long.fromInt(remainderBuffer[13])).shiftLeft(40));
                        case 13:
                            k2 = k2.xor((new goog.math.Long.fromInt(remainderBuffer[12])).shiftLeft(32));
                        case 12:
                            k2 = k2.xor((new goog.math.Long.fromInt(remainderBuffer[11])).shiftLeft(24));
                        case 11:
                            k2 = k2.xor((new goog.math.Long.fromInt(remainderBuffer[10])).shiftLeft(16));
                        case 10:
                            k2 = k2.xor((new goog.math.Long.fromInt(remainderBuffer[9])).shiftLeft(8));
                        case 9:
                            k2 = k2.xor(new goog.math.Long.fromInt(remainderBuffer[8]));
                            h2 = h2.xor(mixk1(k2));

                        case 8:
                            k1 = k1.xor((new goog.math.Long.fromInt(remainderBuffer[7])).shiftLeft(56));
                        case 7:
                            k1 = k1.xor((new goog.math.Long.fromInt(remainderBuffer[6])).shiftLeft(48));
                        case 6:
                            k1 = k1.xor((new goog.math.Long.fromInt(remainderBuffer[5])).shiftLeft(40));
                        case 5:
                            k1 = k1.xor((new goog.math.Long.fromInt(remainderBuffer[4])).shiftLeft(32));
                        case 4:
                            k1 = k1.xor((new goog.math.Long.fromInt(remainderBuffer[3])).shiftLeft(24));
                        case 3:
                            k1 = k1.xor((new goog.math.Long.fromInt(remainderBuffer[2])).shiftLeft(16));
                        case 2:
                            k1 = k1.xor((new goog.math.Long.fromInt(remainderBuffer[1])).shiftLeft(8));
                        case 1:
                            k1 = k1.xor(new goog.math.Long.fromInt(remainderBuffer[0]));
                            h1 = h1.xor(mixk1(k1));
                    }

                    h1 = h1.xor(lengthLong);
                    h2 = h2.xor(lengthLong);

                    h1 = h1.add(h2);
                    h2 = h2.add(h1);

                    h1 = fmix(h1);
                    h2 = fmix(h2);

                    h1 = h1.add(h2);
                    h2 = h2.add(h1);

                    return h1 /*by contract to match Guava's .asLong()*/ ;
                };
            })();
            "use strict";

            /*\
|*|
|*|  Base64 / binary data / UTF-8 strings utilities
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding
|*|
\*/

            function strToUTF8Arr(sDOMStr) {

                var aBytes, nChr, nStrLen = sDOMStr.length,
                    nArrLen = 0;

                /* mapping... */

                for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
                    nChr = sDOMStr.charCodeAt(nMapIdx);
                    nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
                }

                aBytes = new Uint8Array(nArrLen);

                /* transcription... */

                for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
                    nChr = sDOMStr.charCodeAt(nChrIdx);
                    if (nChr < 128) {
                        /* one byte */
                        aBytes[nIdx++] = nChr;
                    } else if (nChr < 0x800) {
                        /* two bytes */
                        aBytes[nIdx++] = 192 + (nChr >>> 6);
                        aBytes[nIdx++] = 128 + (nChr & 63);
                    } else if (nChr < 0x10000) {
                        /* three bytes */
                        aBytes[nIdx++] = 224 + (nChr >>> 12);
                        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                        aBytes[nIdx++] = 128 + (nChr & 63);
                    } else if (nChr < 0x200000) {
                        /* four bytes */
                        aBytes[nIdx++] = 240 + (nChr >>> 18);
                        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                        aBytes[nIdx++] = 128 + (nChr & 63);
                    } else if (nChr < 0x4000000) {
                        /* five bytes */
                        aBytes[nIdx++] = 248 + (nChr >>> 24);
                        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                        aBytes[nIdx++] = 128 + (nChr & 63);
                    } else /* if (nChr <= 0x7fffffff) */ {
                        /* six bytes */
                        aBytes[nIdx++] = 252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824);
                        aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                        aBytes[nIdx++] = 128 + (nChr & 63);
                    }
                }

                return aBytes;

            }

            function hash(str) {
                // The first argument to hash128 expected to be of type Array Buffer. The
                // second argument is a seed (which defaults to 0).
                return murmur3.hash128(strToUTF8Arr(str));
            }

            // Is key in (low, high)
            hash.inRange = function inRange(key, low, high) {
                //return (low < high && key > low && key < high) ||
                //    (low > high && (key > low || key < high)) ||
                //    (low === high && key !== low);
                return (lessThan(low, high) && lessThan(low, key) && lessThan(key, high)) || (lessThan(high, low) && (lessThan(low, key) || lessThan(key, high))) || (equalTo(low, high) && !equalTo(key, low));
            };

            // Is key in (low, high]
            hash.inHalfOpenRange = function inHalfOpenRange(key, low, high) {
                //return (low < high && key > low && key <= high) ||
                //    (low > high && (key > low || key <= high)) ||
                //    (low == high);
                return (lessThan(low, high) && lessThan(low, key) && lessThanOrEqual(key, high)) || (lessThan(high, low) && (lessThan(low, key) || lessThanOrEqual(key, high))) || (equalTo(low, high));
            };

            // Key comparison
            hash.lessThan = function lessThan(low, high) {
                var i;

                if (low.length !== high.length) {
                    // Arbitrary comparison
                    return low.length < high.length;
                }

                for (i = 0; i < low.length; ++i) {
                    if (low[i] < high[i]) {
                        return true;
                    } else if (low[i] > high[i]) {
                        return false;
                    }
                }

                return false;
            };

            hash.lessThanOrEqual = function lessThanOrEqual(low, high) {
                var i;

                if (low.length !== high.length) {
                    // Arbitrary comparison
                    return low.length <= high.length;
                }

                for (i = 0; i < low.length; ++i) {
                    if (low[i] < high[i]) {
                        return true;
                    } else if (low[i] > high[i]) {
                        return false;
                    }
                }

                return true;
            };

            hash.equalTo = function equalTo(a, b) {
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

    // Create a peer connection
    function peer(options) {
        var self = this,
            peer = new Peer(options);

        // The connection event fires when a data channel is established.
        peer.on("connection", function(dataConnection) {
            self.connections.push(dataConnection);

            dataConnection.on("close", function() {
                delete self.connections[self.connections.indexOf(dataConnection)];
            });

            self.peer.socket.close();
        });

        return peer;
    }

    function BubbleHash(options) {
        this.connections = [];
        this.peer = peer(options.peer || {});
    }

    return BubbleHash;
}());

(function(exports) {
    // BubbleHash User Interface
    // -------------------------

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

    // Variables

    var ui, bubblehash, log;

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
        var logger, messages = {}, i = 0;

        messages["info:welcome"] = "Bubble hash is a distributed hash-table which runs in your browser.\n\nTo get started either paste an ID which was sent to you or send your ID to someone else.";
        messages["error:general"] = "An error occured.\n\n";
        messages["success:dataConnection"] = "Dataconnection established!";

        logger = new Logger(
            ["success", "info", "warning", "danger"],
            messages
        );

        logger.onmessage = function(type, message, callback) {
            message = message.replace(/\n/g, "<br>");

            function show(e) {
                var alertBox = ui[type].clone()

                if (Object.prototype.toString.call(e).indexOf("Error") !== -1) {
                    message += e.stack;
                }

                alertBox.attr("id", type + i);
                alertBox.find(".message").html(message);
                ui.alertContainer.prepend(alertBox);
                alertBox.show().alert();

                if (type !== "danger") {
                    window.setTimeout(function() {
                        alertBox.fadeTo(500, 0).slideUp(500, function() {
                            alertBox.remove();
                        });
                    }, 5000);
                }

                if (callback) {
                    callback.apply(this, arguments);
                }

                i += 1;
            }

            return show;
        };

        return logger;
    }());

    // Bind some generic UI events.
    (function() {
        function select() {
            document.getSelection().removeAllRanges();
            this.select();
        }

        // Make it easy to copy che client ID.
        ui.clientID.mousedown(function() {
            return false;
        });
        ui.clientID.mouseenter(select);
        ui.clientID.mouseleave(function() {
            document.getSelection().removeAllRanges();
        });

        // Enable tooltips on form elements.
        $('[rel="tooltip"]').tooltip();
    }());

    bubblehash = (function() {
        var options = {};

        options.peer = {};
        options.peer.key = "mbv2swgd5tztcsor";
        options.peer.config = {
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
        options.peer.debug = 3

        return new BubbleHash(options);
    }());

    // Bind some events to the peer.
    bubblehash.peer.on("open", log.info("info:welcome", function(id) {
        ui.clientID.val(id);
    }));

    bubblehash.peer.on("connection", log.success("success:dataConnection"));

    bubblehash.peer.on("error", log.danger("error:general"))

    // Bind some BubbleHash UI events.
    ui.connect.click(function() {

    });
}(this));
