// pages/video/video.js
import {
  axios
} from '../../utils/request'
// import {getCookie} from '../../utils/cookie'
import {debounce} from '../../utils/debounce'
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appInstance:appInstance,
    videoGroupList: [], //视频标签列表
    navId: "", //导航的标识
    videoList: [], //某个id对应的视频列表,需要登录才能发起请求获得，需要使用到cookie
    videoId: "", //正在播放的视频的id标识
    times: [],//当前播放过的视频与其对应的播放时间
    currentTime:0,//中间值，通过它来设置点击的视频的初始播放时间点
    freshFlag:"false",//下拉刷新的标识，false为关闭，true为打开
    offset:0,//当前标签对应的视频的分页页码
  },
  // 点击导航时的回调
  changeNav: async function (event) {
    wx.showLoading({
      title: '加载中...',
    })
    let navId = event.target.id;
    this.setData({
      navId: navId * 1,
      videoList: []
    })

    await this.getVideoList(navId);
    wx.hideLoading({
      success: (res) => {},
    })
  },
  // 获取导航标签列表数据
  async getVideoGroupListData() {
    let videoGroupListData = await axios("get", "/video/group/list", null);
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id
    })
  },
  async getVideoList(id) {
    let videoList = await axios("get", `/video/group`, {
      id,
      offset:this.data.offset
    }, {
      cookie: wx.getStorageSync('cookie')
    })
    this.setData({
      offset:this.data.offset+1
    })
    let index = 0;
    videoList = videoList.datas.map(item => {
      item.id = index++;
      return item;
    })

    for (let i = 0; i < videoList.length; i++) {
      axios("get", "/video/url", {
        id: videoList[i].data.vid
      }).then(url => {
        videoList[i].url = url.urls[0].url
        this.setData({
          videoList
        })
      })
    }

  },
  getVideoCurrentTime: function (e) {
    var currentTime = parseInt(e.detail.currentTime);
    var id = e.target.id;
    var times = this.data.times;
    var flag = true;
    // 当该视频播放过
    for (let i = 0; i < times.length; i++) {
      if (times[i].id == id) {
        flag = false;
        times[i].currentTime = currentTime;
        break;
      }
    }
    if (flag) { //此时该视频没有被播放过
      times.push({
        id,
        currentTime
      });
    }
    this.setData({
      times,
    })
  },
  videoEnd:function(e) {
   // console.log(e)
    var times =this.data.times;
    var id = e.target.id
    times = times.filter(item=>item.id!==id);
    this.setData({
      times
    })
  },
  //点击播放或继续播放时触发该方法
  handlePlay: function (e) {
    // 思路：若存在上一个播放的视频则找到上一个正在播放的视频，将其暂停播放，之后再播放本视频，否则直接播放本视频
    // 利用单例模式 ，

    let vid = e.target.id;
    var item= this.data.times.filter(item=>item.id===vid)
    if(item.length){
      this.setData({
        videoId: vid,
        currentTime:item[0].currentTime
      })
    }
    else{
      this.setData({
        videoId: vid,
      })
    }
   // console.log(item,item.currentTime,typeof item.currentTime)
    //this.vid !==vid && this.videoContext && this.videoContext.stop();
    //this.vid =vid;
    
  //   this.videoContext=wx.createVideoContext(vid)
  //  var item= this.data.times.filter(item=>item.id===vid)
  //   this.videoContext.seek(item.currentTime);
  },
  handleFresh:async function(e){
    this.setData({
      offset:0,
      freshFlag:true
    })
  await this.getVideoList(this.data.navId);
   this.setData({
     offset:1,
     freshFlag:false
   })
  },
  handleLoadMore:function(){
    debounce(this.loadMore,400)();
  },
  loadMore:async function(){
    let videoList = await axios("get", `/video/group`, {
      id:this.data.navId,
      offset:this.data.offset
    }, {
      cookie: wx.getStorageSync('cookie')
    })
    this.setData({
      offset:this.data.offset+1
    })
    let index = this.data.videoList.length;
    videoList = videoList.datas.map(item => {
      item.id = index++;
      return item;
    })
    let originVideoList = this.data.videoList;
    for (let i = 0; i < videoList.length; i++) {
      axios("get", "/video/url", {
        id: videoList[i].data.vid
      }).then(url => {
        videoList[i].url = url.urls[0].url
        originVideoList.push(videoList[i])
        this.setData({
          videoList:originVideoList
        })
      })
    }
  },
  // 进入搜索页
  search:function(){
    wx.navigateTo({
      url: '/pages/search/search',
      success:function(){
        
      }
    })
  },
  /** 生命周期函数--监听页面加载*/
  onLoad: async function (options) {
    if (!wx.getStorageSync('userInfo')) {
      wx.showToast({
        title: '请先登录',
      })
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/login/login',
        })
      }, 500)
      return;
    }
    wx.showLoading({
      title: '加载中...',
    })
    await this.getVideoGroupListData();
   
    this.getVideoList(this.data.navId);
    wx.hideLoading()
  },
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      appInstance,
    })
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
    console.log("下拉刷新")
    wx.stopPullDownRefresh({
      success: (res) => {},
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    console.log(event.from)
    // from 分享事件来自的位置 button || menu
    // 
    if(event.from =="button")
    return {
      title:"button转发内容",
      paga:"/pages/video/video",
      imageUrl:"/static/images/logo.png"
    }
    else{
      return{
        title:"menu转发内容",
        paga:"/pages/video/video",
        imageUrl:"/static/images/logo.png"
      }
    }
  }
})