/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/
window.onload=function(){
  // works with ff 1.5, 2.x, and 3.x
  var e = document.getElementById("catProxiesButton") || document.getElementById("connectionSettings");
  if (e) e.setAttribute("oncommand", "onConnectionSettings();");
  else {
	  try {
	    gAdvancedPane && (gAdvancedPane.showConnections = onConnectionSettings);
	  }
	  catch (e) {dump("optionsOverlay: " + e + "\n");/*wtf*/}
	}
}
function onConnectionSettings() {
  var fp = Components.classes["@leahscape.org/foxyproxy/service;1"]
    .getService().wrappedJSObject;
  
  if (fp.mode == "disabled")
	  document.documentElement.openSubDialog("chrome://browser/content/preferences/connection.xul", "", null);
	else {
    var fpc = Components.classes["@leahscape.org/foxyproxy/common;1"].getService().wrappedJSObject;
		var win = fpc.getMostRecentWindow();
		if (win && win.foxyproxy)
		  win.foxyproxy.onOptionsDialog();
		else {
		  alert("FoxyProxy Error");
		  document.documentElement.openSubDialog("chrome://browser/content/preferences/connection.xul", "", null);		  
		}
	}
}
