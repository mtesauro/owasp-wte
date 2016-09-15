function MorphLineStyle2(ba, obj) {
	this.startWidth = ba.readUI16() / 20;
	this.endWidth = ba.readUI16() / 20;
	this.startCapStyle = ba.readUB(2);
	this.startCapStyleLabel = CapStyle[this.startCapStyle];
	this.joinStyle = ba.readUB(2);
	this.joinStyleLabel = JoinStyle[this.joinStyle];
	this.hasFillFlag = ba.readBoolean();
	this.noHScaleFlag = ba.readBoolean();
	this.noVScaleFlag = ba.readBoolean();
	this.pixelHintingFlag = ba.readBoolean();
	ba.readUB(5); // Reserved
	this.noClose = ba.readBoolean();
	this.endCapStyle = ba.readUB(2);
	this.endCapStyleLabel = CapStyle[this.endCapStyle];
	if (this.joinStyle == 2) this.miterLimitFactor = ba.readUI16();
	if (!this.hasFillFlag) {
		this.startColor = new RGBA(ba);
		this.endColor = new RGBA(ba);
	} else {
		this.fillType = new MorphFillStyle(ba, obj);
	}
};