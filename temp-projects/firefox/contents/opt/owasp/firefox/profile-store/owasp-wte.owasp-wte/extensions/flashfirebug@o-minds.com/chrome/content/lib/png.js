// If ImageData begins with the eight bytes 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
if (!PNG) var PNG = {};
PNG.isPNG = function(data) {
	var ba = new Flashbug.ByteArray(data);
	return (ba.readUI8() == 0x89 && ba.readUTFBytes(3) == "PNG");
}
PNG.getMetadata = function(data) {
	var ba = new Flashbug.ByteArray(data);
	ba.position = 16;
	var w = ba.readUI32(),
		h = ba.readUI32(),
		bpc = ba.readUI8(),
		ct = ba.readUI8(),
		bpp = bpc;
		
	if (ct == 4) bpp *= 2;
	if (ct == 2) bpp *= 3;
	if (ct == 6) bpp *= 4;

	var alpha = ct >= 4;
	return {
		format : "PNG",
		width : w,
		height : h,
		bpp : bpp,
		alpha : alpha
	}
}