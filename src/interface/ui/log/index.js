log = (function () {
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
      
      if(Object.prototype.toString.call(e).indexOf("Error") !== -1) {
        message += e.stack;
      }
      
      alertBox.attr("id", type+i);
      alertBox.find(".message").html(message);
      ui.alertContainer.prepend(alertBox);
      alertBox.show().alert();
      
      if (type !== "danger") {
        window.setTimeout(function () {
          alertBox.fadeTo(500, 0).slideUp(500, function(){
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