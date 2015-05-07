/*
The PlaceObject tag adds a character to the display list. The CharacterId identifies the
character to be added. The Depth field specifies the stacking order of the character. The
Matrix field species the position, scale, and rotation of the character. If the size of the
PlaceObject tag exceeds the end of the transformation matrix, it is assumed that a
ColorTransform field is appended to the record. The ColorTransform field specifies a color
effect (such as transparency) that is applied to the character. The same character can be added
more than once to the display list with a different depth and transformation matrix.
The minimum file format version is SWF 1.
*/
function PlaceObject(ba, obj) {
	var startPos = ba.position;
	this.header = new RecordHeader(ba);
	this.characterId = ba.readUI16();
	this.depth = ba.readUI16();
	this.matrix = new Matrix(ba);
	// If there is still data to read, assume it's a cxform
	if (this.header.contentLength - (ba.position - startPos) > 0) this.colorTransform = new CXForm(ba);
}