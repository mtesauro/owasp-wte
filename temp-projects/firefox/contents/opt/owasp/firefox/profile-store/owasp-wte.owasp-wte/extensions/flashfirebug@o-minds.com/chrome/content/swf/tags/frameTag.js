/*
Undocumented - SWF3 A tag command for the Flash Generator (WORD duration, STRING label)
*/
function FrameTag(ba, obj) {
	this.header = new RecordHeader(ba);
	this.duration = ba.readUI16();
	this.label = ba.readString();
	//this.data = ba.readBytes(this.header.contentLength);
};