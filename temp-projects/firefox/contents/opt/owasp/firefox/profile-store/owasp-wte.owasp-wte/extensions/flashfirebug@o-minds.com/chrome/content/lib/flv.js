(function() {

Flashbug.FLV = function(vid, frameRate, frameData, frameNum) {
	
	var ba2 = new Flashbug.ByteArray(),
		isFirst = false;
	if (vid.data == '') {
		// Write FLV header //
		ba2.writeUTFBytes('FLV');
		ba2.writeUI8(1);
		ba2.writeUB(0, 5); // Reserved
		ba2.writeUB(0, 1); // Audio tags present, no becuase its streamed and gets combined with other streams
		ba2.writeUB(0, 1); // Reserved
		ba2.writeUB(1, 1); // Video tags present
		ba2.writeUI32(9); // Data Offset
		
		// Write FLV Body //
		ba2.writeUI32(0); // Previous Tag Size
		
		isFirst = true;
	}
	
	var isSpark = (vid.codecID == 2);
	var isVP6 = (vid.codecID == 4 || vid.codecID == 5);
	var vidLength = isVP6 ? frameData.length + 2 : isSpark ? frameData.length + 1 : frameData.length;
	
	// Tag type. 8/audio 9/video 18/script
	ba2.writeUI8(9); 
	
	// Data size
	ba2.writeUI24(vidLength);
	
	// Time in ms at which the data in this tag applies. 
	// This value is relative to the first tag in the FLV file, which always has a timestamp of 0.
	// Not perfect, but very close
	ba2.writeUI24((frameNum / frameRate) * 1000);
	
	// Extension of the Timestamp field to form a SI32 value.
	// This field represents the upper 8 bits, while the previous Timestamp field represents the lower 24 bits of the time in milliseconds.
	ba2.writeUI8(0);
	
	// StreamID, always 0
	ba2.writeUI24(0); 
	
	// Write VideoData
	if (isVP6 || isSpark) {
		/*
		FrameType
		1: keyframe (for AVC, a seekable frame)
		2: inter frame (for AVC, a nonseekable frame)
		3: disposable inter frame (H.263 only)
		4: generated keyframe (reserved for server use only)
		5: video info/command frame
		*/
		ba2.writeUB(isFirst ? 1 : 2, 4);
		
		/*
		CodecID
		1 = JPEG (currently unused)
		2 = Sorenson H.263
		3 = Screen video (SWF 7 and	later only)
		4 = On2 VP6 (SWF 8 and later only)
		5 = On2 VP6 with alpha channel (SWF 8 and later only)
		6 = Screen video version 2 (SWF 9 and later only)
		7 = AVC (H.264) (SWF 9 and later only)
		*/
		ba2.writeUB(vid.codecID, 4);
	}
	
	if (isVP6) {
		// Some sort of offset? 128 is arbitrary, doesn't seem to impact anything
		var n = (vid.codecID == 4) ? 0 : 128;
		ba2.writeUI8(n);
	}
	ba2.writeBytes(frameData);
	
	// Size of previous tag, including its header. //
	// For FLV version 1, this value is 11 plus the DataSize of the previous tag.
	ba2.writeUI32(vidLength + 11);
	
	return ba2._buffer;
}

})();