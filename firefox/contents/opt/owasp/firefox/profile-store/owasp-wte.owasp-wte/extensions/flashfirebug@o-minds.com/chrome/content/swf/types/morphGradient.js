function MorphGradient(ba) {
	this.numGradients = ba.readUI8();
	this.gradientRecords = [];
	this.spreadMode = SpreadModes.PAD; //*
	this.interpolationMode = InterpolationModes.RGB; //*
	
	var i = this.numGradients;
	while(i--) {
		this.gradientRecords.push(new MorphGradRecord(ba));
	}
};