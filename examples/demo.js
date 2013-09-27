define(function(require, exports, module) {
  var $ = require('$');
  var AtSelection = require('../src/At-selection');

  // 创建输入框对象
  var atSelection = new AtSelection({
    textbox: '#J_TextBox', // 输入框选择器
    queryFriendsUrl: './mock/query_friends.json?q=', // 提示好友查询地址
    maxSize: 20, // 搜索query的最大长度,
    show: 5, //提示选择最大的数量
    template: require('./tpl')
  });


  $('#J_Button').on('click', function(){
    $('#J_Content').text(atSelection.val());
    $('#J_Ids').text(atSelection.ids());
  });

});
