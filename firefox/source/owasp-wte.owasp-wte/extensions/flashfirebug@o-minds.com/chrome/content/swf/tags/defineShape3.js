/*
DefineShape3 extends the capabilities of DefineShape2 by extending all of the RGB color
fields to support RGBA with opacity information.
The minimum file format version is SWF 3.
*/
function DefineShape3(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.bounds = new Rect(ba);
	this.bounds.fromTwips();
	ba.align();
	
	this.shapes = new ShapeWithStyle(ba, obj, this);
	
	this.svg = shape2SVG(this); //*
};