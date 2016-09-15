/*
A Color Matrix filter applies a color transformation on the pixels of a display list object.
The matrix values are stored from left to right and each row from top to bottom. The last row
is always assumed to be (0,0,0,0,1) and does not need to be stored.
*/
function ColorMatrixFilter(ba) {
	this.matrix = [];
	var i = 20;
	while (i--) {
		this.matrix.push(ba.readFloat());
	}
}