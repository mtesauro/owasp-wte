function AlphaColorMapData(ba, colorTableSize, imageDataSize) {
	this.colorTableRGB = [];
	
	var start = ba.position;
	var i = colorTableSize + 1;
	while (i--) {
		this.colorTableRGB.push(new RGBA(ba));
	}
	
	this.colormapPixelData = [];
	i = imageDataSize - (ba.position - start);
	while (i--) {
		this.colormapPixelData.push(ba.readUI8());
	}
};