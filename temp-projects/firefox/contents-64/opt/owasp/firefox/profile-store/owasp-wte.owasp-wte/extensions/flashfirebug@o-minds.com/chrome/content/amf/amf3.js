(function() {

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
	
	//dump(str);
}
var ERROR = trace;
	
/*
uint8 - BYTE - readUnsignedByte - U8
int8 - CHAR - readByte
uint16 - USHORT - readUnsignedShort - U16
int16 - SHORT - readShort
uint32 - ULONG - readUnsignedInt - U32
int32 - LONG - readInt

readBoolean : moves position by 1
readByte : moves position by 1
readDouble : moves position by 8
readFloat : moves position by 4
readInt : moves position by 4
readMultiByte : Reads a multibyte string of specified length from the file stream, byte stream
readShort : moves position by 2
readUnsignedByte : moves position by 1
readUnsignedInt : moves position by 4
readUnsignedShort : moves position by 2
readUTF : reads based on assumed prefix of string length
readUTFBytes : moves specified amount
*/

// AMF marker constants
const UNDEFINED_TYPE = 0;
const NULL_TYPE = 1;
const FALSE_TYPE = 2;
const TRUE_TYPE = 3;
const INTEGER_TYPE = 4;
const DOUBLE_TYPE = 5;
const STRING_TYPE = 6;
const XML_DOC_TYPE = 7;
const DATE_TYPE = 8;
const ARRAY_TYPE = 9;
const OBJECT_TYPE = 10;
const XML_TYPE = 11;
const BYTE_ARRAY_TYPE = 12;

// AbstractMessage Serialization Constants
const HAS_NEXT_FLAG = 128;
const BODY_FLAG = 1;
const CLIENT_ID_FLAG = 2;
const DESTINATION_FLAG = 4;
const HEADERS_FLAG = 8;
const MESSAGE_ID_FLAG = 16;
const TIMESTAMP_FLAG = 32;
const TIME_TO_LIVE_FLAG = 64;
const CLIENT_ID_BYTES_FLAG = 1;
const MESSAGE_ID_BYTES_FLAG = 2;

//AsyncMessage Serialization Constants
const CORRELATION_ID_FLAG = 1;
const CORRELATION_ID_BYTES_FLAG = 2;

// CommandMessage Serialization Constants
const OPERATION_FLAG = 1;

// Simplified implementaiton of the class alias registry 
const CLASS_ALIAS_REGISTRY = {	
	"DSK": "flex.messaging.messages.AcknowledgeMessageExt",
	"DSA": "flex.messaging.messages.AsyncMessageExt",
	"DSC": "flex.messaging.messages.CommandMessageExt"	
};

Flashbug.AMF3 = function() {
	
	//--------------------------------------
	//  Public Vars
	//--------------------------------------
	
	//--------------------------------------
	//  Private Vars
	//--------------------------------------

	// The raw binary data
	this._rawData = null;
	
	// The decoded data
	this._data = null;
	
	this.readObjectCache = [];
	this.readStringCache = [];
	this.readTraitsCache = [];
	
	//--------------------------------------
	//  Constructor
	//--------------------------------------
	
};

Flashbug.AMF3.prototype = {
	
	// Reads the amf3 data
	deserialize: function(data) {
		this.reset();
		
		this._rawData = data;
		this._data = this.readData(this._rawData);
	},
	
	// Clears the object, string and definition cache
	reset: function() {
		this.readObjectCache = [];
		this.readStringCache = [];
		this.readTraitsCache = [];
	},
	
	readData: function(ba) {
		var type = ba.readByte();
		switch(type) {
			case UNDEFINED_TYPE : return undefined;
			case NULL_TYPE 		: return null;
			case FALSE_TYPE 	: return false;
			case TRUE_TYPE 		: return true;
			case INTEGER_TYPE 	: return this.readInt(ba);
			case DOUBLE_TYPE 	: return this.readDouble(ba);
			case STRING_TYPE 	: return this.readString(ba);
			case XML_DOC_TYPE 	: return this.readXMLDoc(ba);
			case DATE_TYPE 		: return this.readDate(ba);
			case ARRAY_TYPE 	: return this.readArray(ba);
			case OBJECT_TYPE 	: return this.readObject(ba);
			case XML_TYPE 		: return this.readXML(ba);
			case BYTE_ARRAY_TYPE : return this.readByteArray(ba);
			default: throw Error("AMF3::readData - Error : Undefined AMF3 type encountered '" + type + "'");
		}
	},
	
	readInt: function(ba) {
		var result = this.readUInt29(ba);
		// Symmetric with writing an integer to fix sign bits for negative values...
		result = (result << 3) >> 3;
		return result;
	},
	
	readUInt29: function(ba) {
		var result = 0;
		
		// Each byte must be treated as unsigned
		var b = ba.readUnsignedByte();
		
		if (b < 128) return b;
		
		result = (b & 0x7F) << 7;
		b = ba.readUnsignedByte();
		
		if (b < 128) return (result | b);
		
		result = (result | (b & 0x7F)) << 7;
		b = ba.readUnsignedByte();
		
		if (b < 128) return (result | b);
		
		result = (result | (b & 0x7F)) << 8;
		b = ba.readUnsignedByte();
		
		return (result | b);
	},
	
	readDouble: function(ba) {
		return ba.readDouble();
	},
	
	readString: function(ba) {
		var ref = this.readUInt29(ba);
		if ((ref & 1) == 0) return this.getStringReference(ref >> 1);
		
		// writeString() special cases the empty string
		// to avoid creating a reference.
		var len = ref >> 1;
		var str = "";
		if (len > 0) {
			str = ba.readUTFBytes(len);
			this.readStringCache.push(str);
		}
		return str;
	},
	
	readXMLDoc: function(ba) {
		var ref = this.readUInt29(ba);
		if((ref & 1) == 0) return this.getObjectReference(ref >> 1);
		
		var xmldoc = new XML(ba.readUTFBytes(ref >> 1));
		this.readObjectCache.push(xmldoc);
		return xmldoc;
	},
	
	readDate: function(ba) {
		var ref = this.readUInt29(ba);
		if ((ref & 1) == 0) return this.getObjectReference(ref >> 1);
		
		var d = new Date(ba.readDouble());
		this.readObjectCache.push(d);
		return d;
	},
	
	readArray: function(ba) {
		var ref = this.readUInt29(ba);
		if ((ref & 1) == 0) return this.getObjectReference(ref >> 1);
		
		var arr = new Array();
		this.readObjectCache.push(arr);
		
		// Associative values
		var strKey = this.readString(ba);
		while(strKey != "") {
			arr[strKey] = this.readData(ba);
			strKey = this.readString(ba);
		}
		
		// Strict values
		var l = (ref >> 1);
		for(var i = 0; i < l; i++) {
			arr[i] = this.readData(ba);
		}
		
		return arr;
	},
	
	readObject: function(ba) {
		var ref = this.readUInt29(ba);
		if ((ref & 1) == 0) return this.getObjectReference(ref >> 1);
		
		// Read traits
		var traits;
		if ((ref & 3) == 1) {
			traits = this.getTraitReference(ref >> 2);
		} else {
			var isExternalizable = ((ref & 4) == 4);
			var isDynamic = ((ref & 8) == 8);
			var className = this.readString(ba);
			
			var classMemberCount = (ref >> 4); /* uint29 */
			var classMembers = [];
			for(var i = 0; i < classMemberCount; ++i) {
				classMembers.push(this.readString(ba));
			}
			if (className.length == 0) className = 'Object';
			traits = { type:className, members:classMembers, count:classMemberCount, externalizable:isExternalizable, dynamic:isDynamic };
			this.readTraitsCache.push(traits);
		}
		
		// Check for any registered class aliases 
		var aliasedClass = CLASS_ALIAS_REGISTRY[traits.type];
		if (aliasedClass != null) traits.type = aliasedClass;
		
		var obj = {};
		
		//Add to references as circular references may search for this object
		this.readObjectCache.push(obj);
		
		if (traits.externalizable) {
			// Read Externalizable
			try {
				if (traits.type.indexOf("flex.") == 0) {
					// Try to get a class
					var classParts = traits.type.split(".");
					var unqualifiedClassName = classParts[(classParts.length - 1)];
					if (unqualifiedClassName && Flashbug.AMF3.Flex[unqualifiedClassName]) {
						var flexParser = new Flashbug.AMF3.Flex[unqualifiedClassName]();
						obj = flexParser.readExternal(ba, this);
					} else {
						obj = this.readData(ba);
					}
				}
			} catch (e) {
				ERROR("AMF3::readObject - Error : Unable to read externalizable data type '" + traits.type + "'  |  " + e);
				obj = "Unable to read externalizable data type '" + traits.type + "'";
			}
		} else {
			var l = traits.members.length;
			var key;
			
			for(var j = 0; j < l; ++j) {
				var val = this.readData(ba);
				key = traits.members[j];
				obj[key] = val;
			}
			
			if(traits.dynamic) {
				key = this.readString(ba);
				while(key != "") {
					var value = this.readData(ba);
					obj[key] = value;
					key = this.readString(ba);
				}
			}
		}
		
		if(traits) obj.__traits = traits;
		
		return obj;
	},
	
	readXML: function(ba) {
		var ref = this.readUInt29(ba);
		if((ref & 1) == 0)  return this.getObjectReference(ref >> 1);
		
		var xml = new XML(ba.readUTFBytes(ref >> 1));
		this.readObjectCache.push(xml);
		return xml;
	},
	
	readByteArray: function(ba) {
		var ref = this.readUInt29(ba);
		if ((ref & 1) == 0) return this.getObjectReference(ref >> 1);
		
		var l = (ref >> 1);
		//var ba2 = new ByteArray();
		var ba2 = [];
		while(l--) {
			var b = ba.readUnsignedByte().toString(16).toUpperCase();
			if (b.length < 2) b = '0' + b;
			ba2.push('0x' + b);
		}
		//ba.readBytes(ba2, 0, l);
		this.readObjectCache.push(ba2);
		return ba2;
	},
	
	getStringReference: function(ref) {
		if (ref >= this.readStringCache.length) {
			ERROR("AMF3::getStringReference - Error : Undefined string reference '" + ref + "'");
			return null;
		}
		
		return this.readStringCache[ref];
	},
	
	getTraitReference: function(ref) {
		if (ref >= this.readTraitsCache.length) {
			ERROR("AMF3::getTraitReference - Error : Undefined trait reference '" + ref + "'");
			return null;
		}
		
		return this.readTraitsCache[ref];
	},
	
	getObjectReference: function(ref) {
		if (ref >= this.readObjectCache.length) {
			ERROR("AMF3::getObjectReference - Error : Undefined object reference '" + ref + "'");
			return null;
		}
		
		return this.readObjectCache[ref];
	}
};

//////////////////////
// Remoting Classes //
//////////////////////

Flashbug.AMF3.Flex = {};

var UUIDUtils = {
	
	UPPER_DIGITS: [
		'0', '1', '2', '3', '4', '5', '6', '7',
		'8', '9', 'A', 'B', 'C', 'D', 'E', 'F'
		],
	
	fromByteArray: function(ba) {
		if (ba != null && ba.length == 16) {
			var result = "";
			for (var i = 0; i < 16; i++) {
				if (i == 4 || i == 6 || i == 8 || i == 10) result += "-";
				
				result += this.UPPER_DIGITS[(+ba[i] & 0xF0) >>> 4];
				result += this.UPPER_DIGITS[(+ba[i] & 0x0F)];
			}
			return result;
		}
		
		return null;
	}
}

// Abstract Message //
Flashbug.AMF3.Flex.AbstractMessage = function() {
	this.clientId = null; // object
	this.destination = null; // string
	this.messageId = null; // string
	this.timestamp = null; // number
	this.timeToLive = null; // number
	
	this.headers = null; // Map
	this.body = null; // object
	
	//this.clientIdBytes; // byte array
	//this.messageIdBytes; // byte array
};

Flashbug.AMF3.Flex.AbstractMessage.prototype = {
	
	readExternal: function(ba, parser) {
		var flagsArray = this.readFlags(ba);
		for (var i = 0; i < flagsArray.length; i++) {
			var flags = flagsArray[i],
			reservedPosition = 0;
			trace(i +'/'+flagsArray.length, flags)
			if (i == 0) {
				if ((flags & BODY_FLAG) != 0) this.readExternalBody(ba, parser);
				if ((flags & CLIENT_ID_FLAG) != 0) this.clientId = parser.readData(ba);
				if ((flags & DESTINATION_FLAG) != 0) this.destination = parser.readData(ba);
				if ((flags & HEADERS_FLAG) != 0) this.headers = parser.readData(ba);
				if ((flags & MESSAGE_ID_FLAG) != 0) this.messageId = parser.readData(ba);
				if ((flags & TIMESTAMP_FLAG) != 0) this.timestamp = parser.readData(ba);
				if ((flags & TIME_TO_LIVE_FLAG) != 0) this.timeToLive = parser.readData(ba);
				reservedPosition = 7;
			} else if (i == 1) {
				if ((flags & CLIENT_ID_BYTES_FLAG) != 0) {
					var clientIdBytes = parser.readData(ba);
					this.clientId = UUIDUtils.fromByteArray(clientIdBytes);
				}
				
				if ((flags & MESSAGE_ID_BYTES_FLAG) != 0) {
					var messageIdBytes = parser.readData(ba);
					this.messageId = UUIDUtils.fromByteArray(messageIdBytes);
				}
				
				reservedPosition = 2;
			}
			
			// For forwards compatibility, read in any other flagged objects to
			// preserve the integrity of the input stream...
			if ((flags >> reservedPosition) != 0) {
				for (var j = reservedPosition; j < 6; j++) {
					if (((flags >> j) & 1) != 0) parser.readData(ba);
				}
			}
		}
		
		return this;
	},
	
	readExternalBody: function(ba, parser) {
		this.body = parser.readData(ba);
	},
	
	readFlags: function(ba) {
		var hasNextFlag = true, 
		flagsArray = [], 
		i = 0;
		
		while (hasNextFlag) {
			var flags = ba.readUnsignedByte();
			/*if (i == flagsArray.length) {
				short[] tempArray = new short[i*2];
				System.arraycopy(flagsArray, 0, tempArray, 0, flagsArray.length);
				flagsArray = tempArray;
			}*/
			
			flagsArray[i] = flags;
			hasNextFlag = ((flags & HAS_NEXT_FLAG) != 0) ? true : false;
			i++;
		}
		
		return flagsArray;
	}
};

// flex.messaging.messages.AsyncMessage //
Flashbug.AMF3.Flex.AsyncMessage = function() {
	this.correlationId = null; // string
	//var correlationIdBytes; // byte array
};
Flashbug.AMF3.Flex.AsyncMessage.prototype = new Flashbug.AMF3.Flex.AbstractMessage();
Flashbug.AMF3.Flex.AsyncMessage.constructor = Flashbug.AMF3.Flex.AsyncMessage;

Flashbug.AMF3.Flex.AsyncMessage.prototype.readExternal = function(ba, parser) {
	Flashbug.AMF3.Flex.AbstractMessage.prototype.readExternal.call(this, ba, parser);
	
	var flagsArray = this.readFlags(ba);
	for (var i = 0; i < flagsArray.length; i++) {
		var flags = flagsArray[i],
		reservedPosition = 0;
		
		if (i == 0) {
			if ((flags & CORRELATION_ID_FLAG) != 0) this.correlationId = parser.readData(ba);
			
			if ((flags & CORRELATION_ID_BYTES_FLAG) != 0) {
				var correlationIdBytes = parser.readData(ba);
				this.correlationId = UUIDUtils.fromByteArray(correlationIdBytes);
			}
			
			reservedPosition = 2;
		}
		
		// For forwards compatibility, read in any other flagged objects
		// to preserve the integrity of the input stream...
		if ((flags >> reservedPosition) != 0) {
			for (var j = reservedPosition; j < 6; ++j) {
				if (((flags >> j) & 1) != 0) parser.readData(ba);
			}
		}
	}
	
	return this;
};

// DSA - flex.messaging.messages.AsyncMessageExt //
Flashbug.AMF3.Flex.AsyncMessageExt = function() { };
Flashbug.AMF3.Flex.AsyncMessageExt.prototype = new Flashbug.AMF3.Flex.AsyncMessage();
Flashbug.AMF3.Flex.AsyncMessageExt.constructor = Flashbug.AMF3.Flex.AsyncMessageExt;

// flex.messaging.messages.AcknowledgeMessage //
Flashbug.AMF3.Flex.AcknowledgeMessage = function() { };
Flashbug.AMF3.Flex.AcknowledgeMessage.prototype = new Flashbug.AMF3.Flex.AsyncMessage();
Flashbug.AMF3.Flex.AcknowledgeMessage.constructor = Flashbug.AMF3.Flex.AcknowledgeMessage;

Flashbug.AMF3.Flex.AcknowledgeMessage.prototype.readExternal = function(ba, parser) {
	Flashbug.AMF3.Flex.AsyncMessage.prototype.readExternal.call(this, ba, parser);
	
	var flagsArray = this.readFlags(ba);
	for (var i = 0; i < flagsArray.length; ++i) {
		var flags = flagsArray[i],
		reservedPosition = 0;
		
		// For forwards compatibility, read in any other flagged objects
		// to preserve the integrity of the input stream...
		if ((flags >> reservedPosition) != 0) {
			for (var j = reservedPosition; j < 6; ++j) {
				if (((flags >> j) & 1) != 0) parser.readData(ba);
			}
		}
	}
	
	return this;
};

// DSK - flex.messaging.messages.AcknowledgeMessageExt //
Flashbug.AMF3.Flex.AcknowledgeMessageExt = function() { };
Flashbug.AMF3.Flex.AcknowledgeMessageExt.prototype = new Flashbug.AMF3.Flex.AcknowledgeMessage();
Flashbug.AMF3.Flex.AcknowledgeMessageExt.constructor = Flashbug.AMF3.Flex.AcknowledgeMessageExt;

// flex.messaging.messages.CommandMessage //
Flashbug.AMF3.Flex.CommandMessage = function() {
	this.operation = 1000;
	this.operationName = "unknown";
};
Flashbug.AMF3.Flex.CommandMessage.prototype = new Flashbug.AMF3.Flex.AsyncMessage();
Flashbug.AMF3.Flex.CommandMessage.constructor = Flashbug.AMF3.Flex.CommandMessage;

Flashbug.AMF3.Flex.CommandMessage.prototype.readExternal = function(ba, parser) {
	Flashbug.AMF3.Flex.AsyncMessage.prototype.readExternal.call(this, ba, parser);
	
	var flagsArray = this.readFlags(ba);
	for (var i = 0; i < flagsArray.length; ++i) {
		var flags = flagsArray[i],
		reservedPosition = 0,
		operationNames = [
			"subscribe", "unsubscribe", "poll", "unused3", "client_sync", "client_ping",
			"unused6", "cluster_request", "login", "logout", "subscription_invalidate",
			"multi_subscribe", "disconnect", "trigger_connect"
		];
		
		if (i == 0) {
			if ((flags & OPERATION_FLAG) != 0) {
				this.operation = parser.readData(ba);
				if (this.operation < 0 || this.operation >= operationNames.length) {
					this.operationName = "invalid." + this.operation + "";
				} else {
					this.operationName = operationNames[this.operation];
				}
			}
			reservedPosition = 1;
		}
		
		// For forwards compatibility, read in any other flagged objects
		// to preserve the integrity of the input stream...
		if ((flags >> reservedPosition) != 0) {
			for (var j = reservedPosition; j < 6; ++j) {
				if (((flags >> j) & 1) != 0) parser.readData(ba);
			}
		}
	}
	
	return this;
};

// DSC - flex.messaging.messages.CommandMessageExt //
Flashbug.AMF3.Flex.CommandMessageExt = function() { };
Flashbug.AMF3.Flex.CommandMessageExt.prototype = new Flashbug.AMF3.Flex.CommandMessage();
Flashbug.AMF3.Flex.CommandMessageExt.constructor = Flashbug.AMF3.Flex.CommandMessageExt;

// flex.messaging.messages.ErrorMessage //
Flashbug.AMF3.Flex.ErrorMessage = function() {
	this.faultCode = '';
	this.faultString = '';
	this.faultDetail = '';
	this.rootCause;
	this.extendedData;
};
Flashbug.AMF3.Flex.ErrorMessage.prototype = new Flashbug.AMF3.Flex.AcknowledgeMessage();
Flashbug.AMF3.Flex.ErrorMessage.constructor = Flashbug.AMF3.Flex.ErrorMessage;

// flex.messaging.messages.RPCPMessage //
Flashbug.AMF3.Flex.RPCPMessage = function() {
	this.remoteUsername = '';
	this.remotePassword = '';
};
Flashbug.AMF3.Flex.RPCPMessage.prototype = new Flashbug.AMF3.Flex.AbstractMessage();
Flashbug.AMF3.Flex.RPCPMessage.constructor = Flashbug.AMF3.Flex.RPCPMessage;

// flex.messaging.messages.HTTPMessage //
Flashbug.AMF3.Flex.HTTPMessage = function() {
	this.contentType = '';
	this.method = '';
	this.url = '';
	this.httpHeaders = {};
	this.recordHeaders = false;
};
Flashbug.AMF3.Flex.HTTPMessage.prototype = new Flashbug.AMF3.Flex.RPCPMessage();
Flashbug.AMF3.Flex.HTTPMessage.constructor = Flashbug.AMF3.Flex.HTTPMessage;

// flex.messaging.messages.RemotingMessage //
Flashbug.AMF3.Flex.RemotingMessage = function() {
	this.operation = '';
	this.source = '';
	this.parameters = [];
	this.parameterList = [];
};
Flashbug.AMF3.Flex.RemotingMessage.prototype = new Flashbug.AMF3.Flex.RPCPMessage();
Flashbug.AMF3.Flex.RemotingMessage.constructor = Flashbug.AMF3.Flex.RemotingMessage;

// flex.messaging.messages.SOAPMessage //
Flashbug.AMF3.Flex.SOAPMessage = function() {
	this.remoteUsername = '';
	this.remotePassword = '';
};
Flashbug.AMF3.Flex.SOAPMessage.prototype = new Flashbug.AMF3.Flex.HTTPMessage();
Flashbug.AMF3.Flex.SOAPMessage.constructor = Flashbug.AMF3.Flex.SOAPMessage;

// flex.messaging.io.ArrayCollection //
Flashbug.AMF3.Flex.ArrayCollection = function() {
	this.source = null;
};
Flashbug.AMF3.Flex.ArrayCollection.prototype.readExternal = function(ba, parser) {
	this.source = parser.readData(ba);
	return this;
};

// Array List //
Flashbug.AMF3.Flex.ArrayList = function() { };
Flashbug.AMF3.Flex.ArrayList.prototype = new Flashbug.AMF3.Flex.ArrayCollection();
Flashbug.AMF3.Flex.ArrayList.constructor = Flashbug.AMF3.Flex.ArrayList;

// flex.messaging.io.ObjectProxy //
Flashbug.AMF3.Flex.ObjectProxy = function() { };
Flashbug.AMF3.Flex.ObjectProxy.prototype.readExternal = function(ba, parser) {
	var obj = parser.readData(ba);
	for (var i in obj) {
		this[i] = obj[i];
	}
	return this;
};

// flex.messaging.io.ManagedObjectProxy //
Flashbug.AMF3.Flex.ManagedObjectProxy = function() { };
Flashbug.AMF3.Flex.ManagedObjectProxy.prototype = new Flashbug.AMF3.Flex.ObjectProxy();
Flashbug.AMF3.Flex.ManagedObjectProxy.constructor = Flashbug.AMF3.Flex.ManagedObjectProxy;

// flex.messaging.io.SerializationProxy //
Flashbug.AMF3.Flex.SerializationProxy = function() {
	this.defaultInstance = null;
};

Flashbug.AMF3.Flex.SerializationProxy.prototype.readExternal = function(ba, parser) {
	/*var saveObjectTable = null;
	var saveTraitsTable = null;
	var saveStringTable = null;
	var in3 = null;

	if (ba instanceof Amf3Input) in3 = ba;*/

	try {
		/*if (in3 != null) {
			saveObjectTable = in3.saveObjectTable();
			saveTraitsTable = in3.saveTraitsTable();
			saveStringTable = in3.saveStringTable();
		}*/
		
		this.defaultInstance = parser.readData(ba);
	} finally {
		/*if (in3 != null) {
			in3.restoreObjectTable(saveObjectTable);
			in3.restoreTraitsTable(saveTraitsTable);
			in3.restoreStringTable(saveStringTable);
		}*/
	}
	
	return this;
};

})();