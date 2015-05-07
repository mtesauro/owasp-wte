const TAGS = {};
TAGS[-1] = {name:'Header', 							func:RecordHeader };

TAGS[0] = {name:'End', 								func:End };
TAGS[1] = {name:'ShowFrame', 						func:ShowFrame };
TAGS[2] = {name:'DefineShape', 						func:DefineShape };
TAGS[3] = {name:'FreeCharacter', 					func:FreeCharacter }; // Undocumented
TAGS[4] = {name:'PlaceObject', 						func:PlaceObject };
TAGS[5] = {name:'RemoveObject', 					func:RemoveObject };
TAGS[6] = {name:'DefineBits', 						func:DefineBits };
TAGS[7] = {name:'DefineButton', 					func:DefineButton };
TAGS[8] = {name:'JPEGTables', 						func:JPEGTables };
TAGS[9] = {name:'SetBackgroundColor', 				func:SetBackgroundColor };

TAGS[10] = {name:'DefineFont', 						func:DefineFont };
TAGS[11] = {name:'DefineText', 						func:DefineText };
TAGS[12] = {name:'DoAction', 						func:DoAction };
TAGS[13] = {name:'DefineFontInfo',					func:DefineFontInfo };
TAGS[14] = {name:'DefineSound', 					func:DefineSound };
TAGS[15] = {name:'StartSound', 						func:StartSound };
TAGS[16] = {name:'StopSound', 						func:StopSound }; // Undocumented
TAGS[17] = {name:'DefineButtonSound', 				func:DefineButtonSound };
TAGS[18] = {name:'SoundStreamHead', 				func:SoundStreamHead };
TAGS[19] = {name:'SoundStreamBlock', 				func:SoundStreamBlock };

TAGS[20] = {name:'DefineBitsLossless', 				func:DefineBitsLossless };
TAGS[21] = {name:'DefineBitsJPEG2', 				func:DefineBitsJPEG2 };
TAGS[22] = {name:'DefineShape2', 					func:DefineShape2 };
TAGS[23] = {name:'DefineButtonCxform', 				func:DefineButtonCxform };
TAGS[24] = {name:'Protect', 						func:Protect };
TAGS[25] = {name:'PathsArePostscript', 				func:PathsArePostscript }; // Undocumented
TAGS[26] = {name:'PlaceObject2', 					func:PlaceObject2 };
TAGS[27] = {name:'UNKNOWN 27', 						func:Unknown }; // Undocumented
TAGS[28] = {name:'RemoveObject2', 					func:RemoveObject2 };
TAGS[29] = {name:'SyncFrame', 						func:SyncFrame }; // Undocumented

TAGS[30] = {name:'UNKNOWN 30', 						func:Unknown }; // Undocumented
TAGS[31] = {name:'FreeAll', 						func:FreeAll }; // Undocumented
TAGS[32] = {name:'DefineShape3', 					func:DefineShape3 };
TAGS[33] = {name:'DefineText2', 					func:DefineText2 };
TAGS[34] = {name:'DefineButton2', 					func:DefineButton2 };
TAGS[35] = {name:'DefineBitsJPEG3', 				func:DefineBitsJPEG3 };
TAGS[36] = {name:'DefineBitsLossless2', 			func:DefineBitsLossless2 };
TAGS[37] = {name:'DefineEditText', 					func:DefineEditText };
TAGS[38] = {name:'DefineVideo', 					func:DefineVideo }; // Undocumented
TAGS[39] = {name:'DefineSprite', 					func:DefineSprite };

TAGS[40] = {name:'NameCharacter', 					func:NameCharacter }; // Undocumented
TAGS[41] = {name:'ProductInfo', 					func:ProductInfo }; // Undocumented
TAGS[42] = {name:'DefineTextFormat', 				func:DefineTextFormat }; // Undocumented
TAGS[43] = {name:'FrameLabel', 						func:FrameLabel };
TAGS[44] = {name:'DefineBehavior', 					func:DefineBehavior }; // Undocumented
TAGS[45] = {name:'SoundStreamHead2', 				func:SoundStreamHead2 };
TAGS[46] = {name:'DefineMorphShape', 				func:DefineMorphShape };
TAGS[47] = {name:'FrameTag', 						func:FrameTag }; // Undocumented
TAGS[48] = {name:'DefineFont2', 					func:DefineFont2 };
TAGS[49] = {name:'GenCommand', 						func:GenCommand }; // Undocumented

TAGS[50] = {name:'DefineCommandObject', 			func:DefineCommandObject }; // Undocumented
TAGS[51] = {name:'CharacterSet', 					func:CharacterSet }; // Undocumented
TAGS[52] = {name:'FontRef', 						func:FontRef }; // Undocumented
TAGS[53] = {name:'DefineFunction', 					func:DefineFunction }; // Undocumented
TAGS[54] = {name:'PlaceFunction', 					func:PlaceFunction }; // Undocumented
TAGS[55] = {name:'GenTagObject', 					func:GenTagObject }; // Undocumented
TAGS[56] = {name:'ExportAssets', 					func:ExportAssets };
TAGS[57] = {name:'ImportAssets', 					func:ImportAssets };
TAGS[58] = {name:'EnableDebugger', 					func:EnableDebugger };
TAGS[59] = {name:'DoInitAction', 					func:DoInitAction };

TAGS[60] = {name:'DefineVideoStream', 				func:DefineVideoStream };
TAGS[61] = {name:'VideoFrame', 						func:VideoFrame };
TAGS[62] = {name:'DefineFontInfo2', 				func:DefineFontInfo2 };
TAGS[63] = {name:'DebugID', 						func:DebugID }; // Undocumented
TAGS[64] = {name:'EnableDebugger2', 				func:EnableDebugger2 };
TAGS[65] = {name:'ScriptLimits', 					func:ScriptLimits };
TAGS[66] = {name:'SetTabIndex', 					func:SetTabIndex };
TAGS[67] = {name:'DefineShape4_', 					func:DefineShape4_ }; // Undocumented
TAGS[68] = {name:'DefineMorphShape2_', 				func:DefineMorphShape2_ }; // Undocumented
TAGS[69] = {name:'FileAttributes', 					func:FileAttributes };

TAGS[70] = {name:'PlaceObject3', 					func:PlaceObject3 };
TAGS[71] = {name:'ImportAssets2', 					func:ImportAssets2 };
TAGS[72] = {name:'DoABC', 							func:DoABC };
TAGS[73] = {name:'DefineFontAlignZones', 			func:DefineFontAlignZones };
TAGS[74] = {name:'CSMTextSettings', 				func:CSMTextSettings };
TAGS[75] = {name:'DefineFont3', 					func:DefineFont3 };
TAGS[76] = {name:'SymbolClass', 					func:SymbolClass };
TAGS[77] = {name:'Metadata', 						func:Metadata };
TAGS[78] = {name:'DefineScalingGrid', 				func:DefineScalingGrid };
TAGS[79] = {name:'UNKNOWN 79', 						func:Unknown }; // Undocumented

TAGS[80] = {name:'UNKNOWN 80', 						func:Unknown }; // Undocumented
TAGS[81] = {name:'UNKNOWN 81', 						func:Unknown }; // Undocumented
TAGS[82] = {name:'DoABC2', 							func:DoABC2 }; //
TAGS[83] = {name:'DefineShape4', 					func:DefineShape4 };
TAGS[84] = {name:'DefineMorphShape2', 				func:DefineMorphShape2 };
TAGS[85] = {name:'UNKNOWN 85', 						func:Unknown }; // Undocumented
TAGS[86] = {name:'DefineSceneAndFrameLabelData', 	func:DefineSceneAndFrameLabelData };
TAGS[87] = {name:'DefineBinaryData', 				func:DefineBinaryData };
TAGS[88] = {name:'DefineFontName', 					func:DefineFontName };
TAGS[89] = {name:'StartSound2', 					func:StartSound2 };

TAGS[90] = {name:'DefineBitsJPEG4', 				func:DefineBitsJPEG4 };
TAGS[91] = {name:'DefineFont4', 					func:DefineFont4 };

TAGS[253] = {name:'Amayeta SWF Encrypt ?', 			func:Unknown };
TAGS[255] = {name:'Amayeta SWF Encrypt 6', 			func:Unknown };
TAGS[264] = {name:'Obfu Encryption', 				func:Unknown };
TAGS[1002] = {name:'SWF Protector 3', 				func:Unknown };
TAGS[1022] = {name:'Amayeta SWF Compress 1', 		func:Unknown };

const TAG_CODES = {
	Header: -1,
	End: 0,
	ShowFrame: 1,
	DefineShape: 2,
	FreeCharacter: 3, // Undocumented
	PlaceObject: 4,
	RemoveObject: 5,
	DefineBits: 6,
	DefineButton: 7,
	JPEGTables: 8,
	SetBackgroundColor: 9,
	
	DefineFont: 10,
	DefineText: 11,
	DoAction: 12,
	DefineFontInfo: 13,
	DefineSound: 14,
	StartSound: 15,
	StopSound: 16, // Undocumented
	DefineButtonSound: 17,
	SoundStreamHead: 18,
	SoundStreamBlock: 19,
	
	DefineBitsLossless: 20,
	DefineBitsJPEG2: 21,
	DefineShape2: 22,
	DefineButtonCxform: 23,
	Protect: 24,
	PathsArePostscript: 25, // Undocumented
	PlaceObject2: 26,
	UNKNOWN_27: 27, // Undocumented
	RemoveObject2: 28,
	SyncFrame: 29, // Undocumented
	
	UNKNOWN_30: 30, // Undocumented
	FreeAll: 31, // Undocumented
	DefineShape3: 32,
	DefineText2: 33,
	DefineButton2: 34,
	DefineBitsJPEG3: 35,
	DefineBitsLossless2: 36,
	DefineEditText: 37,
	DefineVideo: 38, // Undocumented
	DefineSprite: 39,
	
	NameCharacter: 40, // Undocumented
	ProductInfo: 41, // Undocumented
	DefineTextFormat: 42, // Undocumented
	FrameLabel: 43,
	DefineBehavior: 44, // Undocumented
	SoundStreamHead2: 45,
	DefineMorphShape: 46,
	GenerateFrame: 47, // Undocumented
	DefineFont2: 48,
	GeneratorCommand: 49, // Undocumented
	
	DefineCommandObject: 50, // Undocumented
	CharacterSet: 51, // Undocumented
	ExternalFont: 52, // Undocumented
	DefineFunction: 53, // Undocumented
	PlaceFunction: 54, // Undocumented
	GeneratorTagObject: 55, // Undocumented
	ExportAssets: 56,
	ImportAssets: 57,
	EnableDebugger: 58,
	DoInitAction: 59,
	
	DefineVideoStream: 60,
	VideoFrame: 61,
	DefineFontInfo2: 62,
	DebugID: 63, // Undocumented
	EnableDebugger2: 64,
	ScriptLimits: 65,
	SetTabIndex: 66,
	DefineShape4_: 67, // Undocumented
	DefineMorphShape2_: 68, // Undocumented
	FileAttributes: 69,
	
	PlaceObject3: 70,
	ImportAssets2: 71,
	DoABCDefine: 72,
	DefineFontAlignZones: 73,
	CSMTextSettings: 74,
	DefineFont3: 75,
	SymbolClass: 76,
	Metadata: 77,
	DefineScalingGrid: 78,
	UNKNOWN_79: 79, // Undocumented
	
	UNKNOWN_80: 80, // Undocumented
	UNKNOWN_81: 81, // Undocumented
	DoABC: 82,
	DefineShape4: 83,
	DefineMorphShape2: 84,
	UNKNOWN_85: 85, // Undocumented
	DefineSceneAndFrameLabelData: 86,
	DefineBinaryData: 87,
	DefineFontName: 88,
	StartSound2: 89,
	
	DefineBitsJPEG4: 90,
	DefineFont4: 91,
	
	AmayetaSWFEncrypt: 253,
	AmayetaSWFEncrypt6: 255,
	ObfuEncryption: 264,
	SWFProtector3: 1002,
	AmayetaSWFCompress1: 1022
};