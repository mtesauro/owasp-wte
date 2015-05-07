/*
DefineVideoStream defines a video character that can later be placed on the display list
*/
function DefineVideoStream(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.numFrames = ba.readUI16();
	this.width = ba.readUI16();
	this.height = ba.readUI16();
	
	ba.readUB(4); // Reserved
	
	this.videoFlagsDeblocking = ba.readUB(3);
	this.deblockingType = VideoDeblockingType[this.videoFlagsDeblocking]; // *
	
	this.videoFlagsSmoothing = ba.readBoolean();
	this.smoothing = VideoSmoothing[this.videoFlagsSmoothing ? 1 : 0]; // *
	
	this.codecID = ba.readUI8();
	this.codec = VideoCodecID[this.codecID]; // *
	
	this.data = ''; // *
	this.duration = 0; // *
}