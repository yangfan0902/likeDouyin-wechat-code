var videoUtil = require('../utils/videoUtil.js')
const app = getApp()

Page({
  data: {
    faceUrl:'../resource/images/noneface.png',
    isMe:true,
    isFollow:false,
    publisherId:"",
    fansCounts:'',
    userId:'',
    videoSelClass:"video-info",
    isSelectedWork:"video-info-selected",
    isSelectedLike:"",
    isSelectedFollow:"",
    
    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    myWorkFlag: false,
    myLikeFlag: true,
    myFollowFlag: true
  },

  onLoad: function (params) {
   var me = this;
  //  var user=app.userInfo;
   var user=app.getGlobalUserInfo();
   var userId=user.id;
   
   var publisherId =app.publisherId;
   app.publisherId='';
   if(publisherId!='' && publisherId!=null && publisherId != undefined){
     userId=publisherId;
     if(userId==user.id){
       me.setData({
         isMe: true,
         publisherId: publisherId
       })
     }else{
       me.setData({
         isMe: false,
         publisherId: publisherId
       })
     }   
   }
    me.setData({
      userId: userId
    })
   wx.showLoading({
     title: '请等待',
   })
   wx.request({
     method: 'POST',
     url: app.serverUrl+'/user/query?userId='+userId+"&fanId="+user.id,
     header:{
       'content-type':'application/json',
       'userId':user.id,
       'userToken':user.userToken
     },
     success: function (res) {
       var data = res.data;
       var status = data.status;
       var userInfo = data.data;
       if (status == 200) {
         wx.hideLoading();
         console.log(userInfo);
         var faceUrl ='../resource/images/noneface.png';
         if(userInfo.faceImage!=null&&userInfo.faceImage!=''&&userInfo.faceImage!=undefined){
           faceUrl=app.serverUrl+userInfo.faceImage;
         }
         console.log(userInfo);
         me.setData({
           faceUrl: faceUrl,
           nickname: userInfo.nickname,
           fansCounts: userInfo.fansCounts,
           followCounts: userInfo.followCounts,
           receiveLikeCounts: userInfo.receiveLikeCounts,
           isFollow:userInfo.follow
         })
       } else if (status == 502) {
         wx.showToast({
           title: data.msg,
           duration:3000,
           icon:"none",
           success:function(){
             wx.redirectTo({
               url: '../userLogin/login',
             })
           }
         })
       }
     }
     
   });
   me.doSelectWork();

  },

  logout:function(){
    var user = app.getGlobalUserInfo();
    var url = app.serverUrl;
    wx.showLoading({
      title: '请等待',
    })
    wx.request({
      url: url + '/logout?userId='+user.id,
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res);
        wx.hideLoading();
        var data = res.data;
        var status = res.statusCode;
        if (status == 200) {
          wx.showToast({
            title: '注销成功',
            duration:3000
          });
          // app.userInfo=null;
          wx.removeStorageSync("userInfo");
          wx.navigateTo({
            url: '../userLogin/login',
          })

        } else if (status == 500) {
          
        }
      }
    })
  },
  changeFace:function(){
    var me = this;
    var user=app.getGlobalUserInfo();
    wx.chooseImage({
      count: 1,
      sizeType: [ 'compressed'],
      sourceType: ['album'],
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        wx.showLoading({
          title: '上传中',
        });
        var userInfo=app.getGlobalUserInfo();
        wx.uploadFile({
          url: app.serverUrl +'/user/uploadFace?userId='+userInfo.id,
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'application/json',
            'userId': user.id,
            'userToken': user.userToken
          },
          success(res) {
            const data = JSON.parse(res.data);
            console.log(data.status);
            wx.hideLoading();
            if(data.status==200){
              wx.showToast({
                title: '上传成功',
                duration: 3000
              });
              var imgUrl=data.data;
              console.log(imgUrl);
              me.setData({
                faceUrl: app.serverUrl+imgUrl
              });
            }else if(data.status==500){
              wx.showToast({
                title: '上传失败',
                duration: 3000
              })
            }
            
          }
        })
      }
    })
  },
  uploadVideo:function(){
    videoUtil.uploadVideo();
  },
  followMe:function(e){
    var me=this;

    var user=app.getGlobalUserInfo();
    var userId=user.id;
    var publisherId=me.data.publisherId;
    var url="";
    var followType=e.currentTarget.dataset.followtype;

    //1:关注 0:取消关注
    if(followType=='1'){
      url='/user/beyourfans?userId='+publisherId+"&fanId="+userId;
    }else{
      url = '/user/dontbeyourfans?userId=' + publisherId + "&fanId=" + userId;
    }
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: app.serverUrl+url,
      method:'POST',
      header: {
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.userToken
      },
      success:function(){
        wx.hideLoading();
        if(followType=='1'){
          me.setData({
            fansCounts:++me.data.fansCounts,
            isFollow: true
          })
        }else if(followType=='0'){
          me.setData({
            fansCounts:--me.data.fansCounts,
            isFollow: false
          })
        }
      }
    })

  },
  doSelectWork:function(){
    console.log('doselectwork');
    var me=this;
    me.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",
      
      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

      myWorkFlag: false,
      myLikeFlag: true,
      myFollowFlag: true

    });
    var page = me.data.myVideoPage;
    me.getMyVideoList(1);

  },
  doSelectLike: function () {
    console.log('doselectlike');
    var me = this;
    me.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

      myWorkFlag: true,
      myLikeFlag: false,
      myFollowFlag: true

    });
    var page = me.data.likeVideoPage;
    me.getMyLikeList(1);
  },
  doSelectFollow: function () {
    console.log('doselectfollow');
    var me = this;
    me.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

      myWorkFlag: true,
      myLikeFlag: true,
      myFollowFlag: false

    });
    var page = me.data.followVideoPage;
    me.getMyFollowList(1);
  },
  getMyVideoList: function (page) {
    var me = this;
   
    var userId=me.data.userId;
    wx.showLoading();

    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showOnesAll?userId=' + me.data.userId + '&page=' + page,
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        console.log(res);
        var myVideoList = res.data.data.rows;

        var newVideoList = me.data.myVideoList;
        me.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        })
      }

    })
  },
  getMyLikeList:function(page){
    var me = this;
    wx.showLoading();
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showOnesLike?userId=' + me.data.userId + '&page=' + page,
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        console.log("函数回调")
        var likeVideoList = res.data.data.rows;
        var newLikeVideoList = me.data.likeVideoList;
        me.setData({
          likeVideoPage: page,
          likeVideoList: newLikeVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        })
      }

    })
  },

  getMyFollowList:function(page){
    var me = this;

    wx.showLoading();

    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showOnesFollow?userId=' + me.data.userId + '&page=' + page,
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        var followVideoList = res.data.data.rows;
        var newFollowVideoList = me.data.followVideoList;
        me.setData({
          followVideoPage: page,
          followVideoList: newFollowVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        })
      }

    })
  },
  onReachBottom: function () {

    var me=this;
    var myWorkFlag = this.data.myWorkFlag;
    var myLikeFlag = this.data.myLikeFlag;
    var myFollowFlag = this.data.myFollowFlag;

    if (!myWorkFlag) {
      var currentPage = me.data.myVideoPage;
      var totalPage = me.data.myVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myLikeFlag) {
      var currentPage = me.data.likeVideoPage;
      var totalPage = me.data.myLikesTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikeList(page);
    } else if (!myFollowFlag) {
      var currentPage = me.data.followVideoPage;
      var totalPage = me.data.followVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }
  },
  showVideo:function(e){
    var me = this;
    var myWorkFlag = this.data.myWorkFlag;
    var myLikeFlag = this.data.myLikeFlag;
    var myFollowFlag = this.data.myFollowFlag;
    var videoList=[];
    if (!myWorkFlag){
      videoList=me.data.myVideoList;
    } else if (!myLikeFlag){
      videoList = me.data.likeVideoList;
    } else if (!myFollowFlag) {
      videoList = me.data.followVideoList;
    }
    var arrindex = e.target.dataset.arrindex;
    console.log(videoList[arrindex])
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo,
    })
  }
})
