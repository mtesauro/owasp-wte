/*
The GLYPHENTRY structure describes a single character in a line of text. It is composed of
an index into the current font's glyph table, and an advance value. The advance value is the
horizontal distance between the reference point of this character and the reference point of the
following character.
*/
function GlyphEntry(ba, glyphBits, advanceBits) {
	this.glyphIndex = ba.readUB(glyphBits);
	this.glyphAdvance = ba.readUB(advanceBits);
}