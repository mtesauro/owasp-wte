/*
DefineButton2 extends the capabilities of DefineButton by allowing any state transition to
trigger actions.
The minimum file format version is SWF 3:
Starting with SWF 9, if the ActionScript3 field of the FileAttributes tag is 1, there must be no
BUTTONCONDACTION fields in the DefineButton2 tag. ActionOffset must be 0. This
structure is not supported because it is not permitted to mix ActionScript 1/2 and
ActionScript 3.0 code within the same SWF file.
*/
function DefineButton2(ba, obj) {
	this.header = new RecordHeader(ba);
	
	this.id = ba.readUI16();
	ba.readUB(7); // Reserved, always 0
	this.trackAsMenu = ba.readBoolean();
	this.actionOffset = ba.readUI16();
	this.characters = [];

	var record;
	while (!(record = new ButtonRecord(ba, this.header.type)).endRecord) {
		this.characters.push(record);
	}
	this.characters.push(record);
	
	this.actions = [];
	if (this.actionOffset) {
		var action;
		while(!(action = new ButtonCondAction(ba)).isLast) {
			this.actions.push(action);
		}
		this.actions.push(action);
	}
};