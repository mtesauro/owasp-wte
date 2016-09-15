/*
DefineShape4 extends the capabilities of DefineShape3 by using a new line style record in the
shape. LINESTYLE2 allows new types of joins and caps as well as scaling options and the
ability to fill a stroke.
The minimum file format version is SWF 8.
*/
function DefineShape4(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	
	this.bounds = new Rect(ba);
	this.bounds.fromTwips();
	ba.align();
	
	this.edgeBounds = new Rect(ba);
	this.edgeBounds.fromTwips();
	
	ba.readUB(5); // Reserved
	
	this.usesFillWindingRule = ba.readBoolean();
	this.usesNonScalingStrokes = ba.readBoolean();
	this.usesScalingStrokes = ba.readBoolean();
	ba.align();
	
	this.shapes = new ShapeWithStyle(ba, obj, this);
	
	this.svg = shape2SVG(this); //*
};