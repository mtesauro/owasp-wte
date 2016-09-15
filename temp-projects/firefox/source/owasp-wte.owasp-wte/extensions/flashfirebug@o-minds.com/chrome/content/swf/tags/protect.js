/*
The Protect tag marks a file as not importable for editing in an authoring environment. If the
Protect tag contains no data (tag length = 0), the SWF file cannot be imported. If this tag is
present in the file, any authoring tool should prevent the file from loading for editing.
If the Protect tag does contain data (tag length is not 0), the SWF file can be imported if the
correct password is specified. The data in the tag is a null-terminated string that specifies an
MD5-encrypted password. Specifying a password is only supported in SWF 5 or later.
The minimum file format version is SWF 2.
*/
function Protect(ba, obj) {
	this.header = new RecordHeader(ba);
	if (this.header.contentLength > 0) this.password = ba.readBytes(this.header.contentLength);
}