// http://s.ytimg.com/yt/swfbin/watch_as3-vflwQAc_A.swf
if (!SWF) var SWF = {};
SWF.isSWF = function(data) {
	var ba = new Flashbug.ByteArray(data),
		signature = ba.readString(3);
	return (signature == "CWS" || signature == "FWS");
}