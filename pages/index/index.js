// pages/index/index.js
import {axios} from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
   banners:[],//轮播图
   recommendList:[],//推荐歌单
   topList:[],//排行榜
   
  },
  playThisSong:function(event){
    // console.log(event.currentTarget)
    let topList = event.currentTarget.dataset.songlist;
     wx.navigateTo({
       url: '/pages/songDetail/songDetail',
       success:function(res){
         res.eventChannel.emit("songDetailInfo",{info:event.currentTarget.dataset.info,songList:topList})
       }
     })
   },
  handleToRecommendSong:function(){
    if(!wx.getStorageSync('cookie')){
      wx.showToast({
        title: '请先登录',
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }, 500);
      return ;
    }
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  axios("get","/banner",{type:2}).then(data=>{
     this.setData({
       banners:data.banners
     })
   }).catch(e=>[
     console.log(e)
   ])
   axios("get","/personalized",{limit:10}).then(data=>{
     this.setData({
       recommendList:data.result
     })
   }).catch(e=>[
     console.log(e)
   ])
   axios("get","/toplist",null).then(data=>{
     var results=[]
     for(let i =0;i<5;i++){
      axios('get',`/playlist/detail`,{id:data.list[i].id}).then(res=>{
       // console.log(res.playlist.tracks.slice(0,3))
       results.push({id:data.list[i].id,name:data.list[i].name,list:res.playlist.tracks.slice(0,3)});
       this.setData({topList:results})
      })
     }
    this.setData({topList:results});
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