function ClipEventFlags(ba, obj) {
	this.clipEventKeyUp = ba.readBoolean();
	this.clipEventKeyDown = ba.readBoolean();
	this.clipEventMouseUp = ba.readBoolean();
	this.clipEventMouseDown = ba.readBoolean();
	this.clipEventMouseMove = ba.readBoolean();
	this.clipEventUnload = ba.readBoolean();
	this.clipEventEnterFrame = ba.readBoolean();
	this.clipEventLoad = ba.readBoolean();
	this.clipEventDragOver = ba.readBoolean();
	this.clipEventRollOut = ba.readBoolean();
	this.clipEventRollOver = ba.readBoolean();
	this.clipEventReleaseOutside = ba.readBoolean();
	this.clipEventRelease = ba.readBoolean();
	this.clipEventPress = ba.readBoolean();
	this.clipEventInitialize = ba.readBoolean();
	this.clipEventData = ba.readBoolean();
	
	if (obj.version >= 6) {
		ba.readUB(5); // Reserved, always 0
		this.clipEventConstruct =  ba.readBoolean();
		this.clipEventKeyPress =  ba.readBoolean();
		this.clipEventDragOut =  ba.readBoolean();
		ba.readUB(8); // Reserved, always 0
	};
	ba.align();
}