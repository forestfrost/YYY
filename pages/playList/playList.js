// pages/playList/playList.js
import {axios} from  '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    playListInfo:{},//歌单信息
  },
  getPlayListInfo:async function(id){
    try{
      let playListInfo = await axios("get",'/playlist/detail',{id});

     // console.log(playListInfo)
     this.setData({
       playListInfo:playListInfo.playlist
     })
    }catch(e){
      console.log(e);
    }
  },
  playThisSong:function(event){
    var that= this;
    wx.navigateTo({
      url: '/pages/songDetail/songDetail',
      success:function(res){
        res.eventChannel.emit("songDetailInfo",{info:event.currentTarget.dataset.info,songList:that.data.playListInfo.tracks})
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
   await this.getPlayListInfo(options.id);
   wx.hideLoading();
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