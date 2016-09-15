/*
Undocumented - SWF5
*/
function DefineCommandObject(ba, obj) {
	this.header = new RecordHeader(ba);
	this.data = ba.readBytes(this.header.contentLength);
};