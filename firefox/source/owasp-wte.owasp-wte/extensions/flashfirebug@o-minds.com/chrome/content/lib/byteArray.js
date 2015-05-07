/**
 * @author Gabriel Mariani
 *
 * http://www.adamia.com/blog/high-performance-javascript-port-of-actionscript-byteArray
 */
if (!Flashbug) var Flashbug = {};
(function() {

var fromCharCode = String.fromCharCode,
	pow = Math.pow,
	min = Math.min,
	max = Math.max,
	TWOeN23 = pow(2, -23);

function trace() {
	var str = '';
	var arr = [];
	for (var i = 0, l = arguments.length; i < l; i++) {
		str += arguments[i];
		arr[i] = arguments[i];
		if (i != (l - 1)) str += ', ';
	}
	str += '\n';
	
	postMessage({
		type: "debug",
		message: arr
	});
};
Flashbug.ByteArray = function(data, endian) {
	if (data == undefined) data = '';
	var buff = [], t = this;
	t.length = data.length;
	t.position = 0;
	t.endian = (endian !== undefined) ? endian : Flashbug.ByteArray.BIG_ENDIAN;
	t._bitBuffer = null;
	t._bitPosition = 8;
	
	// Convert to data
	for (var i = 0; i < t.length; i++) {
	//for (var i = 0; data[i]; i++) {
		buff.push(fromCharCode(data.charCodeAt(i) & 0xff));
	}
	t._buffer = buff.join('');
	
	// Add redundant members that match actionscript for compatibility
	var funcMap = {
		readUnsignedByte: 'readUI8', 	readUnsignedShort: 'readUI16', 	readUnsignedInt: 'readUI32', 
		readByte: 'readSI8', 			readShort: 'readSI16', 			readInt: 'readSI32', 
		readBoolean: 'readBool', 
		writeUnsignedByte: 'writeUI8', 	writeUnsignedShort: 'writeUI16', writeUnsignedInt: 'writeUI32',
		writeByte: 'writeSI8', 			writeShort: 'writeSI16', 		writeInt: 'writeSI32'};
	for (var func in funcMap) {
		t[func] = t[funcMap[func]];
	}
};

Flashbug.ByteArray.BIG_ENDIAN = "bigEndian";
Flashbug.ByteArray.LITTLE_ENDIAN = "littleEndian";

Flashbug.ByteArray.prototype = {
	
	getBytesAvailable: function() {
		return this.length - this.position;
	},
	
	seek: function(offset, absolute) {
		var t = this;
		t.position = (absolute ? 0 : t.position) + offset;
		t.align();
		return t;
	},
	
	readBytes: function(length) {
		var pos = (this.position += length) - length;
		return this._buffer.slice(pos, this.position);
	},
	
	writeBytes: function(value) {
		this._buffer += value;
		this.position += value.length;
	},
	
	/*deflate: function(parseLimit) {
		var zip = new Flashbug.ZipUtil(this);
		return zip.deflate(parseLimit);
	},*/

	/////////////////////////////////////////////////////////
	// Integers
	/////////////////////////////////////////////////////////

	readByteAt: function(pos) {
		return this._buffer.charCodeAt(pos);
	},
	
	writeByteAt: function(pos, value) {
		this._buffer += this._buffer.substr(0, pos) + fromCharCode(value) + this._buffer.substr(pos + 1);
	},

	// Unsigned Number
	readNumber: function(numBytes, bigEnd) {
		var t = this, val = 0;
		if (bigEnd == undefined) bigEnd = !!(this.endian == Flashbug.ByteArray.BIG_ENDIAN);
		if (bigEnd) {
			while (numBytes--) val = (val << 8) | t.readByteAt(t.position++);
		} else {
			var o = t.position, i = o + numBytes;
			while(i > o) val = (val << 8) | t.readByteAt(--i);
			t.position += numBytes;
		}
		
		t.align();
		return val;
	},
	
	writeNumber: function(numBytes, value, bigEnd) {
		//http://jsfromhell.com/classes/binary-parser
		var t = this, bits = numBytes * 8, max = pow(2, bits), r = [];
		//(value >= max || value < -(max >> 1)) && this.warn("encodeInt::overflow") && (value = 0);
		if (value < 0) value += max;
		for(; value; r[r.length] = fromCharCode(value % 256), value = Math.floor(value / 256));
		for(bits = -(-bits >> 3) - r.length; bits--; r[r.length] = "\0");
		if (bigEnd == undefined) bigEnd = !!(t.endian == Flashbug.ByteArray.BIG_ENDIAN);
		var numStr = (bigEnd ? r.reverse() : r).join('');
		t.writeBytes(numStr);
		t.position += numBytes;
		t.align();
	},

	// Signed Number
	readSNumber: function(numBytes, bigEnd) {
		var val = this.readNumber(numBytes, bigEnd), numBits = numBytes * 8, _max = pow(2, numBits);
		if (val >> (numBits - 1)) val -= pow(2, numBits);
		return val;
	},
	
	writeSNumber: function(numBytes, value, bigEnd) {
		this.writeNumber(numBytes, value, bigEnd)
	},

	readSI8: function() {
		return this.readSNumber(1);
	},
	
	writeSI8: function(value) {
		this.writeSNumber(1, value);
	},

	readSI16: function(bigEnd) {
		return this.readSNumber(2, bigEnd);
	},
	
	writeSI16: function(value, bigEnd) {
		this.writeSNumber(2, value, bigEnd);
	},

	readSI32: function(bigEnd) {
		return this.readSNumber(4, bigEnd);
	},
	
	writeSI32: function(value, bigEnd) {
		this.writeSNumber(4, value, bigEnd);
	},
	
	readSI64: function(bigEnd) {
		return this.readSNumber(8, bigEnd);
	},
	
	writeSI64: function(value, bigEnd) {
		this.writeSNumber(8, value, bigEnd);
	},

	readUI8: function() {
		return this.readNumber(1);
	},
	
	writeUI8: function(value) {
		this.writeNumber(1, value);
	},

	readUI16: function(bigEnd) {
		return this.readNumber(2, bigEnd);
	},
	
	writeUI16: function(value, bigEnd) {
		this.writeNumber(2, value, bigEnd);
	},

	readUI24: function(bigEnd) {
		return this.readNumber(3, bigEnd);
	},
	
	writeUI24: function(value, bigEnd) {
		this.writeNumber(3, value, bigEnd);
	},

	readUI32: function(bigEnd) {
		return this.readNumber(4, bigEnd);
	},
	
	writeUI32: function(value, bigEnd) {
		this.writeNumber(4, value, bigEnd);
	},
	
	readUI64: function(bigEnd) {
		return this.readNumber(8, bigEnd);
	},
	
	writeUI64: function(value, bigEnd) {
		this.writeNumber(8, value, bigEnd);
	},

	/////////////////////////////////////////////////////////
	// Fixed-point numbers
	/////////////////////////////////////////////////////////

	_readFixedPoint: function(numBits, precision) {
		return this.readSB(numBits) * pow(2, -precision);
	},

	readFixed: function() {
		return this._readFixedPoint(32, 16);
	},

	readFixed8: function() {
		return this._readFixedPoint(16, 8);
	},

	readFB: function(numBits) {
		return this._readFixedPoint(numBits, 16);
		
		// SWFAssist
		//return this.readSB(numBits) / 65536;
	},

	/////////////////////////////////////////////////////////
	// Floating-point numbers
	/////////////////////////////////////////////////////////

	_readFloatingPoint: function(numEBits, numSBits) {
		var numBits = 1 + numEBits + numSBits,
			numBytes = numBits / 8,
			t = this,
			val = 0.0;
		if (numBytes > 4) {
			var i = Math.ceil(numBytes / 4);
			while (i--) {
				var buff = [],
					o = t.position,
					j = o + (numBytes >= 4 ? 4 : numBytes % 4);
				while (j > o) {
					buff.push(t.readByteAt(--j));
					numBytes--;
					t.position++;
				}
			}
			var s = new Flashbug.ByteArray(fromCharCode.apply(String, buff)),
				sign = s.readUB(1),
				expo = s.readUB(numEBits),
				mantis = 0,
				i = numSBits;
			while(i--){
				if (s.readBool()) mantis += pow(2, i);
			}
		} else {
			var sign = t.readUB(1),
				expo = t.readUB(numEBits),
				mantis = t.readUB(numSBits);
		}
		if (sign || expo || mantis) {
			var maxExpo = pow(2, numEBits),
				bias = ~~((maxExpo - 1) / 2),
				scale = pow(2, numSBits),
				fract = mantis / scale;
			if (bias) {
				if (bias < maxExpo) {
					val = pow(2, expo - bias) * (1 + fract);
				} else if (fract) {
					val = NaN;
				} else {
					val = Infinity;
				}
			} else if (fract) {
				val = pow(2, 1 - bias) * fract;
			}
			if (NaN != val && sign) val *= -1;
		}
		return val;
	},

	readFloat: function(bigEnd) {
		var t = this;
		
		if (bigEnd == undefined) bigEnd = !!(this.endian == Flashbug.ByteArray.BIG_ENDIAN);
		if (bigEnd) {
			var pos = (t.position += 4) - 4,
				b1 = t.readByteAt(pos),
				b2 = t.readByteAt(++pos),
				b3 = t.readByteAt(++pos),
				b4 = t.readByteAt(++pos);
		} else {
			var pos = (t.position += 4),
				b1 = t.readByteAt(--pos),
				b2 = t.readByteAt(--pos),
				b3 = t.readByteAt(--pos),
				b4 = t.readByteAt(--pos);
		}
		
		var sign = 1 - ((b1 >> 7) << 1),
			exp = (((b1 << 1) & 0xFF) | (b2 >> 7)) - 127,
			sig = ((b2 & 0x7F) << 16) | (b3 << 8) | b4;
		if (sig == 0 && exp == -127) return 0.0;
		
		return sign * (1 + TWOeN23 * sig) * pow(2, exp);
		
		//return this._readFloatingPoint(8, 23);
	},

	readFloat16: function() {
		//return this._readFloatingPoint(5, 10);
	},

	// 8 byte IEEE-754 double precision floating point value in network byte order (sign bit in low memory).
	readDouble: function(bigEnd) {
		var t = this;
		if (bigEnd == undefined) bigEnd = !!(this.endian == Flashbug.ByteArray.BIG_ENDIAN);
		if (bigEnd) {
			var pos = (t.position += 8) - 8,
				b1 = t.readByteAt(pos),
				b2 = t.readByteAt(++pos),
				b3 = t.readByteAt(++pos),
				b4 = t.readByteAt(++pos),
				b5 = t.readByteAt(++pos),
				b6 = t.readByteAt(++pos),
				b7 = t.readByteAt(++pos),
				b8 = t.readByteAt(++pos);
		} else {
			var pos = (t.position += 8),
				b1 = t.readByteAt(--pos),
				b2 = t.readByteAt(--pos),
				b3 = t.readByteAt(--pos),
				b4 = t.readByteAt(--pos),
				b5 = t.readByteAt(--pos),
				b6 = t.readByteAt(--pos),
				b7 = t.readByteAt(--pos),
				b8 = t.readByteAt(--pos);
		}
		
		// v3
		var s = (b1 >> 7) & 0x1;
		var e = ((b1 & 0x7f) << 4) | ((b2 & 0xf0) >> 4);
		var f = ((b2 & 0x0f) * pow(2,48)) +
				(b3 * pow(2,40)) +
				(b4 * pow(2,32)) +
				(b5 * pow(2,24)) +
				(b6 * pow(2,16)) +
				(b7 * pow(2, 8)) +
				b8;
	 
		if (e === 2047) {
			if (f !== 0) {
				return Number.NaN;
			} else if (s) {
				return -Infinity;
			} else {
				return Infinity;
			}
		} else if (e > 0) {
			return (s?-1:1) * pow(2,e-1023) * (1 + f / 0x10000000000000);
		} else if (f !== 0) {
			return (s?-1:1) * pow(2,-1022) * (f / 0x10000000000000);
		} else {
			return s ? -0 : 0;
		}
	},

	/////////////////////////////////////////////////////////
	// Encoded integer
	/////////////////////////////////////////////////////////

	readEncodedU32: function() {
		var val = 0;
		for(var i = 0; i < 5; i++) {
			var num = this.readByteAt(this.position++);
			val = val | ((num & 0x7f) << (7 * i));
			if (!(num & 0x80)) break;
		}
		return val;
	},

	/////////////////////////////////////////////////////////
	// Bit values
	/////////////////////////////////////////////////////////

	align: function() {
		this._bitPosition = 8;
		this._bitBuffer = null;
	},

	readUB: function(numBits, lsb) {
		var t = this, val = 0;
		for(var i = 0; i < numBits; i++) {
			if (8 == t._bitPosition) {
				t._bitBuffer = t.readUI8();
				t._bitPosition = 0;
			}
			
			if (lsb) {
				val |= (t._bitBuffer & (0x01 << t._bitPosition++) ? 1 : 0) << i;
			} else {
				val = (val << 1) | (t._bitBuffer & (0x80 >> t._bitPosition++) ? 1 : 0);
			}
		}
		
		return val;
	},
	
	writeUB: function(value, numBits) {
		if (0 == numBits) return;
		
		var t = this;
		if (t._bitPosition == 0) t._bitPosition = 8;
		
		while (numBits > 0) {
			while (t._bitPosition > 0 && numBits > 0) {
				if ((value & (0x01 << (numBits - 1))) != 0) {
					t._bitBuffer = t._bitBuffer | (0x01 << (t._bitPosition - 1));
				}
				
				--numBits;
				--t._bitPosition;
			}
			
			if (0 == t._bitPosition) {
				t.writeUI8(t._bitBuffer);
				t._bitBuffer = 0;
				
				if (numBits > 0) t._bitPosition = 8;
			}
		}
	},

	readSB: function(numBits) {
		if(!numBits) return 0;
		
		var val = this.readUB(numBits);
		
		// SWFWire
		var leadingDigit = val >>> (numBits - 1);
		if (leadingDigit == 1) return -((~val & (~0 >>> -numBits)) + 1);
		return val;
		
		// SWFAssist
		//var shift = 32 - numBits;
		//var result = (val << shift) >> shift;
		//return result;
		
		// Gordon
		//if (val >> (numBits - 1)) val -= pow(2, numBits);
		//return val;
	},
	
	writeSB: function(value, numBits) {
		writeUB(value | ((value < 0 ? 0x80000000 : 0x00000000) >> (32 - numBits)), numBits);
	},

	/////////////////////////////////////////////////////////
	// String
	/////////////////////////////////////////////////////////
	
	/**
	Reads a single UTF-8 character
	http://www.codeproject.com/KB/ajax/ajaxunicode.aspx
	*/
	readUTFChar: function() {
		var pos = (this.position++);
		var code = this._buffer.charCodeAt(pos);
		var rawChar = this._buffer.charAt(pos);
		
		// needs to be an HTML entity
		if (code > 255) {
			// normally we encounter the High surrogate first
			if (0xD800 <= code && code <= 0xDBFF) {
				hi  = code;
				lo = this._buffer.charCodeAt(pos + 1);
				// the next line will bend your mind a bit
				code = ((hi - 0xD800) * 0x400) + (lo - 0xDC00) + 0x10000;
				this.position++; // we already got low surrogate, so don't grab it again
			}
			// what happens if we get the low surrogate first?
			else if (0xDC00 <= code && code <= 0xDFFF) {
				hi  = this._buffer.charCodeAt(pos-1);
				lo = code;
				code = ((hi - 0xD800) * 0x400) + (lo - 0xDC00) + 0x10000;
			}
			// wrap it up as Hex entity
			c = "" + code.toString(16).toUpperCase() + ";";
		} else {
			c = rawChar;
		}
		
		return c;
	},
	
	/*writeUTFChar: function(rawChar) {
		var code = rawChar.charCodeAt(0);
		
		// if an HTML entity
		if (code > 255) {
			this._buffer += fromCharCode((code >>> 8) & 0xFF);
			this._buffer += fromCharCode(code);
		} else {
			this._buffer += fromCharCode(code);
		}
	},*/
	
	readUTFBytes: function(numChars) {
		var t = this, str = null, chars = [];
		var endPos = t.position + numChars;
		while(t.position < endPos) {
			chars.push(this.readUTFChar());
		}
		str = chars.join('');
		return str;
	},
	
	writeUTFBytes: function(value) {
		/*var t = this, chars = value.split(''), l = value.length;
		while(l--) {
			this.writeUTFChar(chars.shift());
			this.position++;
		}*/
		this.writeBytes(value);
	},
	
	/**
	Reads a UTF-8 string from the byte stream. The string is assumed to be 
	prefixed with an unsigned short indicating the length in bytes. 
	*/
	readUTF: function() {
		var len = this.readUI16();
		return this.readUTFBytes(len);
	},
	
	writeUTF: function(value) {
		this.writeUI16(value.length);
		this.writeUTFBytes(value);
	},

	/*
	In SWF 5 or earlier, STRING values are encoded using either ANSI (which is a superset of
	ASCII) or shift-JIS (a Japanese encoding). You cannot indicate the encoding that is used;
	instead, the decoding choice is made according to the locale in which Flash Player is running.
	This means that text content in SWF 5 or earlier can only be encoded in ANSI or shift-JIS,
	and the target audience must be known during authoring—otherwise garbled text results.

	In SWF 6 or later, STRING values are always encoded by using the Unicode UTF-8 standard.
	This is a multibyte encoding; each character is composed of between one and four bytes.
	UTF-8 is a superset of ASCII; the byte range 0 to 127 in UTF-8 exactly matches the ASCII
	mapping, and all ASCII characters 0 to 127 are represented by just one byte. UTF-8
	guarantees that whenever a character other than character 0 (the null character) is encoded by
	using more than one byte, none of those bytes are zero. This avoids the appearance of internal
	null characters in UTF-8 strings, meaning that it remains safe to treat null bytes as string
	terminators, just as for ASCII strings.
	*/
	readString: function(numChars, simple) {
		var t = this, b = t._buffer, str = null;
		if (undefined != numChars) {
			str = b.substr(t.position, numChars);
			t.position += numChars;
		} else {
			var chars = [], i = t.length - t.position;
			while (i--) {
				var code = t.readByteAt(t.position++), code2, code3;
				if (code) {
					if (simple) {
						// Read raw
						chars.push(fromCharCode(code));
					} else {
						// Fix multibyte UTF characters
						if (code < 128) {
							chars.push(fromCharCode(code));
						} else if ((code > 191) && (code < 224)) {
							code2 = t.readByteAt(t.position++);
							chars.push(fromCharCode(((code & 31) << 6) | (code2 & 63)));
							i--;
						} else {
							code2 = t.readByteAt(t.position++);
							code3 = t.readByteAt(t.position++);
							chars.push(fromCharCode(((code & 15) << 12) | ((code2 & 63) << 6) | (code3 & 63)));
							i -= 2;
						}
					}
				} else {
					break;
				}
			}
			str = chars.join('');
		}
		
		// Fix ™ entity
		//str = str.replace('â¢', '™', 'g');
		
		return str;
	},
	
	/////////////////////////////////////////////////////////
	// Boolean
	/////////////////////////////////////////////////////////
	
	readBool: function(numBits) {
		return !!this.readUB(numBits || 1);
	}
};

})();