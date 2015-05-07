Components.utils.import("resource://cookiesmanagerplus/coomanPlusCore.jsm");
var coomanPlus = {
	load: function()
	{
		window.removeEventListener("load", coomanPlus.load, true);
		coomanPlus.init();
	},

	init: function()
	{
		document.getElementById("removeAllCookies").parentNode.insertBefore(document.getElementById("coomanPlusButton"), document.getElementById("removeAllCookies").nextSibling);
	},
	
	openCMP: function()
	{
		coomanPlusCore.openCMP();
	}
}

if (coomanPlusCommon.prefs.getBoolPref("alwaysusecmp") && (!("arguments" in window) || !window.arguments.length || window.arguments[0] != "forced"))
{
	gCookiesWindow.init = function(){};
	gCookiesWindow.uninit = function(){};
	coomanPlusCore.openCMP();
	window.close();
}
else
{
	window.addEventListener("load", coomanPlus.load, true);
}