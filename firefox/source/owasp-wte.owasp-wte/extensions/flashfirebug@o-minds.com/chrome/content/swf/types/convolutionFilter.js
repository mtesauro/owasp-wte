/*
The convolution is applied on each of the RGBA color components and then saturated,
except when the PreserveAlpha flag is set; in this case, the alpha channel value is not modified.
The clamping flag specifies how pixels outside of the input pixel plane are handled. If set to
false, the DefaultColor value is used, and otherwise, the pixel is clamped to the closest valid
input pixel.
*/
function ConvolutionFilter(ba) {
	this.matrixX = ba.readUI8();
	this.matrixY = ba.readUI8();
	this.divisor = ba.readFloat();
	this.bias = ba.readFloat();
	this.matrix = [];
	var i = this.matrixX * this.matrixY;
	while (i--) {
		this.matrix.push(ba.readFloat());
	}
	this.defaultColor = new RGBA(ba);
	ba.readUB(6); // Reserved, must be 0
	this.clamp = ba.readBoolean();
	this.preserveAlpha = ba.readBoolean();
}