var util = require('../../utils/util.js');
function getRandomColor() {
  var colorStr = Math.floor(Math.random()* 0xFFFFFF).toString(16);
  //返回格式化的颜色字符串
  return "#"+"000000".substring(0, 6-colorStr) + colorStr;
}

Page({  
  inputValue: '',
  data: {
    src: 'https://tqutf8.2345cdn.net/tianqiimg/video/20210416/video.mp4',
    danmuList: [
      {text: '第2s出现的弹幕',
      color: '#ff0000',
      time: 2},
      {
        text: '第5s出现的弹幕',
        color: '#ff00ff',
        time: 5
      },
    ],

    weather: {
    }
  },
  videoErrorCallback:function(e){
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)

  },
  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo')
 },
 bindInputBlur: function(e) {
     this.inputValue = e.detail.value
 },

 bindopen:function(){

 },
 bindSendDanmu: function() {
   this.videoContext.sendDanmu({
     text: this.inputValue,
     color: getRandomColor()
   })
 },
 videoErrorCallback: function(e) {
    console.log(e.detail.errMsg)
 },

  onLoad: function (options) {
    this.setData({
      today: util.formatTime(new Date()).split(' ')[0]  //更新当前日期
    });
    var self = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        wx.request({
          url: 'http://api.map.baidu.com/geocoder/v2/' +
          '?ak=ASAT5N3tnHIa4APW0SNPeXN5&location=' +
          res.latitude + ',' + res.longitude + '&output=json&pois=0',
          data: {},
          header: {
            'Content-Type': 'application/json'
          },
          success: function (res) {
            var city = res.data.result.addressComponent.city.replace('市', '');//城市名称
            self.searchWeather(city);  //查询指定城市的天气信息
          }
        })
      }
    })
  },
  //根据城市名称查询天气预报信息
  searchWeather: function (cityName) {
    var self = this;
    wx.request({
      //天气预报查询接口
      url: 'http://wthrcdn.etouch.cn/weather_mini?city=' + cityName,
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.status == 1002) //无此城市
        {
          //显示错误信息
          wx.showModal({
            title: '提示',
            content: '输入的城市名称有误，请重新输入！',
            showCancel: false,
            success: function (res) {
              self.setData({ inputCity: '' });
            }
          })
        } else {
          var weather = res.data.data;  //获取天气数据

          for (var i = 0; i < weather.forecast.length; i++) {
            var d = weather.forecast[i].date;
            //处理日期信息，添加空格
            weather.forecast[i].date = '　' + d.replace('星期', '　星期');
          }
          self.setData({
            city: cityName,      //更新显示城市名称
            weather: weather,    //更新天气信息
            inputCity: ''        //清空查询输入框
          })
        }
      }
    })
  },
  //输入事件
  inputing: function (e) {
    this.setData({ inputCity: e.detail.value });
  },
  //搜索按钮
  bindSearch: function () {
    this.searchWeather(this.data.inputCity);
  }
})