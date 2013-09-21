define(function(require, exports, module) {
  var E = require('./mods/util/event');

  var PublishBox = require('./mods/publishbox/index');

  var publishBox = new PublishBox({
    textbox: '#J_TextBox',
    queryFriendsUrl: './mock/query_friends.json?q=',
    maxSize: 20
  });

  E.on(document.getElementById('J_Button'), 'click', function() {
    document.getElementById('J_Content').innerHTML = publishBox.val();
    document.getElementById('J_Ids').innerHTML = publishBox.ids();
  });

});
