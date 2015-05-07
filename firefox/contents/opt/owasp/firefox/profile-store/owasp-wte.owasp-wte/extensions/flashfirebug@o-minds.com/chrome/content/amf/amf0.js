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

// AMF marker constants
const NUMBER_TYPE = 0;
const BOOLEAN_TYPE = 1;
const STRING_TYPE = 2;
const OBJECT_TYPE = 3;
const MOVIECLIP_TYPE = 4; // reserved, not supported
const NULL_TYPE = 5;
const UNDEFINED_TYPE = 6;
const REFERENCE_TYPE = 7;
const ECMA_ARRAY_TYPE = 8; // associative
const OBJECT_END_TYPE = 9;
const STRICT_ARRAY_TYPE = 10;
const DATE_TYPE = 11;
const LONG_STRING_TYPE = 12; // string.length > 2^16
const UNSUPPORTED_TYPE = 13;
const RECORD_SET_TYPE = 14; // reserved, not supported
const XML_OBJECT_TYPE = 15;
const TYPED_OBJECT_TYPE = 16;
const AVMPLUS_OBJECT_TYPE = 17;
	
Flashbug.AMF0 = function() {
	
	//--------------------------------------
	//  Public Vars
	//--------------------------------------
	
	//--------------------------------------
	//  Private Vars
	//--------------------------------------
	
	// The actual object cache used to store references
	this.readObjectCache = [];
	
	// The raw binary data
	this._rawData;
	
	// The decoded data
	this._data;
	
	// AMF3 Parser
	this._amf3;
	
	//--------------------------------------
	//  Constructor
	//--------------------------------------
	
};

Flashbug.AMF0.prototype = {
	
	deserialize: function(data) {
		this.reset();
		
		this._rawData = data;
		this._data = this.readData(this._rawData);
	},
	
	reset: function() {
		this.readObjectCache = [];
		
		if(this._amf3 != null) this._amf3.reset();
	},
	
	readData: function(ba, type) {
		if(type == null) type = ba.readByte();
		switch(type) {
			case NUMBER_TYPE : return this.readNumber(ba);
			case BOOLEAN_TYPE : return this.readBoolean(ba);
			case STRING_TYPE : return this.readString(ba);
			case OBJECT_TYPE : return this.readObject(ba);
			//case MOVIECLIP_TYPE : return null;
			case NULL_TYPE : return null;
			case UNDEFINED_TYPE : return this.readUndefined(ba);
			case REFERENCE_TYPE : return this.getObjectReference(ba.readUnsignedShort());
			case ECMA_ARRAY_TYPE : return this.readECMAArray(ba);
			case OBJECT_END_TYPE :
				// Unexpected object end tag in AMF stream
				trace("AMF0::readData - Warning : Unexpected object end tag in AMF stream");
				return null;
			case STRICT_ARRAY_TYPE : return this.readArray(ba);
			case DATE_TYPE : return this.readDate(ba);
			case LONG_STRING_TYPE : return this.readLongString(ba);
			case UNSUPPORTED_TYPE :
				// Unsupported type found in AMF stream
				trace("AMF0::readData - Warning : Unsupported type found in AMF stream");
				return "__unsupported";
			case RECORD_SET_TYPE :
				// AMF Recordsets are not supported
				trace("AMF0::readData - Warning : Unexpected recordset in AMF stream");
				return null;
			case XML_OBJECT_TYPE : return this.readXML(ba);
			case TYPED_OBJECT_TYPE : return this.readCustomClass(ba);
			case AVMPLUS_OBJECT_TYPE :
				if(this._amf3 == null) this._amf3 = new Flashbug.AMF3();
				return this._amf3.readData(ba);
			/*
			With the introduction of AMF 3 in Flash Player 9 to support ActionScript 3.0 and the 
			new AVM+, the AMF 0 format was extended to allow an AMF 0 encoding context to be 
			switched to AMF 3. To achieve this, a new type marker was added to AMF 0, the 
			avmplus-object-marker. The presence of this marker signifies that the following Object is 
			formatted in AMF 3.
			*/
			default: ERROR("AMF0::readData - Error : Undefined AMF0 type encountered '" + type + "'");
		}
	},
	
	readNumber: function(ba) {
		return ba.readDouble();
	},
	
	readBoolean: function(ba) {
		return ba.readBoolean();
	},
	
	readString: function(ba) {
		return ba.readUTF();
	},
	
	readObject: function(ba) {
		var obj = {};
		var varName = ba.readUTF();
		var type = ba.readByte();
		
		// 0x00 0x00 (varname) 0x09 (end object type)
		while(varName.length > 0 && type != OBJECT_END_TYPE) {
			obj[varName] = this.readData(ba, type);
			varName = ba.readUTF();
			type = ba.readByte();
		}
		
		this.readObjectCache.push(obj);
		return obj;
	},
	
	readUndefined: function(ba) {
		return undefined;
	},
	
	readECMAArray: function(ba) {
		var arr = [];
		var l = ba.readUnsignedInt();
		var varName = ba.readUTF();
		var type = ba.readByte();
		
		// 0x00 0x00 (varname) 0x09 (end object type)
		while(varName.length > 0 && type != OBJECT_END_TYPE) {
			arr[varName] = this.readData(ba, type);
			varName = ba.readUTF();
			type = ba.readByte();
		}
		
		this.readObjectCache.push(arr);
		return arr;
	},
	
	readArray: function(ba) {
		var l = ba.readUnsignedInt();
		var arr = [];
		for (var i = 0; i < l; ++i) {
			arr.push(this.readData(ba));
		}
		
		this.readObjectCache.push(arr);
		return arr;
	},
	
	readDate: function(ba) {
		var ms = ba.readDouble();
		
		/*
		We read in the timezone but do nothing with the value as
		we expect dates to be written in the UTC timezone. Client
		and servers are responsible for applying their own
		timezones.
		*/
		var timezone = ba.readShort(); // reserved, not supported. should be set to 0x0000
		//if (timezone > 720) timezone = -(65536 - timezone);
		//timezone *= -60;
		
		return new Date(ms);
	},
	
	readLongString: function(ba) {
		return ba.readUTFBytes(ba.readUnsignedInt());
	},
	
	readXML: function(ba) {
		return new XML(this.readLongString(ba));
	},
	
	readCustomClass: function(ba) {
		var className = ba.readUTF();
		try {
			var obj = this.readObject(ba);
		} catch (e) {
			ERROR("AMF0::readCustomClass - Error : Cannot parse custom class");
		}
		obj.__traits = { type:className };
		
		// Try to type it to the class def
		/*try {
			var classDef:Class = getClassByAlias(className);
			obj = new classDef();
			obj.readExternal(ba);
		} catch (e:Error) {
			obj = readData(ba);
		}*/
		
		return obj;
	},
	
	getObjectReference: function(ref) {
		if (ref >= this.readObjectCache.length) {
			ERROR("AMF0::getObjectReference - Error : Undefined object reference '" + ref + "'");
			return null;
		}
		
		return this.readObjectCache[ref];
	}
};

})();