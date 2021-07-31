// components/PlayCom/PlayCom.js
import {
  axios
} from '../../utils/request'
const appInstance = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    song: null,
    show: false, //是否展示遮罩层
    isPlay: Boolean,
    songList: [],
    songDetail: {},
    audioManager: wx.getBackgroundAudioManager(),
    currentIndex: -1,
    playStatus: 0, //当前播放方式 ：0，列表循环 1，随机播放 2，单曲循环
  },

  /**
   * 组件的方法列表
   */
  methods: {
    playSong: async function (flag = false,listFlag = false) {
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
            if(!listFlag){
              let currentIndex= this.getCurrentIndex();
              currentIndex = (currentIndex + 1) % this.data.songList.length;
              this.setData({
                currentIndex,
              })
            }
            return;
          }
        } catch (e) {}
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
      if(flag) return;
      if (!this.data.isPlay) {
        audioManager.play();
        appInstance.globalData.isMusicPlay = true;
      } else {
        audioManager.pause();
        appInstance.globalData.isMusicPlay = false;
      }

    },
    //根据type确定下一首歌曲的详情
    getNextSong: function (type) {
      let audioManager = this.data.audioManager;
      let songList = this.data.songList;
      let currentIndex = this.data.currentIndex
      // 上一首
      if (type === "prev") {
        currentIndex = (currentIndex - 1 + songList.length) % songList.length;
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
      this.setData({
        songDetail: songList[currentIndex],
        song: null,
        currentIndex,
      })
      appInstance.globalData.songDetail = songList[currentIndex];
    },
    manageSongPlay: function () {
      if (this.data.isPlay) {
        this.data.audioManager.pause();
        this.setData({
          isPlay: false,
        })
      } else {
        this.data.audioManager.play();
        this.setData({
          isPlay: true,
        })
      }
    },
    showSongList: function () {
      this.setData({
        show: !this.data.show,
        isPlay: this.data.isPlay,
        songList: appInstance.globalData.songList,
        songDetail: appInstance.globalData.songDetail,
      })
    },
    closePageContainer: function () {
      this.setData({
        show: false,
      })
    },
    onBeforeEnter: function () {
      this.setData({
        songDetail: this.data.songDetail,
        // todo
      })
    },
    playThisSongInList: function (event) {
      let songDetail = event.currentTarget.dataset.info;
      this.setData({
        songDetail,
        song: null,
      })
      appInstance.globalData.songDetail = songDetail;
      let currentIndex = this.getCurrentIndex();
      this.setData({
        currentIndex,
      })
      this.playSong(false,true);
    },
    enterTheSongDetail: function () {
      wx.navigateTo({
        url: '/pages/songDetail/songDetail',
        events:{
          getSong:(res)=>{
            this.setData({
              song:res
            })
          }
        },
        success: (res) => {
          res.eventChannel.emit("songDetailInfo", {
            info: this.data.songDetail,
            songList: this.data.songList,
            song:this.data.song,
          })
        }
      })
    },
    changePlayStatus: function () {
      let playStatus = (this.data.playStatus + 1) % 3;
      this.setData({
        playStatus,
      })
      appInstance.globalData.playStatus = playStatus;
    },
    setAudioManager: function () {
      this.data.audioManager.onPlay(() => {

        this.setData({
          isPlay: true,
        })
        appInstance.globalData.isMusicPlay = true;
      })
      this.data.audioManager.onPause(() => {

        this.setData({
          isPlay: false,
        })
        appInstance.globalData.isMusicPlay = false;
      })
      this.data.audioManager.onEnded(() => {
        this.setData({
          isPlay: false,
        });
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
            this.data.audioManager.play();
            return;
        }
        this.playSong();
      })
    },
    getCurrentIndex: function () {
      let currentIndex = this.data.songList.findIndex(item => {
        return item.id === this.data.songDetail.id
      })
      return currentIndex;
    },
    changePlayingSong: function (event) {
      // console.log(event);
      // 获取用户想要播放的歌曲在列表的位置 
      let currentIndex = event.detail.current;
      this.setData({
        currentIndex,
      })
      // 根据位置在播放列表中找到这首歌的详情，修改data下的songDetail与全局songDetail 并触发播放行为
      let songDetail = this.data.songList[currentIndex];
      this.setData({
        songDetail,
        song: null,
      })
      appInstance.globalData.songDetail = songDetail;
      appInstance.globalData.songIdPlaying=songDetail.id;
      this.playSong(true);
    },
  },
  lifetimes: {
    attached() {
      
      this.setData({
        isPlay: appInstance.globalData.isMusicPlay,
        songList: appInstance.globalData.songList,
        songDetail: appInstance.globalData.songDetail,
        playStatus:appInstance.globalData.playStatus
      })
      this.setAudioManager();
      let currentIndex = this.getCurrentIndex();
      this.setData({
        currentIndex,
      })
    },
  },
  pageLifetimes: {
    show: function () {

      this.setData({
        songList: appInstance.globalData.songList,
        songDetail: appInstance.globalData.songDetail,
        isPlay: appInstance.globalData.isMusicPlay,
        playStatus:appInstance.globalData.playStatus
      })
      let currentIndex = this.getCurrentIndex();
      this.setData({
        currentIndex,
      })
      this.setAudioManager();
      // 页面被展示
    },
    hide: function () {
      this.setData({
        show: false,
      })

      // 页面被隐藏
    },
    resize: function (size) {
      // 页面尺寸变化
    }
  }
})