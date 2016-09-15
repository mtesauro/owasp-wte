/*
Undocumented - a generator tag object written to the swf.
*/
function GenTagObject(ba, obj) {
	this.header = new RecordHeader(ba);
	this.data = ba.readBytes(this.header.contentLength);
};