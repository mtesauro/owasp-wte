function Gradient(ba, tag) {
	this.spreadMode = ba.readUB(2);
	this.interpolationMode = ba.readUB(2);
	this.numGradients = ba.readUB(4);
	this.gradientRecords = [];
	
	var i = this.numGradients;
	while(i--) {
		this.gradientRecords.push(new GradRecord(ba, tag));
	}
};