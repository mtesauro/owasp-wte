/*
The CXFORMWITHALPHA record extends the functionality of CXFORM by allowing
color transforms to be applied to the alpha channel, as well as the red, green, and blue
channels.
*/
function CXFormWithAlpha(ba) {
	this.hasAddTerms = ba.readBoolean();
	this.hasMultTerms = ba.readBoolean();
	this.nbits = ba.readUB(4);
	
	if (this.hasMultTerms) {
		this.redMultTerm = ba.readSB(this.nbits);
		this.greenMultTerm = ba.readSB(this.nbits);
		this.blueMultTerm = ba.readSB(this.nbits);
		this.alphaMultTerm = ba.readSB(this.nbits);
	}
	
	if (this.hasAddTerms) {
		this.redAddTerm = ba.readSB(this.nbits);
		this.greenAddTerm = ba.readSB(this.nbits);
		this.blueAddTerm = ba.readSB(this.nbits);
		this.alphaAddTerm = ba.readSB(this.nbits);
	}
	ba.align();
}