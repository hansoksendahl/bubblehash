notify = (function () {
  var i = 0
    , messages = {};
    
import "messages.js";
  
  return function (type, message) {
    message = messages[message] || message;
    
    var alertBox = cache[type].clone()
      , displayMessage = message;
    
    alertBox.attr("id", type+i);
    alertBox.find(".message").html(displayMessage);
    cache.alertContainer.prepend(alertBox);
    alertBox.show().alert();
    
    window.setTimeout(function () {
      alertBox.fadeTo(500, 0).slideUp(500, function(){
          alertBox.remove();
      });
    }, 3000);
    
    i += 1;
  };
}());