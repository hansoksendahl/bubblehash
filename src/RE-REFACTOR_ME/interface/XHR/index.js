// xhr
var XHR = (function () {
  function XHR () {
    this.request = new XMLHttpRequest();
    this.__header = {};
    this.__data = {};
  }
  
import "headers";
import "data";
import "get";
import "post";
import "send";
    
  return XHR;
}());