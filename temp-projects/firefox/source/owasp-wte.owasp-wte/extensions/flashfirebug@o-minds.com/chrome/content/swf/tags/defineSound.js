/*
The DefineSound tag defines an event sound. It includes the audio coding format, sampling
rate, size of each sample (8 or 16 bit), a stereo/mono flag, and an array of audio samples. Note
that not all of these parameters will be honored depending on the audio coding format.
The minimum file format version is SWF 1.
*/
function DefineSound(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.soundFormat = ba.readUB(4);
	this.soundRate = ba.readUB(2);
	
	// Size of each sample. This parameter only pertains to uncompressed formats.
	this.soundSize = ba.readUB(1);
	this.soundType = ba.readUB(1);
	
	this.soundRateLabel = SoundRate[this.soundRate];
	this.soundSizeLabel = SoundSize[this.soundSize];
	this.soundTypeLabel = SoundType[this.soundType];
	this.soundFormatLabel = SoundCompressionLabel[this.soundFormat];
	
	// Number of samples. Not affected by mono/stereo setting; for stereo sounds this is the number of sample pairs.
	this.soundSampleCount = ba.readUI32();
	
	switch(this.soundFormat) {
		case SoundCompression.UNCOMPRESSED_NATIVE_ENDIAN :
		case SoundCompression.ADPCM :
		case SoundCompression.UNCOMPRESSED_LITTLE_ENDIAN :
			// Need to create WAV wrapper since this is raw data //
			this.data = Flashbug.WAV(this, ba.readBytes(this.header.contentLength - 7));
			break;
		case SoundCompression.MP3 :
			this.data = new MP3SoundData(ba, this.header.contentLength - 9);
			break;
		case SoundCompression.NELLYMOSER_16_KHZ :
		case SoundCompression.NELLYMOSER_8_KHZ :
		case SoundCompression.NELLYMOSER :
		case SoundCompression.SPEEX :
			this.data = ba.readBytes(this.header.contentLength - 7);
			break;
	}
}