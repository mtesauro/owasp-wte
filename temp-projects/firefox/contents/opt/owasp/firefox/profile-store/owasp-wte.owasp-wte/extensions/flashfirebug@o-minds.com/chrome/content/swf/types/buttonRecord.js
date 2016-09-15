/*
A button record defines a character to be displayed in one or more button states. The
ButtonState flags indicate which state (or states) the character belongs to.
A one-to-one relationship does not exist between button records and button states. A single
button record can apply to more than one button state (by setting multiple ButtonState flags),
and multiple button records can be present for any button state.
Each button record also includes a transformation matrix and depth (stacking-order)
information. These apply just as in a PlaceObject tag, except that both pieces of information
are relative to the button character itself.
SWF 8 and later supports the new ButtonHasBlendMode and ButtonHasFilterList fields to
support blend modes and bitmap filters on buttons. Flash Player 7 and earlier ignores these
two fields.
*/
function ButtonRecord(ba, tag) {
	var res = ba.readUB(2); // Reserved, always 0
	this.buttonHasBlendMode = ba.readBoolean();
	this.buttonHasFilterList = ba.readBoolean();
	this.buttonStateHitTest = ba.readBoolean();
	this.buttonStateDown = ba.readBoolean();
	this.buttonStateOver = ba.readBoolean();
	this.buttonStateUp = ba.readBoolean();

	// Is end record?
	if (!this.buttonHasBlendMode && !this.buttonHasFilterList && !this.buttonStateHitTest && !this.buttonStateDown && !this.buttonStateOver && !this.buttonStateUp && res == 0) {
		this.endRecord = true;
		return;
	}
	
	this.id = ba.readUI16();
	this.placeDepth = ba.readUI16();
	this.placeMatrix = new Matrix(ba);

	// DefineButton2
	if (tag == 34) {
		this.colorTransform = new CXFormWithAlpha(ba);
		if (this.buttonHasFilterList) this.FilterList = new FilterList(ba);
		if (this.buttonHasBlendMode) this.blendMode = BLEND_MODES[ba.readUI8()];
	}
}