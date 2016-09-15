/*
StartSound is a control tag that either starts (or stops) playing a sound defined by
DefineSound. The SoundId field identifies which sound is to be played. The SoundInfo field
defines how the sound is played. Stop a sound by setting the SyncStop flag in the
SOUNDINFO record.
The minimum file format version is SWF 9. Supported in Flash Player 9.0.45.0 and later.
*/
function StartSound2(ba, obj) {
	this.header = new RecordHeader(ba);
	this.soundClassName = ba.readString();
	this.soundInfo = new SoundInfo(ba);
}