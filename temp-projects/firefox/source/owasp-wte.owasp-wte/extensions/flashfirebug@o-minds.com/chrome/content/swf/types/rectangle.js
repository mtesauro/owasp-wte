/*
A rectangle value represents a rectangular region defined by a minimum x- and y-coordinate
position and a maximum x- and y-coordinate position. The RECT record must be byte
aligned.
*/
function Rect(ba) {
	this.nBits = ba.readUB(5);
	this.left = this.xmin = ba.readSB(this.nBits);
	this.right = this.xmax = ba.readSB(this.nBits);
	this.top = this.ymin = ba.readSB(this.nBits);
	this.bottom = this.ymax = ba.readSB(this.nBits);
	ba.align();
}
// Convert values from twips
Rect.prototype.fromTwips = function() {
	this.left = this.xmin /= 20;
	this.right = this.xmax /= 20;
	this.top = this.ymin /= 20;
	this.bottom = this.ymax /= 20;
}

Rect.prototype.union = function(rect) {
	return {
			left: this.left < rect.left ? this.left : rect.left,
			right: this.right > rect.right ? this.right : rect.right,
			top: this.top < rect.top ? this.top : rect.top,
			bottom: this.bottom > rect.bottom ? this.bottom : rect.bottom
		};
};