//index.js
const app = getApp()
const db = wx.cloud.database()
const user = db.collection('user')
var userid = ''
Page({
  //页面数据
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    nums: [],
    FirstTest:'',
  },
  //页面加载
  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    
    //获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
              })
            }
          })
        }
      }
    })
    this.setData({
      nums: [15, 23, 77, 65],
      FirstTest:true
    })
    //获取openID
    this.onGetOpenid()
    var that=this
    user.where({
      _openid: userid
    }).count().then(res => {
      if(res.total!=0){
        app.globalData.firstTest=true  
      }else{
        app.globalData.firstTest = false
      }
      that.setData({
        FirstTest: app.globalData.firstTest
      })
    })
  },
  onShow: function(){
    user.where({
      _openid: userid
    }).count().then(res => {
      console.log('这个用户有', res.total, '条上传记录')
      if (res.total != 0) {
        app.globalData.firstTest = true
        
      } else {
        app.globalData.firstTest = false
      }
      console.log(app.globalData.firstTest)
      this.setData({
        FirstTest: app.globalData.firstTest
      })
    })
  },
  //获取用户信息
  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  //获取用户识别码
  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        this.userid=app.globalData.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  //查看好友
  bindViewTap: function () {
    wx.navigateTo({
      url: "../userConsole/userConsole"
    })
  },
  //上传应用列表截图
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            db.collection('user').add({
              data: {
                count: 1
              },
              success: res => {
                // 在返回结果中会包含新创建的记录的 _id
                this.setData({
                  counterId: res._id,
                  count: 1
                })
                app.globalData.firstTest = true
                wx.showToast({
                  title: '新增记录成功',
                })
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
              },
              fail: err => {
                wx.showToast({
                  icon: 'none',
                  title: '新增记录失败'
                })
                console.error('[数据库] [新增记录] 失败：', err)
              }
            })
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  }
})
