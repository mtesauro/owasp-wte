function LineStyle2(ba, obj, tag) {
	this.width = ba.readUI16() / 20;
	
	this.startCapStyle = ba.readUB(2);
	this.startCapStyleLabel = CapStyle[this.startCapStyle];
	
	this.joinStyle = ba.readUB(2);
	this.joinStyleLabel = JoinStyle[this.joinStyle];
	
	this.hasFillFlag = ba.readBoolean();
	this.noHScaleFlag = ba.readBoolean(); // stroke thickness will not scale if the object is scaled horizontally.
	this.noVScaleFlag = ba.readBoolean(); // stroke thickness will not scale if the object is scaled vertically.
	this.pixelHintingFlag = ba.readBoolean(); // all anchors will be aligned to full pixels.
	ba.readUB(5); // Reserved
	this.noClose = ba.readBoolean();
	this.endCapStyle = ba.readUB(2);
	this.endCapStyleLabel = CapStyle[this.endCapStyle];
	ba.align();
	
	if (this.joinStyle == 2) this.miterLimitFactor = ba.readFixed8();
	if (this.hasFillFlag) {
		this.fillType = new FillStyle(ba, obj, tag);
	} else {
		this.color = new RGBA(ba);
	}
};