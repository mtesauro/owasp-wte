if (!JPEG) var JPEG = {};
JPEG.isJPEG = function(data) {
	var ba = new Flashbug.ByteArray(data);
	return (ba.readUI16() == 0xFFD8);
}
JPEG.getMetadata = function(data) {
	var ba = new Flashbug.ByteArray(data),
		w = 0,
		h = 0,
		comps = 0,
		len = ba.length;
	while (ba.position < len) {
		var marker = ba.readUI16();
		if (marker == 0xFFC0) {
			ba.readUI16(); // Length
			ba.readUI8(); // Bit Depth
			h = ba.readUI16();
			w = ba.readUI16();
			break;
		} else if (marker != 0xFFD8 && marker != 0xFFD9) {
			ba.position += ba.readUI16(); // Length
		}
	}
	
	return {
		format : "JPEG",
		width : w,
		height : h,
		bpp : comps * 8,
	}
}