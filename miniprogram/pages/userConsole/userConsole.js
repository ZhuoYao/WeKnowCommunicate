// pages/userConsole/userConsole.js
Page({

  data: {
    openid: '',
    nums: [],
  },

  onLoad: function (options) {
    this.setData({
      nums: [4, 5, 6, 7],
      openid: getApp().globalData.openid
    })
  }
})