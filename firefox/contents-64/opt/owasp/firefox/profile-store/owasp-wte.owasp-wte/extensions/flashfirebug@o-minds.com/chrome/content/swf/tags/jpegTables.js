/*
This tag defines the JPEG encoding table (the Tables/Misc segment) for all JPEG images
defined using the DefineBits tag. There may only be one JPEGTables tag in a SWF file.
The data in this tag begins with the JPEG SOI marker 0xFF, 0xD8 and ends with the EOI
marker 0xFF, 0xD9. Before version 8 of the SWF file format, SWF files could contain an
erroneous header of 0xFF, 0xD9, 0xFF, 0xD8 before the JPEG SOI marker.
The minimum file format version for this tag is SWF 1.
*/
function JPEGTables(ba, obj) {
	this.header = new RecordHeader(ba);
	this.jpegData = ba.readBytes(this.header.contentLength);
}