define(function(require, exports, module) {
  "use strict";

  var supportRange = typeof window.getSelection === "function";

  var selection = (function(){
    var _getRange;

    if (supportRange) {
      _getRange = function(){
        return window.getSelection().getRangeAt(0);
      }
    } else {
      _getRange = function(){
        return document.selection.createRange();
      }
    }

    return {
      getRange: _getRange
    }
  }());

  module.exports = selection;
});
