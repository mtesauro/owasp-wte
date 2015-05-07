/*
The RemoveObject2 tag removes the character at the specified depth from the display list.
The minimum file format version is SWF 3.
*/
function RemoveObject2(ba, obj) {
	this.header = new RecordHeader(ba);
	this.depth = ba.readUI16();
}