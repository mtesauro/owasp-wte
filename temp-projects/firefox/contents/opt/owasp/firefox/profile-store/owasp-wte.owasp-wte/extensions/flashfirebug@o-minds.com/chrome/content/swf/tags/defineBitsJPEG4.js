/*
This tag defines a bitmap character with JPEG compression. This tag extends
DefineBitsJPEG3, adding a deblocking parameter. While this tag also supports PNG and
GIF89a data, the deblocking filter is not applied to such data.
The minimum file format version for this tag is SWF 10.
*/
function DefineBitsJPEG4(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	
	/*
	ZLIB compressed array of alpha data. Only supported when tag contains JPEG data. One byte per pixel. Total size
	after decompression must equal (width * height) of JPEG image.
	*/
	this.alphaDataOffset = ba.readUI32();
	
	/*
	Parameter to be fed into the deblocking filter. The parameter describes a relative strength of the deblocking filter from 
	0-100% expressed in a normalized 8.8 fixed point format.
	*/
	this.deblockParam = ba.readUI16();
	
	this.data = ba.readString(this.alphaDataOffset);
	
	var alphaData = ba.readBytes(this.header.contentLength - this.alphaDataOffset - 6);
	this.alphaData = new Flashbug.Zip(new Flashbug.ByteArray(alphaData)).unzip(true);
	
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