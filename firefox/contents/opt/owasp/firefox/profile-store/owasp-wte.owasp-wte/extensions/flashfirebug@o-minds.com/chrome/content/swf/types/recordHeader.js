/*
Each tag begins with a tag type and a length. The tag-header formats can be either short or
long. Short tag headers are used for tags with 62 bytes of data or less. Long tag headers, with a
signed 32-bit length field, can be used for any tag size up to 2GB, far larger than is presently
practical.

The length specified in the TagCodeAndLength field does not include the
RECORDHEADER that starts a tag.
If the tag is 63 bytes or longer, it is stored in a long tag header. The long tag header consists of
a short tag header with a length of 0x3f, followed by a 32-bit length.
*/
function RecordHeader(ba) {
	if (!ba) return;
	var pos = ba.position;
	this.tagTypeAndLength = ba.readUI16();
	this.contentLength = this.tagTypeAndLength & 0x3F;
	
	// Long header
	if (this.contentLength == 0x3F) this.contentLength = ba.readSI32();
	
	this.type = this.tagTypeAndLength >> 6;
	this.headerLength = ba.position - pos; // *
	this.tagLength = this.headerLength + this.contentLength; // *
	this.name = TAGS[this.type] ? TAGS[this.type].name : '?'; // *
}