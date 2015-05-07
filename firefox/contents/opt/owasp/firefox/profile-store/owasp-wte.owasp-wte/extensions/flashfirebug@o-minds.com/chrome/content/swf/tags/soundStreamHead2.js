/*
The SoundStreamHead2 tag is identical to the SoundStreamHead tag, except it allows
different values for StreamSoundCompression and StreamSoundSize (SWF 3 file format).
*/
function SoundStreamHead2(ba, obj) {
	this.header = new RecordHeader(ba);
	ba.readUB(4); // Reserved
	this.streamID = soundStreamID++;
	this.playbackSoundRate = ba.readUB(2);
	this.playbackSoundSize = ba.readUB(1);
	this.playbackSoundType = ba.readUB(1);
	this.streamSoundCompression = ba.readUB(4); // 1 = ADPCM, SWF 4 and later only: 2 = MP3
	this.streamSoundRate = ba.readUB(2);
	this.streamSoundSize = ba.readUB(1);
	this.streamSoundType = ba.readUB(1);
	this.playbackSoundRateLabel = SoundRate[this.playbackSoundRate];
	this.playbackSoundSizeLabel = SoundSize[this.playbackSoundSize];
	this.playbackSoundTypeLabel = SoundType[this.playbackSoundType];
	this.streamSoundCompressionLabel = SoundCompressionLabel[this.streamSoundCompression];
	this.streamSoundRateLabel = SoundRate[this.streamSoundRate];
	this.streamSoundSizeLabel = SoundSize[this.streamSoundSize];
	this.streamSoundTypeLabel = SoundType[this.streamSoundType];
	
	this.streamSoundSampleCount = ba.readUI16();
	if (this.streamSoundCompression == SoundCompression.MP3) this.latencySeek = ba.readSI16();
	
	this.id = '-'; // *
	this.numSamples = 0; // *
	this.numFrames = 0; // *
	this.rawData = this.data = ''; // *
}