function StyleChangeRecord(ba, obj, tag, flags, numFillBits, numLineBits) {
	this.typeFlag = 0;
	this.stateNewStyles = !!(flags & 0x10);
	this.stateLineStyle = !!(flags & 0x08);
	this.stateFillStyle1 = !!(flags & 0x04);
	this.stateFillStyle0 = !!(flags & 0x02);
	this.stateMoveTo = !!(flags & 0x01);
	
	if (this.stateMoveTo) {
		this.moveBits = ba.readUB(5);
		this.moveDeltaX = ba.readSB(this.moveBits);
		this.moveDeltaY = ba.readSB(this.moveBits);
	}
	if (this.stateFillStyle0) this.fillStyle0 = ba.readUB(numFillBits); // Left Fill
	if (this.stateFillStyle1) this.fillStyle1 = ba.readUB(numFillBits); // Right Fill
	if (this.stateLineStyle) this.lineStyle = ba.readUB(numLineBits);	
	if (this.stateNewStyles) {
		this.fillStyles = (tag == 46 || tag == 84) ? new MorphFillStyleArray(ba,obj) : new FillStyleArray(ba, obj, tag);
		this.lineStyles = (tag == 46 || tag == 84) ? new MorphLineStyleArray(ba,obj,tag) : new LineStyleArray(ba, obj, tag);
		this.numFillBits = ba.readUB(4);
		this.numLineBits = ba.readUB(4);
	}
};