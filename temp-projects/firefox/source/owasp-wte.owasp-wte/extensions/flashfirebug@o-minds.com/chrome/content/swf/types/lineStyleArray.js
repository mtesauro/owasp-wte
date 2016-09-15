function LineStyleArray(ba, obj, tag) {
	this.lineStyleCount = ba.readUI8();
	if (0xFF == this.lineStyleCount) this.lineStyleCountExtended = ba.readUI16();
	
	this.lineStyles = [];
	var count = this.lineStyleCountExtended || this.lineStyleCount;
	while (count--) {
		// Shape1, Shape2, Shape3
		if (tag == 2 || tag == 22 || tag == 32) {
			this.lineStyles.push(new LineStyle(ba, tag));
		} 
		// Shape4
		else if (tag == 83) {
			this.lineStyles.push(new LineStyle2(ba, obj, tag));
		}
	}
};