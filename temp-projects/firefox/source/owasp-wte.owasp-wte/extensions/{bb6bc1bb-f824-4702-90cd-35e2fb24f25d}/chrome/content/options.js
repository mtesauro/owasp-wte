 /* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.org.
 * Portions created by the Initial Developer are Copyright (C) 2004
 * the Initial Developer. All Rights Reserved.
 *
 * Author(s): Michael Ryabushkin
 *
 * ***** END LICENSE BLOCK ***** */

/*----------------------
 Contains some of the code is from Mozilla original Cookie Editor
 ----------------------*/
Components.utils.import("resource://cookiesmanagerplus/coomanPlusCore.jsm");
coomanPlusCore.lastKeyDown = [];

var coomanPlus = {
	aWindowBackup: null,
	standalone: true,
	winid: new Date(),
	_cb: null,
	instantApply: false,
	load: function()
	{
		coomanPlus.init();
	},

	init: function()
	{
		this._cb = document.getElementById("cookieBundle");
		this.strings.secureYes = this.string("forSecureOnly");
		this.strings.secureNo = this.string("forAnyConnection");
		this.test(document.getElementById("format"));
		var t = document.getElementById("preset").childNodes;
		this.instantApply = Cc["@mozilla.org/preferences-service;1"]
												.getService(Ci.nsIPrefBranch)
												.getBoolPref("browser.preferences.instantApply");

		for(var i = 0; i < t.length; i++)
		{
			if (!t[i].label)
				t[i].label = this.getExpiresString((new Date()).getTime()/1000, t[i].value);
		}
		document.getElementById("cookiecullerCheckbox").addEventListener("CheckboxStateChange", this.enableDisable, false);
//		document.getElementById("ifl_expires").addEventListener("CheckboxStateChange", this.enableDisable, false);
		document.getElementById("templateclipboardinput").editor.transactionManager.clear();
		document.getElementById("templatefileinput").editor.transactionManager.clear();
		document.getElementById("templateclipboardinput").selectionStart = 0;
		document.getElementById("templateclipboardinput").selectionEnd = 0;
		document.getElementById("templatefileinput").selectionStart = 0;
		document.getElementById("templatefileinput").selectionEnd = 0;
		function getContents(aURL){
			var ioService=Components.classes["@mozilla.org/network/io-service;1"]
				.getService(Components.interfaces.nsIIOService);
			var scriptableStream=Components
				.classes["@mozilla.org/scriptableinputstream;1"]
				.getService(Components.interfaces.nsIScriptableInputStream);

			var channel=ioService.newChannel(aURL,null,null);
			var input=channel.open();
			scriptableStream.init(input);
			var str=scriptableStream.read(input.available());
			scriptableStream.close();
			input.close();
			return str;
		}

		document.getElementById("changesLog").value = getContents("chrome://cookiesmanagerplus/content/changes.txt");
		document.getElementById("changesLog").selectionStart = 0;
		document.getElementById("changesLog").selectionEnd = 0;
		document.getElementById("general").focus();
		this.enableDisable();
	},

	unload: function()
	{
		coomanPlusCore.aWindowOptions = null;
		if (!coomanPlus.standalone)
			coomanPlusCore.aWindow = coomanPlus.aWindowBackup;
	},

	openLink: function(e)
	{
		var w = window.open('http://php.net/manual/en/function.date.php', "dateManual", "resizable=yes,scrollbars=yes,location=yes,centerscreen");
		if (this.prefTopmost)
		{
			var xulWin = w.QueryInterface(Ci.nsIInterfaceRequestor)
									.getInterface(Ci.nsIWebNavigation)
									.QueryInterface(Ci.nsIDocShellTreeItem)
									.treeOwner.QueryInterface(Ci.nsIInterfaceRequestor)
									.getInterface(Ci.nsIXULWindow);
			xulWin.zLevel = xulWin.normalZ;
		}
		w.focus();
	},

	enableDisable: function()
	{
		document.getElementById("cookiecullerbox").collapsed = !coomanPlusCommon.isCookieCuller;
		document.getElementById("cookiecullerdeleteCheckbox").disabled = !document.getElementById("cookiecullerCheckbox").checked;
	},

	template: function(e)
	{
		document.getElementById("format").value = e.originalTarget.value;
		var event = document.createEvent("Events");
		event.initEvent("change", true, true);
		document.getElementById("format").dispatchEvent(event);
		this.test(e.originalTarget);
		document.getElementById("format").focus();
	},

	test: function(obj)
	{
		document.getElementById("test").value = this.getExpiresString((new Date()).getTime()/1000, obj.value);
	},

	observeSend: function(data)
	{
		var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
		var observerSubject = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
		observerSubject.data = data;
		observerService.notifyObservers(observerSubject, "coomanPlusWindow", null);
	},

	cookieInfoRowsReset: function()
	{
		this.observeSend("cookieInfoRowsReset");
	},

	templateReset: function(id)
	{
		document.getElementById("template" + id + "input").value = coomanPlusCommon.prefsDefault.getComplexValue("template" + id, Ci.nsISupportsString);
		document.getElementById("prefpane").userChangedValue(document.getElementById("template" + id + "input"));
	},

	backupDecrypt: function()
	{
		this.backupRemovePassword();
	},

	backupEncrypt: function()
	{
		this.backupAddPassword();
	},
}
function srGetStrBundle()
{
	return document.getElementById("pippkiBundle");
}

if (coomanPlusCore.aWindowOptions)
{
	coomanPlusCore.aWindowOptions.focus();
	window.close()
}
coomanPlusCore.aWindowOptions = window;
if ("arguments" in window && window.arguments.length && "window" in window.arguments[0])
{
	coomanPlus.aWindowBackup = coomanPlusCore.aWindow;
	coomanPlusCore.aWindow = window;
	coomanPlus.standalone = false;
}

var xulWin = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						.getInterface(Components.interfaces.nsIWebNavigation)
						.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
						.treeOwner.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						.getInterface(Components.interfaces.nsIXULWindow);
xulWin.zLevel = xulWin.raisedZ;
