function PIX24(ba) {
	if (!ba) return;
	this.pix24Reserved = ba.readUI8(); // Always 0
	this.pix24Red = ba.readUI8();
	this.pix24Green = ba.readUI8();
	this.pix24Blue = ba.readUI8();
}