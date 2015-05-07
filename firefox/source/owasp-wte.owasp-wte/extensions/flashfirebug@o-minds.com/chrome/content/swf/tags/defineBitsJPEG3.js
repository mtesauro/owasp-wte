/*
This tag defines a bitmap character with JPEG compression. This tag extends
DefineBitsJPEG2, adding alpha channel (opacity) data. Opacity/transparency information is
not a standard feature in JPEG images, so the alpha channel information is encoded separately
from the JPEG data, and compressed using the ZLIB standard for compression.
If ImageData contains PNG or GIF89a data, the optional BitmapAlphaData is not
supported.
The minimum file format version for this tag is SWF 3. The minimum file format version for
embedding PNG of GIF89a data is SWF 8.
*/
function DefineBitsJPEG3(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	
	/*
	ZLIB compressed array of alpha data. Only supported when tag contains JPEG data. One byte per pixel. Total size
	after decompression must equal (width * height) of JPEG image.
	*/
	this.alphaDataOffset = ba.readUI32();
	
	this.data = ba.readString(this.alphaDataOffset);
	
	var alphaData = ba.readBytes(this.header.contentLength - this.alphaDataOffset - 6);
	this.alphaData = new Flashbug.Zip(new Flashbug.ByteArray(alphaData)).unzip(true);
	
	// Before version 8 of the SWF file format, SWF files could contain an erroneous header of 0xFF, 0xD9, 0xFF, 0xD8 before the JPEG SOI marker.
	if (this.data.charCodeAt(0) == 0xFF && this.data.charCodeAt(1) == 0xD9 && this.data.charCodeAt(2) == 0xFF && this.data.charCodeAt(3) == 0xD8) this.data = this.data.substr(4);
	
	// Fix multiple SOI and EOI in JPEG data in SPL files (Flash 5)
	this.data = this.data.replace(/[^ÿØ]ÿØ/g, ''); // Make sure only one SOI and it's at the beginning
	this.data = this.data.replace(/ÿÙ(?=[ÿ])/g, ''); // Make sure only one EOI and it's at the end
	
	// Determine dimensions
	if (JPEG.isJPEG(this.data)) {
		this.metadata = JPEG.getMetadata(this.data); // *
	} else if(PNG.isPNG(this.data)) {
		this.metadata = PNG.getMetadata(this.data); // *
	} else {
		this.metadata = GIF.getMetadata(this.data); // *
	}
	this.imageType = this.metadata.format; // *
	this.width = this.metadata.width; // *
	this.height = this.metadata.height; // *
	//this.type = 'Image'; // *
}