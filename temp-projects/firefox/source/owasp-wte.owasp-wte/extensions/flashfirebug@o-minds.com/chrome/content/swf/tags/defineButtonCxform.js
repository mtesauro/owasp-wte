/*
DefineButtonCxform defines the color transform for each shape and text character in a
button. This is not used for DefineButton2, which includes its own CXFORM.
The minimum file format version is SWF 2.
*/
function DefineButtonCxform(ba, obj) {
	this.header = new RecordHeader(ba);
	this.buttonId = ba.readUI16();
	this.buttonColorTransform = new CXForm(ba);
};