function MorphLineStyleArray(ba, obj, tag) {
	this.lineStyleCount = ba.readUI8();
	if (0xFF == this.lineStyleCount) this.lineStyleCountExtended = ba.readUI16();
	
	this.lineStyles = [];
	var count = this.lineStyleCountExtended || this.lineStyleCount;
	while (count--) {
		// MorphShape1
		if (tag == 46) {
			this.lineStyles.push(new MorphLineStyle(ba));
		} 
		// MorphShape2
		else if (tag == 84) {
			this.lineStyles.push(new MorphLineStyle2(ba, obj));
		}
	}
};