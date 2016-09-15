/*
The DefineMorphShape tag defines the start and end states of a morph sequence. A morph
object should be displayed with the PlaceObject2 tag, where the ratio field specifies how far
the morph has progressed.
The minimum file format version is SWF 3.
*/
function DefineMorphShape(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.startBounds = new Rect(ba);
	this.startBounds.fromTwips();
	this.endBounds = new Rect(ba);
	this.endBounds.fromTwips();
	this.offset = ba.readUI32();
	this.morphFillStyles = new MorphFillStyleArray(ba, obj);
	this.morphLineStyles = new MorphLineStyleArray(ba, obj, this.header.type);
	this.startEdges = new Shape(ba, obj, this);
	this.endEdges = new Shape(ba, obj, this);
	this.svg = morph2SVG(this);
}