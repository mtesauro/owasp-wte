var EXPORTED_SYMBOLS = ['flashfirebug_gaTrack'];

/**
 * Google Analytics JS v1
 * http://code.google.com/p/google-analytics-js/
 * Copyright (c) 2009 Remy Sharp remysharp.com / MIT License
 * $Date: 2009-02-25 14:25:01 +0000 (Wed, 25 Feb 2009) $
 */
function flashfirebug_gaTrack(urchinCode, domain, url, flashfirebugPrepare, $) {
  function rand(min, max) {
      return min + Math.floor(Math.random() * (max - min));
  }
  
  var unique_id = flashfirebugPrepare.getPrefValue("ffbug.analytics.uniqueTrackingCode");
  
  if (unique_id == '') {
    unique_id = new Date().valueOf() + '.' + 
      rand(1000000000,2147483647) + '.' +
      rand(1000000000,2147483647) + '.' +
      rand(1000000000,2147483647) + '.' +
      rand(1000000000,2147483647) + '.2';
    flashfirebugPrepare.setPrefValue("ffbug.analytics.uniqueTrackingCode", unique_id);
  }
  
  var unique_components = unique_id.split(".");
    
  var i=1000000000,
      utmn=rand(i,9999999999), //random request number
      win = flashfirebugPrepare.myWindow.location,
      urchinUrl = 'http://www.google-analytics.com/__utm.gif?utmwv=1.3&utmn='
          +encodeURIComponent(utmn)+'&utmsr=-&utmsc=-&utmul=-&utmje=0&utmfl=-&utmdt=-&utmhn='
          +encodeURIComponent(domain)+'&utmr='+encodeURIComponent(win)+'&utmp='
          +encodeURIComponent(url)+'&utmac='
          +encodeURIComponent(urchinCode)+'&utmcc=' + encodeURIComponent('__utma='
          +unique_id + ';+__utmb='
          +unique_components[0] + ';+__utmc='
          +unique_components[0] + ';+__utmz='
          +unique_components[0] + '.' + (new Date()).getTime()
          +'.2.2.utmccn=(referral)|utmcsr=' + win.host + '|utmcct=' + win.pathname + '|utmcmd=referral;+__utmv='
          +unique_components[0] + '.-;');

  $.get(urchinUrl);
}