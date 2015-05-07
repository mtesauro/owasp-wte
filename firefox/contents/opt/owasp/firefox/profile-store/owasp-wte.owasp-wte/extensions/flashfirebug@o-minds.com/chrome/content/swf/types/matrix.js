/*
The MATRIX record represents a standard 2x3 transformation matrix of the sort commonly
used in 2D graphics. It is used to describe the scale, rotation, and translation of a graphic
object. The MATRIX record must be byte aligned.
*/
function Matrix(ba) {
	this.hasScale = ba.readBoolean();
	this.scaleX = 1.0;
	this.scaleY = 1.0;
	this.nScaleBits = null;
	
	if (this.hasScale) {
		this.nScaleBits = ba.readUB(5);
		this.scaleX = ba.readFB(this.nScaleBits) / 20; // twips
		this.scaleY = ba.readFB(this.nScaleBits) / 20; // twips
	}
	
	this.hasRotation = ba.readBoolean();
	this.skewX = this.rotateSkew0 = 0.0;
	this.skewY = this.rotateSkew1 = 0.0;
	
	if (this.hasRotation) {
		this.nRotateBits = ba.readUB(5);
		this.skewX = this.rotateSkew0 = ba.readFB(this.nRotateBits) / 20; // twips
		this.skewY = this.rotateSkew1 = ba.readFB(this.nRotateBits) / 20; // twips
	}
	
	this.nTranslateBits = ba.readUB(5);
	this.moveX = this.translateX = ba.readSB(this.nTranslateBits) / 20; // twips
	this.moveY = this.translateY = ba.readSB(this.nTranslateBits) / 20; // twips
	
	ba.align();
};

Matrix.prototype.toString = function() {
	return "matrix(" + [
		this.scaleX, this.skewX,
		this.skewY, this.scaleY,
		this.moveX, this.moveY
	] + ')';
};