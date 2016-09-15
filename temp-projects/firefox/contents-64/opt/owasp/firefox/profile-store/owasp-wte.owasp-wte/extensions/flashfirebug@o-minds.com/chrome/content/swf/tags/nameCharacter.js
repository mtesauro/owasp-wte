/*
Undocumented/Generator - SWF3
*/
function NameCharacter(ba, obj) {
	this.header = new RecordHeader(ba);
	this.nameCharacter = ba.readBytes(this.header.contentLength);
};