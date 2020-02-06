var app = getApp();
module.exports = function (options, callback){
  var jscode = options.jscode;
  wx.request({
    url: app.globalData.baseUrl + '/api/wechat/user/login',
    headers : {
      'Content-Type': 'Application/json'
    },
    method : 'POST',
    success : function(res) {
      console.log(res);
    }
  })
}