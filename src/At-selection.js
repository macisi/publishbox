define(function(require, exports, module) {
	'use strict';
  var $ = require('$');

  var UA = navigator.userAgent;

  var _isFirefox = UA.indexOf('Gecko') > -1 && UA.indexOf('like Gecko') === -1;
  var _isIE = UA.indexOf('Trident/') > -1 || UA.indexOf('MSIE') > -1;
  // Disable Automatic URL detection in ie
  document.execCommand("AutoUrlDetect", false, false);

  /**
   * 发布框
   * @param cfg 配置项
   *        cfg.textbox 输入框容器
   *        cfg.queryFriendsUrl 好友查询接口地址
   *        cfg.maxSize 提示框允许输入最大字符数
   *        cfg.template 编译后的模版
   *        cfg.show 提供选择的最大数量
   */
  function AtSelection(cfg) {
    this.config = $.extend({
      show: 10
    }, cfg);
    this.template = cfg.template;
    this._init();
  }

  AtSelection.prototype = {

    /**
     * 初始化
     */
    _init: function() {
      var that = this;

      // 相关视图结点
      var $box = $(that.config.textbox);
      var $menu = $('<ul class=\'as-menu\'></ul>');
      that.view = {
        $box: $box,
        $menu: $menu
      };
      that.state = {
        hover: null, // 当前高亮选项
        open: false, // 提示是否开启
        timeout: 0 // 查询延时器
      };

      // 输入框初始化
      $box[0].contentEditable = true;

      $box.on({
        'keydown.ats': function(e) {
          if (that.state.open) {
            switch(e.keyCode) {
              case 38:
                // 上箭头
                e.preventDefault();
                that._up();
                break;
              case 40:
                // 下箭头
                e.preventDefault();
                that._down();
                break;
              default:
                break;
            }
          }
        },
        'keypress.ats': function(e) {
          if (e.target && e.target.className == 'at') { // @人员为一个整体，不能再做编辑
            return;
          }
          if (!($box[0].lastChild && $box[0].lastChild.tagName === 'BR') && !_isIE) {
            //firefox下必须在最后加上br 否则光标定位有问题
            $box.append('<br>');
          }
          switch (e.which) {
            case 64:
              // @
              if (that.state.open) {
                //提示已开启
                that._abort();
              }
              that._open();
              e.preventDefault();
              e.stopPropagation();
              break;
            case 32:
              // 空格：关闭提示
              that._abort();
              break;
            case 13:
              // 回车
              if (that.state.open) {
                if (that.state.hover) {
                  that._select();
                } else {
                  that._abort();
                }
              } else {
                if (!_isFirefox) {
                  // 修改默认行为-插入<br/> 火狐是正常的，其他浏览器有问题
                  that._enter();
                }
              }
              e.preventDefault();
              e.stopPropagation();
              break;
            default:
              if (that.state.open) {
                if (that._text().length > that.config.maxSize) {
                  // 超过最大输入字符数关闭提示
                  that._abort();
                } else { // 其他字符做查询
                  that._query();
                }
              }
              break;
          }
        }
      });

      // 选择框初始化
      $menu.on('mousemove.ats', 'li[role=\'menuItem\']', function(e) { // 鼠标高亮选项
        if (!$(this).hasClass('hover')) {
          $(that.state.hover).removeClass('hover');
          $(this).addClass('hover');
          that.state.hover = this;
        }
      });
    },

    /**
     * 打开选择菜单
     */
    _attachMenu: function(){
      var that = this;
      this.view.$menu.appendTo('body');

      $(document).on('click.ats', function(e) { // 鼠标点击选项
        var target = e.target;
        if (target === that.view.$menu[0]) return;
        if (that.view.$menu[0].contains(target)) {
          // 选中提示选项
          while(target && $(target).attr('role') !== 'menuItem') {
            target = target.parentNode;
          }
          if ($(target).attr('role') === 'menuItem') {
            that.state.hover = target;
            that._select();
          }
        } else {
          // 点击其他区域取消提示
          that._abort();
        }
      });
    },

    /**
     * 从dom中移除menu
     */
    _detachMenu: function(){
      this.view.$menu.detach();
      $(document).off('click.ats');
    },

    /**
     * 开启提示
     */
    _open: function() {
      var sel, range, node;
      if (window.getSelection) {
        node = document.createElement('span');
        node.setAttribute('data-type', '@');
        node.innerHTML = '@';
        sel = window.getSelection();
        range = sel && sel.getRangeAt(0);
        if (range) {
          this.state.open = true;
          range.insertNode(node);
          //safari prior to version 3 does not support getRangeAt
          range = document.createRange();
          range.setStart(node, 1);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        sel = document.selection;
        if (sel.type !== 'Control') {
          range = sel && sel.createRange();
          if (range) {
            this.state.open = true;
            range.pasteHTML('<span data-type=\'@\'>@ </span>');
            range.moveStart('character', -1);
            range.select();
          }
        }
      }
    },

    /**
     * 关闭提示
     */
    _close: function() {
      this.state.hover = null;
      this.state.open = false;
      this.view.$menu.empty();
      this._detachMenu();
      clearTimeout(this.state.timeout);
    },

    /**
     * 取消提示
     */
    _abort: function() {
      var box = this.view.$box[0];
      var input = $('[data-type=\'@\']', box)[0];
      if (input) { // 文字结点合并
        var prev = input.previousSibling;
        var next = input.nextSlibing;
        var prevIsText = prev && prev.nodeType === 3;
        var nextIsText = next && next.nodeType === 3;
        var container = null;
        var index = 0;
        if (prevIsText && nextIsText) { // 前后都是文字结点
          var text = $(prev).text() + $(input).text();
          index = text.length;
          text += $(next).text();
          box.removeChild(input);
          box.removeChild(next);
          prev.nodeValue = text;
          container = prev;
        } else if (prevIsText) { // 只有前面是文字结点
          var text = $(prev).text() + $(input).text();
          index = text.length;
          box.removeChild(input);
          prev.nodeValue = text;
          container = prev;
        } else if (nextIsText) { // 只有后面是文字结点
          var text = $(input).text();
          index = text.length;
          text += $(next).text();
          box.removeChild(input);
          next.nodeValue = text;
          container = next;
        } else { // 前后都不是文字结点
          var text = $(input).text();
          index = text.length;
          next = document.createTextNode(text);
          box.insertBefore(next, input);
          box.removeChild(input);
          container = next;
        }
      }
      this._close();
    },

    /**
     * 获取@后输入的文字
     */
    _text: function() {
      var box = this.view.$box[0];
      var input = $('[data-type=\'@\']', box)[0];
      if (input) {
        var text = input.innerHTML;
        if (text.charAt(0) == '@') {
          text = text.substring(1);
        }
        return text;
      }
      return '';
    },

    /**
     * 上一个选项
     */
    _up: function() {
      if (this.state.open && this.state.hover) {
        var hover = this.state.hover;
        var prev = hover.previousSibling;
        if (prev) {
          hover.className = '';
          prev.className = 'hover';
          this.state.hover = prev;
        }
      }
    },

    /**
     * 下一个选项
     */
    _down: function() {
      if (this.state.open && this.state.hover) {
        var hover = this.state.hover;
        var next = hover.nextSibling;
        if (next) {
          hover.className = '';
          next.className = 'hover';
          this.state.hover = next;
        }
      }
    },

    /**
     * 选中当前选项
     */
    _select: function() {
      if (this.state.open && this.state.hover) {
        var box = this.view.$box[0];
        var hover = this.state.hover;
        var input = $('[data-type=\'@\']', box)[0];
        var space = document.createTextNode(' ');
        var sel, range, label;
        if (input) {
          if (!_isFirefox) {
            label = document.createElement('button');
            label.innerHTML = '<span>+</span>' + hover.querySelector('[role=\'nick\']').innerHTML;
            label.contentEditable = false;
          } else {
            label = document.createElement('input');
            label.type = "button";
            label.value = '+' + hover.querySelector('[role=\'nick\']').innerHTML;
          }
          label.setAttribute('data-id', $(hover).data('id'));
          label.setAttribute('tabindex', -1);
          label.className = 'at';

          box.insertBefore(label, input);
          box.insertBefore(space, input);

          box.removeChild(input);
          // 创建选区
          if (window.getSelection) {
            sel = getSelection();
            range = document.createRange();
            range.setEndAfter(space);
            range.setStartAfter(space);
            sel.removeAllRanges();
            sel.addRange(range);
            box.focus();
          } else {
            box.focus();
          }
        }
      }
      this._close();
    },

    /**
     * 查询
     */
    _query: function() {
      var that = this;
      var $menu = that.view.$menu;
      clearTimeout(that.state.timeout);
      that.state.timeout = setTimeout(function() {
        that.state.hover = null;
        var text = that._text();
        text && $.get(that.config.queryFriendsUrl + text, function(result) {
          if (result.code == 0 && result.data && result.data.length) {
            var box = that.view.box;
            var $input = that.view.$box.find('[data-type=\'@\']');
            if ($input.length) {
              // render here
              $menu.html(that.template(result.data.slice(0, that.config.show)));

              var offset = $input.offset();
              $menu.css({
                left: offset.left + 6,
                top: offset.top + $input[0].offsetHeight
              });
              that._attachMenu();
              that.state.hover = $menu.children()[0];
            }
          }
        });
      }, 200);
    },

    /**
     * 修改默认回车行为-插入<br>
     */
    _enter: function() {
      if (window.getSelection) {
        var sel = getSelection();
        if (sel.rangeCount) {
          var range = sel.getRangeAt(0);
          range.deleteContents();
          var br = document.createElement('br');
          range.insertNode(br);
          range.setEndAfter(br);
          range.setStartAfter(br);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        var range = document.selection.createRange();
        range.pasteHTML("<br>");
        range.moveEnd("character", 1);
        range.moveStart("character", 1);
        range.collapse(false);
      }
    },

    /**
     * 获取/设置输入框中文字
     * @param text {String} 可选，设置的文字
     * @returns 内容文字
     */
    val: function(text) {
      if (text) {
        this.view.$box.text(text);
      } else {
        var ret, contents;
        if (_isFirefox) {
          ret = "";
          contents = this.view.$box.contents();
          for (var i = 0, len = contents.length; i < len - 1; i += 1) {
            if (contents[i].nodeType === 1 && contents[1].tagName === "INPUT") {
              ret += contents[i].value;
            } else {
              ret += (contents[i].textContent || "");
            }
          }
        } else {
          ret = this.view.$box.text();
        }
        return ret;
      }
    },

    /**
     * 获取输入框中所有@对象的id列表
     * @returns {Array<String>} ID列表
     */
    ids: function() {
      var at = [];
      this.view.$box.find(".at").each(function(){
        at.push($(this).data('id'));
      });
      return at;
    }
  };

  module.exports = AtSelection;
});
