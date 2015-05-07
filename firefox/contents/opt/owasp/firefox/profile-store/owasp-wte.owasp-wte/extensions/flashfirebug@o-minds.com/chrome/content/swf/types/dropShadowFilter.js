/*
The Drop Shadow filter is based on the same median filter as the blur filter, but the filter is
applied only on the alpha color channel to obtain a shadow pixel plane.
The angle parameter is in radians. With angle set to 0, the shadow shows on the right side of
the object. The distance is measured in pixels. The shadow pixel plane values are interpolated
bilinearly if sub-pixel values are used.
The strength of the shadow normalized is 1.0 in fixed point. The strength value is applied by
multiplying each value in the shadow pixel plane.
*/
function DropShadowFilter(ba) {
	this.dropShadowColor = new RGBA(ba);
	this.blurX = ba.readFixed();
	this.blurY = ba.readFixed();
	this.angle = ba.readFixed();
	this.distance = ba.readFixed();
	this.strength = ba.readFixed8();
	this.innerShadow = ba.readBoolean();
	this.knockout = ba.readBoolean();
	this.compositeSource = ba.readBoolean();
	this.passes = ba.readUB(5);
}