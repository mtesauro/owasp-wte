/*
A TEXTRECORD sets text styles for subsequent characters. It can be used to select a font,
change the text color, change the point size, insert a line break, or set the x and y position of
the next character in the text. The new text styles apply until another TEXTRECORD
changes the styles.
The TEXTRECORD also defines the actual characters in a text object. Characters are
referred to by an index into the current font's glyph table, not by a character code. Each
TEXTRECORD contains a group of characters that all share the same text style, and are on
the same line of text.
*/
function TextRecord(ba, obj, tag, glyphBits, advanceBits) {
	this.textRecordType = ba.readUB(1); // Always 1
	ba.readUB(3); // StyleFlagsReserved, always 0
	
	this.styleFlagsHasFont = ba.readBoolean();
	this.styleFlagsHasColor = ba.readBoolean();
	this.styleFlagsHasYOffset = ba.readBoolean();
	this.styleFlagsHasXOffset = ba.readBoolean();
	
	ba.align();
	
	if (this.styleFlagsHasFont) this.fontID = ba.readUI16();
	if (this.styleFlagsHasColor) this.textColor = (tag == 11) ? new RGB(ba) : new RGBA(ba);
	if (this.styleFlagsHasXOffset) this.xOffset = ba.readSI16();
	if (this.styleFlagsHasYOffset) this.yOffset = ba.readSI16();
	if (this.styleFlagsHasFont) this.textHeight = ba.readUI16() / 20; // twips
	
	this.glyphCount = ba.readUI8();
	this.glyphEntries = [];
	
	// GlyphEntry
	var i = this.glyphCount;
	while (i--) {
		var glyph = new GlyphEntry(ba, glyphBits, advanceBits);
		this.glyphEntries.push(glyph);
		if (this.styleFlagsHasXOffset) this.xOffset += glyph.glyphAdvance;
	}
	ba.align();
}