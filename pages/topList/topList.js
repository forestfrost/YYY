// pages/topList/topList.js
import { axios} from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topList: [], //榜单列表
  },
  getTopList:async function () {
    axios("get","/toplist",null).then(data=>{
      var results=[]
      for(let i =0;i<data.list.length;i++){
       axios('get',`/playlist/detail`,{id:data.list[i].id}).then(res=>{
        results.push({id:data.list[i].id,name:data.list[i].name,list:res.playlist.tracks.slice(0,3),coverImgUrl:data.list[i].coverImgUrl});
        this.setData({topList:results})
       })
      }
     this.setData({topList:results});
    })
  },
  enterThisPlayList:function(event){
    wx.navigateTo({
      url: `/pages/playList/playList?id=${event.currentTarget.dataset.id}`,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    wx.showLoading({
      title: '加载中...',
    })
   await this.getTopList();
    wx.hideLoading({
      success: (res) => {},
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