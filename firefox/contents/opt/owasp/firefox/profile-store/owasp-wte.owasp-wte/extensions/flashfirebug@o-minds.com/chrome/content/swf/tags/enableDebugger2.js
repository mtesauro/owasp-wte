/*
The EnableDebugger2 tag enables debugging. The Password field is encrypted by using the
MD5 algorithm, in the same way as the Protect tag.
The minimum file format version is SWF 6.
*/
function EnableDebugger2(ba, obj) {
	this.header = new RecordHeader(ba);
	ba.readUI16(); // Reserved, always 0
	if (this.header.contentLength > 0) this.password = ba.readBytes(this.header.contentLength - 2);
}