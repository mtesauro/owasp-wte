/*
Undocumented - SWF3
*/
function FreeAll(ba, obj) {
	this.header = new RecordHeader(ba);
	this.data = ba.readBytes(this.header.contentLength);
};