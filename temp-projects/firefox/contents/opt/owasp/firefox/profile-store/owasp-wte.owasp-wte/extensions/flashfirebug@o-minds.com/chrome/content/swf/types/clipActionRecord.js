function ClipActionRecord(ba, obj) {
	this.eventFlags = new ClipEventFlags(ba, obj);
	this.actionRecordSize = ba.readUI32();
	
	var endPos = ba.position + this.actionRecordSize;
	if (this.eventFlags.clipEventKeyPress) this.keyCode = ba.readUI8();
	
	this.actions = [];
	var record = getActionRecord(ba);
	while (record) {
		this.actions.push(record);
		record = getActionRecord(ba);
	}
	
	this.actionscript = parseActions(this.actions); // *
}