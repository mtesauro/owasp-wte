function CurvedEdgeRecord(ba) {
	this.typeFlag = 1;
	this.straightFlag = false;//ba.readBoolean();
	this.numBits = ba.readUB(4) + 2;
	this.controlDeltaX = ba.readSB(this.numBits);
	this.controlDeltaY = ba.readSB(this.numBits);
	this.anchorDeltaX = ba.readSB(this.numBits);
	this.anchorDeltaY = ba.readSB(this.numBits);
};