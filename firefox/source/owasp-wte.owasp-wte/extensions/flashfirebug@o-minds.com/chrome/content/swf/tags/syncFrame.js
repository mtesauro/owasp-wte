/*
Undocumented - SWF3
*/
function SyncFrame(ba, obj) {
	this.header = new RecordHeader(ba);
	this.data = ba.readBytes(this.header.contentLength);
};