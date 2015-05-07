FBL.ns(function() { with (FBL) {
    
Components.utils.import("resource://flashfirebuglibs/prepare.js");

	
// Constants
const panelName = "flashDecompilerTree";
const panelTitle = "SWFs";
//const parentPanelName = "flashDecompiler";
const parentPanelName = "flashfirebug";

var $FL_STR = Flashbug.$FL_STR,
$FL_STRF = Flashbug.$FL_STRF;

Flashbug.DecompileTreeModule = extend(Firebug.Module, {
	
	trace:function(msg, obj) {
		msg = "DecompileTreeModule::" + msg;
		if (FBTrace.DBG_FLASH_DECOMPILER) {
			if (typeof FBTrace.sysout == "undefined") {
				Flashbug.alert(msg + " | " + obj);
			} else {
				FBTrace.sysout(msg, obj);
			}
		}
	},
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	// Extends Module
	
	dispatchName: panelName,
	panelBar2:{},
	
	initializeUI:function(){
		//TODO:侦听切换侧面板事件
		this.panelBar2 = $("fbPanelBar2");
		this.trace("initializeUI", this.panelBar2);
		// this.panelBar2.addEventListener("selectPanel", this.onSelectedSidePanel, false);
		
	},
	
	showPanel: function(browser, panel) {
//		var isPanel = panel && panel.name == panelName;
//		if (isPanel) {
//			this.trace("showPanel");
//			// Append CSS
//			var doc = panel.document;
//			if ($("flashbugStyles", doc)) {
//				// Don't append the stylesheet twice. 
//			} else {
//				var styleSheet = createStyleSheet(doc, "chrome://flashbug/skin/flashbug.css");
//				styleSheet.setAttribute("id", "flashbugStyles");
//				addStyleSheet(doc, styleSheet);
//			}
//		}
	},
	setAClass: function(node, className, swfTitle) {
		if (swfTitle == undefined) swfTitle = false;
		function isSWFTitle(node) {
			if (node.localName == 'a' && node.parentNode.getAttribute('rel')) return true;
			return false;
		};
		
		var nodeList = node.ownerDocument.getElementsByClassName(className),
			i = nodeList.length;
		while(i--) {
			if (isSWFTitle(nodeList[i]) == swfTitle) removeClass(nodeList[i], className);
		}
		if (isSWFTitle(node) == swfTitle) setClass(node, className);
	}
});

Flashbug.DecompileModule.Tree = domplate(Firebug.Rep, {
    tag:
        UL({'class':'flash-dec-tree'},
			FOR("file", "$swfs",
				LI({'class':'isSWF hasChildren', _file:'$file'},
					IMG({"class": "flash-dec-twisty"}),
					A({href:'#', title:'$file|getURI', 'class':'swf'}, '$file|getName'),
					UL({'class':'tree'})
				)
			)
		),
		
	leafTag:
		LI({'class':'isSWF hasChildren', _file:'$file'},
			IMG({"class": "flash-dec-twisty"}),
			A({href:'#', title:'$file|getURI', 'class':'swf'}, '$file|getName'),
			UL({'class':'tree'})
		),
		
	getURI: function(file) {
		if (file.URI) return file.URI.asciiSpec;
		return file.href;
	},
	
	getName: function(file) {
		return unescape(this.getURI(file).split('/').pop()) + ' (' + formatSize(file.contentLength) + ')';
	}
});

Flashbug.DecompileModule.Loading = domplate(Firebug.Rep, {
	tag:
		DIV({"class": "flb-dec-loading"})
});

Flashbug.DecompileModule.Error = domplate(Firebug.Rep, {
	tag:
		LI({'class':'Error'},
			IMG({"class": "twisty2"}),
			A({href:'#', title:'$message', 'class':'Error'}, '$message'),
			UL({'class':'tree'})
		)
});

Flashbug.DecompileModule.SubTree = domplate(Firebug.Rep, {
	tag:
		LI({'class':'$title.type hasChildren'},
			IMG({"class": "flash-dec-twisty"}),
			A({href:'#', title:'$title.name', 'class':'$title.type'}, '$title.name'),
			UL({'class':'flash-dec-tree'},
				FOR("item", "$array",
					TAG('$item|getLeafTag', {item: '$item'})
				)
			)
		),
		
	frameTag:
		LI({'class':'MovieClip hasChildren'},
			IMG({"class": "flash-dec-twisty"}),
			A({href:'#', title:'$title.name', 'class':'$title.type'}, '$title.name'),
			UL({'class':'flash-dec-tree'},
				FOR("item", "$array",
					LI({'class':'MovieClip hasChildren'},
						IMG({"class": "twisty2"}),
						A({href:'#', title:'$item.name', 'class':'MovieClip action', _repObject:'$item.data'}, '$item.name'),
						UL({'class':'tree'},
							FOR("frame", "$item.data.value",
								LI({'class':'Action hasChildren'},
									A({href:'#', title:'$frame|getFrameLabel', 'class':'Frame', _repObject:'$frame'}, '$frame|getFrameLabel')
								)
							)
						)
					)
				)
			)
		),
		
	buttonTag:
		LI({'class':'SimpleButton hasChildren'},
			IMG({"class": "flash-dec-twisty"}),
			A({href:'#', title:'$title.name', 'class':'$title.type'}, '$title.name'),
			UL({'class':'flash-dec-tree'},
				FOR("item", "$array",
					LI({'class':'SimpleButton hasChildren'},
						IMG({"class": "flash-dec-twisty"}),
						A({href:'#', title:'$item.name', 'class':'SimpleButton action', _repObject:'$item.data'}, '$item.name'),
						UL({'class':'tree'},
							FOR("frame", "$item.data.value",
								LI({'class':'Action hasChildren'},
									A({href:'#', title:'$frame|getFrameLabel', 'class':'Frame', _repObject:'$frame'}, '$frame|getFrameLabel')
								)
							)
						)
					)
				)
			)
		),
	
	leafTag:
		LI({'class':'isSWF MovieClip hasChildren', _file:'$item.data.value.data'},
			IMG({"class": "twisty2"}),
			A({href:'#', title:'$item.name', 'class':'$item.type swf'}, '$item.name'),
			UL({'class':'tree'})
		),
		
	nodeTag:
		LI({},
			IMG({"class": "twisty2"}),
			A({href:'#', title:'$item.name', 'class':'$item.type', $isSpecial:'$item|isSpecial', _repObject:'$item.data'}, '$item.name')
		),
		
	isSpecial: function(item) {
		// defineBitsJPEG4
		if (item.data.value.header.name == 'DefineBitsJPEG4') return true;
		// defineBitsLossless 15-bit RGB image
		if (item.data.value.header.name == 'DefineBitsLossless' && item.data.value.format == 4) return true;
		// soundStreamHead2 Uncompressed, native-endian
		if (item.data.value.header.name == 'SoundStreamHead2' && item.data.value.streamSoundCompression == 0) return true;
		// soundStreamHead2 Speex
		if (item.data.value.header.name == 'SoundStreamHead2' && item.data.value.streamSoundCompression == 11) return true;
		// defineVideoStream Screen Video V2
		if (item.data.value.header.name == 'DefineVideoStream' && item.data.value.codecID == 6) return true;
		// defineVideoStream H.264
		if (item.data.value.header.name == 'DefineVideoStream' && item.data.value.codecID == 7) return true;
		
		return false;
	},
		
	getLeafTag: function(item) {
		if (item.data.value.isSWF) return this.leafTag;
		return this.nodeTag;
	},
		
	getFrameLabel: function(frame) {
		var lbl = 'Frame ' + frame.frame;
		if (frame.hasOwnProperty('label') && frame.label.length) lbl += ' (' + frame.label + ')';
		return lbl;
	}
});

function DecompileTreePanel(){}
DecompileTreePanel.prototype = extend(Firebug.Panel, {

	trace:function(msg, obj) {
		msg = "DecompileTreePanel::" + msg;
		if (FBTrace.DBG_FLASH_DECOMPILER) {
			if (typeof FBTrace.sysout == "undefined") {
				Flashbug.alert(msg + " | " + obj);
			} else {
				FBTrace.sysout(msg, obj);
			}
		}
	},
	
	//////////////////////////////////////////////////////////////////////////////////////////////
	// Shared Objects Panel                                                                     //
	//////////////////////////////////////////////////////////////////////////////////////////////
	
	////////////////////////////
	// Firebug Panel Override //
	////////////////////////////
	
	name: panelName,
	title: panelTitle,
    parentPanel:parentPanelName,
	order:23,
	proMsgNode:{},
	
	initialize: function(context, doc) {
		this.onClick = bind(this.onClick, this);
        this.onMouseDown = bind(this.onMouseDown, this);
		
		Firebug.ActivablePanel.initialize.apply(this, arguments);
	},
	
	initializeNode: function(oldPanelNode) {
		this.panelNode.addEventListener("click", this.onClick, false);
        this.panelNode.addEventListener("mousedown", this.onMouseDown, false);
	},

	destroyNode: function() {
		this.panelNode.removeEventListener("click", this.onClick, false);
        this.panelNode.removeEventListener("mousedown", this.onMouseDown, false);
	},
	
	show: function(state) {
		// Append CSS
		var doc = this.document;
		if ($("flashbugStyles", doc)) {
			// Don't append the stylesheet twice. 
		} else {
			var styleSheet = createStyleSheet(doc, "chrome://flashbug/skin/flashbug.css");
			styleSheet.setAttribute("id", "flashbugStyles");
			addStyleSheet(doc, styleSheet);
		}
		
		if (this.context.loaded && !this.location) { // wait for loadedContext to restore the panel
			// Append CSS
			var doc = this.panelNode.ownerDocument;
			if ($("flashbugFlashStyles", doc)) {
				// Don't append the stylesheet twice. 
			} else {
				var styleSheet = createStyleSheet(doc, "chrome://flashbug/skin/inspector.css");
				styleSheet.setAttribute("id", "flashbugFlashStyles");
				addStyleSheet(doc, styleSheet);
			}
		}
		
		// pro version layout
                if (!flashfirebugPrepare.isPro){
                  if(!this.proMsgNode || !this.proMsgNode.parentNode){
                    this.proMsgNode = Firebug.FlashModuleConsole.NeedProRep.tag.append({}, this.panelNode, Firebug.FlashModuleConsole.NeedProRep.tag);
                  }
                }
	},
	
	getContextMenuItems: function(style, target, context) {
		var items = [];
		if(target.className == "swf ") {
			var url = target.title;
			items.push({label: $FL_STR("flashbug.contextMenu.copyLocation"), nol10n: true, command: bindFixed(copyToClipboard, FBL, url) });
			items.push({label: $FL_STR("flashbug.contextMenu.openTab"), nol10n: true, command: bindFixed(openNewTab, FBL, url) });
		} else {
			items.push({label: $FL_STR("flashbug.contextMenu.copy"), nol10n: true, command: bindFixed(copyToClipboard, FBL, target.textContent) });
		}

        return items;
    },
	
	////////////////////
	// Flash Specific //
	////////////////////
	
	refresh: function(swfs) {
		this.trace("refresh", swfs);
		var arr = [];
		for (var url in swfs) {
			arr.push(swfs[url]);
		}

		// pro version layout
    	Flashbug.DecompileModule.Tree.tag.replace({swfs:arr}, this.panelNode, Flashbug.DecompileModule.Tree);
        if (!flashfirebugPrepare.isPro){
        	this.proMsgNode = Firebug.FlashModuleConsole.NeedProRep.tag.append({}, this.panelNode, Firebug.FlashModuleConsole.NeedProRep.tag);
        }
	},
	
	append: function(swf) {
		this.trace("append ", swf);
		if (this.panelNode.textContent == '') {
			Flashbug.DecompileModule.Tree.tag.replace({swfs:[swf]}, this.panelNode, Flashbug.DecompileModule.Tree);
			if (!flashfirebugPrepare.isPro){
				this.proMsgNode = Firebug.FlashModuleConsole.NeedProRep.tag.append({}, this.panelNode, Firebug.FlashModuleConsole.NeedProRep.tag);
			}
		} else {
			Flashbug.DecompileModule.Tree.leafTag.append({file:swf}, this.panelNode.firstChild, Flashbug.DecompileModule.Tree);
			if (!flashfirebugPrepare.isPro){
				if(this.proMsgNode && this.proMsgNode.parentNode)this.panelNode.removeChild(this.proMsgNode);
				this.proMsgNode = Firebug.FlashModuleConsole.NeedProRep.tag.append({}, this.panelNode, Firebug.FlashModuleConsole.NeedProRep.tag);
			}
		}
	},
	
	processData: function(obj) {
		function getSymbolName(obj, id, label) {
			var asset = obj.dictionary[id],
				exportName = (asset && asset.hasOwnProperty('exportName')) ? asset.exportName : null;
			if (exportName) {
				exportName = exportName.substring(exportName.lastIndexOf('.') + 1);
				//exportName = exportName.substring(exportName.lastIndexOf('_') + 1); // Some export names use _ in the name
				return exportName;
			} else {
				return label + ' ' + id;
			}
		}
		var arr = [], arrHeader = [], arrMetadata = [];
		if (obj.hasOwnProperty('error') && obj.error == 'swf') {
			arrHeader.push({name:$FL_STR('flashbug.netInfoSWF.colError.title'), value:[$FL_STR('flashbug.netInfoSWF.error.SWF')]});
			arr.push({name:'Header', value:arrHeader});
			return arr;
		}
		
		arrHeader.push({name:'Compressed', value:(obj.header.signature == "CWS")});
		arrHeader.push({name:'SWF Version', value:obj.header.version});
		arrHeader.push({name:'File Size', value:obj.header.fileLength});
		if(obj.hasOwnProperty('fileLengthCompressed')) arrHeader.push({name:'File Size (Compressed)', value:obj.header.fileLengthCompressed});
		
		var f = obj.header.frameSize;
		arrHeader.push({name:'Frame Width', value:(f.right - f.left) / 20});
		arrHeader.push({name:'Frame Height', value:(f.bottom - f.top) / 20});
		arrHeader.push({name:'Frame Rate', value:obj.header.frameRate});
		arrHeader.push({name:'Frame Count', value:obj.header.frameCount});
		arr.push({name:'Header', value:arrHeader});
		
		var hasAttr = obj.hasOwnProperty('attributes');
		if(hasAttr && obj.attributes.hasOwnProperty('useDirectBlit')) arrMetadata.push({name:'Use Direct Blit', value:obj.attributes.useDirectBlit});
		if(hasAttr && obj.attributes.hasOwnProperty('useGPU')) arrMetadata.push({name:'Use GPU', value:obj.attributes.useGPU});
		if(hasAttr && obj.attributes.hasOwnProperty('actionscript3')) arrMetadata.push({name:'AS3', value:obj.attributes.actionscript3});
		if(hasAttr && obj.attributes.hasOwnProperty('useNetwork')) arrMetadata.push({name:'Use Network', value:obj.attributes.useNetwork});
		
		if(obj.hasOwnProperty('backgroundColor')) {
			arrMetadata.push({name:'Background Color', value:obj.backgroundColor});
		} else {
			arrMetadata.push({name:'Background Color', value:{red:255, green:255, blue:255}});
		}
		
		if(obj.hasOwnProperty('debugPassword')) {
			arrMetadata.push({name:'Protected', value:obj.debugPassword || 'true'});
		} else {
			arrMetadata.push({name:'Protected', value:'false'});
		}
		
		if(obj.hasOwnProperty('maxRecursionDepth')) {
			arrMetadata.push({name:'Max Recursion Depth', value:obj.maxRecursionDepth});
		}
		
		if(obj.hasOwnProperty('scriptTimeoutSeconds')) {
			arrMetadata.push({name:'Script Timeout Seconds', value:obj.scriptTimeoutSeconds});
		}
		
		//if(obj.hasOwnProperty('jpegData') && obj.jpegData != '') arrMetadata.push({name:'JPEG Tables', value:obj.jpegData});
		
		if(obj.hasOwnProperty('productInfo')) {
			arrMetadata.push({name:'Created With', value: obj.productInfo.product + ' ' + obj.productInfo.sdk});
			if (obj.productInfo.hasOwnProperty('compileDate')) arrMetadata.push({name:'Compilation Date', value:obj.productInfo.compileDate});
		}
		
		if(obj.hasOwnProperty('metadata')) {
			var regex = /<xmp:creatortool>([^<]+)<\/xmp:creatortool>/i;
			var result = regex.exec(obj.metadata);
			
			var value = result ? result[1] : null;
			if (value) arrMetadata.push({name:'Created With', value:value});
			
			regex = /<xmp:modifydate>([^<]+)<\/xmp:modifydate>/i;
			result = regex.exec(obj.metadata);
			
			value = result ? result[1] : null;
			if (value) arrMetadata.push({name:'Compilation Date', value:new Date(value).toLocaleString()});
			
			arrMetadata.push({name:'XMP', value:obj.metadata});
		}
		arr.push({name:'Metadata', value:arrMetadata});
		
		//---------------------------------------------
		// Go through dictionary and identify assets
		var arrSnds = [], arrImgs = [], arrVid = [], arrBin = [],
		    arrShapes = [], arrShapes2 = [], arrTxt = [], arrFonts = [],
			l = obj.dictionary.length;
			
		// I don't think a timeline can have more than one stream, but let's assume it can
		for (var j = 0; j < obj.streams.length; j++) {
			if (obj.streams[j].data.length > 0) arrSnds.push({name:'Sound Stream ' + obj.streams[j].streamID, type:'StreamSound', value:obj.streams[j]});
		}
		
		for (var i = 0; i < l; i++) {
			var asset = obj.dictionary[i], name = '';
			
			// Typically, the first CharacterId is 1, the second CharacterId is 2, and so on. The number zero (0) is special and is considered a null character.
			if (i == 0 && !asset) continue;
			
			if (!asset) {
				// Possibly a custom generated swf? (i.e. youtube/google) where it has gaps in dictionary
				// Maybe to break decompilers....
				continue;
			}
			
			// For linked assets
			if (!asset.header) continue;
			
			switch(asset.header.type) {
				case 6  /*DefineBits*/ :
				case 21 /*DefineBitsJPEG2*/ :
				case 35 /*DefineBitsJPEG3*/ :
				case 90 /*DefineBitsJPEG4*/ :
				case 20 /*DefineBitsLossless*/ :
				case 36 /*DefineBitsLossless2*/ :
					name = getSymbolName(obj, asset.id, 'Image');
					arrImgs.push({name:name, type:'Bitmap', value:asset});
					break;
					
				case 39 /*DefineSprite*/ :
					// I don't think a sprite can have more than one stream, but let's assume it can
					for (var j = 0; j < asset.streams.length; j++) {
						if (asset.streams[j].data.length > 0) arrSnds.push({name:'Sound Stream ' + asset.streams[j].streamID, type:'StreamSound', value:asset.streams[j]});
					}
					break;
				case 18 /*SoundStreamHead*/ :
					if (asset.data.length > 0) arrSnds.push({name:'Sound Stream ' + asset.streamID, type:'StreamSound', value:asset});
					break;
				case 14 /*DefineSound*/ :
					name = getSymbolName(obj, asset.id, 'Sound');
					// Buttons sometimes have unused sound streams
					if (asset.data.length > 0) arrSnds.push({name:name, type:'Sound', value:asset});
					break;
					
				case 60 /*DefineVideoStream*/ :
					name = getSymbolName(obj, asset.id, 'Video');
					// Could be a placed video object on stage that plays a loaded FLV, skip those
					if (asset.data.length > 0) arrVid.push({name:name, type:'Video', value:asset});
					break;
					
				case 87 /*DefineBinaryData*/ :
					name = getSymbolName(obj, asset.id, 'Binary');
					if (asset.isPBJ) name = asset.metadata.name;
					var type = 'Binary';
					if (asset.isPBJ) type = 'PixelBender';
					if (asset.isXML) type = 'XML';
					if (asset.isGIF || asset.isPNG || asset.isJPEG) type = 'BinaryBitmap';
					arrBin.push({name:name, type:type, value:asset});
					break;
					
				case 46 /*DefineMorphShape*/ :
				case 84 /*DefineMorphShape2*/ :
					name = getSymbolName(obj, asset.id, 'Morph Shape');
					asset.startEdges.name = name + ' Start';
					asset.endEdges.name = name + ' End';
					arrShapes.push({name:name, type:'MorphShape', value:asset});
					break;
					
				case 2 /*DefineShape*/ :
				case 22 /*DefineShape2*/ :
				case 32 /*DefineShape3*/ :
				case 83 /*DefineShape4*/ :
					name = getSymbolName(obj, asset.id, 'Shape');
					arrShapes.push({name:name, type:'Shape', value:asset});
					break;
					
				case 11 /*DefineText*/ :
				case 33 /*DefineText2*/ :
				case 37 /*DefineEditText*/ :
					if (asset.fontID) asset.font = obj.dictionary[asset.fontID];
					if (!asset.textRecords) asset.textRecords = [];
					if (asset.initialText) asset.textRecords = [asset.initialText];
					if (!asset.colors) asset.colors = [];
					if (asset.textColor) asset.colors = [asset.textColor];
					if (asset.variableName) {
						name = asset.variableName;
					} else {
						if (asset.initialText) {
							name = 'Dynamic Text ' + asset.id;
						} else {
							name = 'Text ' + asset.id;
						}
					}
					
					// Don't display empty strings
					//if (txt.strings.length > 0 && txt.strings[0].length > 0) 
					arrTxt.push({name:name, type:'TextField', value:asset});
					break;
					
				case 10 /*DefineFont*/ :
				case 48 /*DefineFont2*/ :
				case 75 /*DefineFont3*/ :
				case 91 /*DefineFont4*/ :
					name = asset.hasOwnProperty('fontName') ? asset.fontName.fontName : asset.info.name;
					
					// Style
					var caption = [];
					if (asset.info.fontFlagsItalic) caption.push('Italic');
					if (asset.info.fontFlagsBold) caption.push('Bold');
					if (caption.length == 0) caption.push('Regular');
					var style = caption.join(', ');
					name += ' (' + style + ')';
					
					if (name) arrFonts.push({name:name, type:'Font', value:asset});
					break;
			}
		}
		
		if (arrSnds.length > 0) arr.push({name:'Sounds (' + arrSnds.length + ')', value:arrSnds});
		if (arrImgs.length > 0) arr.push({name:'Images (' + arrImgs.length + ')', value:arrImgs});
		if (arrVid.length > 0) arr.push({name:'Videos (' + arrVid.length + ')', value:arrVid});
		if (arrBin.length > 0) arr.push({name:'Binary (' + arrBin.length + ')', value:arrBin});
		if (arrShapes.length > 0) arr.push({name:'Shapes (' + arrShapes.length + ')', value:arrShapes});
		if (arrShapes2.length > 0) arr.push({name:'Morph Shapes (' + arrShapes2.length + ')', value:arrShapes2});
		if (arrTxt.length > 0) arr.push({name:'Text (' + arrTxt.length + ')', value:arrTxt});
		if (arrFonts.length > 0) arr.push({name:'Fonts (' + arrFonts.length + ')', value:arrFonts});
		//---------------------------------------------
		/*
		var arrActions = [], arrButtons = [];
		
		// Timeline
		if(obj.hasOwnProperty('stage')) {
			var arrFrames = [];
			for(var i = 0; i <= obj.stage.length; i++) {
				var frame = obj.stage[i];
				if (frame) {
					var as = [], actions = [];
					for (var i3 = 0; i3 < frame.actions.length; i3++) {
						actions = actions.concat(frame.actions[i3].actions);
						if (frame.actions.length > 1) as.push('', '\\\\ Action segment ' + (i3 + 1));
						as = as.concat(frame.actions[i3].actionscript);
					}
					
					if (as.length) {
						var o = {type:'ActionScript', frame:(i + 1), actions:actions, actionscript:as};
						if (frame.label) o.label = frame.label;
						arrFrames.push(o);
					}
				}
			}
			
			if (arrFrames.length > 0) arrActions.push({name:'Main Timeline', type:'Actions', value:arrFrames});
		}
		
		if(obj.hasOwnProperty('dictionary')) {
			var l = obj.dictionary.length;
			for(var i = 0; i < l; i++) {
				var asset = obj.dictionary[i];
				
				// Exported Sprites
				if (asset && asset.header && asset.header.name == 'DefineSprite' && asset.stage.length > 0) {
					var l2 = asset.stage.length;
					var arrFrames = [];
					for(var i2 = 0; i2 <= l2; i2++) {
						var frame = asset.stage[i2];
						if (frame) {
							var as = [], actions = [];
							for (var i3 = 0; i3 < frame.actions.length; i3++) {
								if (i3 == 0 && asset.hasOwnProperty('initAction')) {
									actions = actions.concat(asset.initAction.actions);
									as.push('\\\\ Initial Action Segment ' + (i3 + 1));
									as = as.concat(asset.initAction.actionscript);
								}
								
								if (frame.actions[i3].actions) {
									actions = actions.concat(frame.actions[i3].actions);
									if (frame.actions.length > 1) as.push('', '\\\\ Action Segment ' + (i3 + 1));
									as = as.concat(frame.actions[i3].actionscript);
								}
							}
							
							if (as.length) {
								var o = {type:'ActionScript', frame:(i2+1), actions:actions, actionscript:as};
								if (frame.label) o.label = frame.label;
								arrFrames.push(o);
							}
						}
					}
					
					if (arrFrames.length == 0 && asset.hasOwnProperty('initAction')) {
						var as = [], actions = [];
						actions = actions.concat(asset.initAction.actions);
						as.push('\\\\ Initial Action Segment 1');
						as = as.concat(asset.initAction.actionscript);
						
						var o = {type:'ActionScript', frame:1, actions:actions, actionscript:as};
						arrFrames.push(o);
					}
					
					if (arrFrames.length > 0) arrActions.push({name:'Sprite ' + asset.id + (asset.exportName ? ' (' + asset.exportName + ')' : ''), type:'Actions', value:arrFrames});
				}
				
				// Buttons
				if (asset && asset.header && asset.header.name == 'DefineButton2' && asset.actions.length > 0) {
					var l2 = asset.actions.length, arrFrames = [], as = [], actions = [];
					for(var i2 = 0; i2 < l2; i2++) {
						var frame = asset.actions[i2];
						if (frame) {
							actions = actions.concat(frame.actions);
							as = as.concat(frame.actionscript);
						}
					}
					var o = {type:'ActionScript', frame:1, actions:actions, actionscript:as};
					arrFrames.push(o);
					if (arrFrames.length > 0) arrButtons.push({name:'Button ' + asset.id + (asset.exportName ? ' (' + asset.exportName + ')' : ''), type:'Actions', value:arrFrames});
				}
			}
		}
		
		if (arrActions.length > 0) arr.push({name:'Actions (' + arrActions.length + ')', value:arrActions});
		if (arrButtons.length > 0) arr.push({name:'Buttons (' + arrButtons.length + ')', value:arrButtons});
		*/
		// Sort results alphabetically
		arr.sort(function(a, b){
			var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
			//sort string ascending
			if (nameA < nameB) return -1;
			if (nameA > nameB) return 1;
			return 0 //default return value (no sorting)
		});
		
		return arr;
	},
	
	onClick: function(event) {
		if (!isLeftClick(event)) return;
		
        if (event.detail == 2) {
            // The double-click (detail == 2) expands an HTML element, but the user must click
            // on the element itself not on the twisty.
            // The logic should be as follow:
            // - click on the twisty expands/collapses the element
            // - double click on the element name expands/collapses it
            // - click on the element name selects it
			var target = event.target;
            if (!hasClass(target, "flash-dec-twisty") && target.localName == 'a') {
				 toggleClass(target.parentNode, 'opened');
			}
        }
    },

    onMouseDown: function(event) {
        if (!isLeftClick(event)) return;
		
		var target = event.target;
		if (hasClass(target.parentNode, 'isSWF')) {
			var loading = target.parentNode.querySelector("div.flb-dec-loading");
			if (target.parentNode.swf || loading) {
				// continue;
			} else {
				// decompile swf
				Flashbug.DecompileModule.Loading.tag.insertBefore({}, target.parentNode.lastChild, Flashbug.DecompileModule.Loading);
				
				var t = this;
				try {
					var worker = new Worker('chrome://flashbug/content/swf/swfWorker.js');
					worker.onmessage = function(event) {
						if (event.data && event.data.hasOwnProperty('type')) {
							if (event.data.type == 'debug') {
								if (event.data.data) {
									t.trace('Worker trace - ' + event.data.title, event.data.data);
								} else {
									var arr = event.data.message,
									title = arr.shift();
									t.trace('Worker trace - ' + title, arr);
								}
							} else if (event.data.type == 'progress') {
								t.displayProgress(target, event.data.percent);
							}
						} else {
							t.trace('Worker message data', event.data);
							target.parentNode.swf = t.processData(event.data);
							t.trace('Worker message', target.parentNode.swf);
							
							// Generate UI using Domplate template
							t.displayData(target);
						}
					};
					worker.onerror = function(error) {
						t.trace('Worker error', error);
						target.parentNode.swf = 'error';
						t.displayError(target, error);
					};
					
					// Returns raw bytes without UTF conversion done by Firebug
					if(target.parentNode.file && !(target.parentNode.file.URI || target.parentNode.file.href)) {
						// Embedded binary swf
						var responseText = target.parentNode.file;
					} else {
						// Actual page swf
						var responseText = getResource(Flashbug.DecompileModule.Tree.getURI(target.parentNode.file));
					}
					
					var config = {};
					config.headerOnly = Firebug.getPref(Firebug.prefDomain, 'flashbug.enableSWFHeaderOnly');
					config.font = config.headerOnly ? false : Firebug.getPref(Firebug.prefDomain, 'flashbug.enableSWFFont');
					config.binary = config.headerOnly ? false : Firebug.getPref(Firebug.prefDomain, 'flashbug.enableSWFBinary');
					config.video = config.headerOnly ? false : Firebug.getPref(Firebug.prefDomain, 'flashbug.enableSWFVideo');
					config.shape = config.headerOnly ? false : Firebug.getPref(Firebug.prefDomain, 'flashbug.enableSWFShape');
					config.morph = config.headerOnly ? false : Firebug.getPref(Firebug.prefDomain, 'flashbug.enableSWFMorph');
					config.image = config.headerOnly ? false : Firebug.getPref(Firebug.prefDomain, 'flashbug.enableSWFImage');
					config.sound = config.headerOnly ? false : Firebug.getPref(Firebug.prefDomain, 'flashbug.enableSWFSound');
					config.text = config.headerOnly ? false : Firebug.getPref(Firebug.prefDomain, 'flashbug.enableSWFText');
					
					worker.postMessage({text:responseText, config:config});
				} catch (e) {
					t.trace("error:::", e);
					target.parentNode.swf = 'error';
					t.displayError(target, e);
				}
				return;
			}
		}
		
		this.clickHandler(target);
    },
	
	setAClass: function(node, className, swfTitle) {
		if (swfTitle == undefined) swfTitle = false;
		function isSWFTitle(node) {
			if (node.localName == 'a' && node.parentNode.getAttribute('rel')) return true;
			return false;
		};
		
		var nodeList = node.ownerDocument.getElementsByClassName(className),
			i = nodeList.length;
		while(i--) {
			if (isSWFTitle(nodeList[i]) == swfTitle) Css.removeClass(nodeList[i], className);
		}
		if (isSWFTitle(node) == swfTitle) Css.setClass(node, className);
	},
	clickHandler:function(target) {
		this.trace("clickHandler, ", target);
		if (target.localName == 'a' && !hasClass(target, 'action')) {
			var isSWFTitle = false;
			if (target.parentNode.getAttribute('rel')) isSWFTitle = true;
			Flashbug.DecompileTreeModule.setAClass(target, 'selected', isSWFTitle);
			// selectobject
			
			if (!target.repObject) {
				ERROR('Item Data not found', target); // there was an error once where it couldn't find repObject
				return;
			}
			
			this.trace('Item Data', target.repObject);
			Flashbug.DecompileModule.showDetails(target.repObject);
		}
		
		if (hasClass(target, "flash-dec-twisty") || hasClass(target, "twisty2")) {
			// getleaftree
			toggleClass(target.parentNode, 'opened');
		}
	},
	
	displayError: function(target, error) {
		// Remove Loader
		var loader = target.parentNode.getElementsByTagName('div')[0];
		target.parentNode.removeChild(loader);
		
		var o = {message:'Error: ' + error.message + ' (' + error.filename + '@' + (error.lineno || error.lineNumber) + ')'};
		Flashbug.DecompileModule.Error.tag.append(o, target.parentNode.lastChild, Flashbug.DecompileModule.Error);
		
		this.clickHandler(target);
	},
	
	displayProgress: function(target, percent) {
		// Remove Loader
		var loader = target.parentNode.getElementsByTagName('div')[0];
                flashfirebugPrepare.replaceHTML(loader, percent);
	},
	
	displayData: function(target) {
		var swf = target.parentNode.swf;
		
		// Remove Loader
		var loader = target.parentNode.getElementsByTagName('div')[0];
		target.parentNode.removeChild(loader);
		
		var aNode = target.parentNode.getElementsByTagName('a')[0],
			arr = [];
		aNode.repObject = arr;
		
		for(var key in swf) {
			var obj = swf[key],
				o = {title:{name:obj.name, type:'Folder'}, array:[]};
				
			if (obj.name == 'Header' || obj.name == 'Metadata') {
				arr.push(obj);
				continue;
			}
			
			for (var i = 0, l = obj.value.length; i < l; i++) {
				var data = obj.value[i];
				o.array.push({name:data.name, type:data.type, data:data});
			}
			if (l > 0) o.hasChildren = true;
			
			if (obj.name.indexOf('Actions') == 0) {
				Flashbug.DecompileModule.SubTree.frameTag.append(o, target.parentNode.lastChild, Flashbug.DecompileModule.SubTree);
			} else if (obj.name.indexOf('Button') == 0) {
				Flashbug.DecompileModule.SubTree.buttonTag.append(o, target.parentNode.lastChild, Flashbug.DecompileModule.SubTree);
			} else {
				Flashbug.DecompileModule.SubTree.tag.append(o, target.parentNode.lastChild, Flashbug.DecompileModule.SubTree);
			}
		}
		
		this.clickHandler(target);
	},
	
	onActivatePro:function(data){
		var proNode = this.proMsgNode;
		if(proNode){
                  if (flashfirebugPrepare.isPro){
                    $FQuery("#pro-main", this.panelNode).remove();                        
                  }else{
                    Firebug.FlashModuleConsole.NeedProRep.tag.append({}, this.panelNode, Firebug.FlashModuleConsole.NeedProRep.tag);
                  }
		}
	}
});

//////////////////////////
// Firebug Registration //
//////////////////////////
Firebug.registerModule(Flashbug.DecompileTreeModule);
Firebug.registerPanel(DecompileTreePanel);

}});