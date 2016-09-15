/*
When generating SWF 6 or later, it is recommended that you use the new DefineFontInfo2
tag rather than DefineFontInfo. DefineFontInfo2 is identical to DefineFontInfo, except that
it adds a field for a language code. If you use the older DefineFontInfo, the language code will
be assumed to be zero, which results in behavior that is dependent on the locale in which
Flash Player is running.
The minimum file format version is SWF 6.
*/
function DefineFontInfo2(ba, obj) {
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
	this.languageCode = new LanguageCode(ba);
	
	this.codeTable = [];

	var font = obj.dictionary[this.fontID];
	var i = font.numGlyphs;
	while(i--) {
		this.codeTable.push(this.fontFlagsWideCodes ? ba.readUI16() : ba.readUI8());
	}
}