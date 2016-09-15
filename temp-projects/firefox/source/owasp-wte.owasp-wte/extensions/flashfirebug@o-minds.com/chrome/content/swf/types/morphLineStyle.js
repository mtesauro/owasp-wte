function MorphLineStyle(ba) {
	this.startWidth = ba.readUI16() / 20;
	this.endWidth = ba.readUI16() / 20;
	this.startColor = new RGBA(ba);
	this.endColor = new RGBA(ba);
};