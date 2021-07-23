import config from './config'
const axios = (method,url,paras,header)=>{
    // 小程序请求只允许发起https请求，且不会做url自动补全，无法使用ajax做请求，（xml对象不存在） 最大并发个数为10个，超过就等待。
    return new Promise((res,rej)=>{
      wx.request({
        url:config.mobileHost+url,
        method:method,
        data:paras,
        header,
        success:(data)=>{
          res(data.data)
        },
        fail:(err)=>{
          rej(err)
        }
      })
    })
}
export {
 axios,
}