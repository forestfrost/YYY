// pages/recommendSong/recommendSong.js
import {axios} from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    month:"",
    day:"",
    recommendSongList:[],
  },
  playThisSong:function(event){
   // console.log(event.currentTarget)
   var that= this;
    wx.navigateTo({
      url: '/pages/songDetail/songDetail',
      success:function(res){
        res.eventChannel.emit("songDetailInfo",{info:event.currentTarget.dataset.info,songList:that.data.recommendSongList.data.dailySongs})
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    var date= new Date();
    let recommendSongList= await axios("get","/recommend/songs",null,{cookie:wx.getStorageSync('cookie')})
    this.setData({
      month:date.getMonth()+1,
      day:date.getDate(),
      recommendSongList
    })
    wx.hideLoading()
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