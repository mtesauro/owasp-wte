function FocalGradient(ba, tag) {
	this.spreadMode = ba.readUB(2);
	this.interpolationMode = ba.readUB(2);
	this.numGradients = ba.readUB(4);
	this.gradientRecords = [];
	
	var numStops = this.numGradients;
	while(numStops--) {
		this.gradientRecords.push(new GradRecord(ba, tag));
	}
	this.focalPoint = ba.readFixed8();
};