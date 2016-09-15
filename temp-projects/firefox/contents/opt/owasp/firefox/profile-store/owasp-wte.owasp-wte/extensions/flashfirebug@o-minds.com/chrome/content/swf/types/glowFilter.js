/*
The Glow filter works in the same way as the Drop Shadow filter, except that it does not have
a distance and angle parameter. Therefore, it can run slightly faster.
*/
function GlowFilter(ba) {
	this.glowColor = new RGBA(ba);
	this.blurX = ba.readFixed();
	this.blurY = ba.readFixed();
	this.strength = ba.readFixed8();
	this.innerGlow = ba.readBoolean();
	this.knockout = ba.readBoolean();
	this.compositeSource = ba.readBoolean();
	this.passes = ba.readUB(5);
}