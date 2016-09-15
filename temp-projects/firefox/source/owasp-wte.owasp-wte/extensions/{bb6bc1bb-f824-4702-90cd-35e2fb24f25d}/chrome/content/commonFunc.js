coomanPlus.trim = function(s)
{
	return s.replace(/^\s+|\s+$/g,"");
}

coomanPlus.numberClean = function(s)
{
	return s.replace(/-[^0-9]/g,"");
}

coomanPlus.clone = function(o)
{
	var n = {};
	for(var i in o)
		n[i] = o[i];
	return n;
}

coomanPlus.getExpiresString = function(expires, format)
{
	var format = format || this.prefDateFormat
	if (expires)
	{
		var date;
		if (format)
		{
			date = this.date(format,  expires);
			if (date)
				return date;
		}
		date = new Date(1000 * expires)
		return coomanPlusCommon._ds.FormatDateTime(1,	coomanPlusCommon._ds.dateFormatLong,
																			coomanPlusCommon._ds.timeFormatSeconds,
																			date.getFullYear(),
																			date.getMonth() + 1,
																			date.getDate(),
																			date.getHours(),
																			date.getMinutes(),
																			date.getSeconds()
																	);

	}
	return this.string("expireAtEndOfSession");
}

coomanPlus.string = function(s)
{
	try
	{
		return this._cb.getString(s);
	}
	catch(e)
	{
		if ("_cb2" in this)
			return this._cb2.getString(s);
	}
}

coomanPlus._cookieGetExtraInfo = function(aCookie)
{
	if (aCookie.extra)
		return aCookie;

	var list = coomanPlusCommon._cm2.getCookiesFromHost(aCookie.host);
	while (list.hasMoreElements())
	{
		var c = list.getNext();
		if (!c || !(c instanceof Ci.nsICookie))
			break;
		if (this._cookieEquals(aCookie, c))
		{
			aCookie = new this.cookieObject(c.QueryInterface(Ci.nsICookie2), aCookie.sel, aCookie.added);
			aCookie.extra = true;
			break;
		}
	}
	return aCookie;
}

coomanPlus.cookieObject = function(aCookie, sel, updated)
{
	this.aCookie			= aCookie;
	this.name					= aCookie.name;
	this.value				= aCookie.value;
	this.isDomain			= aCookie.isDomain;
	this.host					= aCookie.host;
	this.rawHost			= aCookie.rawHost ? aCookie.rawHost : (aCookie.host.charAt(0) == "." ? aCookie.host.substring(1, aCookie.host.length) : aCookie.host);
	this.simpleHost		= this.rawHost.charAt(0) == "." ? this.rawHost.substring(1, this.rawHost.length) : this.rawHost.match(/^www\./) ? this.rawHost.replace(/^www\./, "") : this.rawHost;
	this.rootHost			= this.rawHost.replace(/^.*\.([^.]+\.[^.]+)$/, "$1");
	this.path					= aCookie.path;
	this.isSecure			= aCookie.isSecure;
	this.expires			= aCookie.expires;
	this.policy				= aCookie.policy;
	this.status				= typeof(aCookie.status) == "undefined" ? null : aCookie.status;
	this.isSession		= typeof(aCookie.isSession) == "undefined" ? null : aCookie.isSession;
	this.expiry				= typeof(aCookie.expiry) == "undefined" ? null : aCookie.expiry;
	this.creationTime	= typeof(aCookie.creationTime) == "undefined" ? null : aCookie.creationTime;
	this.lastAccessed	= typeof(aCookie.lastAccessed) == "undefined" ? null : aCookie.lastAccessed;
	this.isHttpOnly		= typeof(aCookie.isHttpOnly) == "undefined" ? null : aCookie.isHttpOnly;
	this.sel					= typeof(sel) == "undefined" ? false : sel;
	this.extra				= typeof(aCookie.extra) == "undefined" ? false : aCookie.extra;
	this.isProtected	= coomanPlus.cookieCuller && coomanPlus.cookieCuller.enabled ? coomanPlus.cookieCuller.obj.checkIfProtected(this.name, this.host, this.path) : false;
	this.updated			= typeof(updated) == "undefined" ? null : updated;
}

coomanPlus.resizeWindow = function(f)
{
	var w = document.getElementById("main").boxObject.width;
	var h = document.getElementById("main").boxObject.height;
//	alert(document.width + "x" + document.height +"\n" + w + "x" + h);
	if (f || document.width < w || document.height < h)
		window.sizeToContent();
}

coomanPlus.clearUserPref = function(p)
{
	if (coomanPlusCommon.prefs.prefHasUserValue(p))
		coomanPlusCommon.prefs.clearUserPref(p);
}

coomanPlus.right = function(str, n)
{
	if (n <= 0)
		return "";

	else if (n > String(str).length)
		return str;

	else
	{
		var iLen = String(str).length;
		return String(str).substring(iLen, iLen - n);
	}
}

coomanPlus.left = function(str, n)
{
	if (n <= 0)
		return "";
	else if (n > String(str).length)
		return str;
	else
		return String(str).substring(0,n);
}

coomanPlus._openDialog = function(a, b, c, arg)
{

	var wm = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
	var browsers = wm.getZOrderDOMWindowEnumerator('', false);
	if (!a.match("/"))
		a = "chrome://cookiesmanagerplus/content/" + a;

	var browser;
	while (browser = browsers.getNext())
	{
		if (browser.location.href.toString() == a)
		{
			browser.focus();
			return;
		}
	}
	if (typeof(arg) == "undefined")
		var arg = {};

	arg.window = window;
	arg.document = document;
/*
	Cc["@mozilla.org/embedcomp/window-watcher;1"]
		.getService(Ci.nsIWindowWatcher)
		.openWindow(null, a, b, c, arg);
*/
	window.openDialog(a, b, c, arg);
}

coomanPlus.alert = function(msg, title)
{
	var promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"]
											.getService(Ci.nsIPromptService);
	promptService.alert(window, title || msg, msg);
}

coomanPlus.os = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;
coomanPlus.appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
try
{
	Components.utils.import("resource://gre/modules/AddonManager.jsm");
	AddonManager.getAddonByID(coomanPlusCore.GUID, function(app)
	{
		coomanPlus.app = app;
		if (coomanPlus.inited)
			coomanPlus.load();
	});
}
catch (e)
{
	coomanPlus.app = Cc["@mozilla.org/extensions/manager;1"]
								.getService(Ci.nsIExtensionManager)
								.getItemForID(coomanPlusCore.GUID);
}

coomanPlus.isFF4 = (Cc["@mozilla.org/xpcom/version-comparator;1"]
									.getService(Ci.nsIVersionComparator)
									.compare(coomanPlus.appInfo.version, "4.0b") >= 0);

coomanPlus.isMac = coomanPlus.os == "Darwin";

(coomanPlus.observer = {
	_observerService: Cc["@mozilla.org/observer-service;1"]
														.getService(Ci.nsIObserverService),
	_name: "coomanPlusWindow",
	init: function()
	{
		this._observerService.addObserver(this, this._name, false);
		window.addEventListener("unload", function() { coomanPlus.observer.uninit(); }, false);
	},

	uninit: function()
	{
		this._observerService.removeObserver(this, this._name);
	},

	observe: function(aSubject, aTopic, aData)
	{
		aSubject.QueryInterface(Components.interfaces.nsISupportsString);
		if (aTopic != this._name || !coomanPlus[aSubject.data])
			return;

		coomanPlus[aSubject.data](aData);
	},
}).init();
