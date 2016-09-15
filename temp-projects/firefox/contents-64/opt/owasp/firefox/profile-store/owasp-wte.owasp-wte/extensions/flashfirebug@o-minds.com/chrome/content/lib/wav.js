/**
 * Write WAV wrapper to raw samples  IMA ADPCM!!!!
 
 WAVE Codec Registry
 http://www.rfc-editor.org/rfc/rfc2361.txt
 
 */
(function() {

Flashbug.WAV = function (snd, data) {
	var soundRate = snd.hasOwnProperty('streamSoundRate') ? snd.streamSoundRate : snd.soundRate,
		soundType = snd.hasOwnProperty('streamSoundType') ? snd.streamSoundType : snd.soundType,
		soundSampleCount = snd.hasOwnProperty('streamSoundSampleCount') ? snd.streamSoundSampleCount : snd.soundSampleCount,
		soundSize = snd.hasOwnProperty('streamSoundSize') ? snd.streamSoundSize : snd.soundSize,
		soundFormat = snd.hasOwnProperty('streamSoundCompression') ? snd.streamSoundCompression : snd.soundFormat,
		isADPCM = (soundFormat == 1),
		isStereo = !!soundType,
		bits = [8, 16],
		rates = [
			5500,
			11025,
			22050,
			44100
		],
		format = isADPCM ? 0x0011 : 0x0001,
		dataSize = data.length,
		factSize = 4,
		adpcmSize = isADPCM ? 2 : 0,
		formatSize = 16 + (isADPCM ? (2 + adpcmSize) : 0),
		riffSize = 4 + (8 + formatSize) + (isADPCM ? (2 + adpcmSize) + (8 + factSize) : 0) + (8 + dataSize);
		ba2 = new Flashbug.ByteArray('', Flashbug.ByteArray.LITTLE_ENDIAN);
	
	// This is ignored for compressed formats which always decode to 16 bits internally.
	if (isADPCM) soundSize = 1;
	
	snd.rate = rates[soundRate];
	snd.channels = soundType ? 2 : 1;
	if (isADPCM) {
		snd.bits = 4; // TODO figure out bits encoded
		switch (snd.bits) {
			case 3:	snd.blockAlign = ((snd.bits * 3) + 1) * 4 * snd.channels; break;
			case 4:	snd.blockAlign = snd.bits * 512; break; // (snd.bits + 1) * snd.bits * snd.channels
		}
	} else {
		//snd.bits = soundSampleCount * (bits[soundSize] / 8);
		snd.bits = bits[soundSize];
		snd.blockAlign = snd.channels * (bits[soundSize] / 8); // SignificantBitsPerSample / 8 * NumChannels
	}
	
	// Write Wave File Header - RIFF chunk
	ba2.writeUTFBytes('RIFF'); 					// Chunk ID
	ba2.writeInt(riffSize); 					// Chunk size
	ba2.writeUTFBytes('WAVE'); 					// WAVE ID
	
	// Write Format Sub-chunk
	ba2.writeUTFBytes('fmt '); 					// Chunk ID
	ba2.writeInt(formatSize); 					// Chunk size
	ba2.writeShort(format); 					// Format code
	ba2.writeShort(snd.channels); 				// Channels: 1 = mono, 2 = stereo
	ba2.writeInt(snd.rate); 					// Samples Per Sec: e.g., 44100
	ba2.writeInt(snd.rate * snd.blockAlign); 	// Avg Bytes Per Sec: e.g., (SampleRate * BlockAlign) 90316800 ------- 22087     128 * (1024 / 8)
	ba2.writeShort(snd.blockAlign);				// Block Align
	ba2.writeShort(snd.bits); 					// Bits Per Sample: e.g., 8 or 16
	
	/*
	- Original -
	44KHz, IMA ADPCM 4 Bit, 220kbps Mono 47.3 kB 16 Bit
	
	- VLC -
	format: 0x0011, fourcc:   ms, channels: 1, freq: 44100 Hz, bitrate: 289667Ko/s, blockalign: 18900, bits/samples: 16, extra size: 32
	
	- Help -
	http://git.ffmpeg.org/?p=ffmpeg;a=blob;f=libavformat/wav.c;hb=HEAD
	http://www.libspark.org/wiki/yossy/swfassist
	http://www.hydrogenaudio.org/forums/lofiversion/index.php/t45453.html
	http://icculus.org/SDL_sound/downloads/external_documentation/wavecomp.htm
	http://www.sonicspot.com/guide/wavefiles.html
	*/
	if (isADPCM) {
		// Write sub chunk
		ba2.writeShort(adpcmSize); 				// Extra data size
		// Samples per block (((blockAlign - (7 * channels)) * 8) / (bits * channels)) + 2
		ba2.writeShort((((snd.blockAlign - (7 * snd.channels)) * 8) / (snd.bits * snd.channels)) + 2); // 4084 ----- 4089
		
		// Write Fact Sub-chunk
		ba2.writeUTFBytes('fact'); 				// Chunk ID
		ba2.writeInt(factSize);					// Chunk size
		ba2.writeInt(soundSampleCount); 		// Number of samples
	}
	
	// Write Data Sub-chunk
	ba2.writeUTFBytes('data'); 					// Chunk ID
	ba2.writeInt(dataSize); 					// Chunk size
	ba2.writeBytes(data); 						// Raw samples
	
	return ba2._buffer;
}

})();