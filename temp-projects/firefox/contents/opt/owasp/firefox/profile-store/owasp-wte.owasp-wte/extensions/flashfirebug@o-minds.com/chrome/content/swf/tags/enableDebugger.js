/*
The EnableDebugger tag enables debugging. The password in the EnableDebugger tag is
encrypted by using the MD5 algorithm, in the same way as the Protect tag.
The EnableDebugger tag was deprecated in SWF 6; Flash Player 6 or later ignores this tag
because the format of the debugging information required in the ActionScript debugger was
changed in SWF 6. In SWF 6 or later, use the EnableDebugger2 tag instead.
The minimum and maximum file format version is SWF 5.
*/
function EnableDebugger(ba, obj) {
	this.header = new RecordHeader(ba);
	if (this.header.contentLength > 0) this.password = ba.readBytes(this.header.contentLength);
}