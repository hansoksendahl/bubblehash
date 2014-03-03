BubbleHash.prototype._hash = function _hash (key, seed) {
  var h, i;
  
  h = murmurHash3.x86.hash128(key, seed)
      .match(/([a-f0-9]{8})([a-f0-9]{8})([a-f0-9]{8})([a-f0-9]{8})/)
      .slice(1, 5);
  
  for (i = 0; i < 4; i += 1) {
    h[i] = parseInt(h[i], 16);
  }
  
  return h;
};