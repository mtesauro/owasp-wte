/*
The blur filter is based on a sub-pixel precise median filter (also known as a box filter). The
filter is applied on each of the RGBA color channels.
*/
function BlurFilter(ba) {
	this.blurX = ba.readFixed();
	this.blurY = ba.readFixed();
	this.passes = ba.readUB(5);
	
	ba.readUB(3); // Reserved, must be 0;
}