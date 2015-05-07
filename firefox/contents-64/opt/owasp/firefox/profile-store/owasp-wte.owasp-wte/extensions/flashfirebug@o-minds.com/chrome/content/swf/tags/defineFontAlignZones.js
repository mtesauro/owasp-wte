/*
The DefineFont3 tag can be modified by a DefineFontAlignZones tag. The advanced text
rendering engine uses alignment zones to establish the borders of a glyph for pixel snapping.
Alignment zones are critical for high-quality display of fonts.
The alignment zone defines a bounding box for strong vertical and horizontal components of
a glyph. The box is described by a left coordinate, thickness, baseline coordinate, and height.
Small thicknesses or heights are often set to 0.
For example, consider the letter I. The letter I has a strong horizontal at its baseline and the
top of the letter. The letter I also has strong verticals that occur at the edges of the stem—not
the short top bar or serif. These strong verticals and horizontals of the center block of the
letter define the alignment zones.
The minimum file format version is SWF 8.
*/
function DefineFontAlignZones(ba, obj) {
	this.header = new RecordHeader(ba);
	this.fontID = ba.readUI16();
	/*
	Font thickness hint. Refers to the thickness of the typical stroke used in the font.
	0 = thin
	1 = medium
	2 = thick
	*/
	this.csmTableHint = ba.readUB(2);
	ba.readUB(6); // Reserved, must be 0
	this.zoneTable = [];
	
	var i = obj.dictionary[this.fontID].numGlyphs;
	while (i--) {
		this.zoneTable.push(new ZoneRecord(ba));
	}
};