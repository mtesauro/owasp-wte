/*
A Kerning Record defines the distance between two glyphs in EM square coordinates. Certain
pairs of glyphs appear more aesthetically pleasing if they are moved closer together, or farther
apart. The FontKerningCode1 and FontKerningCode2 fields are the character codes for the
left and right characters. The FontKerningAdjustment field is a signed integer that defines a
value to be added to the advance value of the left character.
*/
function KerningRecord(ba, fontFlagsWideCodes, tag) {
	this.fontKerningCode1 = fontFlagsWideCodes ? ba.readUI16() : ba.readUI8();
	this.fontKerningCode2 = fontFlagsWideCodes ? ba.readUI16() : ba.readUI8();
	this.fontKerningAdjustment = tag == 75 ? ba.readSI16() / 20 : ba.readSI16();
}