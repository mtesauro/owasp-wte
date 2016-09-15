/*
Defines a lossless bitmap character that contains RGB bitmap data compressed with ZLIB.
Two kinds of bitmaps are supported. Colormapped images define a colormap of up to 256
colors, each represented by a 24-bit RGB value, and then use 8-bit pixel values to index into
the colormap. Direct images store actual pixel color values using 15 bits (32,768 colors) or 24
bits (about 17 million colors).
The minimum file format version for this tag is SWF 2.
*/
function DefineBitsLossless(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.format = ba.readUI8();
	this.width = ba.readUI16();
	this.height = ba.readUI16();
	if (this.format == BitmapFormat.BIT_8) this.colorTableSize = ba.readUI8() + 1;
	
	this.zlibBitmapData = ba.readBytes(this.header.contentLength - (this.format == BitmapFormat.BIT_8 ? 8 : 7));
	this.colorData = new Flashbug.Zip(new Flashbug.ByteArray(this.zlibBitmapData)).unzip(true);
	/*if (this.format == BitmapFormat.BIT_8) {
		this.zlibBitmapData = new ColorMapData(ba, this.colorTableSize, this.zlibBitmapData.length);
	} else {
		this.zlibBitmapData = new BitmapData(ba, this.format, this.zlibBitmapData.length);
	}*/
	
	//this.size = this.colorData.length; // *
	//this.type = 'Image'; // *
	this.imageType = this.format != BitmapFormat.BIT_8 ? "PNG" : "GIF89a"; // *
}