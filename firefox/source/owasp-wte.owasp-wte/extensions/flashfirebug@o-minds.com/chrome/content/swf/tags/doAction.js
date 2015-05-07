/*
DoAction instructs Flash Player to perform a list of actions when the current frame is
complete. The actions are performed when the ShowFrame tag is encountered, regardless of
where in the frame the DoAction tag appears.
Starting with SWF 9, if the ActionScript3 field of the FileAttributes tag is 1, the contents of
the DoAction tag will be ignored.
*/
function DoAction(ba, obj) {
	this.header = new RecordHeader(ba);
	
	this.actions = [];
	var record = getActionRecord(ba);
	while (record) {
		this.actions.push(record);
		record = getActionRecord(ba);
	}
	
	this.actionscript = parseActions(this.actions); // *
};