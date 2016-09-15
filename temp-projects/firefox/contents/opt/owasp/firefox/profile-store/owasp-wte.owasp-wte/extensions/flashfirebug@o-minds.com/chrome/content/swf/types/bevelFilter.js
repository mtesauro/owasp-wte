/*
The Bevel filter creates a smooth bevel on display list objects.
*/
function BevelFilter(ba) {
	this.shadowColor = new RGBA(ba);
	this.highlightColor = new RGBA(ba);
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