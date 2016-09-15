/**
 * Parse CFF files to extract the font name
 */
if (!Flashbug) var Flashbug = {};
(function() {

Flashbug.CFF = function (ba) {
	var strOTTO = ba.readString(4), // OTTO signature
		objData = {};
	
	// Populate Offset Table
	ba.position = 0;
	objData.offSetTable = getOffSetTable(ba);

	// Populate Directory
	objData.tables = [];
	for(var i = 0; i < objData.offSetTable.numTables; i++) {
		objData.tables.push(getDirectoryTable(ba));
	}
	
	// Populate Tables
	var l = objData.tables.length;
	for (var j = 0; j < l; j++) {
		var curTable = objData.tables[j];
		
		if (curTable.name == 'CFF ') {
			// Read CFF table
			ba.position = curTable.offSet;
			curTable.header = getCFFTableHeader(ba);
			curTable.names = readIndex(ba);
			curTable.top = readIndex(ba);
			curTable.string = readIndex(ba);
			//curTable.globalSubr = readIndex(ba);
			// encodings
			// charsets
			// fdselect
			//curTable.charStrings = readIndex(ba);
			// font DICT INDEX
			// private DICT
			// local subr INDEX
			//break;
		}
		
		if (curTable.name == 'name') {
			// Read NAME table
			ba.position = curTable.offSet;
			curTable.header = getNameTableHeader(ba);
			curTable.nameRecords = [];
			
			for (var k = 0; k < curTable.header.count; k++) {
				var offset = curTable.offSet + curTable.header.stringOffset;
				curTable.nameRecords.push(addNameRecords(ba, offset));
			}
		}
	}
	
	function readIndex(ba) {
		var index = [];
		var count = ba.readUI16();
		var offSize = ba.readUI8();
		var offSet = [];
		for (var k = 0; k <= count; k++) {
			offSet.push(ba.readNumber(offSize));
		}
		
		var nPos = ba.position;
		for (var k = 0; k < count; k++) {
			ba.position = nPos + (offSet[k] - 1);
			var len = offSet[k + 1] - offSet[k];
			var data = ba.readString(len);
			index.push(data);
		}
		
		return index;
	}
	
	function getNameTableHeader(ba) {
		var obj = {};
		obj.format = ba.readUI16(); // Format selector. Always 0
		obj.count = ba.readUI16(); // Name Records count
		obj.stringOffset = ba.readUI16(); // Offset for strings storage, from start of the table
		return obj;
	}
		
	function addNameRecords(ba, nOffSet) {
		var obj = new Object();
		try {
			obj.platformId = ba.readUnsignedShort(); // Platform ID
			obj.platformSpecificID = ba.readUnsignedShort(); // Platform-specific encoding ID
			obj.languageId = ba.readUnsignedShort(); // Language ID
			obj.nameId = ba.readUnsignedShort(); // Name ID
			/*obj.nameType = "unknown"; // Name ID Translated
			switch(obj.nameId) {
				case 0:
					obj.nameType = "Copyright Notice";
					break;
				case 1:
					obj.nameType = "Font Family Name";
					break;
				case 2:
					obj.nameType = "Font Subfamily Name";
					break;
				case 3:
					obj.nameType = "Unique Font Identifier";
					break;
				case 4:
					obj.nameType = "Full Font Name";
					break;
				case 5:
					obj.nameType = "Version String";
					break;
				case 6:
					obj.nameType = "Postscript Name";
					break;
				case 7:
					obj.nameType = "Trademark";
					break;
				case 8:
					obj.nameType = "Manufacturer Name";
					break;
				case 9:
					obj.nameType = "Designer";
					break;
				case 10:
					obj.nameType = "Description";
					break;
				case 11:
					obj.nameType = "URL Vendor";
					break;
				case 12:
					obj.nameType = "URL Designer";
					break;
				case 13:
					obj.nameType = "License Description";
					break;
				case 14:
					obj.nameType = "License Info URL";
					break;
				case 15:
					obj.nameType = "Reserved; Set to zero;";
					break;
				case 16:
					obj.nameType = "Preferred Family (Windows only)";
					break;
				case 17:
					obj.nameType = "Preferred Subfamily (Windows only)";
					break;
				case 18:
					obj.nameType = "Compatible Full (Macintosh only)";
					break;
				case 19:
					obj.nameType = "Sample Text";
					break;
			}*/
			
			obj.length = ba.readUnsignedShort(); // String Length (in bytes)
			obj.offSet = ba.readUnsignedShort(); // String offset from start of storage area (in bytes)
			if (obj.offSet > ba.getBytesAvailable()) obj.offSet = 0;
			
			// Add Record
			var nPos = ba.position;
			ba.position = nOffSet + obj.offSet;
			obj.text = readUTFBytes16(ba, obj.length);
			ba.position = nPos;
		} catch (e) {
			obj.error = true;
		}
		return obj;
	}
	
	function readUTFBytes16(ba, length) {
		var str = "", count = 1, byte = ""; 
		for (var i = 0; i < length; i++) {
			byte += ba.readUTFBytes(1);
			count++;
			
			if(count > 2) {
				if(byte == '!"') byte = "™"; // Trademark Unicode
				
				str += byte;
				byte = "";
				count = 1;
			}
		}
		return str;
	}
	
	function getCFFTableHeader(ba) {
		var obj = {};
		obj.major = ba.readUI8(); // Format major version (starting at 1) 
		obj.minor = ba.readUI8(); // Format minor version (starting at 0)
		obj.hdrSize = ba.readUI8(); // Header size (byteS)
		obj.offSize = ba.readUI8(); // Absolute offset (0) size
		return obj;
	}

	function getOffSetTable(ba) {
		var obj = {};
		obj.majorVersion = ba.readUI16();
		obj.minorVersion = ba.readUI16();
		obj.numTables = ba.readUI16();
		obj.searchRange = ba.readUI16();
		obj.entrySelector = ba.readUI16();
		obj.rangeShift = ba.readUI16();
		return obj;
	}
	
	function getDirectoryTable(ba) {
		var obj = {};
		obj.name = ba.readUTFBytes(4); //table name
		obj.checkSum = ba.readUI32(); //Check sum
		obj.offSet = ba.readUI32(); //Offset from beginning of file
		obj.length = ba.readUI32(); //length of the table in bytes
		return obj;
	}
	
	this.getFontName = function() {
		var l = objData.tables.length;
		for (var j = 0; j < l; j++) {
			var curTable = objData.tables[j];
			if (curTable.name == 'CFF ') return curTable.names[0];
		}
		
		return '';
	}
	
	this.getGlyphCount = function() {
		var l = objData.tables.length;
		for (var j = 0; j < l; j++) {
			var curTable = objData.tables[j];
			if (curTable.name == 'CFF ') return curTable.string.length;
		}
		
		return 0;
	}
	
	this.getCopyright = function() {
		var l = objData.tables.length;
		for (var j = 0; j < l; j++) {
			var curTable = objData.tables[j];
			if (curTable.name == 'name') return curTable.nameRecords[0].text;
		}
		
		return '';
	}
};

})();