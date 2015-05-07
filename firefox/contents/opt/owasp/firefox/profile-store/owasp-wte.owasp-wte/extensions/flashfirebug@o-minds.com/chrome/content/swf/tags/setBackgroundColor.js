/*
The SetBackgroundColor tag sets the background color of the display.
The minimum file format version is SWF 1.
*/
function SetBackgroundColor(ba, obj) {
	this.header = new RecordHeader(ba);
	this.backgroundColor = new RGB(ba);
}