import {
  axios
} from "../../utils/request";


let startY = 0; //手指起始坐标y
let moveY = 0; //手指移动中的坐标y
let moveDistance = 0; //手指移动的距离
Page({
  data: {
    coverTransform: "translateY(0rpx)",
    coveTransition: "0",
    userInfo: null, //登录用户
    recentPlayList: [], //播放记录
  },
  toLogin: function () {
    if (this.data.userInfo) return;
    // console.log("to login.wxml")
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  handleTouchStart: function (event) {
    // 获得手指起始坐标
    this.setData({
      coveTransition: "0"
    })
    startY = event.touches[0].clientY;
  },
  handleTouchMove: function (event) {
    //获得手指移动中的y坐标
    moveY = event.touches[0].clientY;
    // 获得移动距离
    moveDistance = moveY - startY;
    if (moveDistance >= 80 || moveDistance <= 0) return;
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd: function () {
    // 重置三个变量
    [moveY, startY, moveDistance] = [0, 0, 0];
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`,
      coveTransition: "1.5s"
    })


  },
  onLoad: function (options) {
    try {
      var userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({
          userInfo
        })
       this.getUserRecentPlayList(this.data.userInfo.userId)
      }
    } catch (e) {
      console.log(e)
    }

  },
  async getUserRecentPlayList(userId){
    let recentPlayListData = await axios('get','/user/record', {uid: userId, type: 0});
    let index = 0;
    let recentPlayList = recentPlayListData.allData.splice(0, 10).map(item => {
      item.id = index++;
      return item;
    })
    this.setData({
      recentPlayList
    })
  },
  playThisSong:function(event){
    // console.log(event.currentTarget)
    let recentList=this.data.recentPlayList;
    recentList= recentList.map(item=>item.song)
     wx.navigateTo({
       url: '/pages/songDetail/songDetail',
       success:(res)=>{
         res.eventChannel.emit("songDetailInfo",{info:event.currentTarget.dataset.info.song,songList:recentList})
       }
     })
   },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})