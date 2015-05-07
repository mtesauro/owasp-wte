/*
DefineShape2 extends the capabilities of DefineShape with the ability to support more than
255 styles in the style list and multiple style lists in a single shape.
The minimum file format version is SWF 2.
*/
function DefineShape2(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.bounds = new Rect(ba);
	this.bounds.fromTwips();
	ba.align();
	
	this.shapes = new ShapeWithStyle(ba, obj, this);
	
	this.svg = shape2SVG(this); //*
};