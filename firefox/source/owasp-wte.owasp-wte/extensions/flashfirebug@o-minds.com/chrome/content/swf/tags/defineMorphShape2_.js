/*
Undocumented
*/
function DefineMorphShape2_(ba, obj) {
	this.header = new RecordHeader(ba);
	this.data = ba.readBytes(this.header.contentLength);
};