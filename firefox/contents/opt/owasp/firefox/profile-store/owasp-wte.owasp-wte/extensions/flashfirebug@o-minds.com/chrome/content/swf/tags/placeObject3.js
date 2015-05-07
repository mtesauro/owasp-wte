/*
The PlaceObject3 tag extends the functionality of the PlaceObject2 tag.
The minimum file format version is SWF 8.
*/
function PlaceObject3(ba, obj) {
	this.header = new RecordHeader(ba);
	this.placeFlagHasClipActions = ba.readBoolean();
	this.placeFlagHasClipDepth = ba.readBoolean();
	this.placeFlagHasName = ba.readBoolean();
	this.placeFlagHasRatio = ba.readBoolean();
	this.placeFlagHasColorTransform = ba.readBoolean();
	this.placeFlagHasMatrix = ba.readBoolean();
	this.placeFlagHasCharacter = ba.readBoolean();
	this.placeFlagMove = ba.readBoolean();
	
	ba.readUB(3) // Reserved, must be 0
	this.placeFlagHasImage = ba.readBoolean();
	this.placeFlagHasClassName = ba.readBoolean();
	this.placeFlagHasCacheAsBitmap = ba.readBoolean();
	this.placeFlagHasBlendMode = ba.readBoolean();
	this.placeFlagHasFilterList = ba.readBoolean();
	this.depth = ba.readUI16();
	
	if (this.placeFlagHasClassName || (this.placeFlagHasImage && this.placeFlagHasCharacter)) this.className = ba.readString();
	if (this.placeFlagHasCharacter) this.characterId = ba.readUI16();
	if (this.placeFlagHasMatrix) this.matrix = new Matrix(ba);
	if (this.placeFlagHasColorTransform) this.colorTransform = new CXFormWithAlpha(ba);
	if (this.placeFlagHasRatio) this.ratio = ba.readUI16();
	if (this.placeFlagHasName) this.name = ba.readString();
	if (this.placeFlagHasClipDepth) this.clipDepth = ba.readUI16();
	if (this.placeFlagHasFilterList) this.surfaceFilterList = new FilterList(ba);
	if (this.placeFlagHasBlendMode) this.blendMode = ba.readUI8();
	if (this.placeFlagHasCacheAsBitmap) this.bitmapCache = ba.readUI8();
	if (this.placeFlagHasClipActions) this.clipActions = new ClipActions(ba, obj);
}