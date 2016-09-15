coomanPlus.prefTemplateClipboard = {value: "", extra: false}
coomanPlus.prefTemplateFile = {value: "", extra: false};
coomanPlus.prefBackupEncrypt = false;
coomanPlus.prefBackupFileName = "";
coomanPlus.backupTemplate = {value: "{HOST}	{ISDOMAIN_RAW}	{PATH}	{ISSECURE_RAW}	{EXPIRES_RAW}	{NAME}	{CONTENT_RAW}\r\n\r\n", extra: false};
coomanPlus.exportGetData = function(t, s, a, u)
{
	if (typeof(s) == "undefined")
		var s = this.getTreeSelections(this._cookiesTree);

	if (!s.length)
		return;

	if (typeof(a) == "undefined")
		a = this._cookies;

	var data = "";
	for(var i = 0; i < s.length; i++)
	{
		if (u)
			data += this.exportTemplate(a[s[i]], t).replace(/\ttrue/g, "\tTRUE").replace(/\tfalse/g, "\tFALSE");
		else
			data += this.exportTemplate(a[s[i]], t);
	}
	return data;
}

coomanPlus.exportClipboard = function()
{
	var data = this.exportGetData(this.prefTemplateClipboard);
	var str = Cc["@mozilla.org/supports-string;1"]
						.createInstance(Ci.nsISupportsString);
	str.data = data;
	var trans = Cc["@mozilla.org/widget/transferable;1"]
							.createInstance(Ci.nsITransferable);
	trans.addDataFlavor("text/unicode");
	trans.setTransferData("text/unicode", str, data.length * 2);
	var clip = Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard);
	clip.setData(trans, null, Ci.nsIClipboard.kGlobalClipboard);
	return;

	Cc["@mozilla.org/widget/clipboardhelper;1"]
	.getService(Ci.nsIClipboardHelper)
	.copyString(str);
}

coomanPlus.exportFile = function()
{
	var s = this.getTreeSelections(this._cookiesTree);
	if (!s.length)
		return;

	var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
	if (s.length > 1)
	{
		var t = new Date();
		var filename = "cookies_"
										+ t.getFullYear()
										+ coomanPlus.right("00" + t.getMonth(), 2)
										+ coomanPlus.right("00" + t.getDate(), 2)
										+ coomanPlus.right("00" + t.getHours(), 2)
										+ coomanPlus.right("00" + t.getMinutes(), 2)
										+ coomanPlus.right("00" + t.getSeconds(), 2)
										+ ".txt";
	}
	else
		var filename = this._cookies[s[0]].rawHost + "_" + this._cookies[s[0]].name + ".txt";

	var fp = this.saveFileSelect(filename, "txt", this.string("export.file.save"));
	if (!fp)
		return;

	var content = this.exportGetData(this.prefTemplateFile);
	if (!content.length)
		return;

	if (this.saveFile(fp, content))
	{
		this.alert(this.strings.export_success)
	}
}

coomanPlus.exportTemplate = function(aCookie, t)
{
	var r = t.value;
	r = r.replace(/{NAME}/g,						aCookie.name);
	r = r.replace(/{CONTENT}/g,					aCookie.value);
//		r = r.replace(/{CONTENT}/g,					unescape(aCookie.value));
	r = r.replace(/{CONTENT_RAW}/g,			aCookie.value);
	r = r.replace(/{HOST}/g,						aCookie.host);
	r = r.replace(/{PATH}/g,						aCookie.path);
	r = r.replace(/{ISSECURE}/g,				aCookie.isSecure ? this.strings.secureYes : this.strings.secureNo);
	r = r.replace(/{ISSECURE_RAW}/g,		aCookie.isSecure);
	r = r.replace(/{EXPIRES}/g,					this.getExpiresString(aCookie.expires));
	r = r.replace(/{EXPIRES_RAW}/g,			aCookie.expires);
	r = r.replace(/{POLICY}/g,					this.string("policy"+aCookie.policy));
	r = r.replace(/{POLICY_RAW}/g,			aCookie.policy);
	r = r.replace(/{ISDOMAIN}/g,				this.string("yesno"+ (aCookie.isDomain ? 1 : 0)));
	r = r.replace(/{ISDOMAIN_RAW}/g,		aCookie.isDomain);

	r = r.replace(/{ISPROTECTED}/g,			this.string("yesno"+ (aCookie.isProtected ? 1 : 0)));
	r = r.replace(/{ISPROTECTED_RAW}/g,	aCookie.isProtected);

	if (t.extra)
	{
		if (!aCookie.extra)
			aCookie = this._cookieGetExtraInfo(aCookie);

		r = r.replace(/{CREATIONTIME}/g,			this.getExpiresString(Math.round(aCookie.creationTime/1000000)));
		r = r.replace(/{CREATIONTIME_RAW}/g,	aCookie.creationTime);
		r = r.replace(/{LASTACCESSED}/g,			this.getExpiresString(Math.round(aCookie.lastAccessed/1000000)));
		r = r.replace(/{LASTACCESSED_RAW}/g,	aCookie.lastAccessed);
		r = r.replace(/{ISHTTPONLY}/g,				this.string('yesno' + (aCookie.isHttpOnly?1:0)));
		r = r.replace(/{ISHTTPONLY_RAW}/g,		aCookie.isHttpOnly);
		r = r.replace(/{STATUS}/g,						this.string("status"+aCookie.status));
		r = r.replace(/{STATUS_RAW}/g,				aCookie.status);
	}
	return r;
}

coomanPlus.decrypt = function(data, pass, crc)
{
	return this.encrypt(data, pass, crc);
}

coomanPlus.encrypt = function(data, pass, crc)
{
	var pass = Base64.encode(pass); //work around some issues when used non-ASCII characters
	var n = 0, r = "";

	for(var i = 0; i < data.length; i++)
	{
		r += String.fromCharCode(data.charCodeAt(i) ^ pass.charCodeAt(n));
		if (++n >= pass.length)
			n = 0;
	}
	if (crc && crc != this.getHash(r))
		return null;

	return r;
}

coomanPlus.backupSelected = function()
{
	var l = [];
	var s = this.getTreeSelections(this._cookiesTree);
	this.backupAll([s, this._cookies]);
}

coomanPlus.backupAll = function(sel)
{
	var t = new Date();
	var file;
	if (this.prefBackupFileName)
		file = this.prefBackupFileName;
	else
		file = "backup_cookies_" + (sel ? "" : "all_")
						+ t.getFullYear()
						+ coomanPlus.right("00" + t.getMonth(), 2)
						+ coomanPlus.right("00" + t.getDate(), 2)
						+ coomanPlus.right("00" + t.getHours(), 2)
						+ coomanPlus.right("00" + t.getMinutes(), 2)
						+ coomanPlus.right("00" + t.getSeconds(), 2)
						+ ".txt";

	var a = this._cookiesAll, l = [];
	if (sel)
	{
		l = sel[0];
		a = sel[1];
	}
	else
	{
		for(var i = 0; i < this._cookiesAll.length; i++)
			l.push(i);
	}
	var t = this.clone(this.backupTemplate);
	if (this.cookieCuller.enabled && this.prefCookieCuller)
		t.value = t.value.replace("\r\n\r\n", "	{ISPROTECTED_RAW}\r\n\r\n");

	var data = this.exportGetData(t, l, a, true);

	if (!data.length)
		return;

	if (this.prefBackupEncrypt)
	{
		var password = this.promptPassword(null, null, true);
		if (password)
		{
			data = this.encryptData(password, data);
		}
	}

	var fp = this.saveFileSelect(file, "txt", this.string("export.file.save"));
	if (!fp)
		return;

	if (this.saveFile(fp, this.exportGetHeader() + data))
		this.alert(this.strings.export_success)
}

coomanPlus.encryptData = function(password, data)
{
	var md5 = this.getHash(data);
	var e = this.encrypt(data, password);
	var md5e = this.getHash(e);
	return "#encrypted" + md5 + md5e + e;
}
coomanPlus.exportGetHeader = function()
{
	return "#Created by Cookies Manager+ v" + this.app.version + " on " + Date() + "\r\n\r\n";
}

coomanPlus.backupAddPassword = function()
{
	var file = this.restoreOpen(true);
	if (!file)
	{
		this.alert(this.strings.restore_file_open_error);
		return;
	}
	if (file[4])
	{
		this.alert(this.strings.backup_already_encrypted);
		return;
	}
	var b = this.prefBackupEncrypt;
	this.prefBackupEncrypt = true;
	var cookies = file[1];
	if (!cookies)
		return;

	var l = [];
	for(var i = 0; i < cookies.length; i++)
		l.push(i);

	var t = this.clone(this.backupTemplate);
	if ("isProtected" in cookies[0])
		t.value = t.value.replace("\r\n\r\n", "	{ISPROTECTED_RAW}\r\n\r\n");

	var data = this.exportGetData(t, l, cookies, true);

	if (!data.length)
		return;

	var password = this.promptPassword(null, null, true, true);
	if (password)
	{
		data = this.encryptData(password, data);
	}
	else
	{
		this.alert(this.strings.password_notset);
		return;
	}
	var fp = this.saveFileSelect(file[2].file.path, "txt", this.string("export.file.save"));
	if (!fp)
	{
		this.alert(this.strings.password_notset)
		return;
	}
	var l = /^(#Created by Cookies Manager.*)$/m.exec(file[3]), h;
	if (l)
		h = l[1] + "\r\n\r\n";
	else
		h = this.exportGetHeader();

	if (this.saveFile(fp, h + data))
		this.alert(this.strings.password_set)
}

coomanPlus.backupRemovePassword = function()
{
	var file = this.restoreOpen();
	if (file)
	{
		switch(file[0])
		{
			case "canceled":
				return;
		}
		if (!file[4])
		{
			this.alert(this.strings.backup_notencrypted)
			return;
		}
	}
	else
		return;

	var cookies = file[1];
	if (!cookies)
		return;

	var l = [];
	for(var i = 0; i < cookies.length; i++)
		l.push(i);

	var t = this.clone(this.backupTemplate);
	if ("isProtected" in cookies[0])
		t.value = t.value.replace("\r\n\r\n", "	{ISPROTECTED_RAW}\r\n\r\n");

	var data = this.exportGetData(t, l, cookies, true);

	if (!data.length)
		return;

	var fp = this.saveFileSelect(file[2].file.path, "txt", this.string("export.file.save"));
	if (!fp)
	{
		this.alert(this.strings.backup_decrypt_failed)
		return;
	}
	if (this.saveFile(fp, file[3].substring(0, file[3].indexOf("#encrypted" + file[4][1] + file[4][2])) + data))
	{
		this.alert(this.strings.backup_decrypt_success)
	}
}

coomanPlus.promptPassword = function(msg, title, newPass, set)
{
	var r = {return: null, msg: msg, title: title, newPass: newPass, set: set};
	this._openDialog("password.xul", "", "chrome,resizable=no,centerscreen," + (this.isMac ? "dialog=no" : "modal"), r);
	return r.return;
}

coomanPlus.restoreSelected = function()
{
	this.restoreAll(true);
}

coomanPlus.restoreAll = function(sel)
{
	if (sel && this._selected.length == 0)
		return;

	var cookies = this.restoreOpen()[1];
	if (!cookies)
		return;

	this._noObserve = true;
	var num = 0;
	for(var i = 0; i < cookies.length; i++)
	{
		if (!sel || this._isSelected(cookies[i]))
		{
			coomanPlusCommon._cm2.add(cookies[i].host,
										cookies[i].path,
										cookies[i].name,
										cookies[i].value,
										cookies[i].isSecure,
										cookies[i].isHttpOnly,
										(cookies[i].expires) ? false : true,
										cookies[i].expires || Math.round((new Date()).getTime() / 1000 + 9999999999)
			);
			if (cookies[i].isProtected !== null && this.cookieCuller.enabled && this.prefCookieCuller)
				this.cookieCuller[cookies[i].isProtected ? "protect" : "unprotect"](cookies[i]);

			num++;
		}
	}
	this._noObserve = false;
	this.loadCookies();
	this.selectLastCookie(true);
	if (num > 0)
		this.alert(this.strings.restore_success.replace("#", num))
	else
		this.alert(this.strings.restore_none)
}

coomanPlus.restoreOpen = function(nopass)
{
	var nsIFilePicker = Ci.nsIFilePicker;
	var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	var localFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
	fp.init(window, this.strings["restore_file_open"], nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);
	var rv = fp.show();
	if (rv != nsIFilePicker.returnOK)
		return ["canceled"];


	var istream = Cc["@mozilla.org/network/file-input-stream;1"].
								createInstance(Ci.nsIFileInputStream);
	istream.init(fp.file, -1, -1, false);

	var bstream = Cc["@mozilla.org/binaryinputstream;1"].
								createInstance(Ci.nsIBinaryInputStream);
	bstream.setInputStream(istream);

	var fileData = bstream.readBytes(bstream.available());
	bstream.close();
	istream.close();
	var data = fileData;
	var encrypted = /#encrypted([0-9a-f]{32})([0-9a-f]{32})/.exec(data);
	if (encrypted)
	{
		if (nopass)
		{
			return ["encrypted", null, fp, fileData, encrypted];
		}
		data = data.substring(data.indexOf("#encrypted" + encrypted[1] + encrypted[2]) + 74, data.length);
		if (this.getHash(data) != encrypted[2])
		{
			this.alert(this.strings.backup_corrupted);
			return false;
		}

		var r = true, msg;
		while(1)
		{
			var password = this.promptPassword(msg, this.strings.backup_protected);
			if (password !== null)
			{
				let d = this.decrypt(data, password, encrypted[1]);
				if (d !== null)
				{
					data = d;
					break;
				}
				msg = this.strings.password_incorrect;
//					this.alert(this.strings.password_incorrect);
			}
			else
			{
				return false;
			}
		}
	}
	var lines = data.split("\r\n");
	var cookies = [], data = "";
	for (var i = 0; i < lines.length; i++)
	{
		var line = lines[i];
		if (line.length > 10 && line.match(/^[^#\s]/))
		{
			var s = line.split("\t");
			cookies.push(new this.cookieObject({
				host: s[0],
				name: s[5],
				path: s[2],
				value: s[6],
				expires: parseInt(s[4]),
				isSecure: s[3].toUpperCase() == "TRUE",
				isDomain: s[1].toUpperCase() == "TRUE",
				policy: 0
			}));
			cookies[cookies.length-1].isProtected = typeof(s[7]) == "undefined" ? null : s[7].toUpperCase() == "TRUE";
		}
	}

	return [false, cookies, fp, fileData, encrypted];
}

coomanPlus.saveFileSelect = function(filename, ext, title)
{
	var nsIFilePicker = Ci.nsIFilePicker;
	var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	var localFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
	fp.init(window, title, nsIFilePicker.modeSave);

	fp.defaultString = filename.replace(/\s*/g, '');
	fp.defaultExtension = ext;
	fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);
	var rv = fp.show();
	if (rv != nsIFilePicker.returnOK && rv != nsIFilePicker.returnReplace)
		return false;

	return fp;
}

coomanPlus.saveFile = function(fp, content)
{
//save file block taken from chrome://pippki/content/pippki.js
	var bundle = srGetStrBundle("chrome://pippki/locale/pippki.properties");
	var localFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
	var msg;
	var written = 0;
	try
	{
		localFile.initWithPath(fp.file.path);
		if (localFile.exists())
			localFile.remove(true);

		localFile.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0600);
		var fos = Cc["@mozilla.org/network/file-output-stream;1"].
							createInstance(Ci.nsIFileOutputStream);
		// flags: PR_WRONLY | PR_CREATE_FILE | PR_TRUNCATE
		fos.init(localFile, 0x04 | 0x08 | 0x20, 0600, 0);
		written = fos.write(content, content.length);
		if (fos instanceof Ci.nsISafeOutputStream)
			fos.finish();
		else
			fos.close();
	}
	catch(e) {
		switch (e.result) {
			case Components.results.NS_ERROR_FILE_ACCESS_DENIED:
				msg = bundle.GetStringFromName("writeFileAccessDenied");
				break;
			case Components.results.NS_ERROR_FILE_IS_LOCKED:
				msg = bundle.GetStringFromName("writeFileIsLocked");
				break;
			case Components.results.NS_ERROR_FILE_NO_DEVICE_SPACE:
			case Components.results.NS_ERROR_FILE_DISK_FULL:
				msg = bundle.GetStringFromName("writeFileNoDeviceSpace");
				break;
			default:
				msg = e.message;
				break;
		}
	}
	if (written != content.length)
	{
		if (!msg.length)
			msg = bundle.GetStringFromName("writeFileUnknownError");

			var ps = null;
			this.alert(bundle.GetStringFromName("writeFileFailure"),
										 bundle.formatStringFromName("writeFileFailed",
											 [ fp.file.path, msg ], 2));
		return false;
	}
	return true;
}

coomanPlus.getHash = function(str)
{
	var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
			createInstance(Ci.nsIScriptableUnicodeConverter);

	// we use UTF-8 here, you can choose other encodings.
	converter.charset = "UTF-8";
	// result is an out parameter,
	// result.value will contain the array length
	var result = {};
	// data is an array of bytes
	var data = converter.convertToByteArray(str, result);
	var ch = Cc["@mozilla.org/security/hash;1"]
						.createInstance(Ci.nsICryptoHash);
	ch.init(ch.MD5);
	ch.update(data, data.length);
	var hash = ch.finish(false);
	// return the two-digit hexadecimal code for a byte
	function toHexString(charCode)
	{
		return ("0" + charCode.toString(16)).slice(-2);
	}
	// convert the binary hash data to a hex string.
	return [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
}
