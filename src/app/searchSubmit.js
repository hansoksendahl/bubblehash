var searchSubmit = (function () {
  // Twitter's official hashtag verifier.
  
  // Creates a Unicode Regular Expression range
  function regexRange (from, to) {
    to = to || 0;
    
    from = from.toString(16);
    fromLen = (from.length > 4) ? from.length : 4;
    to = to.toString(16);
    toLen = (to.length > 4) ? to.length : 4;
    
    if (to !== "0") {
      return "\\u"+("0000"+from).slice(-fromLen)+"-\\u"+("0000"+to).slice(-toLen)+"";
    }
    else {
      "\\u{"+("0000"+from).slice(-fromLen)+"}";
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
    regexRange(0x08a0),         // Arabic Extended A
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
    regexRange(0xFFA1, 0xFFDC)  // Half-width Hangul
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
  HASHTAG_ALPHA = "[a-z_"+LATIN_ACCENTS+NON_LATIN_HASHTAG_CHARS+CJ_HASHTAG_CHARACTERS+"]";
  HASHTAG_ALPHANUMERIC = "[a-z0-9_"+LATIN_ACCENTS+NON_LATIN_HASHTAG_CHARS+CJ_HASHTAG_CHARACTERS+"]";
  
  HASHTAG = new RegExp("(#|＃)("+HASHTAG_ALPHANUMERIC+"*"+HASHTAG_ALPHA+HASHTAG_ALPHANUMERIC+"*)", "i");
  
  return function () {
    var val = cache.searchQuery.val()
      , tags = []
      , match;
    
    if (HASHTAG.test(val)) {
      match = HASHTAG.exec(val);
      
      if (match !== null) {
        cache.search.data("hashtag", match[1]);
      }
    }
    else {
      notify("danger", "OMG! Invalid hashtag.")
    }
  }
}());
  
