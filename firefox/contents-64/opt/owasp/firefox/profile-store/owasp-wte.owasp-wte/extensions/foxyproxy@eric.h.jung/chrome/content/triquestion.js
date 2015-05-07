/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

function onLoad() {
  var inn = window.arguments[0].inn;
  document.getElementById("title").appendChild(document.createTextNode(inn.title));
  
  document.getElementById("1").label = inn.btn1Text;
  var btn2 = document.getElementById("2"); 
  btn2.label = inn.btn2Text; 
  document.getElementById("3").label = inn.btn3Text;
  btn2.focus();
	sizeToContent();
}

function onOK(v) {
  window.arguments[0].out = {value:v};
  close();
}
