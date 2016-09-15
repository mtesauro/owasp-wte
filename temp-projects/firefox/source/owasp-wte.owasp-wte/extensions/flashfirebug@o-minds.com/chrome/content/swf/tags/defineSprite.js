/*
The DefineSprite tag defines a sprite character. It consists of a character ID and a frame count,
followed by a series of control tags. The sprite is terminated with an End tag.
The length specified in the Header reflects the length of the entire DefineSprite tag, including
the ControlTags field.
Definition tags (such as DefineShape) are not allowed in the DefineSprite tag. All of the
characters that control tags refer to in the sprite must be defined in the main body of the file
before the sprite is defined.
The minimum file format version is SWF 3.
*/
function DefineSprite(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.frameCount = ba.readUI16();
	
	this.streams = [];
	this.dictionary = [];// obj.dictionary;
	// DisplayList
	this.stage = [new Frame()];
	this.version = obj.version;
	this.frameRate = obj.frameRate;
	
	this.tags = readTags(ba, this);
}