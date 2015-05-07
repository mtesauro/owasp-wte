/*
An ACTIONRECORD consists of an ACTIONRECORDHEADER followed by a possible
data payload. The ACTIONRECORDHEADER describes the action using an ActionCode.
If the action also carries data, the ActionCode's high bit will be set which indicates that the
ActionCode is followed by a 16-bit length and a data payload. Note that many actions have
no data payload and only consist of a single byte value.
*/
function ActionRecordHeader(ba) {
	this.pos = ba.position - 3; // * The previous position
	
	this.actionCode = ba.readUI8();
	if (this.actionCode >= 0x80) this.length = ba.readUI16();
}