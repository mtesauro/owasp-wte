/*
The DefineScalingGrid tag introduces the concept of 9-slice scaling, which allows
component-style scaling to be applied to a sprite or button character.
The minimum file format version is SWF 8.
*/
function DefineScalingGrid(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.splitter = new Rect(ba);
}