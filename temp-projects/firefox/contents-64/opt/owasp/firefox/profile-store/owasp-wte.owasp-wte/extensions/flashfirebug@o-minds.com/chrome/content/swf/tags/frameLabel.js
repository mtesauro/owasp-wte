/*
The FrameLabel tag gives the specified Name to the current frame. ActionGoToLabel uses
this name to identify the frame.
The minimum file format version is SWF 3.

In SWF files of version 6 or later, an extension to the FrameLabel tag called named anchors is
available. A named anchor is a special kind of frame label that, in addition to labeling a frame
for seeking using ActionGoToLabel, labels the frame for seeking using HTML anchor syntax.
To create a named anchor, insert one additional non-null byte after the null terminator of the
anchor name. This is valid only for SWF 6 or later.
*/
function FrameLabel(ba, obj) {
	var startPos = ba.position;
	this.header = new RecordHeader(ba);
	this.name = ba.readString();
	
	// If there is still data to read, assume it's an anchor flag (1 byte), in SWF files of version 6 or later
	if (this.header.contentLength - (ba.position - startPos) > 0) this.namedAnchorFlag = ba.readUI8(); // Always 1
}