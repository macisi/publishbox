define(function(require, exports, module) {

  var PublishBox = require('./mods/publishbox/index');

  var publishBox = new PublishBox({
    container: '#J_PublishBox',
    queryFriendsUrl: './mock/query_friends.json';
  });

});