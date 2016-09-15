/*
StartSound is a control tag that either starts (or stops) playing a sound defined by
DefineSound. The SoundId field identifies which sound is to be played. The SoundInfo field
defines how the sound is played. Stop a sound by setting the SyncStop flag in the
SOUNDINFO record.
The minimum file format version is SWF 1.
*/
function StartSound(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.soundInfo = new SoundInfo(ba);
}