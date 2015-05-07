/*
The RGBA record represents a color as 32-bit red, green, blue and alpha value. An RGBA
color with an alpha value of 255 is completely opaque. An RGBA color with an alpha value of
zero is completely transparent. Alpha values between zero and 255 are partially transparent.
*/
function RGBA(ba) {
	RGB.apply(this, arguments);
	this.alpha = ba.readUI8() / 255;
}
RGBA.prototype = new RGB();
RGBA.prototype.constructor = RGBA;

RGBA.prototype.toHex = function() {
	function zero(n) { return (n.length < 2) ? '0' + n : n;	}
	var str = '#';
	str += zero(this.red.toString(16));
	str += zero(this.green.toString(16));
	str += zero(this.blue.toString(16));
	str += zero(this.alpha.toString(16));
	return str.toUpperCase();
}
RGBA.prototype.toString = function() {
	return 'rgba(' + [this.red, this.green, this.blue, this.alpha] + ')';
}