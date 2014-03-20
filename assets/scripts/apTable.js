var apTable = function(o, c) {
  // initialize some arrays
  var columns = c !== undefined ? c : []
    , rows = []
    , row
    , i, j;
 
  // iterate through all the remaining arguments
  for (var i = 0; i < o.length; i++) {
    row = {};
    // Is it an Array or a Object?
    for (j in o[i]) {
      // Add a column title
      if (! (/^\d+$/).test(j)) {
        if (c === void(0) && columns.indexOf(j) === -1) columns.push(j);
        row[j] = o[i][j];
      }
      else {
        row[columns[j]] = o[i][j];
      }
    }
    // Add a row
    rows.push(row);
  }
 
  return [columns, rows];
};