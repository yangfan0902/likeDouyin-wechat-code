const app = getApp()

Page({
  data: {
    //用于分页的属性
    totalPage:1,
    page:1,
    videoList:[],
    screenWidth: 350,
    serverUrl:"",
    searchContent:""
  },

  onLoad: function (params) {
    var me=this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });
    var searchContent=params.search;
    var isSaveRecord=params.isSaveRecord;
    var page=me.data.page;
    if (isSaveRecord==null||isSaveRecord==0||isSaveRecord==undefined){
      isSaveRecord=0;
    }
    if (searchContent != null && searchContent != '' && searchContent!=undefined){
      me.setData({
        searchContent: searchContent
      })
    }
    me.getAllVideoList(page, isSaveRecord);
  },
  getAllVideoList:function(page,isSaveRecord){
    var me=this;
    var serverUrl = app.serverUrl;
    var searchContent = me.data.searchContent;
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page+'&isSaveRecord='+isSaveRecord,
      method: 'POST',
      data:{
        videoDesc:searchContent
      },
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        console.log(res.data);
        if (page === 1) {
          me.setData({
            videoList: []
          })
        }
        var videoList = res.data.data.rows;
        var newVideoList = me.data.videoList;

        me.setData({
          videoList: newVideoList.concat(videoList),
          page: page,
          serverUrl: app.serverUrl,
          totalPage: res.data.data.total

        })
      }
    })
  },
  onReachBottom:function(){
    var me=this;
    var currentPage=me.data.page;
    var totalPage=me.data.totalPage;
    if(currentPage==totalPage){
      wx.showToast({
        title: '没有新视频啦',
      })
    }else{
      me.getAllVideoList(currentPage+1,0)
    }
  },
  onPullDownRefresh:function(){
    wx.showNavigationBarLoading();
    this.getAllVideoList(1,0);
  },
  showVideoInfo:function(e){
    var me=this;
    var videoList=me.data.videoList;
    var arrindex=e.target.dataset.arrindex;
    console.log(videoList[arrindex])
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo='+videoInfo,
    })

  }

})
