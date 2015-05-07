function BitmapData(ba, bitmapFormat, imageDataSize) {
	this.bitmapPixelData = [];
	
	var start = ba.position;
	var i = imageDataSize - (ba.position - start);
	if (bitmapFormat == BitmapFormat.BIT_15) {
		while (i--) {
			this.bitmapPixelData.push(new PIX15(ba));
		}
	} else if (bitmapFormat == BitmapFormat.BIT_24) {
		while (i--) {
			this.bitmapPixelData.push(new PIX24(ba));
		}
	}
};