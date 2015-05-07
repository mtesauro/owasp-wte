/*
Undocumented - SWF1
*/
function FreeCharacter(ba, obj) {
	this.header = new RecordHeader(ba);
	this.data = ba.readBytes(this.header.contentLength);
};