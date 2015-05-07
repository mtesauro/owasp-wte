/*
Undocumented -  SWF2
*/
function StopSound(ba, obj) {
	this.header = new RecordHeader(ba);
	this.data = ba.readBytes(this.header.contentLength);
};