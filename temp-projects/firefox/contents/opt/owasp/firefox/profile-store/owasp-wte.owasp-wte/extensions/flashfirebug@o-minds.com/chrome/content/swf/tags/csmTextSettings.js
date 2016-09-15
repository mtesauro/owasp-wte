/*
In addition to the advanced text rendering tags discussed earlier in this chapter, the rendering
engine also supports a tag for modifying text fields. The CSMTextSettings tag modifies a
previously streamed DefineText, DefineText2, or DefineEditText tag. The CSMTextSettings
tag turns advanced anti-aliasing on or off for a text field, and can also be used to define quality
and options.
The minimum file format version is SWF 8.
*/
function CSMTextSettings(ba, obj) {
	this.header = new RecordHeader(ba);
	this.textID = ba.readUI16();
	this.useFlashType =  ba.readUB(2);
	this.gridFit =  ba.readUB(3);
	ba.readUB(3); // Reserved, always 0
	this.thickness =  ba.readFixed();
	this.sharpness =  ba.readFixed();
	ba.readUI8(); // Reserved, always 0
};