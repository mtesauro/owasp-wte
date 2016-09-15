function MorphFillStyle(ba, obj) {
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
			this.startColor = new RGBA(ba);
			this.endColor = new RGBA(ba);
			this.type = 'solid';
			break;
		case FillStyleTypes.LINEAR_GRADIENT:
		case FillStyleTypes.RADIAL_GRADIENT:
			this.startGradientMatrix = nlizeMatrix(new Matrix(ba));
			this.endGradientMatrix = nlizeMatrix(new Matrix(ba));
			this.gradientMatrix = this.startGradientMatrix; //*
			this.gradient = new MorphGradient(ba);
			this.type = (this.fillStyleType == FillStyleTypes.LINEAR_GRADIENT) ? 'linear' : 'radial'; // *
			break;
		case FillStyleTypes.REPEATING_BITMAP:
		case FillStyleTypes.CLIPPED_BITMAP:
		case FillStyleTypes.NON_SMOOTHED_REPEATING_BITMAP:
		case FillStyleTypes.NON_SMOOTHED_CLIPPED_BITMAP:
			this.bitmapId = ba.readUI16();
			this.startBitmapMatrix = new Matrix(ba);
			this.endBitmapMatrix = new Matrix(ba);
			
			this.type = 'pattern'; // *
			this.repeat = (this.fillStyleType == FillStyleTypes.REPEATING_BITMAP); // *
			break;
		default :
			this.type = 'unknown';
	}
};