/*
The DoABC tag is similar to the DoAction tag: it defines a series of bytecodes to be executed.
However, the bytecodes contained within the DoABC tag run in the ActionScript 3.0 virtual
machine.
*/
function DoABC(ba, obj) {
	this.header = new RecordHeader(ba);
	var startPos = ba.position;
	/*
	A 32-bit flags value, which may
	contain the following bits set:
	kDoAbcLazyInitializeFlag = 1:
	Indicates that the ABC block
	should not be executed
	immediately, but only parsed. A
	later finddef may cause its
	scripts to execute.
	*/
	this.flags = ba.readUI32();
	this.name = ba.readString();
	
	/*
	A block of .abc bytecode to be
	parsed by the ActionScript 3.0
	virtual machine, up to the end
	of the tag.
	*/
	this.ABCData = ba.readBytes(this.header.contentLength - (ba.position - startPos));
	// www.adobe.com/go/avm2overview/
}