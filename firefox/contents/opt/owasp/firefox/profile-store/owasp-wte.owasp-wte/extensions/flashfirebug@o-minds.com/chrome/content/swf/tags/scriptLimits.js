/*
The ScriptLimits tag includes two fields that can be used to override the default settings for
maximum recursion depth and ActionScript time-out: MaxRecursionDepth and ScriptTimeoutSeconds.
The minimum file format version is SWF 7.
*/
function ScriptLimits(ba, obj) {
	this.header = new RecordHeader(ba);
	this.maxRecursionDepth = ba.readUI16();
	this.scriptTimeoutSeconds = ba.readUI16();
}