const Cc = Components.classes;
const Ci = Components.interfaces;
var coomanPlusCommon = {
	prefs: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.cookiesmanagerplus."),
	prefsDefault: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getDefaultBranch("extensions.cookiesmanagerplus."),
	_ds: Cc["@mozilla.org/intl/scriptabledateformat;1"].getService(Ci.nsIScriptableDateFormat),
	_cm: Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager),
	_cm2: Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager2),
	isCookieCuller: "CookieCullerStartup" in Cc["@mozilla.org/appshell/window-mediator;1"]
																						.getService(Ci.nsIWindowMediator)
																						.getMostRecentWindow("navigator:browser"),
}