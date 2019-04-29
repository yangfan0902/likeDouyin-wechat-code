  function uploadVideo() {
    var me = this;
    wx.chooseVideo({
      sourceType: ['album'],
      maxDuration: 60,
      success(res) {
        var duration = res.duration;
        var tmpHeight = res.height;
        var tmpWidth = res.width;
        var tmpVideoUrl = res.tempFilePath;
        var tmpCoverUrl = res.thumbTempFilePath;

        // if (duration > 11) {
        //   wx.showToast({
        //     title: '视频长度不能超过10秒',
        //     duration: 2500
        //   })
        // } else {
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration=' + duration +
              '&tmpHeight=' + tmpHeight +
              '&tmpWidth=' + tmpWidth +
              '&tmpWidth=' + tmpWidth +
              '&tmpVideoUrl=' + tmpVideoUrl +
              '&tmpCoverUrl=' + tmpCoverUrl,

          })
        // }

      }
    })
  }

  module.exports={
    uploadVideo: uploadVideo
  }