// Set some data
out.data = function dataSetter (obj) {
  if (arguments.length === 0) {
    return data;
  }
  
  data = obj;
  return out;
};