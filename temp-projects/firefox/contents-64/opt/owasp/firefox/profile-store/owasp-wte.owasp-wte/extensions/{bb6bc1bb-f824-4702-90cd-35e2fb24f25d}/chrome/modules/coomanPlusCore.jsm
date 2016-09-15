const EXPORTED_SYMBOLS = ["coomanPlusCore"];
var coomanPlusCore = {
	GUID: '{bb6bc1bb-f824-4702-90cd-35e2fb24f25d}',
	aWindow: null,
	aWindowOptions: null,
	lastKeyDown: [],
	prefNoObserve: false,
	openCMP: function(arg)
	{
		if (this.aWindow)
			this.aWindow.focus();
		else
		{
			var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
												 .getService(Components.interfaces.nsIWindowWatcher);
			var win = ww.openWindow(null, "chrome://cookiesmanagerplus/content/cookiesmanagerplus.xul",
															"coomanPlusWindow", "chrome,resizable=yes,toolbar=no,statusbar=no,scrollbar=no,centerscreen", arg);
		}
	},
}