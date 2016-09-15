/*
The ShowFrame tag instructs Flash Player to display the contents of the display list. The file is
paused for the duration of a single frame.
The minimum file format version is SWF 1.
*/
function ShowFrame(ba, obj) {
	this.header = new RecordHeader(ba);
}