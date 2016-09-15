/*
MP3 sound data is described in the following table:
*/
function MP3SoundData(ba, length) {
	this.length = length; // *
	this.seekSamples = ba.readSI16();
	this.mp3Frames = ba.readBytes(length);
}