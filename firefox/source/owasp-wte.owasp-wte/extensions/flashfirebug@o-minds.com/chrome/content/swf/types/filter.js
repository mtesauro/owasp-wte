function Filter(ba) {
	this.id = ba.readUI8();
	
	switch(this.id) {
		case 0 : this.dropShadowFilter = new DropShadowFilter(ba); break;
		case 1 : this.blurFilter = new BlurFilter(ba); break;
		case 2 : this.glowFilter = new GlowFilter(ba); break;
		case 3 : this.bevelFilter = new BevelFilter(ba); break;
		case 4 : this.gradientGlowFilter = new GradientGlowFilter(ba); break;
		case 5 : this.convolutionFilter = new ConvolutionFilter(ba); break;
		case 6 : this.colorMatrixFilter = new ColorMatrixFilter(ba); break;
		case 7 : this.gradientBevelFilter = new GradientBevelFilter(ba); break;
	}
}