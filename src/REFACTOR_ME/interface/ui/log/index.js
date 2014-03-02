log = (function () {
import "Logger/";
  
  var logger
    , messages = {}
    , i = 0;
    
import "messages.js"
  
  logger = new Logger(
    ["success", "info", "warning", "danger"],
    messages
  );
  
  logger.onmessage = function (type, message, callback) {
    message = message.replace(/\n/g, "<br>");
    
    function show (e) {
      var alertBox = ui[type].clone()
        , displayMessage = message
      
      if(Object.prototype.toString.call(e).indexOf("Error") !== -1) {
        displayMessage += e.message;
      }
      
      alertBox.attr("id", type+i);
      alertBox.find(".message").html(displayMessage);
      ui.alertContainer.prepend(alertBox);
      alertBox.show().alert();
      
      window.setTimeout(function () {
        alertBox.fadeTo(500, 0).slideUp(500, function(){
            alertBox.remove();
        });
      }, 3000);
      
      if (callback) {
        callback.apply(this, arguments);
      }
      
      i += 1;
    }
    
    return show;
  };
  
  return logger;
}());