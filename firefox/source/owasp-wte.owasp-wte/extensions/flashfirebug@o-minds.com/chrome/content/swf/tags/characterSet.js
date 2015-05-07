/*
Undocumented/Generator - SWF5 Defines the character set used to store strings
*/
function CharacterSet(ba, obj) {
	this.header = new RecordHeader(ba);
	this.charSet = ba.readBytes(this.header.contentLength);
}