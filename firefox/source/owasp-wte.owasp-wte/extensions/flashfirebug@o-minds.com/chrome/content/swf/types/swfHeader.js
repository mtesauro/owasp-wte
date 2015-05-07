/*
All SWF files begin with the following header.
*/
function SWFHeader(ba) {
	function formatSize(bytes) {
		// Get size precision (number of decimal places from the preferences)
		// and make sure it's within limits.
		var sizePrecision = 2;
		sizePrecision = (sizePrecision > 2) ? 2 : sizePrecision;
		sizePrecision = (sizePrecision < -1) ? -1 : sizePrecision;
	
		if (sizePrecision == -1) return bytes + " B";
	
		var a = Math.pow(10, sizePrecision);
	
		if (bytes == -1 || bytes == undefined) {
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
	
	function formatNumber(number) {
		number += "";
		var x = number.split(".");
		var x1 = x[0];
		var x2 = x.length > 1 ? "." + x[1] : "";
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, "$1" + "," + "$2");
		}
		return x1 + x2;
	}
	
	this.signature = ba.readString(3);
	if(this.signature == "CWS") {
		// Compressed
	} else if(this.signature != "FWS") {
		this.error = "swf";
		this.byteArray = null;
		return; // Not a SWF
	}
	
	this.version = ba.readUI8();
	this.fileLength = ba.readUI32();
	this.fileLength = formatSize(this.fileLength) + " (" + formatNumber(this.fileLength) + ")";
	
	if (this.signature == "CWS") {
		this.fileLengthCompressed = formatSize(ba.length) + " (" + formatNumber(ba.length) + ")";
		ba = new Flashbug.Zip(ba).deflate();
	}
	
	this.frameSize = new Rect(ba);
	this.frameSize.fromTwips();
	this.frameRate = ba.readUI16() / 256;
	this.frameCount = ba.readUI16();
	this.byteArray = ba;
	
};