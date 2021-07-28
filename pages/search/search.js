// pages/search/search.js
import {
  axios
} from '../../utils/request';
import {
  debounce
} from '../../utils/debounce'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchDefault: {}, //搜索栏的默认搜索数据对象，showKeyword :展示的数据 ，realkeyword : 真实的搜索数据
    inputValue: "", //真实输入的搜索信息
    hotSearchList: [], //热搜榜数据
    searchResults: [], //搜索结果
    searchHistory: [], //搜索历史
  },
  // 输入搜索数据，进行搜索，使用防抖函数，减少请求次数
  handleInput: debounce(async function (event) {
    //  更新真实输入的数据
    this.setData({
      inputValue: event.detail.value.trim(),
    })
    try {
      if (event.detail.value.trim().length > 0) {
        let searchResults = await axios("get", '/search', {
          keywords: event.detail.value.trim(),
          limit: 10
        });
        this.setData({
          searchResults: searchResults.result.songs,
        })
        // todo 记录搜索历史
        this.addHistory(event.detail.value.trim())
      }
    } catch (e) {
      console.log(e)
    }
  }, 500),
  clearInput: function () {
    this.setData({
      inputValue: "",
    })
  },
  // 点击热搜榜的项目，进行搜索
  searchThisWord: async function (event) {
    //console.log(event)
    this.setData({
      inputValue: event.currentTarget.dataset.keywords
    })
    try {
      let searchResults = await axios("get", '/search', {
        keywords: event.currentTarget.dataset.keywords,
        limit: 10
      });
      this.setData({
        searchResults: searchResults.result.songs,
      })
      this.addHistory(event.currentTarget.dataset.keywords);
    } catch (e) {
      console.log(e)
    }
  },
  // 点击搜索结果列表的某一首歌曲，进入歌曲播放页播放
  playThisSong: function (event) {
    // console.log(event.currentTarget)
    var that = this;
    wx.navigateTo({
      url: '/pages/songDetail/songDetail',
      success: function (res) {
        res.eventChannel.emit("songDetailInfo", {
          info: event.currentTarget.dataset.info,
          songList: that.data.searchResults
        })
      }
    })
  },

  /**
   功能： 增加历史记录
   入口：string
   出口：undefined
   流程： 获取当前的历史记录，当参数不存在时，新增历史记录，并将历史记录在storage中
  */
  addHistory: function (newItem) {
    let searchHistory = this.data.searchHistory;
    if (!searchHistory.includes(newItem)) {
      searchHistory.push(newItem);
      wx.setStorageSync('history', searchHistory);
      this.setData({
        searchHistory,
      })
    }

  },
  //  删除历史记录
  deleteHistory: function () {
    wx.showModal({
      title: '删除历史记录',
      content: '是否删除记录？',
      success: (res)=> {
        if (res.confirm) {
          this.setData({
            searchHistory: [],
          })
          wx.removeStorage({
            key: 'history',
          })
        } 
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 获取storage中的历史记录
    let searchHistory;
    try {
      searchHistory =  wx.getStorageSync('history')
    } catch (e) {
    }
    this.setData({
      searchHistory:searchHistory?searchHistory:[],
    })
    try {
      let getSearchDefault = axios("get", "/search/default", null);
      let getHotSearchList = axios("get", '/search/hot/detail', null);
      let res = await Promise.all([getSearchDefault, getHotSearchList])
      this.setData({
        searchDefault: res[0].data,
        hotSearchList: res[1].data
      })
    } catch (e) {
      console.log(e)
    }
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