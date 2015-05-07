/*
Undocumented - SWF3
Assume shapes are filled as PostScript style paths
*/
function PathsArePostscript(ba, obj) {
	this.header = new RecordHeader(ba);
	this.data = ba.readBytes(this.header.contentLength);
};