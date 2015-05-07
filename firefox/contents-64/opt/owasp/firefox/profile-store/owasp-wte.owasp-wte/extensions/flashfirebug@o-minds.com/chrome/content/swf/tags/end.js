/*
The End tag marks the end of a file. This must always be the last tag in a file. The End tag is
also required to end a sprite definition.
The minimum file format version is SWF 1.
*/
function End(ba, obj) {
	this.header = new RecordHeader(ba);
}