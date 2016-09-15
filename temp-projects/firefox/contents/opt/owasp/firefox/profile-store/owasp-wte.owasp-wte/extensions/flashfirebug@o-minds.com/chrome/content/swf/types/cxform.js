/*
The CXFORM record defines a simple transform that can be applied to the color space of a
graphic object.
*/
function CXForm(ba) {
	this.hasAddTerms = ba.readBoolean();
	this.hasMultTerms = ba.readBoolean();
	this.nbits = ba.readUB(4);
	
	if (this.hasMultTerms) {
		this.redMultTerm = ba.readSB(this.nbits);
		this.greenMultTerm = ba.readSB(this.nbits);
		this.blueMultTerm = ba.readSB(this.nbits);
	}
	
	if (this.hasAddTerms) {
		this.redAddTerm = ba.readSB(this.nbits);
		this.greenAddTerm = ba.readSB(this.nbits);
		this.blueAddTerm = ba.readSB(this.nbits);
	}
}