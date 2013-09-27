# AtSelection

---

// another person selection componment

Support IE>=8, Firefox, Chrome, Safari

---

## 使用说明

``` js
var AtSelection = require('../src/At-selection');
 
  // 创建输入框对象
var atSelection = new AtSelection({
    textbox: '#J_TextBox', // 输入框选择器
    queryFriendsUrl: './mock/query_friends.json?q=', // 提示好友查询地址
    maxSize: 20, // 搜索query的最大长度,
    show: 5, //提示选择最大的数量
    template: require('./tpl')
});
```

## API
val
获取/设置输入框中文字
``` js
//getter
atSelection.val();
//setter
atSelection.val('some text');
```

ids
获取输入框中所有@对象的id列表
``` js
atSelection.ids();
```