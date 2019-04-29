const app = getApp()

Page({
    data: {
      bgmList:[],
      serverUrl:'',
      lastId:'',
      playFlag:true,
      videoParam:{}
    },
    
  onLoad: function (params) {
    console.log("跳转过来了");
    console.log(params);
    this.setData({
      videoParam:params
    })
    var me = this;
    // var user = app.userInfo;
    var user = app.getGlobalUserInfo();
    wx.showLoading({
      title: '请等待',
    })
    wx.request({
      method: 'POST',
      url: app.serverUrl + '/bgm/list',
      header: {
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function (res) {
        wx.hideLoading();
        var data = res.data;
        var status = data.status;
        if (status == 200) {
          var bgmList=data.data;
          me.setData({
            bgmList:bgmList,
            serverUrl:app.serverUrl
          })

        } else if (status == 502) {
          wx.showToast({
            title: data.msg,
            duration: 3000,
            icon: "none",
            success: function () {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      }

    })

  },
  playMusic:function(e){
    var me=this;
    var id=e.currentTarget.id;
    console.log(id);
  
    var lastId=me.data.lastId;
    console.log(lastId);
    
    if(lastId!=''){
      me.audioCtx = wx.createAudioContext(lastId);
      me.audioCtx.pause();
      me.audioCtx.seek(0);
    }
    me.audioCtx = wx.createAudioContext(id);
    me.audioCtx.play();
    me.setData({
      lastId:id
    })
  },
  upload:function(e){
    var me=this;
    var user=app.getGlobalUserInfo();
    var bgmId=e.detail.value.bgmId;
    var desc=e.detail.value.desc;
    var duration=me.data.videoParam.duration;
    var tmpHeight=me.data.videoParam.tmpHeight;
    var tmpWidth=me.data.videoParam.tmpWidth;
    var tmpVideoUrl=me.data.videoParam.tmpVideoUrl;
    var tmpCoverUrl=me.data.videoParam.tmpCoverUrl;
    
    //上传短视频
    wx.showLoading({
      title: '请等待',
      });
    wx.uploadFile({
      url: app.serverUrl + '/video/upload',
      filePath: tmpVideoUrl,
      header: {
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.userToken
      },
      formData:{
        userId:user.id,
        bgmId:bgmId,
        videoSeconds:duration,
        desc : desc,
        videoHeight : me.data.videoParam.tmpHeight,
        videoWidth : me.data.videoParam.tmpWidth,
      },
      name: 'file',
      success(res) {
        const data = JSON.parse(res.data);
        if (data.status == 200) {
          wx.hideLoading();
          wx.showToast({
            title: '上传成功',
            duration: 3000
          });
          wx.navigateBack({
            delta: 1,
          })
          
        } else if (data.status == 500) {
          wx.showToast({
            title: '上传失败',
            duration: 3000
          })
        } else if (status == 502) {
          wx.showToast({
            title: data.msg,
            duration: 3000,
            icon: "none",
            success: function () {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      }
    })
  }

    
    
})

