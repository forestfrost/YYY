/**
 * 登录流程
 * 1，收集表单项数据
 * 2，前端验证
 *  用户信息是否合法 ： 手机号，密码是否合法，不通过就提示用户错误，不发送请求；否则发送请求给服务端
 * 3，后端验证
 *  1）验证用户是否存在
 *  2）用户不存在返回，告知前端用户不存在
 *  3）用户存在，验证密码是否匹配 ： 不正确返回给前端，告知密码不正确 ； 正确则携带相关账号信息返回给前端，
 */
import {
  axios
} from '../../utils/request'
Page({
  data: {
    phone: "",
    password: "",
    user: {}
  },
  login: async function () {
    var reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
    //var patrn=/^(\w){6,20}$/;  
    if (this.data.phone.length !== 11 || !reg_tel.test(this.data.phone)) {
      wx.showToast({
        title: '手机号不正确',
        icon: "error"
      })
      return;
    } else if (this.data.password.length <= 0) {
      wx.showToast({
        title: '密码验证失败',
        icon: "error"
      })
      return;
    }
    wx.showLoading({
      title: '正在登录中',
    })
    let res = await axios("get", "/login/cellphone", {
      phone: this.data.phone,
      password: this.data.password
    });
    wx.hideLoading();
    if (res.code == 200) {
      wx.showToast({
        title: '登录成功！',
      })
      wx.setStorageSync('cookie', res.cookie)
      wx.setStorageSync(
        "userInfo",
        res.profile
      )
      wx.reLaunch({
        url: '/pages/personal/personal',
      })
    } else if (res.code == 400) {
      wx.showToast({
        title: '手机号不存在',
      })
    } else if (res.code === 502) {
      wx.showToast({
        title: '密码错误',
      })
    } else {
      wx.showToast({
        title: '网络出错',
      })
    }
  },
  handleInput: function (event) {
    //console.log(event);
    let type = event.target.id;
    this.setData({
      [type]: event.detail.value
    })
  },
  onLoad: function (options) {

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