function PIX15(ba) {
	if (!ba) return;
	this.pix15Reserved = ba.readUB(1); // Reserved
	this.pix15Red = ba.readUB(5);
	this.pix15Green = ba.readUB(5);
	this.pix15Blue = ba.readUB(5);
}