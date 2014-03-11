// FIXME
// Since `(h₁ - h₂) ∈ {x|0≤x<2¹²⁸-1}` and we are restricted to 32 bit unsigned
// integers we cannot easily calculate the actual value of h₁ - h₂.
//
// While the following may be true by careful manipulation of string based
// exponential notation we can represent these values with enough precision to
// accurately calculate the value of `log(h₁ - h₂)`.
//
// The method currently used is a bit of a hack.  It takes the most significant
// chunk not equal to zero from h₁-h₂ and uses Javascript exponential notation
// to come as close to the actual value as our 32bit values will allow.
// It has some rounding errors due to loss of precision.
//
// Better approaches could be based on factorization but these approaches would
// not work for primes.  As prime numbers are only divisible by one and
// themselves.
//
// It is unknown whether there exists a Javascript Bigint library which provides
// a `log` member function.  Greater precision could be established with a 
// library that supports integer types with higher levels of precision.
util.logMinus = function (h_1, h_2) {
  var a = []
    , buffer = ""
    , carry = 0
    , sub = 0
    , i
    , enc = 0
    , encL = 0
    , hex
    , e = 0;

  // Swap if h_1 is less than h₂
  if (util.lessThan(h_1, h_2)) {
    sub = h_1;
    h_1 = h_2;
    h_2 = sub;
  }
  
  // Subtract h₂ from h_1
  sub = 0;
  for (i = 0; i < h_1.length; i += 1) {
    sub = Math.abs(h_1[i]) - Math.abs(h_2[i]) + carry;
    
    if (sub < 0 && i < h_1.length - 1) {
      sub = (i < h_1.length - 1 && a[i + 1] > 0) ? 0x100000000 - sub : 0;
      carry = -1;
    }
    else {
      carry = 0;
    }
    
    a[i] = sub;
  }
  
  // Capture a buffer of hexadecimal characters and calculate the exponent.
  // Changing the exponent form base₂ to base₁₀.
  for (i = a.length - 1; i >= 0; i -= 1) {
    if (a[i] > 0 || buffer.length > 0) {
      // Convert the zero-padded number to hclexadecimal and add it to the
      // buffer.
      hex = (buffer.length ? (a[i]).toString(16).slice(-8) : a[i].toString(16));
      buffer = (buffer + hex).slice(0, 8);
      // Record the index of the first encountered non-zero 32 bit chunk.
      enc = enc || i;
      // Record the length of the hexadecimal value in the first non-zero
      // chunk
      encL = encL || buffer.length;
    }
    
    if (buffer.length >= 8 || i === 0) {
      // Calculate the exponent which the buffer would need to be raised to
      // to equal the originating value for a keyspace broken into 32 bit
      // chunks.
      e = Math.floor(((32 * enc) + 4 * encL) * Math.LN2 / Math.LN10);
      break;
    }
  }
  
  sub = 0;
  // Initialize the buffer to zero if nothing else is recorded.
  //
  // TODO
  // Initializing to a value of `"1"` might be a better choice here.
  buffer = (buffer.length) ? buffer : "0";
  // Convert to decimals in the for 0.00000001
  buffer = parseInt(buffer, 16).toString();
  buffer = buffer[0]+"."+buffer.slice(1);
  // Use exponential notation to represent the value of the largest chunk
  sub = Number(""+buffer+"e"+e);
  
  // Return the log₂ value of the exponential number descibed by `sub`
  return Math.round(Math.log(sub || 1) / Math.LN2) || 0
};