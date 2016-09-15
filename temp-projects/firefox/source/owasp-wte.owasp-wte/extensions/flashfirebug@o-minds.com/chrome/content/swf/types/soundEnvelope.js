/*
The SOUNDENVELOPE structure is defined as follows:
*/
function SoundEnvelope(ba) {
	this.pos44 = ba.readUI32();
	this.leftLevel = ba.readUI16();
	this.rightLevel = ba.readUI16();
}