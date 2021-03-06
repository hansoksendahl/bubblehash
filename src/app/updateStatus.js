var updateStatus = (function () {
  var statuses = $("[id^=ui-status]");
  
  return function statusUpdate (status) {
    statuses.hide();
    cache["status"+status[0].toUpperCase()+status.slice(1)].show();
    
    // Toggle form fields
    if (status === "on") {
      cache.searchBtn.removeAttr("disabled");
      cache.searchQuery.removeAttr("disabled");
    }
    else {
      cache.searchBtn.attr("disabled", "disabled");
      cache.searchQuery.attr("disabled", "disabled");
    }
  };
}());