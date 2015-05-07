/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
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
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
Components.utils.import("resource://cookiesmanagerplus/coomanPlusCore.jsm");
coomanPlusCore.lastKeyDown = [];

var coomanPlus = {
	_aWindow: null,
	_params: null,

	load: function()
	{
		coomanPlus.init();
	},

	init: function()
	{
		this._params = window.arguments[0];
		this._aWindow = coomanPlusCore.aWindow;
		coomanPlusCore.aWindow = window;

		var cookieBundle = document.getElementById("cookieBundle");
		document.title = cookieBundle.getString("promptDelete.window.title");
		document.getElementById("warning_left").value = cookieBundle.getString("promptDelete.label.warning.left");
		document.getElementById("warning_name").value = this._params.params[0] + ' @ ' + this._params.params[1];
		document.getElementById("warning_right").value = cookieBundle.getString("promptDelete.label.warning.right");
		document.getElementById("dontshow").label = cookieBundle.getString("promptDelete.label.dontshow");
		document.getElementById("dontshow").setAttribute("accesskey", cookieBundle.getString("promptDelete.label.dontshow.key"));
		document.getElementById("block").label = cookieBundle.getString("promptDelete.label.block").replace("#", this._params.params[1]);
		document.getElementById("block").setAttribute("accesskey", cookieBundle.getString("promptDelete.label.block.key"));
		document.getElementById("block").checked = this._params.block === true;
		if (this._params.params[2] == 1)
		{
			document.documentElement.getButton("extra1").hidden = true;
			document.documentElement.getButton("accept").hidden = true;
		}
		document.documentElement.getButton("extra2").label = cookieBundle.getString("promptDelete.button.Delete");
		document.documentElement.getButton("accept").label = cookieBundle.getString("promptDelete.button.DeleteAll") + " (" + this._params.params[2] + ")";
		document.documentElement.getButton("extra1").label = cookieBundle.getString("promptDelete.button.DoNotDelete");
		document.documentElement.getButton("help").label = cookieBundle.getString("promptDelete.button.Cancel");

		document.documentElement.getButton("extra2").setAttribute("accesskey", cookieBundle.getString("promptDelete.button.Delete.key"));
		document.documentElement.getButton("accept").setAttribute("accesskey", cookieBundle.getString("promptDelete.button.DeleteAll.key"));
		document.documentElement.getButton("extra1").setAttribute("accesskey", cookieBundle.getString("promptDelete.button.DoNotDelete.key"));
		document.documentElement.getButton("help").setAttribute("accesskey", cookieBundle.getString("promptDelete.button.Cancel.key"));
		document.documentElement.getButton("extra2").focus();
	},

	action: function(b)
	{
		coomanPlusCore.aWindow = this._aWindow;

		this._params.button = b;

		// delete = 1, delete all = 2, do not delete = 4, cancel = 3, close window = 0
		if (b != 3 && b != 0 && document.getElementById("dontshow").checked)
			this._params.window.coomanPlus.prefs.setBoolPref("delconfirm", false);

		if (b != 3 && b != 0)
			this._params.block = document.getElementById("block").checked;

		window.close();
	}
}
