// If ImageData begins with the six bytes 0x47 0x49 0x46 0x38 0x39 0x61
// http://www.onicos.com/staff/iz/formats/
// https://plusone.google.com/_/scs/flash/plusOne_1.swf
if (!GIF) var GIF = {};
GIF.isGIF = function(data) {
	var ba = new Flashbug.ByteArray(data);
	return (ba.readUTFBytes(3) == "GIF");
}
GIF.getMetadata = function(data) {
	function readUnsigned(ba) {
		var b1 = ba.readUI8(), b2 = ba.readUI8();
		return (b2 << 8) + b1;
	}
	
	var ba = new Flashbug.ByteArray(data),
		header = ba.readUTFBytes(3),
		version = ba.readUTFBytes(3),
		w = readUnsigned(ba),
		h = readUnsigned(ba),
		bpp = ((ba.readUI8() >> 4) & 7) + 1,
		bgColor = ba.readUI8(),
    	pixelAspectRatio = ba.readUI8(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64

	return {
		format : header + version,
		version : version,
		width : w,
		height : h,
		bpp : bpp,
		bgColor : bgColor,
		pixelAspectRatio : pixelAspectRatio
	}
}