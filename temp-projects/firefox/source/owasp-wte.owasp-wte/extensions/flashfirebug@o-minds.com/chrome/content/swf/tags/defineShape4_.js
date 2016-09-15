/*
Undocumented - use 83
*/
function DefineShape4_(ba, obj) {
	this.header = new RecordHeader(ba);
	this.data = ba.readBytes(this.header.contentLength);
};