/*
DefineBitsLossless2 extends DefineBitsLossless with support for opacity (alpha values). The
colormap colors in colormapped images are defined using RGBA values, and direct images
store 32-bit ARGB colors for each pixel. The intermediate 15-bit color depth is not available
in DefineBitsLossless2.
The minimum file format version for this tag is SWF 3.
*/
function DefineBitsLossless2(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.format = ba.readUI8();
	this.width = ba.readUI16();
	this.height = ba.readUI16();
	if (this.format == BitmapFormat.BIT_8) this.colorTableSize = ba.readUI8() + 1;
	
	this.zlibBitmapData = ba.readBytes(this.header.contentLength - (this.format == BitmapFormat.BIT_8 ? 8 : 7));
	this.colorData = new Flashbug.Zip(new Flashbug.ByteArray(this.zlibBitmapData)).unzip(true);
	/*if (this.format == BitmapFormat.BIT_8) {
		this.zlibBitmapData = new AlphaColorMapData(ba, this.colorTableSize, this.zlibBitmapData.length);
	} else {
		this.zlibBitmapData = new AlphaBitmapData(ba, this.zlibBitmapData.length);
	}*/
	
	//this.size = this.colorData.length; // *
	//this.type = 'Image'; // *
	this.imageType = this.format != BitmapFormat.BIT_8 ? "PNG" : "GIF89a"; // *
}