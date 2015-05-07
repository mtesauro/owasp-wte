/*
Undocumented - SWF5 Defines a reference to an external font source
*/
function FontRef(ba, obj) {
	this.header = new RecordHeader(ba);
	this.data = ba.readBytes(this.header.contentLength);
};