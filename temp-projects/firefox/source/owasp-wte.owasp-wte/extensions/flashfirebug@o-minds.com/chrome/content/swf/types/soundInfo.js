/*
The SOUNDINFO record modifies how an event sound is played. An event sound is defined
with the DefineSound tag.
*/
function SoundInfo(ba) {
	ba.readUB(2); // Reserved, always 0
	this.syncStop = ba.readBoolean();
	this.syncNoMultiple = ba.readBoolean();
	this.hasEnvelope = ba.readBoolean();
	this.hasLoops = ba.readBoolean();
	this.hasOutPoint = ba.readBoolean();
	this.hasInPoint = ba.readBoolean();
	if (this.hasInPoint) this.inPoint = ba.readUI32();
	if (this.hasOutPoint) this.outPoint = ba.readUI32();
	if (this.hasLoops) this.loopCount = ba.readUI16();
	if (this.hasEnvelope) {
		this.envPoints = ba.readUI8();
		this.envelopeRecords = [];
		var i = this.envPoints;
		while (i--) {
			this.envelopeRecords.push(new SoundEnvelope(ba));
		}
	}
}