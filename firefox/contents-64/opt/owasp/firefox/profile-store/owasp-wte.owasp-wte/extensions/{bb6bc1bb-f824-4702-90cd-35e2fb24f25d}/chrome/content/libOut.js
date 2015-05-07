coomanPlus.dump = function (aMessage, obj)
{
	var r = "";
	var t = typeof(aMessage);
	if (obj && t != "string" && t != "number" && t != "bool")
	{
		for(var i in aMessage)
			try
			{
				r = r + i + ": " + aMessage[i] + "\n";
			}catch(e){r = r + i + ": " + e + "\n"};


		if (r)
			r = "\n-------------\n"+t+"\n"+r;
	}
	Components.classes["@mozilla.org/consoleservice;1"]
		.getService(Components.interfaces.nsIConsoleService)
		.logStringMessage("CookiesManager+: " + aMessage + r);
};
function out(s)
{
	coomanPlus.dump(s);
}

function out_d(s)
{

}

function out_d2(s)
{
	coomanPlus.dump('  DBG2: ' + s +'\n');
}
