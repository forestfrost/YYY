笔记
# 小程序的自定义组件
* 新建组件 右键->new Component
* 书写组件结构与样式
* 在需要的页面中进行注册（在json中进行注册）在wxml中使用

# 存储
* ！！！！ 单个key最大存储1MB 所有storage最多存储10MB！！！
* 设置
* * 这是异步方法，有回调
wx.setStorage({
  key:"key",//键，唯一存在，多次赋值会覆盖
  data:"value",//值
  success:()=>{},//成功时调用的回调
  fail:()=>{},//失败时调用的回调
  coplete:()=>{},//无论成败，都会运行的回调。
})
* * 同步方法，无需回调
wx.setStorageSync(
 "key",
 "value"
)
* 取值
  * * 同步
try{
  let value =wx.getStorageSync("key")
  if(value){
    //读取成功的操作
  }
}
catch(e){
  //读取失败的操作
}
* * 异步
wx.getStorage({
  key:"key",
  success(res){
    console.log(res.data)
  }
})
* 移除某个键的值
wx.removeStorage({
  key: 'key',
  success (res) {
    console.log(res)
  }
})
try {
  wx.removeStorageSync('key')
} catch (e) {
  // Do something when catch error
}

* 清空所有缓存
wx.clearStorage()
try {
  wx.clearStorageSync()
} catch(e) {
  // Do something when catch error
}


# 路由
* navigateTo({
  url:"url",
  events:{
    <!-- 从被打开的页面传来的数据 -->
    name:function(data){
      console.log(data);
    },
    name2:function(data){
      console.log(data)
    }
  },
  success:function(res){
    <!--使用到了订阅-发布者模式 -->
    <!-- 向被打开的页面发送数据 -->
    res.eventChannel.emit("name",{})
  }
})
//test.js
Page({
  onLoad: function(option){
    console.log(option.query)
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('acceptDataFromOpenedPage', {data: 'test'});
    eventChannel.emit('someEvent', {data: 'test'});
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      console.log(data)
    })
  }
})

# scrollView
* 事件 
* * 下拉事件  需要配合 refresher-triggered属性来关闭
   bindrefresherrefresh="name"
* * 上拉触底事件
bindscrolltolower= "name"

# video
* 事件
* * 视频结束时触发
bindended
* * 视频进度变化时触发，event.detail = {currentTime, duration} 。触发频率 250ms 一次

* 视频实例
let VideoContext=wx.createVideoContext("id")//id为视频标签的id