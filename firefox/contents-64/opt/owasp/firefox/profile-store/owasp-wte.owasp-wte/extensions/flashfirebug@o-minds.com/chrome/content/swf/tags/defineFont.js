/*
The DefineFont tag defines the shape outlines of each glyph used in a particular font. Only
the glyphs that are used by subsequent DefineText tags are actually defined.
DefineFont tags cannot be used for dynamic text. Dynamic text requires the DefineFont2 tag.
The minimum file format version is SWF 1.
*/
function DefineFont(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.numGlyphs = ba.readUI16() / 2;
	this.offsetTable = [this.numGlyphs * 2];
	this.glyphShapeTable = [];
	
	var i = this.numGlyphs - 1;
	while (i--) { this.offsetTable.push(ba.readUI16()); }
	
	i = this.numGlyphs;
	while (i--) { this.glyphShapeTable.push(new Shape(ba, obj, this)); }
	
	this.dataSize = this.header.contentLength;  // *
}