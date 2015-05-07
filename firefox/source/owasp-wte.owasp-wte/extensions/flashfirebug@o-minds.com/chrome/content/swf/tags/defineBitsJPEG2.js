/*
This tag defines a bitmap character with JPEG compression. It differs from DefineBits in that
it contains both the JPEG encoding table and the JPEG image data. This tag allows multiple
JPEG images with differing encoding tables to be defined within a single SWF file.
The minimum file format version for this tag is SWF 2. The minimum file format version for
embedding PNG of GIF89a data is SWF 8.
*/
function DefineBitsJPEG2(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.data = ba.readBytes(this.header.contentLength - 2);
	
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