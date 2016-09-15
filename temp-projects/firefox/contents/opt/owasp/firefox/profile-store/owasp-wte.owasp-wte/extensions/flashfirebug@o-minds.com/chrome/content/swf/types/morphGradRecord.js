function MorphGradRecord(ba) {
	this.startRatio = ba.readUI8();
	this.startColor = new RGBA(ba);
	this.endRatio = ba.readUI8();
	this.endColor = new RGBA(ba);
};