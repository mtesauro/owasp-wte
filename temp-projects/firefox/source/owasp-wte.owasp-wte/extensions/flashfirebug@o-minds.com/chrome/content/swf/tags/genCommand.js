/*
Undocumented/Generator - Gives information about what generated this SWF and its version. SWF3 
*/
function GenCommand(ba, obj) {
	this.header = new RecordHeader(ba);
	this.version = ba.readUI32();
	this.info = ba.readString();
};