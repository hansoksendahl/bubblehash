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

import "log/";

import "peer/";

import "connect/";