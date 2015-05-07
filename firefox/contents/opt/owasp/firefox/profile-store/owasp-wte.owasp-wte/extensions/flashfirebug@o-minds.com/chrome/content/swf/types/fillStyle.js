function FillStyle(ba, obj, tag) {
	function nlizeMatrix(matrix) {
		return {
			scaleX: matrix.scaleX * 20, scaleY: matrix.scaleY * 20,
			skewX: matrix.skewX * 20, skewY: matrix.skewY * 20,
			moveX: matrix.moveX, moveY: matrix.moveY
		};
	}
	
	this.fillStyleType = ba.readUI8();
	
	switch(this.fillStyleType) {
		case FillStyleTypes.SOLID:
			// Shape1, Shape2
			if (tag == 2 || tag == 22) {
				this.color = new RGB(ba);
			}
			// Shape3, Shape4
			else if (tag == 32 || tag == 83) {
				this.color = new RGBA(ba);
			}
			this.type = 'solid';
			break;
		case FillStyleTypes.LINEAR_GRADIENT:
		case FillStyleTypes.RADIAL_GRADIENT:
		case FillStyleTypes.FOCAL_RADIAL_GRADIENT:
			this.gradientMatrix = nlizeMatrix(new Matrix(ba));
			this.gradient = (this.fillStyleType == FillStyleTypes.FOCAL_RADIAL_GRADIENT) ? new FocalGradient(ba, tag) : new Gradient(ba, tag);
			this.type = this.fillStyleType == FillStyleTypes.LINEAR_GRADIENT ? 'linear' : 'radial'; // *
			break;
		case FillStyleTypes.REPEATING_BITMAP:
		case FillStyleTypes.CLIPPED_BITMAP:
		case FillStyleTypes.NON_SMOOTHED_REPEATING_BITMAP:
		case FillStyleTypes.NON_SMOOTHED_CLIPPED_BITMAP:
			this.bitmapId = ba.readUI16();
			this.bitmapMatrix = new Matrix(ba);
			this.image = obj.dictionary[this.bitmapId];
			this.type = 'pattern'; // *
			this.repeat = (this.fillStyleType == FillStyleTypes.REPEATING_BITMAP); // *
			break;
		default :
			this.type = 'unknown';
	}
};