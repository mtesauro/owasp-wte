/*
The SoundStreamBlock tag defines sound data that is interleaved with frame data so that
sounds can be played as the SWF file is streamed over a network connection. The
SoundStreamBlock tag must be preceded by a SoundStreamHead or SoundStreamHead2 tag.
There may only be one SoundStreamBlock tag per SWF frame.
The minimum file format version is SWF 1.
*/
function SoundStreamBlock(ba, obj) {
	this.header = new RecordHeader(ba);
	var pos = ba.position;
	this.streamSoundData = ba.readBytes(this.header.contentLength);
	
	// If there is more than one sound playing on a given frame, they are combined.
	hasSoundBlock = true;
	
	// Get last stream, append stream block
	var strm = obj.streams[obj.streams.length - 1];
	if(strm != null) {
		strm.rawData += this.streamSoundData;
		switch(strm.streamSoundCompression) {
			case SoundCompression.UNCOMPRESSED_NATIVE_ENDIAN :
			case SoundCompression.ADPCM :
			case SoundCompression.UNCOMPRESSED_LITTLE_ENDIAN :
				strm.data = Flashbug.WAV(strm, strm.rawData);
				break;
			case SoundCompression.MP3 :
				ba.position = pos;
				var numSamples = ba.readUI16();
				var seekSamples = ba.readSI16();
				if (numSamples > 0) {
					strm.numSamples += numSamples;
					strm.data += ba.readBytes(this.header.contentLength - 4);
				}
				strm.numFrames++;
				break;
			case SoundCompression.NELLYMOSER_16_KHZ :
			case SoundCompression.NELLYMOSER_8_KHZ :
			case SoundCompression.NELLYMOSER :
			case SoundCompression.SPEEX :
				strm.data += this.streamSoundData;
				break;
		}
	} else {
		trace('readSoundStreamBlockTag - unable to find streamhead');
	}
}