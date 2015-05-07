/*
VideoFrame provides a single frame of video data for a video character that is already defined
with DefineVideoStream.
*/
function VideoFrame(ba, obj) {
	this.header = new RecordHeader(ba);
	this.streamID = ba.readUI16();
	this.frameNum = ba.readUI16();
	this.videoData = ba.readBytes(this.header.contentLength - 4);
	// Not typed to datapackets becuase it'd be too intensive with no payoff
}