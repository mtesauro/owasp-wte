(function() {

importScripts('../lib/byteArray.js', 'amf0.js', 'amf3.js');

// AMF Version Constants
const AMF0_VERSION = 0;
const AMF1_VERSION = 1; // There is no AMF1 but FMS uses it for some reason, hence special casing.
const AMF3_VERSION = 3;

var amf0 = new Flashbug.AMF0();

function trace() {
	var str = '';
	var arr = [];
	for (var i = 0, l = arguments.length; i < l; i++) {
		str += arguments[i];
		arr[i] = arguments[i];
		if (i != (l - 1)) str += ', ';
	}
	str += '\n';
	
	postMessage({
        type: "debug",
        message: arr
    });
	
	//dump(str);
}
var ERROR = trace;

// From Firebug Lib //
function formatSize(bytes) {

	// Get size precision (number of decimal places from the preferences)
	// and make sure it's within limits.
	var sizePrecision = 2;
	sizePrecision = (sizePrecision > 2) ? 2 : sizePrecision;
	sizePrecision = (sizePrecision < -1) ? -1 : sizePrecision;

	if (sizePrecision == -1) return bytes + " B";

	var a = Math.pow(10, sizePrecision);

	if (bytes == -1 || bytes == undefined) {
		return "-1";
	} else if(bytes == undefined) {
		return "?";
	} else if (bytes == 0) {
		return "0";
	} else if (bytes < 1024) {
		return bytes + " B";
	} else if (bytes < (1024*1024)) {
		return Math.round((bytes/1024)*a)/a + " KB";
	} else {
		return Math.round((bytes/(1024*1024))*a)/a + " MB";
	}
}

/**
 * Similar to AMF 0, AMF 3 object reference tables, object trait reference tables and string reference 
 * tables must be reset each time a new context header or message is processed.
 * 
 * Note that Flash Player 9 will always set the second byte to 0×03, regardless of whether the message was sent in AMF0 or AMF3.
 * 
 * @param	data
 */
onmessage = function(event) {
	var ba = new Flashbug.ByteArray(event.data, Flashbug.ByteArray.BIG_ENDIAN);
	
	var obj = { };
	obj.headers = [];
	obj.bodies = [];
	
	// Read Header
	obj.version = ba.readUnsignedShort();
	switch(obj.version) {
		case AMF0_VERSION:
			obj.versionInfo = "Flash Player 8 and Below";
			break;
		case AMF1_VERSION:
			obj.versionInfo = "Flash Media Server";
			break;
		case AMF3_VERSION:
			obj.versionInfo = "Flash Player 9+";
			break;
	}
	
	if (obj.version != AMF0_VERSION && obj.version != AMF3_VERSION) {
		//Unsupported AMF version {version}.
		throw new Error("Unsupported AMF version " + obj.version);     
	}
	
	var numHeaders = ba.readUnsignedShort(); //  find the total number of header elements return
	while (numHeaders--) {
		amf0.reset();
		var name = ba.readUTF();
		var required = !!ba.readUnsignedByte(); // find the must understand flag
		var length = ba.readUnsignedInt(); // grab the length of the header element, -1 if unknown
		var data = amf0.readData(ba); // turn the element into real data
		
		obj.headers.push({ name:name, mustUnderstand:required, length:formatSize(length), data:data }); // save the name/value into the headers array
	}
	
	// Read Body
	var numBodies = ba.readUnsignedShort(); // find the total number of body elements
	while (numBodies--) {
		amf0.reset();
		var targetURI = ba.readUTF(); // When the message holds a response from a remote endpoint, the target URI specifies which method on the local client (i.e. AMF request originator) should be invoked to handle the response.
		var responseURI = ba.readUTF(); // The response's target URI is set to the request's response URI with an '/onResult' suffix to denote a success or an '/onStatus' suffix to denote a failure.
		var length = ba.readUnsignedInt(); // grab the length of the body element, -1 if unknown
		var data = amf0.readData(ba); // turn the element into real data
		
		obj.bodies.push({ targetURI:targetURI, responseURI:responseURI, length:formatSize(length), data:data }); // add the body element to the body object
	}
	
	postMessage(obj);
}

})();