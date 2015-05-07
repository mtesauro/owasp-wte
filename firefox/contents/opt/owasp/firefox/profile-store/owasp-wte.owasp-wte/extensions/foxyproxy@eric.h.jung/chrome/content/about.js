/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/
var fpc, intervalId, angle = 4, iconRotater;

function onLoad() {
  document.documentElement.getButton("accept").focus();
  fpc = Components.classes["@leahscape.org/foxyproxy/common;1"].getService().wrappedJSObject;
  document.getElementById("ver").value += " " + fpc.getVersion();
	sizeToContent();  
	iconRotater = document.getElementById("fp-statusbar-icon-rotater");
	intervalId = window.setInterval(function() {animate()}, 10);
}

function animate() {
  iconRotater.setAttribute("transform", "rotate("+(angle)+", 9, 9)");
  if ((angle += 10) > 1440) {
    iconRotater.setAttribute("transform", "rotate(0, 9, 9)");
    window.clearInterval(intervalId);
  }
}
