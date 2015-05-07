/*
An ACTIONRECORD consists of an ACTIONRECORDHEADER followed by a possible
data payload. The ACTIONRECORDHEADER describes the action using an ActionCode.
If the action also carries data, the ActionCode's high bit will be set which indicates that the
ActionCode is followed by a 16-bit length and a data payload. Note that many actions have
no data payload and only consist of a single byte value.
*/
function getActionRecord(ba, trace2) {
	var code = ba.readUI8();
	if (code == 0) return null;
	if (code == -1) return null;
	if (code) ba.position--;
	
	if (trace2) trace('action code: 0x' + code.toString(16));
	switch (code) {
		// SWF 1 & 2 Actions //
		case 0x00 : return null; // ActionEndFlag
		case 0x81 :	return new ActionGotoFrame(ba);
		case 0x83 :	return new ActionGetURL(ba);
		case 0x04 :	return new ActionNextFrame(ba);
		case 0x05 :	return new ActionPreviousFrame(ba);
		case 0x06 :	return new ActionPlay(ba);
		case 0x07 :	return new ActionStop(ba);
		case 0x08 :	return new ActionToggleQuality(ba);
		case 0x09 :	return new ActionStopSounds(ba);
		case 0x8A :	return new ActionWaitForFrame(ba);
		
		// SWF 3 Actions //
		case 0x8B :	return new ActionSetTarget(ba);
		case 0x8C :	return new ActionGoToLabel(ba);
		
		// SWF 4 Actions //
		case 0x0A :	return new ActionAdd(ba);
		case 0x0B :	return new ActionSubtract(ba);
		case 0x0C :	return new ActionMultiply(ba);
		case 0x0D :	return new ActionDivide(ba);
		case 0x0E :	return new ActionEquals(ba);
		case 0x0F :	return new ActionLess(ba);
		case 0x10 :	return new ActionAnd(ba);
		case 0x11 :	return new ActionOr(ba);
		case 0x12 :	return new ActionNot(ba);
		case 0x13 :	return new ActionStringEquals(ba);
		case 0x14 :	return new ActionStringLength(ba);
		case 0x21 :	return new ActionStringAdd(ba);
		case 0x15 :	return new ActionStringExtract(ba);
		case 0x96 :	return new ActionPush(ba);
		case 0x17 :	return new ActionPop(ba);
		case 0x18 :	return new ActionToInteger(ba);
		case 0x99 :	return new ActionJump(ba);
		case 0x9D :	return new ActionIf(ba);
		case 0x9E :	return new ActionCall(ba);
		case 0x1C :	return new ActionGetVariable(ba);
		case 0x1D :	return new ActionSetVariable(ba);
		case 0x9A :	return new ActionGetURL2(ba);
		case 0x9F :	return new ActionGotoFrame2(ba);
		case 0x20 :	return new ActionSetTarget2(ba);
		case 0x22 :	return new ActionGetProperty(ba);
		case 0x23 :	return new ActionSetProperty(ba);
		case 0x24 :	return new ActionCloneSprite(ba);
		case 0x25 :	return new ActionRemoveSprite(ba);
		case 0x26 :	return new ActionTrace(ba);
		case 0x27 :	return new ActionStartDrag(ba);
		case 0x28 :	return new ActionEndDrag(ba);
		case 0x29 :	return new ActionStringLess(ba);
		case 0x8D :	return new ActionWaitForFrame2(ba);
		case 0x30 :	return new ActionRandomNumber(ba);
		case 0x31 :	return new ActionMBStringLength(ba);
		case 0x32 :	return new ActionCharToAscii(ba);
		case 0x33 :	return new ActionAsciiToChar(ba);
		case 0x34 :	return new ActionGetTime(ba);
		case 0x35 :	return new ActionMBStringExtract(ba);
		case 0x36 :	return new ActionMBCharToAscii(ba);
		case 0x37 :	return new ActionMBAsciiToChar(ba);
		
		// SWF 5 Actions //
		case 0x3A :	return new ActionDelete(ba);
		case 0x9B :	return new ActionDefineFunction(ba);
		case 0x3B :	return new ActionDelete2(ba);
		case 0x3C :	return new ActionDefineLocal(ba);
		case 0x3D :	return new ActionCallFunction(ba);
		case 0x3E :	return new ActionReturn(ba);
		case 0x3F :	return new ActionModulo(ba);
		case 0x40 :	return new ActionNewObject(ba);
		case 0x41 :	return new ActionDefineLocal2(ba);
		case 0x42 :	return new ActionInitArray(ba);
		case 0x43 :	return new ActionInitObject(ba);
		case 0x44 :	return new ActionTypeOf(ba);
		case 0x45 :	return new ActionTargetPath(ba);
		case 0x46 :	return new ActionEnumerate(ba);
		case 0x87 :	return new ActionStoreRegister(ba);
		case 0x47 :	return new ActionAdd2(ba);
		case 0x48 :	return new ActionLess2(ba);
		case 0x49 :	return new ActionEquals2(ba);
		case 0x4A :	return new ActionToNumber(ba);
		case 0x4B :	return new ActionToString(ba);
		case 0x4C :	return new ActionPushDuplicate(ba);
		case 0x4D :	return new ActionStackSwap(ba);
		case 0x4E :	return new ActionGetMember(ba);
		case 0x4F :	return new ActionSetMember(ba);
		case 0x50 :	return new ActionIncrement(ba);
		case 0x51 :	return new ActionDecrement(ba);
		case 0x52 :	return new ActionCallMethod(ba);
		case 0x53 :	return new ActionNewMethod(ba);
		case 0x94 :	return new ActionWith(ba);
		case 0x88 :	return new ActionConstantPool(ba);
		case 0x60 :	return new ActionBitAnd(ba);
		case 0x61 :	return new ActionBitOr(ba);
		case 0x62 :	return new ActionBitXor(ba);
		case 0x63 :	return new ActionBitLShift(ba);
		case 0x64 :	return new ActionBitRShift(ba);
		case 0x65 :	return new ActionBitURShift(ba);
		
		// SWF 6 Actions //
		case 0x54 :	return new ActionInstanceOf(ba);
		case 0x55 :	return new ActionEnumerate2(ba);
		case 0x66 :	return new ActionStrictEquals(ba);
		case 0x67 :	return new ActionGreater(ba);
		case 0x68 :	return new ActionStringGreater(ba);
		
		// SWF 7 Actions //
		case 0x8E :	return new ActionDefineFunction2(ba);
		case 0x8F :	return new ActionTry(ba);
		case 0x2A :	return new ActionThrow(ba);
		case 0x2B :	return new ActionCastOp(ba);
		case 0x2C :	return new ActionImplementsOp(ba);
		case 0x69 :	return new ActionExtends(ba);
		
		// Misc Actions //
		case 0x89 :	return new ActionStrictMode(ba);
		case 0x80 :	return new ActionHasLength(ba);
		case 0x77 :	return new ActionNOP(ba);
		case 0x5F :	return new ActionHalt(ba);
		case 0xAA :	return new ActionQuickTime(ba);
		default : 
			//throw Error('getActionRecord - Unable to find ActionRecord 0x' + code.toString(16) + ' @ ' + ba.position);
			trace('getActionRecord - Unknown ActionRecord 0x' + code.toString(16) + ' @ ' + ba.position);
			return new ActionUnknown(ba);
			// 0x1, 0x84, 0xd6, 0xb9, 0x2, 0x93, 0xe5, 0xc5, 0xcc, 0x19, 0x16, 0x75, 0x70, 0x72, 0x77, 0x78, 0x79, 0x6c, 0x6e, 0x6f
	}
	
	return null;
}

// *******************************************************************************************

function getObjectClass(obj) {
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(/function\s*(\w+)/);

        if (arr && arr.length == 2) {
            return arr[1];
        }
    }

    return undefined;
}

function parseActions(actionsRaw) {
	var pool = [], stack = [], branches = [], register = [null], localVar = {}, skipCount = -1;
	for (var i = 0, l = actionsRaw.length; i < l; i++) {
		var o = actionsRaw[i], className = getObjectClass(o);
		o.header.type = className;
		switch (className) {
			case 'ActionWith' :
			case 'ActionIf' :
			case 'ActionJump' :
			case 'ActionDefineFunction' :
				this[className + 'Parse'](o, stack, branches);
				break;
			case 'ActionDefineFunction2' :
				this[className + 'Parse'](o, stack, register);
				break;
			case 'ActionConstantPool' :
				pool = this[className + 'Parse'](o);
				break;
			case 'ActionNot' :
				this[className + 'Parse'](actionsRaw, i, stack, pool);
				break;
			case 'ActionPush' :
				this[className + 'Parse'](o, stack, pool, register);
				break;
			case 'ActionDefineLocal' :
			case 'ActionDefineLocal2' :
				this[className + 'Parse'](o, stack, localVar);
				break;
			case 'ActionStoreRegister' :
				this[className + 'Parse'](o, stack, register);
				break;
			case 'ActionWaitForFrame' :
			case 'ActionWaitForFrame2' :
				skipCount = o.skipCount;
			default :
				this[className + 'Parse'](o, stack);
		}
		
		// End If
		if (branches.length && o.header.pos > branches[branches.length - 1]) {
			while (branches.length && o.header.pos > branches[branches.length - 1]) {
				stack.push('}');
				branches.pop();
			}
		}

		if (skipCount == 0)  {
			stack.push('}');
		} else {
			skipCount--;
		}
	}
	
	return stack;
}

// *** Note: Since these objects are returned from the webworker, they can't contain functions ***
// ***********************************************************************************************

function ActionUnknown(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionUnknownParse(obj, stack) {
	trace('Parse unknown as');
}

// Flash 1,2,3
function ActionGotoFrame(ba) {
	this.header = new ActionRecordHeader(ba);
	this.frame = ba.readUI16() + 1;
}
function ActionGotoFrameParse(obj, stack) {
	stack.push('gotoFrame(' + obj.frame + ');');
}

function ActionGetURL(ba) {
	this.header = new ActionRecordHeader(ba);
	this.urlString = ba.readString();
	this.targetString = ba.readString();
}
function ActionGetURLParse(obj, stack) {
	if (obj.urlString.indexOf('FSCommand') == 0) {
		stack.push('fscommand("' + obj.urlString.replace('FSCommand:', '') + '", "' + obj.targetString + '");');
	} else {
		stack.push('getURL("' + obj.urlString + '", "' + obj.targetString + '");');
	}
}

function ActionNextFrame(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionNextFrameParse(obj, stack) {
	stack.push('nextFrame();');
}

function ActionPreviousFrame(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionPreviousFrameParse(obj, stack) {
	stack.push('previousFrame();');
}

function ActionPlay(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionPlayParse(obj, stack) {
	var last = stack.length - 1;
	var value = 'play();';
	
	if (stack.length && stack[last].indexOf('gotoFrame') != -1) {
		value = stack.pop().replace('gotoFrame', 'gotoAndPlay');
	} else if (stack.length && stack[last].indexOf('gotoLabel') != -1) {
		value = stack.pop().replace('gotoLabel', 'gotoAndPlay');
	}
	stack.push(value);
}

function ActionStop(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStopParse(obj, stack) {
	var last = stack.length - 1;
	if (stack.length && stack[last].indexOf('gotoFrame') != -1) {
		stack.push(stack.pop().replace('gotoFrame', 'gotoAndStop'));
	} if (stack.length && stack[last].indexOf('gotoLabel') != -1) {
		stack.push(stack.pop().replace('gotoLabel', 'gotoAndStop'));
	} else {
		stack.push('stop();');
	}
}

function ActionToggleQuality(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionToggleQualityParse(obj, stack) {
	stack.push('togglQuality();');
}

function ActionStopSounds(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStopSoundsParse(obj, stack) {
	stack.push('stopAllSounds();');
}

function ActionWaitForFrame(ba) {
	this.header = new ActionRecordHeader(ba);
	this.frame = ba.readUI16();
	this.skipCount = ba.readUI8();
}
function ActionWaitForFrameParse(obj, stack) {
	stack.push('ifFrameLoaded(' + obj.frame + ') {');
}

function ActionSetTarget(ba) {
	this.header = new ActionRecordHeader(ba);
	this.targetName = ba.readString();
}
function ActionSetTargetParse(obj, stack) {
	if (obj.targetName != '') {
		stack.push('tellTarget("' + obj.targetName + '") {');
	} else {
		stack.push("}");
	}
}

function ActionGoToLabel(ba) {
	this.header = new ActionRecordHeader(ba);
	this.label = ba.readString();
}
function ActionGoToLabelParse(obj, stack) {
	var num = parseInt(obj.label);
	if (String(num) == obj.label) {
		stack.push('gotoLabel(' + obj.label + ')');
	} else {
		stack.push('gotoLabel("' + obj.label + '")');
	}
}

// Flash 4
function ActionPush(ba) {
	this.header = new ActionRecordHeader(ba);
	this.stack = [];
	
	var end = ba.position + this.header.length;
	do {
		var o = {};
		o.type = ba.readUI8();
		switch(o.type) {
			case 0 : 
				o.value = ba.readString();
				o.value = escapeNewLines(o.value);
				o.type = 'string'; 
				break;
			case 1 : o.value = ba.readFloat(); 	o.type = 'float'; break;
			case 2 : /* null */ 				o.type = 'null';  break;
			case 3 : /* undefined */ 			o.type = 'undefined'; break;
			case 4 : o.value = ba.readUI8(); 	o.type = 'register'; break;
			case 5 : o.value = ba.readUI8() ? 'true' : 'false'; 	o.type = 'boolean'; break;
			case 6 : o.value = ba.readDouble(); o.type = 'double'; break;
			case 7 : o.value = ba.readUI32(); 	o.type = 'integer'; break;
			case 8 : o.value = ba.readUI8(); 	o.type = 'constant8'; break; // Constant pool index (for indexes < 256)
			case 9 : o.value = ba.readUI16(); 	o.type = 'constant16'; break; // Constant pool index (for indexes >= 256)
		}
		this.stack.push(o);
	} while (ba.position < end);
}
function ActionPushParse(obj, stack, pool, register) {
	for (var i = 0, len = obj.stack.length; i < len; i++) {
		if (obj.stack[i].type == 'constant8' || obj.stack[i].type == 'constant16') {
			var val = obj.stack[i].value != undefined ? pool[obj.stack[i].value] : '';
			stack.push('"' + val + '"');
		} else if (obj.stack[i].type == 'register') {
			var val = obj.stack[i].value != undefined && register.length > obj.stack[i].value ? register[obj.stack[i].value] : '';
			if (obj.stack[i].value == undefined || register.length <= obj.stack[i].value) {
				trace('ERROR value ' + obj.stack[i].value + ' ; ?', register);
				trace('object', obj.stack[i]);
			} else {
				//trace('value ' + obj.stack[i].value + ' ; ' + register[obj.stack[i].value], register);
			}
			
			stack.push(val);
		} else {
			var val = obj.stack[i].type == 'string' ? '"' + obj.stack[i].value + '"' : obj.stack[i].value;
			stack.push(val);
		}
	}
}

function ActionPop(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionPopParse(obj, stack) {
	var a = stack.pop();
	stack.push(a + ';');
}

function ActionAdd(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionAddParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' + ' + a);
}

function ActionSubtract(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionSubtractParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' - ' + a);
}

function ActionMultiply(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionMultiplyParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' * ' + a);
}

function ActionDivide(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionDivideParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' / ' + a);
}

function ActionEquals(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionEqualsParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' == ' + a);
}

function ActionLess(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionLessParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' < ' + a);
}

function ActionAnd(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionAndParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' && ' + a);
}

function ActionOr(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionOrParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' || ' + a);
}

function ActionNot(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionNotParse(actionsRaw, index, stack) {
	var actionNotCount = 0, i = index - 1, prevAction = actionsRaw[i];
	while (prevAction && prevAction.header.type == 'ActionNot') {
		actionNotCount++;
		i--;
		prevAction = actionsRaw[i];
	}
	
	var a = stack.pop();
	// Skip, seems to do only once so player knows to convert to boolean
	if (actionNotCount == 0) {
		stack.push('(' + a + ')');
	} else {
		stack.push('!' + a);
	}
}

function ActionStringEquals(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStringEqualsParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' eq ' + a);
}

function ActionStringLength(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStringLengthParse(obj, stack) {
	var str = stack.pop(); // leave '
	stack.push('length(' + str + ')');
}

function ActionStringAdd(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStringAddParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' add ' + a);
}

function ActionStringExtract(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStringExtractParse(obj, stack) {
	var count = stack.pop(),
		index = stack.pop(),
		str = stack.pop(); // leave '
	stack.push('substring(' + str + ', ' + index + ', ' + count + ')');
}

function ActionStringLess(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStringLessParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(a + ' < ' + b);
}

function ActionMBStringLength(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionMBStringLengthParse(obj, stack) {
	var str = stack.pop(); // leave '
	stack.push('mblength(' + str + ')');
}

function ActionMBStringExtract(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionMBStringExtractParse(obj, stack) {
	var count = stack.pop(),
		index = stack.pop(),
		str = stack.pop(); // leave '
	stack.push('mbsubstring(' + str + ', ' + index + ', ' + count + ')');
}

function ActionToInteger(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionToIntegerParse(obj, stack) {
	var a = stack.pop();
	stack.push('int(' + a + ')');
}

function ActionCharToAscii(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionCharToAsciiParse(obj, stack) {
	var a = stack.pop();
	stack.push('ord(' + a + ')');
}

function ActionAsciiToChar(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionAsciiToCharParse(obj, stack) {
	var a = stack.pop();
	stack.push('chr(' + a + ')');
}

function ActionMBCharToAscii(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionMBCharToAsciiParse(obj, stack) {
	var a = stack.pop();
	stack.push('mbchr(' + a + ')');
}

function ActionMBAsciiToChar(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionMBAsciiToCharParse(obj, stack) {
	var a = stack.pop();
	stack.push('mbord(' + a + ')');
}

function ActionJump(ba) {
	this.header = new ActionRecordHeader(ba);
	this.branchOffset = ba.readSI16();
}
function ActionJumpParse(obj, stack, branches) {
	branches.pop();
	stack.push('} else {');
	branches.push(obj.header.pos + obj.branchOffset);
}

function ActionIf(ba) {
	this.header = new ActionRecordHeader(ba);
	this.branchOffset = ba.readSI16();
}
function ActionIfParse(obj, stack, branches) {
	var condition = stack.pop();
	stack.push('if (' + condition + ') {');
	branches.push(obj.header.pos + obj.branchOffset);
}

function ActionCall(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionCallParse(obj, stack) {
	var frame = stack.pop();
	stack.push('call(' + frame + ')');
}

function ActionGetVariable(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionGetVariableParse(obj, stack) {
	stack[stack.length - 1] = strip(stack[stack.length - 1]);
}

function ActionSetVariable(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionSetVariableParse(obj, stack) {
	var value = stack.pop(),
		target = stack.pop();
	if (target.indexOf(' add ') != -1) {
		stack.push('set(' + target + ', ' + value + ');');
	} else {
		stack.push(strip(target) + ' = ' + value + ';');
	}
}

function ActionGetURL2(ba) {
	this.header = new ActionRecordHeader(ba);
	
	this.sendVarsMethod = SendVars[ba.readUB(2)];
	ba.readUB(4); //reserved, always 0
	/*
	0 = Target is a browser window
	1 = Target is a path to a sprite
	*/
	this.loadTargetFlag = ba.readBoolean();
	/*
	0 = No variables to load
	1 = Load variables
	*/
	this.loadVariablesFlag = ba.readBoolean();
	ba.align();
}
function ActionGetURL2Parse(obj, stack) {
	var target = stack.pop().replace('_level', ''), // This is automatically added at compilation
		url = stack.pop();
	stack.push('loadVariables(' + url + ', ' + target + ');'); // loadMovieNum?
}

function ActionGotoFrame2(ba) {
	this.header = new ActionRecordHeader(ba);
	ba.readUB(6); // Reserved, always 0
	this.sceneBiasFlag = ba.readBoolean();
	this.playFlag = ba.readBoolean();// 0 = Go to frame and stop, 1 = Go to frame and play
	ba.align();
	if (this.sceneBiasFlag) this.sceneBias = ba.readUI16();
}
function ActionGotoFrame2Parse(obj, stack) {
	var frame = stack.pop();
	if (obj.sceneBiasFlag) frame += obj.sceneBias;
	if (obj.playFlag) {
		stack.push('gotoAndPlay(' + frame + ')');
	} else {
		stack.push('gotoAndStop(' + frame + ')');
	}
}

function ActionSetTarget2(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionSetTarget2Parse(obj, stack) {
	var targetName = stack.pop();
	if (targetName != '') {
		stack.push("tellTarget('" + targetName + "') {");
	} else {
		stack.push("}");
	}
	//target = o.targetName;
}

function ActionGetProperty(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionGetPropertyParse(obj, stack) {
	var index = stack.pop(),
		target = stack.pop();
	stack.push('getProperty(' + target + ', ' + PROPERTIES[index] + ')');
}

function ActionSetProperty(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionSetPropertyParse(obj, stack) {
	var value = stack.pop(),
		index = stack.pop(),
		target = stack.pop();
	stack.push('setProperty(' + target + ', ' + PROPERTIES[index] + ', ' + value + ')');
}

function ActionCloneSprite(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionCloneSpriteParse(obj, stack) {
	var depth = stack.pop().replace('16384 + ', ''), // This is automatically added at compilation to push it to the top,
		target = stack.pop(),
		source = stack.pop();
	stack.push('duplicateMovieClip(' + source + ', ' + target + ', ' + depth + ')');
}

function ActionRemoveSprite(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionRemoveSpriteParse(obj, stack) {
	var a = stack.pop();
	stack.push('removeMovieClip(' + a + ')');
}

function ActionStartDrag(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStartDragParse(obj, stack) {
	// target, lockcenter
	var args = [stack.pop(), stack.pop()],
		constrain = stack.pop();
	if (constrain != 0) {
		// y2, x2, y1, x1
		args.push(stack.pop(), stack.pop(), stack.pop(), stack.pop());
	}
	stack.push('startDrag(' + args.join(', ') + ')');
}

function ActionEndDrag(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionEndDragParse(obj, stack) {
	stack.push('stopDrag()');
}

function ActionWaitForFrame2(ba) {
	this.header = new ActionRecordHeader(ba);
	this.skipCount = ba.readUI8();
}
function ActionWaitForFrame2Parse(obj, stack) {
	var frame = stack.pop();
	stack.push('ifFrameLoaded(' + frame + ') {');
}

function ActionTrace(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionTraceParse(obj, stack) {
	var a = stack.pop()
	stack.push('trace(' + a + ')');
}

function ActionGetTime(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionGetTimeParse(obj, stack) {
	stack.push('getTimer()');
}

function ActionRandomNumber(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionRandomNumberParse(obj, stack) {
	var max = stack.pop();
	stack.push('random(' + max + ')');
}

// Flash 5
function ActionCallFunction(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionCallFunctionParse(obj, stack) {
	var functionName = strip(stack.pop()),
		numArgs = stack.pop(),
		args = [];
	while (numArgs--) {
		args.push(stack.pop());
	}
	args = args.join(', ');
	
	stack.push(functionName + '(' + args + ')');
}

function ActionCallMethod(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionCallMethodParse(obj, stack) {
	var method = strip(stack.pop()),
		target = stack.pop(),
		numArgs = stack.pop(),
		args = [];
	while (numArgs--) {
		args.push(stack.pop());
	}
	args = args.join(', ');
	
	if (method == '') {
		stack.push(target + '(' + args + ')');
	} else {
		stack.push(target + '.' + method + '(' + args + ')');
	}
}

function ActionConstantPool(ba) {
	this.header = new ActionRecordHeader(ba)
	this.count = ba.readUI16();
	this.constantPool = [];
	
	var i = this.count;
	while (i--) {
		this.constantPool.push(ba.readString());
	}
}
function ActionConstantPoolParse(obj) {
	return obj.constantPool;
}

function ActionDefineFunction(ba) {
	this.header = new ActionRecordHeader(ba);
	this.functionName = ba.readString();
	this.numParams = ba.readUI16();
	this.parameters = [];
	var i = this.numParams;
	while (i--) {
		this.parameters.push(ba.readString());
	}
	
	// The next [codesize] bytes is considered the body of the function
	this.codeSize = ba.readUI16();
	
	//this.body = ba.readString(this.codeSize); // *
}
function ActionDefineFunctionParse(obj, stack, branches) {
	//var object = stack.pop(), 
	var args = obj.parameters.concat();
	args.reverse();
	args = args.join(', ');
	
	if (obj.functionName) {
		stack.push('function ' + obj.functionName + '(' + args + ') {');
		//stack.push('with (' + object + ') {');
	} else {
		stack.push('function(' + args + ') {');
	}
	branches.push(obj.header.pos + obj.codeSize);
}

// Uses register?
function ActionDefineLocal(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionDefineLocalParse(obj, stack, localVar) {
	var value = stack.pop(), name = stack.pop();
	localVar[name] = value;
	trace('definelocal ' + value + ' ; ' + name);
	//register.push(name);
}

function ActionDefineLocal2(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionDefineLocal2Parse(obj, stack, localVar) {
	var name = stack.pop();
	localVar[name] = localVar[name] || undefined;
	trace('definelocal2 ; ' + name);
	// defines a local variable and sets its value
}

function ActionDelete(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionDeleteParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push('delete ' + b + '.' + strip(a));
	//stack.pop(); // name of prop
	//stack.pop(); // object to delete
}

function ActionDelete2(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionDelete2Parse(obj, stack) {
	var a = stack.pop();
	stack.push('delete ' + a);
	//stack.pop(); // name of prop
}

function ActionEnumerate(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionEnumerateParse(obj, stack) {
	// Used for .. in
	var name = stack.pop();
	stack.push(null);
	//stack.push(prop names);
	/*
	stack.push('for (var prop in ' + name + ') { ');
		//
	} 
	*/
}

function ActionEquals2(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionEquals2Parse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' != ' + a);
}

function ActionGetMember(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionGetMemberParse(obj, stack) {
	var prop = strip(stack.pop()),
		target = stack.pop();
	stack.push(target + '.' + prop);
}

function ActionInitArray(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionInitArrayParse(obj, stack) {
	var numArgs = stack.pop(),
		args = [];
	while (numArgs--) {
		args.push(stack.pop());
	}
	args = args.join(', ');
	stack.push('[' + args + ']');
}

function ActionInitObject(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionInitObjectParse(obj, stack) {
	var numArgs = stack.pop(),
		args = [];
	while (numArgs--) {
		var val = stack.pop(), name = stack.pop();
		args.push(name + ':' + val);
	}
	args = args.join(', ');
	stack.push('{' + args + '}');
}

function ActionNewMethod(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionNewMethodParse(obj, stack) {
	var method = strip(stack.pop()),
		target = stack.pop(),
		numArgs = stack.pop(),
		args = [];
	while (numArgs--) {
		args.push(stack.pop());
	}
	args = args.join(', ');
	
	if (method == '') {
		stack.push('new ' + target + '(' + args + ')');
	} else {
		stack.push('new ' + target + '.' + method + '(' + args + ')');
	}
}

function ActionNewObject(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionNewObjectParse(obj, stack) {
	var name = strip(stack.pop()),
		numArgs = stack.pop(),
		args = [];
	while (numArgs--) {
		args.push(stack.pop());
	}
	args = args.join(', ');
	stack.push('new ' + name + '(' + args + ')');
}

function ActionSetMember(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionSetMemberParse(obj, stack) {
	var value = stack.pop(),
		prop = strip(stack.pop()),
		target = strip(stack.pop());
		//targetObj = stack.pop(),
		//lastChar = String(targetObj).charAt(String(targetObj).length - 1);
		//if (!targetObj) {
			//stack.push(targetObj);
			stack.push(target + '.' + prop + ' = ' + value + ';');
		//} else {
		//	stack.push(targetObj + '.' + target + ' = ' + prop);
		//	stack.push(value);
		//}
}

function ActionTargetPath(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionTargetPathParse(obj, stack) {
	// pop object, push target path?
}

function ActionWith(ba) {
	this.header = new ActionRecordHeader(ba)
	this.size = ba.readUI16();
	
	//this.body = ba.readString(this.size); // *
}
function ActionWithParse(obj, stack, branches) {
	var object = stack.pop();
	stack.push('with (' + object + ') {');
	branches.push(obj.header.pos + obj.size);
}

function ActionToNumber(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionToNumberParse(obj, stack) {
	var a = stack.pop();
	stack.push('Number(' + a + ')');
}

function ActionToString(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionToStringParse(obj, stack) {
	var a = stack.pop();
	stack.push('String(' + a + ')');
}

function ActionTypeOf(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionTypeOfParse(obj, stack) {
	var a = stack.pop();
	stack.push('typeof ' + a);
}

function ActionAdd2(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionAdd2Parse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' + ' + a);
}

function ActionLess2(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionLess2Parse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' < ' + a);
}

function ActionModulo(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionModuloParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' % ' + a);
}

function ActionBitAnd(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionBitAndParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' & ' + a);
}

function ActionBitLShift(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionBitLShiftParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' << ' + a);
}

function ActionBitOr(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionBitOrParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' | ' + a);
}

function ActionBitRShift(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionBitRShiftParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' >> ' + a);
}

function ActionBitURShift(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionBitURShiftParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' >>> ' + a);
}

function ActionBitXor(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionBitXorParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' ^ ' + a);
}

function ActionDecrement(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionDecrementParse(obj, stack) {
	var a = stack.pop();
	stack.push(a + '--');
}

function ActionIncrement(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionIncrementParse(obj, stack) {
	var a = stack.pop();
	stack.push(a + '++');
}

function ActionPushDuplicate(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionPushDuplicateParse(obj, stack) {
	//var a = stack[stack.length - 1];
	//stack.push(a);
}

function ActionReturn(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionReturnParse(obj, stack) {
	stack.pop();
}

function ActionStackSwap(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStackSwapParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(a,b);
}

function ActionStoreRegister(ba) {
	this.header = new ActionRecordHeader(ba);
	this.registerNumber = ba.readUI8();
}
function ActionStoreRegisterParse(obj, stack, register) {
	trace('ActionStoreRegisterParse', obj);
	trace('stack', stack);
	register[obj.registerNumber] = stack[stack.length - 1];
}

// Flash 6
function ActionInstanceOf(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionInstanceOfParse(obj, stack) {
	var constr = stack.pop(), obj2 = stack.pop();
	stack.push(obj2 + ' instanceof ' + constr);
}

function ActionEnumerate2(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionEnumerate2Parse(obj, stack) {
	//trace('Need to parse as');
}

function ActionStrictEquals(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStrictEqualsParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(a + ' === ' + b);
}

function ActionGreater(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionGreaterParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' > ' + a);
}

function ActionStringGreater(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStringGreaterParse(obj, stack) {
	var a = stack.pop(), b = stack.pop();
	stack.push(b + ' > ' + a);
}

// Flash 7
function ActionDefineFunction2(ba) {
	this.header = new ActionRecordHeader(ba);
	this.functionName = ba.readString();
	this.numParams = ba.readUI16();
	this.registerCount = ba.readUI8();
	this.preloadParentFlag = ba.readBoolean();
	// 0 = Don't preload _parent into register
	// 1 = Preload _parent into register
	this.preloadRootFlag = ba.readBoolean();
	// 0 = Don't preload _root into register
	// 1 = Preload _root into register
	this.suppressSuperFlag = ba.readBoolean();
	// 0 = Create super variable
	// 1 = Don't create super variable
	this.preloadSuperFlag = ba.readBoolean();
	this.suppressArgumentsFlag = ba.readBoolean();
	this.preloadArgumentsFlag = ba.readBoolean();
	this.suppressThisFlag = ba.readBoolean();
	this.preloadThisFlag = ba.readBoolean();
	
	ba.readUB(7); //Reserved
	
	this.preloadGlobalFlag = ba.readBoolean();
	this.parameters = [];
	for (var i = 0; i < this.numParams; i++) {
		this.parameters.push(new RegisterParam(ba));
	}
	this.codeSize = ba.readUI16();
	
	//this.body = ba.readString(this.codeSize); // *
}
function ActionDefineFunction2Parse(obj, stack, register) {
	if (obj.preloadThisFlag) register.push('this');
	if (obj.preloadArgumentsFlag) register.push('arguments');
	if (obj.preloadSuperFlag) register.push('super');
	if (obj.preloadRootFlag) register.push('_root');
	if (obj.preloadParentFlag) register.push('_parent');
	if (obj.preloadGlobalFlag) register.push('_global');
	
	var args = [];
	for (var i = 0; i < obj.parameters.length; i++) {
		args.push(obj.parameters[i].paramName);
		register.push(obj.parameters[i].paramName);
	}
	
	var a = stack.pop(), b = stack.pop();
	stack.push(b + '.' + strip(a) + ' = function (' + args.join(', ') + ') {');
}

function ActionExtends(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionExtendsParse(obj, stack) {
	//trace('Need to parse as');
}

function ActionCastOp(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionCastOpParse(obj, stack) {
	//trace('Need to parse as');
}

function ActionImplementsOp(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionImplementsOpParse(obj, stack) {
	//trace('Need to parse as');
}

function ActionTry(ba) {
	this.header = new ActionRecordHeader(ba);
	
	ba.readUB(5); // Reserved
	
	this.catchInRegisterFlag = ba.readBoolean();
	this.finallyBlockFlag = ba.readBoolean();
	this.catchBlockFlag = ba.readBoolean();
	ba.align();
	this.trySize = ba.readUI16();
	this.catchSize = ba.readUI16();
	this.finallySize = ba.readUI16();
	if (this.catchInRegisterFlag) {
		this.catchRegister = ba.readUI8();
	} else {
		this.catchName = ba.readString();
	}
	this.tryBody = ba.readString(this.trySize);
	this.catchBody = ba.readString(this.catchSize);
	this.finallyBody = ba.readString(this.finallySize);
}
function ActionTryParse(obj, stack) {
	//trace('Need to parse as');
}

function ActionThrow(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionThrowParse(obj, stack) {
	//trace('Need to parse as');
}


// Misc
function ActionHasLength(ba) {
	this.header = new ActionRecordHeader(ba);
	this.frame = ba.readUI16() + 1;
}
function ActionHasLengthParse(obj, stack) {
	//trace('Need to parse as');
}

function ActionStrictMode(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionStrictModeParse(obj, stack) {
	//trace('Need to parse as');
}
function ActionNOP(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionNOPParse(obj, stack) {
	//trace('Need to parse as');
}

function ActionHalt(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionHaltParse(obj, stack) {
	//trace('Need to parse as');
}

function ActionQuickTime(ba) {
	this.header = new ActionRecordHeader(ba);
}
function ActionQuickTimeParse(obj, stack) {
	//trace('Need to parse as');
}
