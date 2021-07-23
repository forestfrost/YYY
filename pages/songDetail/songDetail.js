
import {axios} from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,
    songDetail: null,//歌曲详情
    song:null,//歌曲的url相关信息
  },
  playSong: async function () {
      // 创建控制可在后台播放的音乐的管理者
      let audioManager= wx.getBackgroundAudioManager();
      audioManager.onPause(()=>{
        this.setData({
          isPlay:false,
        })
      })
      audioManager.onPlay(()=>{
        this.setData({
          isPlay:true,
        })
      })
      audioManager.onStop(()=>{
        this.setData({
          isPlay:true,
        })
      })
    // 未播放时触发的逻辑
    if(!this.data.song){
      try{
        let check =await axios("get","/check/music",{id:this.data.songDetail.id});
       //console.log(check)
       if(!check.success){
         wx.showToast({
           title: '暂时没有版权',
         })
         return;
       }
      }catch(e){
       // console.log(e)
      }
      try{
        let song =await axios("get","/song/url",{id:this.data.songDetail.id})
        this.setData({
          song:song.data
        })
       //  必须添加音乐标题！！！
        audioManager.title=this.data.songDetail.name;
      //  添加音乐连接,添加后会自动播放
       audioManager.src=song.data[0].url;
      }catch(e){
        console.log(e)
      }
    }
    // 音乐播放时点击按钮，暂停播放
    if(!this.data.isPlay){
      audioManager.play();
    }
    else {
     audioManager.pause();
    }
    this.setData({
      isPlay: !this.data.isPlay
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('songDetailInfo', (data) => {
      // console.log(data)
      wx.setNavigationBarTitle({
        title: data.info.name
      });
      this.setData({
        songDetail: data.info
      })
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