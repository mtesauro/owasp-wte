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
	_params: null,
	focused: null,
	_aWindow: null,

	_addFlag: false,
	_addFlagNew: false,
	_curCookie: null,
	_newCookie: null,
	_cb: null, //cookie bundle
	_cb2: null, //cookie bundle
	_parent: null,
	_multi: false,
	backup: {},
	prefs: coomanPlusCommon.prefs,

	load: function()
	{
		coomanPlus.init();
	},

	init: function()
	{
		this._aWindow = coomanPlusCore.aWindow;
		coomanPlusCore.aWindow = window;

		this._params = window.arguments[0];
		this._parent = this._params.document;

		this._addFlag = this._params.type == "add";
		this._cb = document.getElementById("cookieBundle");
		this._cb2 = document.getElementById("bundlePreferences");

		document.getElementById('ifl_isSecureYes').label = document.getElementById('ifl_isSecureYes').value = this.string("forSecureOnly");
		document.getElementById('ifl_isSecureNo').label = document.getElementById('ifl_isSecureNo').value = this.string("forAnyConnection");

		if (this._params.cookies) //this._params.window.coomanPlus._selected.length == 1)
		{
			this._multi = (this._params.cookies.length > 1);
			var aCookie = this.clone(this._cookieGetExtraInfo(this._params.cookies[0]));
			if (this._addFlag)
			{
				aCookie.name = "";
				aCookie.value = "";
			}

			this._curCookie = new this.cookieObject(aCookie);
		}
		else
			this._curCookie = new this.cookieObject({name:"",value:"",host:"",path:"",isSecure:false,expires:0,policy:0,isHttpOnly:false});
		document.getElementById("ifl_name").disabled = this._multi;
		document.getElementById("ifl_host").disabled = this._multi;
		document.getElementById("ifl_path").disabled = this._multi;
		if (this._multi)
		{
			document.getElementById("c_name").disabled = this._multi;
			document.getElementById("c_host").disabled = this._multi;
			document.getElementById("c_path").disabled = this._multi;
			this.backup["c_name"] = document.getElementById("c_name").checked;
			this.backup["c_host"] = document.getElementById("c_host").checked;
			this.backup["c_path"] = document.getElementById("c_path").checked;
			document.getElementById("c_name").checked = false;
			document.getElementById("c_host").checked = false;
			document.getElementById("c_path").checked = false;
			document.title += " (" + this._params.cookies.length + " " + this.string("cookies") + ")";
		}
		for(var i in this._curCookie)
		{
			if (!document.getElementById("c_" + i))
				continue;

			if (this._addFlag)
				document.getElementById("c_" + i).disabled = true;

			document.getElementById("c_" + i).setAttribute("checked", !this._multi && this._addFlag ? true : document.getElementById("c_" + i).checked);
			document.getElementById("c_" + i).addEventListener("CheckboxStateChange", this.enableDisable, false);
			this.enableDisableChildren(document.getElementById("c_" + i));
		}
		document.getElementById("ifl_expires_date").addEventListener("change", this.fixDate, true);
		document.getElementById("ifl_expires_time").addEventListener("change", this.fixTime, true);
		document.getElementById("ifl_expires_Year").addEventListener("DOMMouseScroll", this.mouseScroll, false);
		document.getElementById("ifl_expires_Month").addEventListener("DOMMouseScroll", this.mouseScroll, false);
		document.getElementById("ifl_expires_Day").addEventListener("DOMMouseScroll", this.mouseScroll, false);
		document.getElementById("ifl_expires_Hours").addEventListener("DOMMouseScroll", this.mouseScroll, false);
		document.getElementById("ifl_expires_Minutes").addEventListener("DOMMouseScroll", this.mouseScroll, false);
		document.getElementById("ifl_expires_Seconds").addEventListener("DOMMouseScroll", this.mouseScroll, false);
		window.addEventListener("focus", this.focus, true);
		if (this._addFlag)
		{
			document.title = this.string("CookieEditDlg.titleAdd");
			document.getElementById("editCookie").hidden = false;

			document.getElementById('ifl_isSecure').value = document.getElementById('ifl_isSecureNo').value;

			document.getElementById("expr_selection").value = "expr_new";

			var newdate = (new Date());

			//add a day to the default time, so it does not expire right away.
			var newdate = (this.dateAdd(newdate, "d", 1));

			document.getElementById("ifl_expires_date").value = this.getDateStr(newdate);
			document.getElementById('ifl_expires_time').value = this.getTimeStr(newdate); //newdate.getHours() + ':' + newdate.getMinutes() + ':' +newdate.getSeconds();

			this.rebuildDateSelection(document.getElementById("expr_new"), true);
			//set date/time picker fields
		}
		this.setFieldProps();
		this.showNew();
	},

	unload: function()
	{
		coomanPlus.uninit();
	},

	uninit: function()
	{

		coomanPlusCore.aWindow = this._aWindow;

		for(var i in this._curCookie)
		{
			if (!document.getElementById("c_" + i))
				continue;

			document.getElementById("c_" + i).removeEventListener("CheckboxStateChange", this.enableDisable, false);
		}
		document.getElementById("ifl_expires_date").removeEventListener("change", this.fixDate, true);
		document.getElementById("ifl_expires_time").removeEventListener("change", this.fixTime, true);
		document.getElementById("ifl_expires_Day").removeEventListener("DOMMouseScroll", this.mouseScroll, false);
		document.getElementById("ifl_expires_Month").removeEventListener("DOMMouseScroll", this.mouseScroll, false);
		document.getElementById("ifl_expires_Year").removeEventListener("DOMMouseScroll", this.mouseScroll, false);
		document.getElementById("ifl_expires_Hours").removeEventListener("DOMMouseScroll", this.mouseScroll, false);
		document.getElementById("ifl_expires_Minutes").removeEventListener("DOMMouseScroll", this.mouseScroll, false);
		document.getElementById("ifl_expires_Seconds").removeEventListener("DOMMouseScroll", this.mouseScroll, false);

		for(var i in this.backup)
			document.getElementById(i).setAttribute("checked", this.backup[i]);

		window.removeEventListener("focus", this.focus, true);
	},

	focus: function(e)
	{
		coomanPlus.focused = "id" in e.target ? e.target.id : null;
	},

	setAttribute: function (obj, attr, value, remove)
	{
		if (typeof(obj) == "string")
			obj = document.getElementById(obj);

		var c = obj.childNodes;
		var command = remove ? "removeAttribute" : "setAttribute";
		obj[command](attr, value);
		for(var i = 0; i < c.length; i++)
		{
			if (c[i][command])
				c[i][command](attr, value);

			if (c[i].childNodes.length > 0)
				coomanPlus.setAttribute(c[i], attr, value, remove);
		}
	},

	enableDisable: function(e)
	{
		e.target.setAttribute("checked", e.target.checked); //work around of bug https://bugzilla.mozilla.org/show_bug.cgi?id=15232
		coomanPlus.enableDisableChildren(e.target);
		coomanPlus.showNew();
	},

	enableDisableChildren: function(obj)
	{
		this.setAttribute(obj.parentNode.nextSibling, "disabled", !obj.checked, obj.checked);
	},

	secure: function()
	{
		document.getElementById("secure").hidden = document.getElementById('ifl_isSecure').value == document.getElementById('ifl_isSecureNo').value;
	},

	mouseScroll: function(e)
	{
		if (e.axis != e.VERTICAL_AXIS)
			return true;
	/*

	var t = "";
	var a = e.target;
	for(var i in a)
		t = t + i + ": " + a[i] + "\n";
	alert(t);
	*/
		if (e.target.id != coomanPlus.focused)
		{
	//		return true;
			e.target.focus();
		}
		var dir = e.detail > 0 ? "down" : "up";
		var s = e.target.parentNode.getElementsByTagName("spinbuttonsH");
		if (s.length)
		{
			coomanPlus.spinEvent("", s[0], dir);
		}

	},

	setFieldProps: function()
	{
		var field;
		var i;
		var d = document;


		var props = [
			{id: "ifl_name", value: this._curCookie.name, readonly: true, hidden: false },
			{id: "ifl_value", value: this._curCookie.value, readonly: false, hidden: false },
			{id: "ifl_host", value: this._curCookie.host, readonly: true, hidden: false },
			{id: "ifl_path", value: this._curCookie.path, readonly: true, hidden: false },
			{id: "ifl_isSecure",
			 value: this._curCookie.isSecure ?
							this.string("forSecureOnly") :
							this.string("forAnyConnection"), readonly: false, hidden: false },
			{id: "ifl_expires", value: this._curCookie.expires, readonly: true, hidden: true },
			{id: "ifl_expires_date", value: "", readonly: true, hidden: false },
			{id: "ifl_expires_time", value: "", readonly: true, hidden: false },
			{id: "ifl_isHttpOnly", value: this._curCookie.isHttpOnly ? "true" : "false" , readonly: true, hidden: false },
		];


		for(i = 0; i < props.length; i++ )
		{
			field						= d.getElementById(props[i].id);
			field.value			= props[i].value;
			field.readonly	= props[i].readonly;
			field.hidden		= props[i].hidden;
		}

		this.secure();
		//rearrange radio bttons if this is a session cookie
		var sel = "new";
		if (!this._curCookie.expires)
		{
			sel = "session";
			var newdate = (new Date());

			//add a day to the default time, so it does not expire right away.
			var newdate = (this.dateAdd(newdate, "d", 1));

			d.getElementById("ifl_expires_date").value = this.getDateStr(newdate);
			d.getElementById('ifl_expires_time').value = this.getTimeStr(newdate); //newdate.getHours() + ':' + newdate.getMinutes() + ':' +newdate.getSeconds();

		}
		else
		{
			d.getElementById("ifl_expires_date").value = this.getDateStr(new Date(d.getElementById("ifl_expires").value*1000))
			d.getElementById('ifl_expires_time').value = this.getTimeStr(new Date(d.getElementById("ifl_expires").value*1000))
		}

		d.getElementById("expr_selection").value  = "expr_" + sel;
		//collapse the new date dialog
	//  d.getElementById("datetimepickerbox").hidden = true;
		this.rebuildDateSelection(document.getElementById("expr_" + sel));
		//set date/time picker fields
		this.fixDate();
		this.setDateField();
		this.fixTime();
		this.setTimeField();
	},

	rebuildDateSelection: function(radio, noresize)
	{
		if (radio.id == "expr_new")
			document.getElementById("datetimepickerbox").collapsed = false;
		else
			document.getElementById("datetimepickerbox").collapsed = true;
		this.showWarning();
		if (!noresize)
			this.resizeWindow();
	},

	getExpireSelection: function()
	{
		switch (document.getElementById('expr_selection').value)
		{
			case "expr_new":
				return Date.parse(document.getElementById('ifl_expires_date').value + ' ' + document.getElementById('ifl_expires_time').value) / 1000;
			case "expr_session":
				return false;
			default:
				return this._curCookie.expires;
		}
		return this._curCookie.expires;

	},


	test_url: function(host, path)
	{
		var temp;

		//check url
		try
		{
			var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
			temp = "http://" + host + "/";
			var newuri = ioService.newURI(temp, null, null);
			try
			{
				newuri = '';
				temp = '';
				temp = "http://" + host + "/" + path
				newuri = ioService.newURI(temp, null, null);
			}
			catch(e)
			{
				return 'not a valid path: ' + path;
			}
			return 0;
		}
		catch(e)
		{
			return 'not a valid host: ' + host;
		}
	},

	createNewCookie:function(check)
	{
		var check = typeof(check) == "undefined" ? true : check;
		var name = this.trim(document.getElementById("ifl_name").value);
		var value = document.getElementById("ifl_value").value;
		var host = this.trim(document.getElementById("ifl_host").value);
		var path = this.trim(document.getElementById("ifl_path").value);
		var isHttpOnly = (document.getElementById("ifl_isHttpOnly").value == "true");
		if (check)
		{
			var isValidURI = this.test_url(host, path);

			if ( isValidURI != 0 )
			{
				alert('Error: \n' + isValidURI);
				return false;
			}

			if ( !(name.length > 0) )
			{
				alert('Error: \n' + 'please specify name');
				return false;
			}
/*
			if ( !(value.length > 0) ) {
				alert('Error: \n' + 'please specify value');
				return false;
			}
*/
		}
		this._newCookie = new this.cookieObject({
												name: name,
												value: value,
												host: host,
												path:path,
												isSecure: document.getElementById("ifl_isSecure").value == coomanPlus.string("forSecureOnly"),
												expires: this.getExpireSelection(),
												policy: this._curCookie.policy,
												isHttpOnly: isHttpOnly
											});
		return true;

	},

	_cookieEquals: function (aCookieA, aCookieB)
	{
		return this.trim(aCookieA.host) == this.trim(aCookieB.host) &&
					 this.trim(aCookieA.name) == this.trim(aCookieB.name) &&
					 this.trim(aCookieA.path) == this.trim(aCookieB.path);
	},

	cookieMerge: function(a, b)
	{
		var r = {};
		for(var i in a)
		{
			r[i] = a[i];
			if (document.getElementById("c_" + i))
				if (document.getElementById("c_" + i).checked)
					r[i] = b[i];
		}

		return r;
	},

	saveCookie: function(asNew)
	{
		asNew = typeof(asNew) == "undefined" ? false : true;
	//out_d2("Cookie Manager::SaveCookie::BEGIN");

		var d= document;

		if (!this.createNewCookie())
			return false;

		var exists = coomanPlusCommon._cm2.cookieExists(this._newCookie);
		var cookieEqual = this._cookieEquals(this._curCookie, this._newCookie);
		if (!cookieEqual && exists)
		{
			if (!window.confirm(this.string("exists.overwrite")))
				return;
		}
		var list = this._params.cookies;
		if (!list)
			list = [this._curCookie];

		var selected = [];
		for(var i = 0; i < list.length; i++)
		{
			var aCookie = this.cookieMerge(list[i], this._newCookie);
			cookieEqual = this._cookieEquals(aCookie, list[i]);
			if(this._addFlag
					|| (!this._addFlag && !exists)
					|| !cookieEqual
					|| (aCookie.value != list[i].value)
					|| (aCookie.expires != list[i].expires)
					|| (aCookie.isSecure != list[i].isSecure)
					|| (aCookie.isHttpOnly!= list[i].isHttpOnly)
				)
			{
				this._params.window.coomanPlus._noObserve = true;
				if (!this._addFlag && !asNew && !cookieEqual)
				{
					coomanPlusCommon._cm.remove(list[i].host, list[i].name, list[i].path, false);
				}
				coomanPlusCommon._cm2.add(aCookie.host,
											aCookie.path,
											aCookie.name,
											aCookie.value,
											aCookie.isSecure,
											aCookie.isHttpOnly,
											(aCookie.expires) ? false : true,
											aCookie.expires || Math.round((new Date()).getTime() / 1000 + 9999999999)
				);
				this._params.window.coomanPlus._noObserve = false;
			}
			selected.push(aCookie);
		}
		this._params.window.coomanPlus._selected = selected;
		this._params.window.coomanPlus.loadCookies(this._parent.getElementById('lookupcriterium').getAttribute("filter"));

	//out_d2("Cookie Manager::SaveCookie::END");
		window.close();

		return true;

	},

//http://rishida.net/tools/conversion/
	convertCharStr2jEsc: function ( str, cstyle )
	{
		// Converts a string of characters to JavaScript escapes
		// str: sequence of Unicode characters
		var highsurrogate = 0;
		var suppCP;
		var pad;
		var n = 0;
		var outputString = '';
		for (var i = 0; i < str.length; i++)
		{
			var cc = str.charCodeAt(i);
			if (cc < 0 || cc > 0xFFFF)
			{
				this.dump('Error in convertCharStr2jEsc: unexpected charCodeAt result, cc=' + cc + '!');
				return str;
			}
			if (highsurrogate != 0) // this is a supp char, and cc contains the low surrogate
			{
				if (0xDC00 <= cc && cc <= 0xDFFF)
				{
					suppCP = 0x10000 + ((highsurrogate - 0xD800) << 10) + (cc - 0xDC00);
					if (cstyle)
					{
						pad = suppCP.toString(16);
						while (pad.length < 8) { pad = '0'+pad; }
						outputString += '\\U'+pad;
					}
					else
					{
						suppCP -= 0x10000;
						outputString += '\\u'+ dec2hex4(0xD800 | (suppCP >> 10)) +'\\u'+ dec2hex4(0xDC00 | (suppCP & 0x3FF));
					}
					highsurrogate = 0;
					continue;
				}
				else
				{
					this.dump('Error in convertCharStr2jEsc: low surrogate expected, cc=' + cc + '!');
					return str;
				}
			}
			if (0xD800 <= cc && cc <= 0xDBFF) // start of supplementary character
			{
				highsurrogate = cc;
			}
			else // this is a BMP character
			{
				//outputString += dec2hex(cc) + ' ';
				switch (cc)
				{
					case 0: outputString += '\0'; break;
					case 8: outputString += '\b'; break;
					case 9: outputString += '\t'; break;
					case 10: outputString += '\n'; break;
					case 13: outputString += '\r'; break;
					case 11: outputString += '\v'; break;
					case 12: outputString += '\f'; break;
					case 34: outputString += '\"'; break;
					case 39: outputString += '\''; break;
					case 92: outputString += '\\'; break;
					default:
						if (cc > 0x1f && cc < 0x7F)
						{
							outputString += String.fromCharCode(cc);
						}
						else
						{
							pad = cc.toString(16).toUpperCase();
							while (pad.length < 4)
							{
								pad = '0'+pad;
							}
							outputString += '\\u'+pad;
						}
				}
			}
		}
		return outputString;
	},

	showNew: function()
	{
		var d = document;
		this.createNewCookie(false);
		try
		{
			coomanPlusCommon._cm2.cookieExists(this._newCookie);
			var ok = true;
		}
		catch(e)
		{
			var ok = false;
		}
		var e = (!ok
							|| !this.trim(d.getElementById('ifl_name').value)
							||	!this.trim(d.getElementById('ifl_host').value)
							||	(!d.getElementById('c_name').checked
										&& !d.getElementById('c_host').checked
										&& !d.getElementById('c_path').checked
										&& !d.getElementById('c_value').checked
										&& !d.getElementById('c_expires').checked
										&& !d.getElementById('c_isSecure').checked
									)
						);

		d.getElementById("editCookie").disabled = e;
		if (this._addFlag || this._multi)
			return;

		var aCookie = this.cookieMerge(this._curCookie, this._newCookie);
		this._addFlagNew = !this._cookieEquals(aCookie, this._curCookie);
		d.getElementById("editCookieNew").hidden = false;
		if (this._addFlagNew && !e)
		{
			d.getElementById("editCookieNew").disabled = false;
	//    d.getElementById("editCookie").style.fontWeight = "normal";
		}
		else
		{
			d.getElementById("editCookieNew").disabled = true;
	//    d.getElementById("editCookie").style.fontWeight = "bold";
		}
	},

	saveCookiesCheck: function(e)
	{
//		if (e.keyCode == KeyEvent.DOM_VK_RETURN && (this._addFlag || !this._addFlagNew))
		if (e.keyCode == KeyEvent.DOM_VK_RETURN && !document.getElementById("editCookie").disabled)
		{
			return this.saveCookie();
		}
		return false;
	},
};