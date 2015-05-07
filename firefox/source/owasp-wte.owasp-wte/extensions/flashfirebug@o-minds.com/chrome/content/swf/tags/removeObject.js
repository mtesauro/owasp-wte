/*
The RemoveObject tag removes the specified character (at the specified depth) from the
display list.
The minimum file format version is SWF 1.
*/
function RemoveObject(ba, obj) {
	this.header = new RecordHeader(ba);
	this.characterId = ba.readUI16();
	this.depth = ba.readUI16();
}