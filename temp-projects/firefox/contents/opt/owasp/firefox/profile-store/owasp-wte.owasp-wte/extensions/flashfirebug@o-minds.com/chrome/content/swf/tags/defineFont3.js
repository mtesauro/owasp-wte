/*
The DefineFont3 tag is introduced along with the DefineFontAlignZones tag in SWF 8. The
DefineFontAlignZones tag is optional but recommended for SWF files using advanced antialiasing,
and it modifies the DefineFont3 tag.
The DefineFont3 tag extends the functionality of DefineFont2 by expressing the SHAPE
coordinates in the GlyphShapeTable at 20 times the resolution. All the EMSquare coordinates
are multiplied by 20 at export, allowing fractional resolution to 1/20 of a unit. This allows for
more precisely defined glyphs and results in better visual quality.
The minimum file format version is SWF 8.
*/
function DefineFont3(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.fontFlagsHasLayout = ba.readBoolean();
	this.info = {};
	this.info.fontFlagsShiftJIS = ba.readBoolean();
	this.info.fontFlagsSmallText = ba.readBoolean();
	this.info.fontFlagsANSI = ba.readBoolean();
	this.info.fontFlagsWideOffsets = ba.readBoolean();
	this.info.fontFlagsWideCodes = ba.readBoolean();
	this.info.fontFlagsItalic = ba.readBoolean();
	this.info.fontFlagsBold = ba.readBoolean();
	this.info.languageCode = new LanguageCode(ba); // SWF 5 or earlier: always 0 SWF 6 or later: language code
	this.info.nameLen = ba.readUI8();
	this.info.name = ba.readString(this.info.nameLen);
	this.info.name = this.info.name.substr(0, this.info.nameLen - 1); // Removes an invalid character at end of font name
	this.numGlyphs = ba.readUI16();
	if (this.numGlyphs > 0) this.info.codeTable = [];
	if (this.numGlyphs > 0) this.glyphShapeTable = [];
	if (this.numGlyphs > 0) this.offsetTable = [];
	this.dataSize = this.header.contentLength; // *
	
	var i = this.numGlyphs,
		tablesOffset = ba.position;
	
	if (this.numGlyphs > 0)  {
		while (i--) {
			this.offsetTable.push(this.info.fontFlagsWideOffsets ? ba.readUI32() : ba.readUI16());
		}
	}
	
	if (this.numGlyphs > 0) this.codeTableOffset = this.info.fontFlagsWideOffsets ? ba.readUI32() : ba.readUI16();
		
	if (this.numGlyphs > 0) {
		for(var i = 0, o = this.offsetTable[0]; o; o = this.offsetTable[++i]) {
			ba.seek(tablesOffset + o, true);
			this.glyphShapeTable.push(new Shape(ba, obj, this));
		}
		
		i = this.numGlyphs;
		while (i--) {
			this.info.codeTable.push(this.info.fontFlagsWideCodes ? ba.readUI16() : ba.readUI8());
		};
	}
	
	if(this.fontFlagsHasLayout) this.ascent = ba.readSI16() / 20;
	if(this.fontFlagsHasLayout) this.descent = ba.readSI16() / 20;
	if(this.fontFlagsHasLayout) this.leading = ba.readSI16() / 20;
	if(this.fontFlagsHasLayout && this.numGlyphs > 0) {
		i = this.numGlyphs;
		this.advanceTable = [];
		while (i--) {
			this.advanceTable.push(ba.readSI16() / 20);
		};
	}
	
	if(this.fontFlagsHasLayout && this.numGlyphs > 0) {
		i = this.numGlyphs;
		this.boundsTable = [];
		while (i--) {
			var rect = new Rect(ba);
			rect.fromTwips();
			this.boundsTable.push(rect);
		};
	}
	
	if(this.fontFlagsHasLayout) {
		this.kerningCount = ba.readUI16(); // Not used in Flash Player through version 7 (always set to 0 to save space).
		
		i = this.kerningCount;
		this.kerningTable = [];
		while (i--) {
			this.kerningTable.push(new KerningRecord(ba, this.info.fontFlagsWideCodes, this.header.type));
		};
	}
}