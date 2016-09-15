/*
The DoInitAction tag is similar to the DoAction tag: it defines a series of bytecodes to be
executed. However, the actions defined with DoInitAction are executed earlier than the usual
DoAction actions, and are executed only once.
In some situations, actions must be executed before the ActionScript representation of the first
instance of a particular sprite is created. The most common such action is calling
Object.registerClass to associate an ActionScript class with a sprite. Such a call is generally
found within the #initclip pragma in the ActionScript language. DoInitAction is used to
implement the #initclip pragma.
A DoInitAction tag specifies a particular sprite to which its actions apply. A single frame can
contain multiple DoInitAction tags; their actions are executed in the order in which the tags
appear. However, the SWF file can contain only one DoInitAction tag for any particular
sprite.
The specified actions are executed immediately before the normal actions of the frame in
which the DoInitAction tag appears. This only occurs the first time that this frame is
encountered; playback reaches the same frame again later, actions provided in DoInitAction
are skipped.
Starting with SWF 9, if the ActionScript3 field of the FileAttributes tag is 1, the contents of
the DoInitAction tag will be ignored.
*/
function DoInitAction(ba, obj) {
	this.header = new RecordHeader(ba);
	this.spriteID = ba.readUI16();
	
	this.actions = [];
	var record = getActionRecord(ba);
	while (record) {
		this.actions.push(record);
		record = getActionRecord(ba);
	}
	
	this.actionscript = parseActions(this.actions); // *
	this.actionscript.unshift('#initclip', '');
	this.actionscript.push('', '#endinitclip', '');
};