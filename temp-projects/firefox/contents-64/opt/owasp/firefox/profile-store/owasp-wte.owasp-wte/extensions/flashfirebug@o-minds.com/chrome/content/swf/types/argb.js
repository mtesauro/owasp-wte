/*
The ARGB record behaves exactly like the RGBA record, but the alpha value for the ARGB
record is in the first byte.
*/
function ARGB(ba) {
	this.alpha = ba.readUI8() / 255;
	this.red = ba.readUI8();
	this.green = ba.readUI8();
	this.blue = ba.readUI8();
}

ARGB.prototype.toHex = function() {
	function zero(n) { return (n.length < 2) ? '0' + n : n;	}
	var str = '#';
	str += zero(this.alpha.toString(16));
	str += zero(this.red.toString(16));
	str += zero(this.green.toString(16));
	str += zero(this.blue.toString(16));
	return str.toUpperCase();
}
ARGB.prototype.toString = function() {
	return 'argb(' + [this.alpha, this.red, this.green, this.blue] + ')';
}