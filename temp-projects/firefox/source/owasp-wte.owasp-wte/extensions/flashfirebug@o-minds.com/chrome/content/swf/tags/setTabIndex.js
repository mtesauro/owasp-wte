/*
Flash Player maintains a concept of tab order of the interactive and textual objects displayed.
Tab order is used both for actual tabbing and, in SWF 6 and later, to determine the order in
which objects are exposed to accessibility aids (such as screen readers). The SWF 7
SetTabIndex tag sets the index of an object within the tab order.
If no character is currently placed at the specified depth, this tag is ignored.
The minimum file format version is SWF 7.
*/
function SetTabIndex(ba, obj) {
	this.header = new RecordHeader(ba);
	this.depth = ba.readUI16();
	this.tabIndex = ba.readUI16();
}