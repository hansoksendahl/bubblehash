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