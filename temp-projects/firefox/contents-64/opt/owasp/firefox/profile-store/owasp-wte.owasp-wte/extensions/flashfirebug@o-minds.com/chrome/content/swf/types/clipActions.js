/*
Clip actions are valid for placing sprite characters only. Clip actions define event handlers for
a sprite character.
*/
function ClipActions(ba, obj) {
	ba.readUI16(); // Reserved, must be 0
	this.allEventFlags = new ClipEventFlags(ba, obj);
	this.clipActionRecords = [];
	
	// ClipActionEndFlag, must be 0
	
	while(obj.version <= 5 ? (ba.readUI16() != 0) : (ba.readUI32() != 0)) {
		ba.position -= (obj.version <= 5) ? 2 : 4;
		this.clipActionRecords.push(new ClipActionRecord(ba, obj));
	}
}