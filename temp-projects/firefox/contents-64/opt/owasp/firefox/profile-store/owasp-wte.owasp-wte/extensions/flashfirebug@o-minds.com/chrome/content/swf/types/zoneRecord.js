function ZoneRecord(ba) {
	this.numZoneData = ba.readUI8(); // Always 2
	this.zoneData = [];
	var i = this.numZoneData;
	while (i--) {
		this.zoneData.push(new ZoneData(ba));
	}
	ba.readUB(6); // Reserved, must be 0
	this.zoneMaskY = ba.readBoolean();
	this.zoneMaskX = ba.readBoolean();
}