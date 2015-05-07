// http://www.hulu.com/site-player/110075/player.swf?cb=110075 http://chrome.plantsvszombies.com/
if (!XML) var XML = {};
XML.isXML = function(data) {
	var ba = new Flashbug.ByteArray(data),
		signature = ba.readString(50),
		re = /<[^>]+>/;
	// Not all have the xml header, some just are xml data
	return signature.match(re);//(signature == "<?xml");
}