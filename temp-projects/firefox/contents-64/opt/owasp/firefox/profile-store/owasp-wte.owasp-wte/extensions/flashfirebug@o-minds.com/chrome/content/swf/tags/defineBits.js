/*
This tag defines a bitmap character with JPEG compression. It contains only the JPEG
compressed image data (from the Frame Header onward). A separate JPEGTables tag contains
the JPEG encoding data used to encode this image (the Tables/Misc segment).
The data in this tag begins with the JPEG SOI marker 0xFF, 0xD8 and ends with the EOI
marker 0xFF, 0xD9. Before version 8 of the SWF file format, SWF files could contain an
erroneous header of 0xFF, 0xD9, 0xFF, 0xD8 before the JPEG SOI marker.
The minimum file format version for this tag is SWF 1.
*/
function DefineBits(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	var data = ba.readBytes(this.header.contentLength - 2);
	
	// Before version 8 of the SWF file format, SWF files could contain an erroneous header of 0xFF, 0xD9, 0xFF, 0xD8 before the JPEG SOI marker.
	if (data.charCodeAt(0) == 0xFF && data.charCodeAt(1) == 0xD9 && data.charCodeAt(2) == 0xFF && data.charCodeAt(3) == 0xD8) data = data.substr(4);
	
	// JPEG Table
	this.data = obj.jpegData ? obj.jpegData.substr(0, obj.jpegData.length - 2) + data.substr(2) : data;
	
	// Fix multiple SOI and EOI in JPEG data in SPL files (Flash 5)
	this.data = this.data.replace(/[^ÿØ]ÿØ/g, ''); // Make sure only one SOI and it's at the beginning
	this.data = this.data.replace(/ÿÙ(?=[ÿ])/g, ''); // Make sure only one EOI and it's at the end
	
	// Determine dimensions
	this.metadata = JPEG.getMetadata(this.data); // *
	this.imageType = this.metadata.format; // *
	this.width = this.metadata.width; // *
	this.height = this.metadata.height; // *
	//this.type = 'Image'; // *
}