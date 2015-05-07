/*
The RGB record represents a color as a 24-bit red, green, and blue value.
*/

function RGB(ba) {
	if (!ba) return;
	this.red = ba.readUI8();
	this.green = ba.readUI8();
	this.blue = ba.readUI8();
}

(function() {

function zero(n) {
	return (n.length < 2) ? '0' + n : n;
}

RGB.prototype.toHex = function() {
	var str = '#';
	str += zero(this.red.toString(16));
	str += zero(this.green.toString(16));
	str += zero(this.blue.toString(16));
	return str.toUpperCase();
}

RGB.prototype.toString = function() {
	return 'rgb(' + [this.red, this.green, this.blue] + ')';
}

})();