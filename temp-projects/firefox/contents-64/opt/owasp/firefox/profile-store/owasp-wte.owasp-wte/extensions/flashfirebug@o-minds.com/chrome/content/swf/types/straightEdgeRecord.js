function StraightEdgeRecord(ba) {
	this.typeFlag = 1;
	this.straightFlag = true; //ba.readBoolean();
	this.numBits = ba.readUB(4) + 2;
	this.generalLineFlag = ba.readBoolean();
	if (this.generalLineFlag) {
		this.deltaX = ba.readSB(this.numBits);
		this.deltaY = ba.readSB(this.numBits);
	} else {
		this.vertLineFlag = ba.readBoolean();
		if (this.vertLineFlag) {
			this.deltaY = ba.readSB(this.numBits);
		} else {
			this.deltaX = ba.readSB(this.numBits);
		}
	}
};