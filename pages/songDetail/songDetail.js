
import {
  axios
} from '../../utils/request'
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    isPlay: false,
    songDetail: null, //歌曲详情
    song: null, //歌曲的url相关信息
    songList: [], //歌曲列表
    playStatus: 0, //当前播放方式 ：0，列表循环 1，随机播放 2，单曲循环
    totalTime: null, //当前歌曲的总时长
    currentTime: {
      minutes: 0,
      seconds: 0
    }, //当前歌曲已经播放的时长(min:sec)
    distance: 0, //进度条的长度 与小球与左侧的距离
    canMove:false,//进度条的小球是否可滑动的标识，
  },
  // 时间换算工具类
  totalTimeToRealTime: function (time) {
    let res = parseInt(time );
    let minutes = parseInt(res / 60);
    let seconds = res - minutes * 60;
    return {
      minutes,
      seconds
    }
  },
  playSong: async function () {
    // 播放时动态修改标题
    wx.setNavigationBarTitle({
      title: this.data.songDetail.name,
    })
    // 创建控制可在后台播放的音乐的管理者
    let audioManager = wx.getBackgroundAudioManager();
    // 播放音乐未初始化时获取相应的音乐
    if (!this.data.song) {
      try {
        let check = await axios("get", "/check/music", {
          id: this.data.songDetail.id
        });
        //console.log(check)
        if (!check.success) {
          wx.showToast({
            title: '暂时没有版权',
          })
          // 跳转到下一首
         setTimeout(() => {
          this.getNextSong("next");
          this.playSong();
         }, 600);
          return;
        }
      } catch (e) {
        // console.log(e)
      }
      try {
        let song = await axios("get", "/song/url", {
          id: this.data.songDetail.id
        })
        this.setData({
          song: song.data
        })
        //  必须添加音乐标题！！！
        audioManager.title = this.data.songDetail.name;
        //  添加音乐连接,添加后会自动播放
        audioManager.src = song.data[0].url;
        appInstance.globalData.songIdPlaying = song.data[0].id;
      } catch (e) {
        console.log(e)
      }
    }
    // 音乐播放时点击按钮，暂停播放
    if (!this.data.isPlay) {
    //  console.log("111")
      audioManager.play();
      appInstance.globalData.isMusicPlay = true;
    } else {
      //console.log("222")
      audioManager.pause();
      appInstance.globalData.isMusicPlay = false;
    }

  },
  //根据type确定下一首歌曲的详情
  getNextSong: function (type) {
    let audioManager = wx.getBackgroundAudioManager();
    let songList = this.data.songList;
    let currentIndex = songList.findIndex(item =>
      item.id === this.data.songDetail.id
    )
    // 上一首
    if (type === "prev") {
      currentIndex = (currentIndex - 1 + songList.length) % songList.length;
      // console.log(currentIndex)
    }
    // 下一首
    else if (type === "next") {
      currentIndex = (currentIndex + 1) % songList.length;
    }
    // 随机播放
    else {
      currentIndex = (currentIndex + parseInt(Math.random() * songList.length)) % songList.length
    }
    audioManager.stop();
    let realTime;
    if(audioManager.duration)
     realTime = this.totalTimeToRealTime(audioManager.duration)
    else{
      realTime = this.totalTimeToRealTime(0);
    }
    this.setData({
      songDetail: songList[currentIndex],
      totalTime: realTime,
      song: null,
    })
  },
  // 切换歌曲的回调函数
  handleSwitch: function (event) {
    let type = event.currentTarget.id;
    this.getNextSong(type);
    // 歌曲详情已经修改，需要触发播放事件才能播放
    this.playSong()
  },
  // 展示遮罩层
  showSongList: function () {
    this.setData({
      show: !this.data.show
    })
  },
  // 在page-Container显示前，主动触发一次滚动事件，使得播放列表滚动到相应歌曲的位置，提高用户体验
  onBeforeEnter: function () {
    this.setData({
      songDetail: this.data.songDetail,
      // todo
    })
  },
  // 在播放列表选择某一首歌曲进行播放
  playThisSongInList: function (event) {
    let songDetail = event.currentTarget.dataset.info;
    let realTime = this.totalTimeToRealTime(songDetail.dt)
    this.setData({
      songDetail,
      totalTime: realTime,
      song: null,
    })
    this.playSong();
  },
  // 关闭遮蔽层
  closePageContainer: function () {
    this.setData({
      show: false,
    })
  },
  // 修改播放方式
  changePlayStatus: function () {
    let playStatus = (this.data.playStatus + 1) % 3;
    this.setData({
      playStatus,
    })
    appInstance.globalData.playStatus = playStatus;
  },
  // 触摸小球的回调事件，将小球放大两倍，并放开小球的触摸滑动权限，而且要暂停音乐播放进度的监听
  handleTouchStart:function(){
    var audioManager = wx.getBackgroundAudioManager();
    audioManager.onTimeUpdate(()=>{});
    this.setData({
      canMove:true,
    })
  },
  // // 小球的触摸滑动事件，根据手指的位置设置小球的位置，
  // handleTouchMove:throttle(function(event){
  //   // 利用单例模式获取触摸小球时的distance
  //   // if(!this.distance){
  //   //   this.distance = this.data.distance;
  //   // }
  //   if(this.data.canMove){
  // //    console.log(event);
  //     this.setData({
  //       distance:event.changedTouches[0].clientX
  //     })
  //   }
  // },50),
  // //手指离开屏幕，根据小球的位置，计算应该跳转到的相应时间点，播放音乐，并继续音乐播放进度的监听
  handleTouchEnd:function(event){
    event=event.event;
    var audioManager = wx.getBackgroundAudioManager();
    let distance = event.currentTarget.offsetLeft;
    let width =0;
    let time
     wx.createSelectorQuery().select('.barControl').boundingClientRect().exec(res=>{
      width=res[0].width;
      time= distance/width*audioManager.duration;
       audioManager.seek(time)
    })
   
    audioManager.onTimeUpdate(()=>{
      this.setData({
        totalTime:this.totalTimeToRealTime(audioManager.duration),
        currentTime: this.totalTimeToRealTime(audioManager.currentTime ),
        distance: audioManager.currentTime / audioManager.duration * 450,
      })
    })
    this.setData({
      canMove:false,
    })

  },
  // 点击进度条进行时间点跳转
  handleTap:function(event){
    //console.log(event)
    var audioManager = wx.getBackgroundAudioManager();
    let distance = event.detail.x-event.currentTarget.offsetLeft;
    let width =0;
    let time
   var query=  wx.createSelectorQuery()
   query.select('.barControl').boundingClientRect();
   query.select("#leftTime").boundingClientRect();
   query.exec(res=>{
      width=res[0].width;
      time= (distance-res[1].width)/width*audioManager.duration;
       audioManager.seek(time)
    })
  },
  //收藏当前播放列表的所有歌曲
  // collectAllSong:function(){

  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取背景音乐控制器
    let audioManager = wx.getBackgroundAudioManager();
    let width=0;
    // 重新进入页面时,得到当前播放的时长,并设置进度条
    var query=  wx.createSelectorQuery()
    query.select('.barControl').boundingClientRect();
    query.exec(res=>{
      width = res[0].width;
    })
    if(audioManager.currentTime)
    this.setData({
      currentTime: this.totalTimeToRealTime(audioManager.currentTime ),
      distance: audioManager.currentTime / audioManager.duration * width,
    })
    else{
      this.setData({
        currentTime: this.totalTimeToRealTime(0),
        distance: 0,
      })
    }
    // 获取父页面传来的需要播放的歌曲信息与播放列表
    const eventChannel = this.getOpenerEventChannel()
    var flag = false;
    eventChannel.on('songDetailInfo', (data) => {
      wx.setNavigationBarTitle({
        title: data.info.name
      });
      let realTime;
      if(audioManager.duration)
       realTime = this.totalTimeToRealTime(audioManager.duration)
      else{
        realTime = this.totalTimeToRealTime(0);
      }
      this.setData({
        songDetail: data.info,
        totalTime: realTime,
        songList: data.songList
      })
      if (data.info.id == appInstance.globalData.songIdPlaying) {
        // 当单曲循环或者该歌曲未播放完毕时
        this.setData({
          isPlay: appInstance.globalData.isMusicPlay,
        })
        flag = true;
      }
      if (!flag) {
        this.playSong();
      }
    })
    //  设置背景音乐控制器的播放、暂停、停止回调函数，并且根据当前播放的音乐id与 当前页显示的音乐id是否相同，判断播放按钮的类型

    audioManager.onPause(() => {
      if (this.data.songDetail.id == appInstance.globalData.songIdPlaying) {
        this.setData({
          isPlay: false,
        })
      }
      appInstance.globalData.isMusicPlay = false;
    })
    audioManager.onPlay(() => {
      if (this.data.songDetail.id == appInstance.globalData.songIdPlaying)
        this.setData({
          isPlay: true,
        })
      appInstance.globalData.isMusicPlay = true;
    })
    // 在音乐正常播放完毕时，根据当前播放类型进行下一首歌曲的确定，并进行播放。
    audioManager.onEnded(() => {
      if (this.data.songDetail.id == appInstance.globalData.songIdPlaying)
        this.setData({
          isPlay: false,
        })
      appInstance.globalData.isMusicPlay = false;
      // 当当前歌曲播放完毕时，按照播放类型进行切换歌曲
      let playStatue = this.data.playStatus;
      switch (playStatue) {
        // 列表循环
        case 0:
          this.getNextSong("next");
          break;
        case 1:
          this.getNextSong("random");
          break;
        case 2:
          audioManager.play();
         return;
      }
      this.playSong();
    })
    audioManager.onStop(() => {
      this.setData({
        isPlay: false,
      })
      appInstance.globalData.isMusicPlay = false;
    })
    audioManager.onTimeUpdate(() => {
      // console.log(audioManager.currentTime);

      this.setData({
        totalTime:this.totalTimeToRealTime(audioManager.duration),
        currentTime: this.totalTimeToRealTime(audioManager.currentTime ),
        distance: audioManager.currentTime / audioManager.duration * 450,
      })
    })
    audioManager.onWaiting(()=>{
      wx.showLoading({
        title: '加载中...',
      })
    })
    audioManager.onCanplay(()=>{
      wx.hideLoading({
        success: (res) => {},
      })
    })
    // 获取当前播放方式
    if (appInstance.globalData.playStatus !== -1) {
      this.setData({
        playStatus: appInstance.globalData.playStatus
      })
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