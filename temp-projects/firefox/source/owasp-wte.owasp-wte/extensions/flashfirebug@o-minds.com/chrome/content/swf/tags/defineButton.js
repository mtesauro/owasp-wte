/*
The DefineButton tag defines a button character for later use by control tags such as PlaceObject.
The minimum file format version is SWF 1.
*/
function DefineButton(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	
	this.characters = [];

	var record;
	while ((record = new ButtonRecord(ba, this.header.type)) != null) {
		this.characters.push(record);
	}
	
	this.actions = [];
	var record = getActionRecord(ba);
	while (record) {
		this.actions.push(record);
		record = getActionRecord(ba);
	}
	
	this.actionscript = parseActions(this.actions); // *
};