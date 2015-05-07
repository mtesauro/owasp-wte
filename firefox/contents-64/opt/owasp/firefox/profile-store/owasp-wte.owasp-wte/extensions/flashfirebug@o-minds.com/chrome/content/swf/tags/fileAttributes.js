/*
The FileAttributes tag defines characteristics of the SWF file. This tag is required for SWF 8
and later and must be the first tag in the SWF file. Additionally, the FileAttributes tag can
optionally be included in all SWF file versions.
The minimum file format version is SWF 8.
*/
function FileAttributes(ba, obj) {
	this.header = new RecordHeader(ba);
	
	ba.readUB(1); // Reserved
	
	// If 1, the SWF file uses hardware acceleration to blit graphics to the screen, where such acceleration is available.
	// If 0, the SWF file will not use hardware accelerated graphics facilities.
	// Minimum file version is 10
	this.useDirectBlit = ba.readBoolean();
	
	// If 1, the SWF file uses GPU compositing features when drawing graphics, where such acceleration is available.
	// If 0, the SWF file will not use hardware accelerated graphics facilities.
	// Minimum file version is 10
	this.useGPU = ba.readBoolean();
	
	// If 1, the SWF file contains the Metadata tag.
	// If 0, the SWF file does not contain the Metadata tag
	this.hasMetadata = ba.readBoolean();
	
	// If 1, this SWF uses ActionScript 3.0.
	// If 0, this SWF uses ActionScript 1.0 or 2.0.
	// Minimum file format version is 9.
	this.actionscript3 = ba.readBoolean();
	
	ba.readUB(2); // Reserved
	
	// If 1, this SWF file is given network file access when loaded locally.
	// If 0, this SWF file is given local file access when loaded locally
	this.useNetwork = ba.readBoolean();
	
	// Reserved
	ba.readByte();
	ba.readByte();
	ba.readByte();
}