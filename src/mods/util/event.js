define(function(require, exports, module) {

  exports.on = function(ele, type, fn) {
    if (document.addEventListener) {
      ele.addEventListener(type, fn, false);
    } else {
      ele.attachEvent('on' + type, fn);
    }
  };

  exports.halt = function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  };
});
