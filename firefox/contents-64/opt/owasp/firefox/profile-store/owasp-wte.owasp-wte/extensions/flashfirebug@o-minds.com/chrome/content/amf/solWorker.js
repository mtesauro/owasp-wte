(function() {

importScripts('../lib/byteArray.js', 'amf0.js', 'amf3.js');

var amf0 = new Flashbug.AMF0();
var amf3 = new Flashbug.AMF3();

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
	
// Parse the individual file
onmessage = function(event) {
	var id = event.data.fileID;
	var ba = new Flashbug.ByteArray(event.data.text, Flashbug.ByteArray.BIG_ENDIAN);
	var obj = { };
	amf0.reset();
	amf3.reset();
	
	// Read Header
	var nLenFile = ba.getBytesAvailable();
	obj.header = {};
	
	// Unknown header 0x00 0xBF
	ba.readUnsignedShort();
	
	// Length of the rest of the file (filesize - 6)
	var nLenData = ba.readUnsignedInt();
	if (nLenFile != nLenData + 6) {
		throw new Error('Data Length Mismatch');
		return;
	}
	
	// Signature, 'TCSO'
	ba.readUTFBytes(4);
	
	// Unknown, 6 bytes long 0x00 0x04 0x00 0x00 0x00 0x00 0x00
	ba.readUTFBytes(6);
	
	// Read SOL Name
	obj.header.fileName = ba.readUTFBytes(ba.readUnsignedShort());
	
	// AMF Encoding
	obj.header.amfVersion = ba.readUnsignedInt();
	
	if(obj.header.amfVersion === 0 || obj.header.amfVersion === 3) {
		if(obj.header.fileName == "undefined") obj.header.fileName = "[SOL Name not Set]";
	} else {
		obj.header.fileName = "[Not yet supported sol format]";
	}
	
	// Read Body
	if(obj.header.amfVersion == 0 || obj.header.amfVersion == 3) {
		obj.body = {};
		while(ba.getBytesAvailable() > 1) {
			try {
				var varName = "";
				var varVal;
				if (obj.header.amfVersion == 3) {
					varName = amf3.readString(ba);
					varVal = amf3.readData(ba);
				} else {
					varName = ba.readUTF();
					varVal = amf0.readData(ba);
				}
				ba.readUnsignedByte(); // Ending byte
				obj.body[varName] = varVal;
			} catch(e) {
				dump(id + "- " + e + "\n");
				return;
			}
		}
	}
	
	postMessage({fileID:id, data:obj});
};

})();