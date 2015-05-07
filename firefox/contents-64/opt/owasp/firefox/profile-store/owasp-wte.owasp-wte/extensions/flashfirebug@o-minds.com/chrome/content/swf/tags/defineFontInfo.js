/*
The DefineFontInfo tag defines a mapping from a glyph font (defined with DefineFont) to a
device font. It provides a font name and style to pass to the playback platform's text engine,
and a table of character codes that identifies the character represented by each glyph in the
corresponding DefineFont tag, allowing the glyph indices of a DefineText tag to be converted
to character strings.
The minimum file format version is SWF 1.
*/
function DefineFontInfo(ba, obj) {
	this.header = new RecordHeader(ba);
	this.fontID = ba.readUI16();
	this.fontNameLen = ba.readUI8();
	this.fontName = ba.readString(this.fontNameLen);
	ba.readUB(2); // Reserved
	this.fontFlagsSmallText = ba.readBoolean();
	this.fontFlagsShiftJIS = ba.readBoolean();
	this.fontFlagsANSI = ba.readBoolean();
	this.fontFlagsItalic = ba.readBoolean();
	this.fontFlagsBold = ba.readBoolean();
	this.fontFlagsWideCodes = ba.readBoolean();
	this.codeTable = [];

	var font = obj.dictionary[this.fontID];
	var i = font.numGlyphs;
	while(i--) {
		this.codeTable.push(this.fontFlagsWideCodes ? ba.readUI16() : ba.readUI8());
	}
}