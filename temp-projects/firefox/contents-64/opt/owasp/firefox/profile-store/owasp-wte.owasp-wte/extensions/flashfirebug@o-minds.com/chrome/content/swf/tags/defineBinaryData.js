/*
The DefineBinaryData tag permits arbitrary binary data to be embedded in a SWF file.
DefineBinaryData is a definition tag, like DefineShape and DefineSprite. It associates a blob
of binary data with a standard SWF 16-bit character ID. The character ID is entered into the
SWF file's character dictionary.
DefineBinaryData is intended to be used in conjunction with the SymbolClass tag. The
SymbolClass tag can be used to associate a DefineBinaryData tag with an AS3 class definition.
The AS3 class must be a subclass of ByteArray. When the class is instantiated, it will be
populated automatically with the contents of the binary data resource.
*/
function DefineBinaryData(ba, obj) {
	this.header = new RecordHeader(ba);
	var startPos = ba.position;
	this.id = ba.readUI16();
	ba.readUI32(); // Reserved
	this.data = ba.readBytes(this.header.contentLength - (ba.position - startPos));
	
	// Try to identify binary data type
	if (PBJ.isPBJ(this.data)) {
		this.isPBJ = true;
		this.metadata = PBJ.getMetadata(this.data);
	} else if (GIF.isGIF(this.data)) {
		this.isGIF = true;
		this.metadata = GIF.getMetadata(this.data);
	} else if (SWF.isSWF(this.data)) {
		this.isSWF = true;
	} else if (XML.isXML(this.data)) {
		this.isXML = true;
	} else if (JPEG.isJPEG(this.data)) {
		this.isJPEG = true;
		this.metadata = JPEG.getMetadata(this.data);
	} else if (PNG.isPNG(this.data)) {
		this.isPNG = true;
		this.metadata = PNG.getMetadata(this.data);
	}
}