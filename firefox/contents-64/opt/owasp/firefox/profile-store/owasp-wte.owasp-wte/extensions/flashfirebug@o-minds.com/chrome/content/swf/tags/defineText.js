/*
The DefineText tag defines a block of static text. It describes the font, size, color, and exact
position of every character in the text object.
The minimum file format version is SWF 1.
*/
function DefineText(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.bounds = new Rect(ba);
	this.bounds.fromTwips();
	this.matrix = new Matrix(ba);
	this.glyphBits = ba.readUI8();
	this.advanceBits = ba.readUI8();
	this.colors = [];
	this.textRecords = [];
	while (ba.readUI8() != 0) {
		ba.position--;
		this.textRecords.push(new TextRecord(ba, obj, this.header.type, this.glyphBits, this.advanceBits));
	}
	
	//////////////////////////////
	// Extract text from glyphs/font
	var colors = {}, lastFontID, lastColor, lastHeight;
	for (var i = 0, record = this.textRecords[0]; record; record = this.textRecords[++i]) {
		//if (record.styleFlagsHasFont) {
			var entries = record.glyphEntries,
				font = record.hasOwnProperty('fontID') ? obj.dictionary[record.fontID] : obj.dictionary[lastFontID],
				codes = font.info.codeTable,
				chars = [];
			
			// Use last font/color of the previous record
			if (record.hasOwnProperty('textHeight')) {
				lastHeight = record.textHeight;
			} else {
				record.textHeight = lastHeight;
			}
			if (record.hasOwnProperty('fontID')) lastFontID = record.fontID;
			if (record.styleFlagsHasColor) {
				lastColor = record.textColor;
			} else {
				record.textColor = lastColor;
			}
			
			for(var j = 0, entry = entries[0]; entry; entry = entries[++j]){
				var str = String.fromCharCode(codes[entry.glyphIndex]);
				if(' ' != str || chars.length) chars.push(str);
			}
			record._text = chars.join('');
			record._font = font.hasOwnProperty('fontName') ? font.fontName.fontName : font.info.name; // non-standard
		//}
		
		if (record.styleFlagsHasColor) colors[record.textColor.toHex()] = record.textColor;
	}
	
	// Get just unique colors
	for (var i in colors) {
		this.colors.push(colors[i]);
	}
};