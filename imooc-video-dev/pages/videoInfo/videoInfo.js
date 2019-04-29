var videoUtil=require('../utils/videoUtil.js')
const app = getApp()

Page({
  data:{
    cover:'cover',
    videoId:'',
    src:'',
    videoInfo:{},
    userLikeVideo:false,
    publisher:{},
    serverUrl:'',
    commentFocus:false,
    placeholder:'说点什么。。。',

    commentsPage:1,
    commentsTotalPage:1,
    commentsList:[]
  },
  videoCtx:{},
  onLoad:function(params){
    var me=this;
    me.videoCtx=wx.createVideoContext("myVideo", me);
    //获取上一个页面传入的参数
    var videoInfo=JSON.parse(params.videoInfo);
    var height=videoInfo.videoHeight;
    var width=videoInfo.videoWidth;
    var cover="cover";
    if(width>=height){
      cover="";
    }

    me.setData({
      videoId:videoInfo.id,
      src:app.serverUrl+videoInfo.videoPath,
      videoInfo:videoInfo,
      cover:cover
    });
    var user=app.getGlobalUserInfo();
    var loginUserId="";
    if(user!=null&&user!=undefined&&user!=""){
      loginUserId=user.id;
    }
    if(user!=null)
    wx.request({
      url: app.serverUrl +'/user/queryPublisher?loginUserId='+loginUserId+"&videoId="+videoInfo.id+"&publishUserId="+videoInfo.userId,
      method:'POST',
      success:function(res){
        console.log(res.data);
        var publisher=res.data.data.publisher;
        var userLikeVideo=res.data.data.userLikeVideo;
        me.setData({
          publisher:publisher,
          userLikeVideo:userLikeVideo,
          serverUrl:app.serverUrl,
        })
      }

    })
  },
  onShow:function(){
    var me=this;
    me.videoCtx.play();
  },
  onHide:function(){
    var me = this;
    me.videoCtx.pause();
  },
  showSearch:function(){
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },
  upload:function(){
    var me=this;
    var user = app.getGlobalUserInfo();

    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl='../videoInfo/videoInfo#videoInfo@'+videoInfo;
    

    if (user == null || user == undefined || user == '') {
      wx.redirectTo({
        url: '../userLogin/login?redirectUrl='+realUrl,
      })
    } else {
      videoUtil.uploadVideo();
    }
  },
  showIndex:function(){
    wx.switchTab({
      url: '../index/index',
    })
  },
  showMine:function(){
    var user = app.getGlobalUserInfo();
    if(user==null||user==undefined||user==''){
      wx.switchTab({
        url: '../userLogin/login',
      })
    }else{
      wx.switchTab({
        url: '../mine/mine',
      })
    }
    
  },
  likeVideoOrNot:function(){
    var me=this;
    var videoInfo=me.data.videoInfo;
    var user = app.getGlobalUserInfo();
    if (user == null || user == undefined || user == '') {
      wx.redirectTo({
        url: '../userLogin/login',
      })
    }else{
      var userLikeVideo=me.data.userLikeVideo;
      var url='/video/userLike?userId='+user.id+'&videoId='+videoInfo.id+'&videoCreaterId='+videoInfo.userId;

      if (userLikeVideo){
        url = '/video/userUnLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;

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
        success:function(res){
          console.log(res);
          wx.hideLoading();
          me.setData({
            userLikeVideo:!userLikeVideo
          })
        }
      })
    }
  },
  showPublisher:function(){
    var me = this;
    var user = app.getGlobalUserInfo();

    var videoInfo = me.data.videoInfo;
    var publisherId=videoInfo.userId;
    app.publisherId = videoInfo.userId;
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;

    if (user == null || user == undefined || user == '') {
      wx.redirectTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      if(publisherId==user.id){
        wx.switchTab({
          url: '../mine/mine',
        })
      }else{
        wx.navigateTo({
          url: '../publisher/publisher',
        })
      }
      
    }
  },
  shareMe:function(){
    var me=this;
    var user=app.getGlobalUserInfo();
    wx.showActionSheet({
      itemList: ["下载到本地","举报用户","分享到微信"],
      success:function(res){
        if(res.tapIndex==0){
          //下载到本地
          wx.showLoading();
          wx.downloadFile({
            url: app.serverUrl+me.data.videoInfo.videoPath,
            success(res) {
              var filePath='';
              if (res.statusCode === 200) {
                
                filePath=res.tempFilePath
                
                wx.saveVideoToPhotosAlbum({
                  filePath: filePath,
                  success(res) {
                    wx.hideLoading();
                    wx.showToast({
                      title: '保存成功',
                      duration:1500
                    })
                  }
                })
              }
            }
          })
        }else if(res.tapIndex==1){
          //举报用户
          var videoInfo=JSON.stringify(me.data.videoInfo);
          var realUrl='../videoInfo/videoInfo#videoInfo@'+videoInfo;
          if(user==null||user==undefined||user==''){
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl='+realUrl,
            })
          }else{
            var publishUserId=me.data.videoInfo.userId;
            var videoId=me.data.videoInfo.id;
            var currentUserId=user.id;
            wx.navigateTo({
              url: '../report/report?videoId='+videoId+'&publishUserId='+publishUserId
            })
          }
        }else if(res.tapIndex==2){
          wx.updateShareMenu({
            withShareTicket: true,
            success() { }
          })
        }
      }
    })
  },
  onShareAppMessage:function(res){
    var me=this;
    var videoInfo=me.data.videoInfo;

    return {
      title:'短视频内容分享',
      path:'pages/videoInfo/videoInfo?videoInfo='+JSON.stringify(videoInfo)
    }
  },
  leaveComment:function(){
    this.getCommentsList(1);
    this.setData({
      commentFocus:true
    })
  },

  replyFocus:function(e){
    console.log(e);
    var fatherCommentId=e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname; 
    
    this.setData({
      placeholder:'回复'+toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus:true
     
    })
  },



  saveComment:function(e){
    var me=this;
    var content=e.detail.value;
    var user=app.getGlobalUserInfo();
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;


    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      var publishUserId = me.data.videoInfo.userId;
      var videoId = me.data.videoInfo.id;
      var currentUserId = user.id;
      wx.showLoading();
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId+'&toUserId='+toUserId,
        method:'POST',
        header:{
          'content-type': 'application/json',
          'userId': user.id,
          'userToken': user.userToken
        },
        data:{
          videoId: videoId,
          fromUserId:user.id,
          comment: content
        },
        success:function(res){
          wx.hideLoading();
          console.log(res.data);
          me.setData({
            contentValue:'',
            commentsList:[]
          });
          me.getCommentsList(1);
          console.log('为什么恢复没有显示呢')
          console.log(me.commentsList)
        }
      })
    }
  },
  // commentsPage: 1,
  // commentsTotalPage: 1,
  // commentsList: []

  getCommentsList:function(page){
    var me=this;
    var videoId=me.data.videoInfo.id;

    wx.request({
      url: app.serverUrl+'/video/getVideoComments?videoId='+videoId+'&page='+page,
      method:'POST',
      success:function(res){ 
        var commentsList=res.data.data.rows;
        var newCommentsList=me.data.commentsList;

        me.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total,
        })

        
      }
    })
    
  },
  onReachBottom: function () {
    var me=this;
    var currentPage = me.data.commentsPage;
    var total = me.data.commentsTotalPage;
    if(currentPage==total){
      return;
    }else{
      me.getCommentsList(currentPage+1)
    }
  }

})