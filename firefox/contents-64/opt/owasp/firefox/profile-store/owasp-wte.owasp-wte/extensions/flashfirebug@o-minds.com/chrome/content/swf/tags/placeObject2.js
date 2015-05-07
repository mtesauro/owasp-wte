/*
The PlaceObject2 tag extends the functionality of the PlaceObject tag. The PlaceObject2 tag
can both add a character to the display list, and modify the attributes of a character that is
already on the display list. The PlaceObject2 tag changed slightly from SWF 4 to SWF 5. In
SWF 5, clip actions were added.
The minimum file format version is SWF 3.
*/
function PlaceObject2(ba, obj) {
	this.header = new RecordHeader(ba);
	this.placeFlagHasClipActions = ba.readBoolean();
	this.placeFlagHasClipDepth = ba.readBoolean();
	this.placeFlagHasName = ba.readBoolean();
	this.placeFlagHasRatio = ba.readBoolean();
	this.placeFlagHasColorTransform = ba.readBoolean();
	this.placeFlagHasMatrix = ba.readBoolean();
	this.placeFlagHasCharacter = ba.readBoolean();
	this.placeFlagMove = ba.readBoolean();
	this.depth = ba.readUI16();
	
	if (this.placeFlagHasCharacter) this.characterId = ba.readUI16();
	if (this.placeFlagHasMatrix) this.matrix = new Matrix(ba);
	if (this.placeFlagHasColorTransform) this.colorTransform = new CXFormWithAlpha(ba);
	if (this.placeFlagHasRatio) this.ratio = ba.readUI16();
	if (this.placeFlagHasName) this.name = ba.readString();
	if (this.placeFlagHasClipDepth) this.clipDepth = ba.readUI16();
	if (this.placeFlagHasClipActions) this.clipActions = new ClipActions(ba, obj);
}