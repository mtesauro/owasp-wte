/*
DefineFont4 supports only the new Flash Text Engine. The storage of font data for embedded
fonts is in CFF format.
The minimum file format version is SWF 10.
*/
function DefineFont4(ba, obj) {
	this.header = new RecordHeader(ba);
	var startPos = ba.position;
	this.id = ba.readUI16();
	ba.readUB(5); // Reserved
	this.fontFlagsHasFontData = ba.readBoolean();
	this.info = {};
	this.info.fontFlagsItalic = ba.readBoolean();
	this.info.fontFlagsBold = ba.readBoolean();
	this.info.name = ba.readString(); // Given ID, not actual name
	
	// CFF (OTF) Font
	if (this.fontFlagsHasFontData) {
		this.data = ba.readBytes(this.header.contentLength - (ba.position - startPos));
		try {
			var cff = new Flashbug.CFF(new Flashbug.ByteArray(this.data));
			var fontName = cff.getFontName();
			if (fontName.length > 0) this.info.name = fontName;
			
			var copyright = cff.getCopyright();
			this.info.copyright = (copyright.length > 0) ? copyright : '';
			
			this.numGlyphs = cff.getGlyphCount();
		} catch(e) {
			trace('readDefineFont4 ' + e);
		}
	}
}