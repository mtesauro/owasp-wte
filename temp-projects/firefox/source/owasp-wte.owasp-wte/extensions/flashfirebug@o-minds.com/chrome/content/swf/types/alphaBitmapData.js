function AlphaBitmapData(ba, imageDataSize) {
	this.bitmapPixelData = [];
	
	var start = ba.position;
	var i = imageDataSize - (ba.position - start);
	while (i--) {
		this.bitmapPixelData.push(new ARGB(ba));
	}
};