const app = getApp()

Page({
    data: {

    },
    doRegist:function(e){
      console.log(e);
      var formObject=e.detail.value;
      var username=formObject.username;
      var password=formObject.password;

      //simple verify
      if(username==''||password==''){
        wx.showToast({
          title: '用户名或密码不能为空',
          duration:3000,
        })
      }else{
        var url=app.serverUrl;
        wx.showLoading({
          title: '请等待',
        })
        wx.request({
          url: url+'/regist',
          method:'POST',
          data:{
            username:username,
            password:password
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success:function(res){
            wx.hideLoading();
            var data=res.data;
            var status=data.status;
            if(status==200){
              wx.showToast({
                title: '注册成功',
                duration:3000
              })
              // app.userInfo=data.data;
              app.setGlobalUserInfo(data.data);
            }else if(status==500){
              wx.showToast({
                title: data.msg,
                duration:3000
              })
            }
          }
        })
      }
      
    },
  goLoginPage:function(){
    wx.navigateTo({
      url: '../userLogin/login',
    })
  }

})