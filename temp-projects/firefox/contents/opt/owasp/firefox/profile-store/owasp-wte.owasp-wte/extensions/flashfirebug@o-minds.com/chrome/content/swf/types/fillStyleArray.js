function FillStyleArray(ba, obj, tag) {
	this.fillStyleCount = ba.readUI8();
	if (0xFF == this.fillStyleCount) this.fillStyleCountExtended = ba.readUI16();
	
	this.fillStyles = [];
	var count = this.fillStyleCountExtended || this.fillStyleCount;
	while (count--) {
		this.fillStyles.push(new FillStyle(ba, obj, tag));
	}
};