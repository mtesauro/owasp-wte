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

		if (this._params.title)
			document.title = this._params.title;

		document.getElementById("msg").value = this._params.msg;
		document.getElementById("msg").collapsed = !this._params.msg;

		document.getElementById("password").focus();
		if (!this._params.newPass)
		{
			document.getElementById("pass2").collapsed = true;
			document.getElementById("msg.warning").collapsed = true;
		}
		document.getElementById("msg.info").collapsed = !this._params.newPass || this._params.set ? true : false;
		this.check();
	},

	check: function()
	{
		document.documentElement.getButton("accept").disabled = (this._params.newPass && (document.getElementById("password").value == "" || document.getElementById("password").value != document.getElementById("password2").value))
	},

	action: function(b)
	{
		coomanPlusCore.aWindow = this._aWindow;

		if (b)
			this._params.return = document.getElementById("password").value;
		window.close();
	}
}
