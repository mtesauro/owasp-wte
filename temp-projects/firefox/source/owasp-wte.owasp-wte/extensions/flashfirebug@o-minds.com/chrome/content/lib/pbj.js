// http://dl.dropbox.com/u/340823/Flashbug%20Demo.swf
if (!PBJ) var PBJ = {};

PBJ.getMetadata = function(data) {
	var ba = new Flashbug.ByteArray(data),
		obj = {
			format: 'PixelBender Kernel',
			metadata: [],
			params: [],
			textures: []
		},
		op;
	
	do {
		op = this.readOPCode(ba, obj).op;
	} while(op >= 0xA0 && op <= 0xA5);

	return obj;
}

PBJ.isPBJ = function(data) {
	var ba = new Flashbug.ByteArray(data),
		obj = {
			format: 'PixelBender Kernel',
			metadata: [],
			params: [],
			textures: []
		},
		op;
	try {
		do {
			var ret = this.readOPCode(ba, obj);
			op = ret.op;
			if (ret.isPBJ) return true;
		} while(op >= 0xA0 && op <= 0xA5);
	} catch(e) {
		trace('PBJ: ' + e.toString());
	}
	
	return false;
}

PBJ.getType = function(type) {
	switch(type) {
		case 0x01: return 'TFloat';
		case 0x02: return 'TFloat2';
		case 0x03: return 'TFloat3';
		case 0x04: return 'TFloat4';
		case 0x05: return 'TFloat2x2';
		case 0x06: return 'TFloat3x3';
		case 0x07: return 'TFloat4x4';
		case 0x08: return 'TInt';
		case 0x09: return 'TInt2';
		case 0x0A: return 'TInt3';
		case 0x0B: return 'TInt4';
		case 0x0C: return 'TString';
		default: return "Unknown type 0x" + t.toString(16);
	}
}

PBJ.readValue = function(type, ba) {
	switch(type) {
		case 0x01:
			return {f1:ba.readFloat(false)};
		case 0x02:
			return { f1:ba.readFloat(false), f2:ba.readFloat(false)};
		case 0x03:
			return { f1:ba.readFloat(false), f2:ba.readFloat(false), f3:ba.readFloat(false)};
		case 0x04:
			return { f1:ba.readFloat(false), f2:ba.readFloat(false), f3:ba.readFloat(false), f4:ba.readFloat(false)};
		case 0x05:
			var a = [], i = 4;
			while (i--) {
				a.push(ba.readFloat(false));
			}
			return a;
		case 0x06:
			var a = [], i = 9;
			while (i--) {
				a.push(ba.readFloat(false));
			}
			return a;
		case 0x07:
			var a = [], i = 16;
			while (i--) {
				a.push(ba.readFloat(false));
			}
			return a;
		case 0x08:
			return ba.readUI16(false);
		case 0x09:
			return {i1:ba.readUI16(false), il2:ba.readUI16(false)};
		case 0x0A:
			return {i1:ba.readUI16(false), il2:ba.readUI16(false), i3:ba.readUI16(false)};
		case 0x0B:
			return {i1:ba.readUI16(false), il2:ba.readUI16(false), i3:ba.readUI16(false), i4:ba.readUI16(false)};
		case 0x0C:
			return ba.readString();
	};
	return null;
}

PBJ.readOPCode = function(ba, obj) {
	var op = ba.readUI8(), isPBJ = false;
	switch(op) {
		case 0xA0 : /* Kernel Metadata */
			isPBJ = true;
			var type = ba.readByte();
			var key = ba.readString();
			var value = this.readValue(type, ba);
			obj.metadata[key] = value;
			break;
		case 0xA1 : /* Parameter */
			isPBJ = true;
			
			var qualifier = ba.readByte();
			var type = ba.readByte();
			var reg = ba.readUI16(false);
			var mask = ba.readByte();
			var name = ba.readString();
			switch(type) {
				case 0x05: mask = 0xF;
				case 0x06: mask = 0xF;
				case 0x07: mask = 0xF;
			}
			
			obj.params.push({ name:name, metas:{}, type:this.getType(type), out:qualifier == 2/*, reg:dstReg(reg,mask) */});
			break;
		case 0xA2 : /* Parameter Metadata */
			isPBJ = true;
			
			var type = ba.readByte();
			var key = ba.readString();
			var value = this.readValue(type, ba);
			obj.params[obj.params.length - 1].metas[key] = value;
			break;
		case 0xA3 : /* Texture */
			isPBJ = true;
			
			var index = ba.readByte();
			var channels = ba.readByte();
			var name = ba.readString();
			obj.textures.push({ name:name, metas:{}, channels:channels, index:index });
			break;
		case 0xA4 : /* Name */
			isPBJ = true;
			var len = ba.readUI16(false);
			obj.name = ba.readString(len);
			break;
		case 0xA5 : /* Version */
			isPBJ = true;
			obj.version = ba.readUI32(false);
			break;
		
	}
	return { op:op, isPBJ:isPBJ };
}