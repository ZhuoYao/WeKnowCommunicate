//index.js
//获取应用实例
var app = getApp();
var Loger = require("../../utils/Loger.js");
Page({
  data: {
    motto: '最新收到的飞鸽：',
    userInfo: {},
    nums: [],
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url:"../friend/friend"
    })
  },
  onLoad: function () {
    var that = this
    that.setData({
      nums: [15, 23, 77, 64]
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo,
      })
    })
  },
  onShow: function(){
    app.globalData.userInfo = "wxopen.club";
  }
})
