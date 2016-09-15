/*
Undocumented - SWF4 - OBSOLETE...a reference to an external video stream
*/
function DefineVideo(ba, obj) {
	this.header = new RecordHeader(ba);
	ba.seek(this.header.contentLength); // Skip bytes
}