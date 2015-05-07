/*
The DefineMorphShape2 tag extends the capabilities of DefineMorphShape by using a new
morph line style record in the morph shape. MORPHLINESTYLE2 allows the use of new
types of joins and caps as well as scaling options and the ability to fill the strokes of the morph
shape.
DefineMorphShape2 specifies not only the shape bounds but also the edge bounds of the
shape. While the shape bounds are calculated along the outside of the strokes, the edge
bounds are taken from the outside of the edges. For an example of shape bounds versus edge
bounds, see the diagram in DefineShape4. The new StartEdgeBounds and EndEdgeBounds
fields assist Flash Player in accurately determining certain layouts.
In addition, DefineMorphShape2 includes new hinting information, UsesNonScalingStrokes
and UsesScalingStrokes. These flags assist Flash Player in creating the best possible area for
invalidation.
The minimum file format version is SWF 8.

http://www.toyota.com/vehicles/minisite/newprius/media/swf/PriusGraphics.swf
*/
function DefineMorphShape2(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.startBounds = new Rect(ba);
	this.startBounds.fromTwips();
	this.endBounds = new Rect(ba);
	this.endBounds.fromTwips();
	
	this.startEdgeBounds = new Rect(ba);
	this.startEdgeBounds.fromTwips();
	this.endEdgeBounds = new Rect(ba);
	this.endEdgeBounds.fromTwips();
			
	ba.readUB(6); // Reserved
		
	this.usesNonScalingStrokes = ba.readBoolean();
	this.usesScalingStrokes = ba.readBoolean();
	
	ba.align();
	
	this.offset = ba.readUI32();
	this.morphFillStyles = new MorphFillStyleArray(ba, obj);
	this.morphLineStyles = new MorphLineStyleArray(ba, obj, this.header.type);
	this.startEdges = new Shape(ba, obj, this);
	this.endEdges = new Shape(ba, obj, this);
	
	this.svg = morph2SVG(this);
}