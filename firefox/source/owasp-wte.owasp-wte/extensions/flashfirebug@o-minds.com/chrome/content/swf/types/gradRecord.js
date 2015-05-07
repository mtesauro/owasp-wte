function GradRecord(ba, tag) {
	this.ratio = ba.readUI8();
	this.offset = this.ratio / 256; // *
	// Shape1, Shape2
	if (tag == 2 || tag == 22) {
		this.color = new RGB(ba);
	}
	// Shape3, Shape4
	else if (tag == 32 || tag == 83) {
		this.color = new RGBA(ba);
	}
};