/*
The Gradient Glow and Gradient Bevel filters are extensions of the normal Glow and Bevel
Filters and allow a gradient to be specified instead of a single color. Instead of multiplying a
single color value by the shadow-pixel plane value, the shadow-pixel plane value is mapped
directly into the gradient ramp to obtain the resulting color pixel value, which is then
composited by using one of the specified compositing modes.
*/
function GradientGlowFilter(ba) {
	this.numColors = ba.readUI8();
	this.gradientColors = [];
	this.gradientRatio = [];
	
	var i = this.numColors;
	while (i--) {
		this.gradientColors.push(new RGBA(ba));
	}
	
	i = this.numColors;
	while (i--) {
		this.gradientRatio.push(ba.readUI8());
	}
	
	this.blurX = ba.readFixed();
	this.blurY = ba.readFixed();
	this.angle = ba.readFixed();
	this.distance = ba.readFixed();
	this.strength = ba.readFixed8();
	this.innerShadow = ba.readBoolean();
	this.knockout = ba.readBoolean();
	this.compositeSource = ba.readBoolean();
	this.onTop = ba.readBoolean();
	this.passes = ba.readUB(4);
}