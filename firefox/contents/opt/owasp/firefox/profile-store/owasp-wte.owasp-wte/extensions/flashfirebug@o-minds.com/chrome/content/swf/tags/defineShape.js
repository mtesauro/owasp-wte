/*
The DefineShape tag defines a shape for later use by control tags such as PlaceObject. The
ShapeId uniquely identifies this shape as 'character' in the Dictionary. The ShapeBounds field
is the rectangle that completely encloses the shape. The SHAPEWITHSTYLE structure
includes all the paths, fill styles and line styles that make up the shape.
The minimum file format version is SWF 1.
*/
function DefineShape(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.bounds = new Rect(ba);
	this.bounds.fromTwips();
	ba.align();
	
	this.shapes = new ShapeWithStyle(ba, obj, this);
	
	this.svg = shape2SVG(this); //*
};