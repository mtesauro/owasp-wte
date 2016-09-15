/*
Undocumented - This tag is used when debugging an SWF movie. 
It gives information about what debug file to load to match the SWF movie with the source. The identifier is a UUID. SWF6
*/
function DebugID(ba, obj) {
	this.header = new RecordHeader(ba);
	this.uuid = ba.readString(this.header.contentLength);
};