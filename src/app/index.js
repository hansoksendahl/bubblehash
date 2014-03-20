(function (exports) {
  var cache, bubblehash, bubblehashOptions, notify, xhr
    , manifest = [];
    
import "dependencyCheck.js";

import "XHR/";

import "cache.js";

import "bubblehashOptions.js";

import "notify/";

import "updateStatus.js";

import "xhr/";

import "peerOpen.js";

import "manifestGet.js";

import "dbConnection.js";

import "searchSubmit.js";

  // Bind some generic UI events.
  (function () {
    // Enable tooltips on form elements.
    $('[rel="tooltip"]').tooltip();
  }());

  bubblehash = new BubbleHash(bubblehashOptions);
  
  // Make the search button fire the submit event.
  cache.searchBtn.on("click", function () {
    $(this).closest("form").trigger("submit")
  });
  
  cache.addColumnBtn.on("click", function () {
    var columnNum = cache.tableColumns.find("th").length + 1;
    
    cache.tableColumns.append($("<th>").append("<input type=\"text\">"));
    
    cache.tableRows.find("tr").each(function () {
      var row = $(this)
        , cellNum = row.find("td").length
        , i;
      
      if (cellNum < columnNum) {
        for (i = cellNum; i < columnNum; i += 1) {
          row.append($("<td>").append("<input type=\"text\">"));
        }
      }
    })
  });
  
  cache.addRowBtn.on("click", function () {
    var cellNum = cache.tableColumns.find("th").length
      , row = $("<tr>")
      , i;
    
    cellNum = cellNum || 1;
    
    for (i = 0; i < cellNum; i += 1) {
      row.append($("<td>").append("<input type=\"text\">"));
    }
    
    cache.tableRows.append(row);
  });
  
  cache.search.on("submit", function () {
    var results = searchSubmit(function (results) {
      // Empty the table
      cache.tableColumns.empty();
      cache.tableRows.empty();
      
      // Create the table
      var data = apTable(results);
      
      data[0].forEach(function (column) {
        cache.tableColumns.append($("<th>").text(column));
      });
      
      data[1].forEach(function (entry) {
        var row = $("<tr>")
          , i, column, cell;
        
        for (i = 0; i < data[0].length; i += 1) {
          column = data[0][i];
          cell = $("<td>");
          
          if (entry[column] !== void(0)) {
            cell.text(entry[column]);
          }
          
          row.append(cell);
        }
        
        cache.tableRows.append(row);
      });
    });

    // console.log(apTable(results));
    
    // Prevent default
    return false;
  });
  
  (function () {
    var hashTags = ["#test", "#awesome", "#sandbox"];
    
    cache.searchQuery.attr("placeholder", hashTags[Math.floor(Math.random() * hashTags.length)]);
  }());
  
  bubblehash.peer.on("open", function () {
    notify("success", "socket");
    updateStatus("connecting");
    peerOpen();
  });
  
  bubblehash.on("chord", function () {
    updateStatus("on");
    notify("success", "connection");
  });
  
  exports.queries = queries;
  exports.bubblehash = bubblehash;
  
  notify("info", "welcome");
}(this));