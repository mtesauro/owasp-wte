function RegisterParam(ba) {
	this.register = ba.readUI8();
	this.paramName = ba.readString();
}