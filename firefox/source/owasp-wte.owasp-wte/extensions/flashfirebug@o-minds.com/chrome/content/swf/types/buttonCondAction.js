/*
The actions associated with DefineButton2 are specified as follows:
*/
function ButtonCondAction(ba) {
	this.condActionSize = ba.readUI16();
	this.isLast = this.condActionSize <= 0;// *
	this.condIdleToOverDown = ba.readBoolean();
	this.condOutDownToIdle = ba.readBoolean();
	this.condOutDownToOverDown = ba.readBoolean();
	this.condOverDownToOutDown = ba.readBoolean();
	this.condOverDownToOverUp = ba.readBoolean();
	this.condOverUpToOverDown = ba.readBoolean();
	this.condOverUpToIdle = ba.readBoolean();
	this.condIdleToOverUp = ba.readBoolean();
	
	this.condKeyPress = ba.readUB(7);
	this.condOverDownToIdle = ba.readBoolean();
	ba.align();
	
	this.actions = [];

	var record;
	while ((record = getActionRecord(ba)) != null) {
		this.actions.push(record);
	}
	
	this.actionscript = parseActions(this.actions); // *
	
	// Add event handlers
	var cond = [];
	if (this.condIdleToOverDown) cond.push('dragOver');
	if (this.condOutDownToIdle) cond.push('releaseOutside');
	if (this.condOutDownToOverDown) cond.push('dragOver');
	if (this.condOverDownToOutDown) cond.push('dragOut');
	if (this.condOverDownToOverUp) cond.push('release');
	if (this.condOverUpToOverDown) cond.push('press');
	if (this.condOverUpToIdle ) cond.push('rollOut');
	if (this.condIdleToOverUp) cond.push('rollOver');
	if (this.condKeyPress) {
		var str = 'keyPress ';
		switch (this.condKeyPress) {
			case 1 :
				str += '"<Left>"'; break;
			case 2 :
				str += '"<Right>"'; break;
			case 3 :
				str += '"<Home>"'; break;
			case 4 :
				str += '"<End>"'; break;
			case 5 :
				str += '"<Insert>"'; break;
			case 6 :
				str += '"<Delete>"'; break;
			case 8 :
				str += '"<Backspace>"'; break;
			case 13 :
				str += '"<Enter>"'; break;
			case 14 :
				str += '"<Up>"'; break;
			case 15 :
				str += '"<Down>"'; break;
			case 16 :
				str += '"<PageUp>"'; break;
			case 17 :
				str += '"<PageDown>"'; break;
			case 18 :
				str += '"<Tab>"'; break;
			case 19 :
				str += '"<Escape>"'; break;
			default :
				str += '"' + String.fromCharCode(this.condKeyPress) + '"';
		}
		cond.push(str);
	}
	if (this.condOverDownToIdle) cond.push('dragOut');// TODO: Figure out why this can be redundant with condOverDownToOutDown
	
	this.actionscript.unshift('on (' + cond.join(', ') + ') {');
	this.actionscript.push('}');
}