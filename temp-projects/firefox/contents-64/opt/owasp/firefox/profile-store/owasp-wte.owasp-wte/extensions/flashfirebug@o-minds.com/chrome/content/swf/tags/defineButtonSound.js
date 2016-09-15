/*
The DefineButtonSound tag defines which sounds (if any) are played on state transitions.
The minimum file format version is SWF 2.
*/
function DefineButtonSound(ba, obj) {
	this.header = new RecordHeader(ba);
	this.buttonId = ba.readUI16();
	
	this.buttonSoundChar0 = ba.readUI16();
	if (this.buttonSoundChar0) this.buttonSoundInfo0 = new SoundInfo(ba);
	
	this.buttonSoundChar1 = ba.readUI16();
	if (this.buttonSoundChar1) this.buttonSoundInfo1 = new SoundInfo(ba);
	
	this.buttonSoundChar2 = ba.readUI16();
	if (this.buttonSoundChar2) this.buttonSoundInfo2 = new SoundInfo(ba);
	
	this.buttonSoundChar3 = ba.readUI16();
	if (this.buttonSoundChar3) this.buttonSoundInfo3 = new SoundInfo(ba);
};