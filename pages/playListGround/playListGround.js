// pages/playListGround/playListGround.js
import {
  axios
} from '../../utils/request';
import {debounce} from '../../utils/debounce'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navId: Number, //当前歌单标签的id
    navName: "", //当前歌单标签的名字
    categoryList: [], //歌单标签列表
    playList: [], //当前标签下的歌单
    offset: 0, //当前标签对应的歌单的分页页码
  },

  // 获取歌单标签
  getListCategory: async function () {
    try {
      let categoryList = await axios("get", "/playlist/hot", null)
      categoryList = categoryList.tags;

      this.setData({
        categoryList,
        navId: categoryList[0].id,
        navName: categoryList[0].name
      })
    } catch (e) {
      console.log(e)
    }
  },
  // 获取当前标签下个歌单
  getPlayList: async function () {
    try {
      let playList = await axios('get', '/top/playlist', {
        limit: 30,
        cat: this.data.navName
      });
      playList.playlists.forEach(item => {
        item.playCount = item.playCount > 10000 ? parseInt(item.playCount / 10000) + "万" : playCount
      })
      this.setData({
        playList: playList
      })
    } catch (e) {
      console.log(e);
    }
  },
  // 切换导航
  changeNav: async function (event) {
    wx.showLoading({
      title: '加载中...',
    })
    
    let navId = event.currentTarget.id;
    let navName = event.currentTarget.dataset.name;
    this.setData({
      navId: navId * 1,
      navName,
      playList: [],
    })
    // 获取歌单
   await this.getPlayList();
    wx.hideLoading({
      success: (res) => {},
    })
  },
  // 获取更多歌单
  loadMore:async function(){
    if(!this.data.playList.more) return;
    let moreList = await axios("get","/top/playlist",{
      limit: 30,
      cat: this.data.navName,
      offset:this.data.offset+1,
    });
    let playList =this.data.playList;
    playList.more = moreList.more;
    playList.playlists = playList.playlists.concat(moreList.playlists)
    this.setData({
      offset:this.data.offset+1,
      playList,
    })
  },
  handleLoadMore:function(){
    debounce(this.loadMore,400)()
  },
  // 进入该歌单查看
  enterThisPlayList:function(event){
    wx.navigateTo({
      url: `/pages/playList/playList?id=${event.currentTarget.dataset.id}`,
    })
  },
  onLoad: async function (options) {
    await this.getListCategory();
    await this.getPlayList();
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