function LineStyle(ba, tag) {
	this.width = ba.readUI16() / 20;
	
	// Shape1, Shape2
	if (tag == 2 || tag == 22) {
		this.color = new RGB(ba);
	}
	// Shape3
	else if (tag == 32) {
		this.color = new RGBA(ba);
	}
};