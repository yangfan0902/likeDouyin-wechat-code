const app = getApp()

Page({
  data: {
  },
  onLoad:function(params){
    var me=this;
    var redirectUrl=params.redirectUrl;
    if(redirectUrl!=null&&redirectUrl!=''&&redirectUrl!=undefined){
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");
      me.redirectUrl = redirectUrl;
    }
  },
  doLogin:function(e){
    var me = this;
    console.log(e);
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;

    // var username = 'admin';
    // var password = '123';

    //simple verify
    if (username == '' || password == '') {
      wx.showToast({
        title: '用户名或密码不能为空',
        duration: 3000,
      })
    } else {
      var url = app.serverUrl;
      wx.showLoading({
        title: '请等待',
      })
      wx.request({
        url: url + '/login',
        method: 'POST',
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          wx.hideLoading();
          var data = res.data;
          var status = data.status;
          if (status == 200) {
            wx.showToast({
              title: '登录成功',
              duration: 1000
            });
            // app.userInfo = data.data;
            
            app.setGlobalUserInfo(data.data);
            var redirectUrl=me.redirectUrl;
            if (redirectUrl != '' && redirectUrl != null && redirectUrl!=undefined){
              wx.navigateTo({
                url: redirectUrl,
              })
            }else{
              wx.switchTab({
                url: '../mine/mine',
              })
            }
          } else if (status == 500) {
            wx.showToast({
              title: data.msg,
              duration: 3000
            })
          }
        }
      })
    }
  },
  goRegistPage:function(){
    wx.navigateTo({
      url: '../userRegist/regist',
    })
  }
})