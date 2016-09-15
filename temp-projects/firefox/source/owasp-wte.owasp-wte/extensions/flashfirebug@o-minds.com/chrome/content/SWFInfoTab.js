FBL.ns(function() { with (FBL) {

Components.utils.import("resource://flashfirebuglibs/prepare.js");

// Constants
const NS_SVG = "http://www.w3.org/2000/svg";
const NS_XLINK = "http://www.w3.org/1999/xlink";
const NS_XHTML = "http://www.w3.org/1999/xhtml";
const NS_SEEK_SET = Ci.nsISeekableStream.NS_SEEK_SET;
const SWF_MIME = "application/x-shockwave-flash";
const SPL_MIME = "application/x-futuresplash";

var $FL_STR = Flashbug.$FL_STR,
$FL_STRF = Flashbug.$FL_STRF;

function trace(msg, obj) {
	msg = "Flashbug - SWFTab::" + msg;
	if (FBTrace.DBG_FLASH_SWF_TAB) {
		if (typeof FBTrace.sysout == "undefined") {
			Flashbug.alert(msg + " | " + obj);
		} else {
			FBTrace.sysout(msg, obj);
		}
	}
}

Flashbug.SWFInfoModule = extend(Firebug.Module, {
	
	tabId: "SWF",
	childTabs: 0,
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	// Extends Module
	
	dispatchName: "SWFViewer",
	
    initialize: function() {
		trace("initialize");
		
		Firebug.Module.initialize.apply(this, arguments);
		
        Firebug.NetMonitor.NetInfoBody.addListener(this);
    },
	
    shutdown: function() {
		trace("shutdown");
		
		Firebug.Module.shutdown.apply(this, arguments);
		
		Firebug.NetMonitor.NetInfoBody.removeListener(this);
    },
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	// Extends NetInfoBody

    initTabBody: function(infoBox, file) {
		trace("initTabBody");
		if (this.isSWF(safeGetContentType(file.request)) && file.loaded) {
			Firebug.NetMonitor.NetInfoBody.appendTab(infoBox, this.tabId, $FL_STR("flashbug.netInfoSWF.title"));
		}
	},
	
    destroyTabBody: function(infoBox, file) {},
	
    updateTabBody: function(infoBox, file, context) {
		// Get currently selected tab.
		var tab = infoBox.selectedTab;
		var tabId = tab.getAttribute('view'); // this.tabId
		
		trace('updateTabBody ' + file.href + ' | ' + 'netInfo' + tabId + 'Tab', tab);
		
		// Generate content only for the first time; and only if our tab has been just activated.
		if (tabId.indexOf(this.tabId) != 0) return;
		if (tab.dataPresented || !hasClass(tab, 'netInfo' + tabId + 'Tab')) return;
		
		// Make sure the content is generated just once.
		tab.dataPresented = true;
		
		// Get body element associated with the tab.
		var tabBody = getElementByClass(infoBox, 'netInfo' + tabId + 'Text');
		var t = this;
		
		// Request
		if(!file['response' + tabId]) {
			// Add processing message
			Flashbug.SWFInfoModule.NetInfoSWF.loadingTag.replace({}, tabBody);
			
			try {
				var worker = new Worker('chrome://flashbug/content/lib/SWFWorker.js');
				worker.onmessage = function(event) {
					if (event.data.type == 'debug') {
						var arr = event.data.message,
							title = arr.shift();
						trace('Worker trace - ' + title, arr);
					} else {
						trace('Worker message data', event.data);
						file['response' + tabId] = t.processData(event.data);
						trace('Worker message', file['response' + tabId]);
						
						// Generate UI using Domplate template
						t.displayData(file['response' + tabId], tabBody, infoBox, file);
					}
				};
				worker.onerror = function(error) {
					trace('Worker error', error);
					Flashbug.SWFInfoModule.NetInfoSWF.messageTag.replace({ param:{name:$FL_STR('flashbug.netInfoSWF.colError.title'), value:$FL_STR('flashbug.netInfoSWF.error.deflate') + ' (' + error.message + ')'}}, tabBody);
				};
				
				// Returns raw bytes without UTF conversion done by Firebug
				if(tabId != this.tabId) {
					// Embedded binary swf
					var idx = tabId.replace(this.tabId, '');
					var responseText = file['responseText' + idx];
				} else {
					// Actual page swf
					var responseText = getResource(file.href);
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
				ERROR(e);
				Flashbug.SWFInfoModule.NetInfoSWF.messageTag.replace({ param:{name:$FL_STR('flashbug.netInfoSWF.colError.title'), value:$FL_STR('flashbug.netInfoSWF.error.deflate') + ' (' + e.message + ')'}}, tabBody);
			}
		} else {
			this.displayData(file['response' + tabId], tabBody, infoBox, file);
		}
	},
	
	isSWF: function(contentType) {
		trace(contentType + ' :: ' + SWF_MIME + '/' + SPL_MIME);
		if (!contentType) return false;
		if (contentType.indexOf(SWF_MIME) == 0 || contentType.indexOf(SPL_MIME) == 0) return true;
		return false;
	},
	
	displayData: function(data, tabBody, infoBox, file) {
		Flashbug.SWFInfoModule.NetInfoSWF.doc = tabBody.ownerDocument;
		
		// Copied from XMLViewer // 
		// Override getHidden in these templates. The parsed XML documen is
        // hidden, but we want to display it using 'visible' styling.
        var templates = [
            Firebug.HTMLPanel.CompleteElement,
            Firebug.HTMLPanel.Element,
            Firebug.HTMLPanel.TextElement,
            Firebug.HTMLPanel.EmptyElement,
            Firebug.HTMLPanel.XEmptyElement,
        ];
		
        var originals = [];
        for (var i = 0; i < templates.length; i++) {
            originals[i] = templates[i].getHidden;
            templates[i].getHidden = function() { return ""; }
        }
		//
		
		var l = data.length;
		for(var i = 0; i < l; i++) {
			var tag = Flashbug.SWFInfoModule.NetInfoSWF.getSectionTag(data[i]),
				o = {section:data[i], infoBox:infoBox, file:file};
			if (i == 0) {
				tag.replace(o, tabBody);
			} else {
				tag.append(o, tabBody);
			}
		}
		
		// Adjust thumbs
		// BUG: Needs to be broken out of the flow of the WebWorker result or else errors occur
		var timeout = CCIN('@mozilla.org/timer;1', 'nsITimer'),
			t = this;
		timeout.initWithCallback({ notify:function(timer) {
			t.processThumbs(tabBody, 'flb-swf-binary');
			t.processThumbs(tabBody, 'flb-swf-videos');
			t.processThumbs(tabBody, 'flb-swf-shapes');
			t.processThumbs(tabBody, 'flb-swf-morph-shapes');
			//t.processThumbs(tabBody, 'flb-swf-images');
			t.processThumbs(tabBody, 'flb-swf-sounds');
		} }, 100, Ci.nsITimer.TYPE_ONE_SHOT);
		
		// Copied from XMLViewer // 
		l = originals.length;
		for (var i = 0; i < l; i++) {
            templates[i].getHidden = originals[i];
		}
		//
		
		trace('Worker message html', tabBody);
	},
	
	processThumbs: function(tabBody, sectionClass) {
		var arrSection = tabBody.getElementsByClassName(sectionClass);
		
		// Make sure section exists
		if (!arrSection || arrSection.length < 1) return;
		
		var arrNodes = arrSection[0].childNodes,
			i = arrNodes.length,
			tallest = 0;
		while (i--) {
			if (sectionClass == 'flb-swf-images') {
				if (tallest < arrNodes[i].origHeight) tallest = arrNodes[i].origHeight;
			} else {
				if (tallest < arrNodes[i].offsetHeight) tallest = arrNodes[i].offsetHeight;
			}
			if (sectionClass == 'flb-swf-sounds') {
				var audNode = arrNodes[i].getElementsByClassName('flb-swf-sound-control');
				
				// Try to trigger redraw to move up the audio controls
				if (audNode && audNode.length > 1) {
					audNode = audNode[0];
					audNode.style.overflow = 'hidden';
					audNode.style.overflow = 'visible';
					audNode.style.overflow = 'hidden';
				}
				//
			}
		}
		
		i = arrNodes.length;
		while (i--) {
			arrNodes[i].style.height = tallest + 'px';
		}
	},
	
	processData: function(obj) {
		var arr = [], arrHeader = [], arrMetadata = [];
		if(obj.error == 'swf') {
			arrHeader.push({name:$FL_STR('flashbug.netInfoSWF.colError.title'), value:[$FL_STR('flashbug.netInfoSWF.error.SWF')]});
			arr.push({name:'Header', value:arrHeader});
			return arr;
		}
		
		arrHeader.push({name:'Compressed', value:obj.isCompressed});
		arrHeader.push({name:'SWF Version', value:obj.version});
		arrHeader.push({name:'File Size', value:obj.fileLength});
		if(obj.hasOwnProperty('fileLengthCompressed')) arrHeader.push({name:'File Size (Compressed)', value:obj.fileLengthCompressed});
		
		var f = obj.frameSize;
		arrHeader.push({name:'Frame Width', value:(f.right - f.left) / 20});
		arrHeader.push({name:'Frame Height', value:(f.bottom - f.top) / 20});
		arrHeader.push({name:'Frame Rate', value:obj.frameRate});
		arrHeader.push({name:'Frame Count', value:obj.frameCount});
		arr.push({name:'Header', value:arrHeader});
		
		if(obj.hasOwnProperty('useDirectBlit')) arrMetadata.push({name:'Use Direct Blit', value:obj.useDirectBlit});
		if(obj.hasOwnProperty('useGPU')) arrMetadata.push({name:'Use GPU', value:obj.useGPU});
		if(obj.hasOwnProperty('actionscript3')) arrMetadata.push({name:'AS3', value:obj.actionscript3});
		if(obj.hasOwnProperty('useNetwork')) arrMetadata.push({name:'Use Network', value:obj.useNetwork});
		
		if(obj.hasOwnProperty('backgroundColor')) {
			arrMetadata.push({name:'Background Color', value:obj.backgroundColor});
		} else {
			arrMetadata.push({name:'Background Color', value:{red:255, green:255, blue:255}});
		}
		
		if(obj.hasOwnProperty('isProtected')) {
			arrMetadata.push({name:'Protected', value:obj.password || 'true'});
		} else {
			arrMetadata.push({name:'Protected', value:'false'});
		}
		
		//if(obj.hasOwnProperty('jpegTables') && obj.jpegTables != '') arrMetadata.push({name:'JPEG Tables', value:obj.jpegTables});
		
		if(obj.hasOwnProperty('productInfo')) {
			arrMetadata.push({name:'Created With', value: 'Adobe Flex ' + obj.productInfo.sdk});
			if (obj.productInfo.hasOwnProperty('compileTimeStamp')) arrMetadata.push({name:'Compilation Date', value:obj.productInfo.compileTimeStamp});
		}
		
		if(obj.hasOwnProperty('metadata')) {
			var regex = /<xmp:creatortool>([^<]+)<\/xmp:creatortool>/i;
			var result = regex.exec(obj.metadata);
			//trace('creator', result);
			var value = result ? result[1] : null;
			if (value) arrMetadata.push({name:'Created With', value:value});
			
			regex = /<xmp:modifydate>([^<]+)<\/xmp:modifydate>/i;
			result = regex.exec(obj.metadata);
			//trace('modify', result);
			value = result ? result[1] : null;
			if (value) arrMetadata.push({name:'Compilation Date', value:new Date(value).toLocaleString()});
			
			arrMetadata.push({name:'XMP', value:obj.metadata});
		}
		arr.push({name:'Metadata', value:arrMetadata});
		
		if(obj.hasOwnProperty('fonts')) {
			var l = obj.fonts.length;
			var arrFonts = [];
			for(var i = 0; i < l; i++) {
				var font = obj.fonts[i];
				if (!font.info.copyright) font.info.copyright = '';
				if (font.info.hasOwnProperty('name')) {
					// Remove UTF-8 encoding error
					var lastChar = font.info.name.substring(font.info.name.length - 1);
					font.info.name = lastChar.charCodeAt(0) == 0 ? font.info.name.substring(0, font.info.name.length - 1) : font.info.name;
					
					arrFonts.push({name:font.info.name, value:font});
				}
			}
			
			arr.push({name:'Fonts', value:arrFonts});
		}
		
		function getSymbolName(obj, id, label) {
			var obj = obj.dictionary[id],
				exportName = obj ? obj.exportName : null;
			if (exportName) {
				exportName = exportName.substring(exportName.lastIndexOf('.') + 1);
				exportName = exportName.substring(exportName.lastIndexOf('_') + 1);
				return exportName;
			} else {
				return label + ' ' + id;
			}
		}
		
		if(obj.hasOwnProperty('binary')) {
			var l = obj.binary.length;
			var arrBin = [];
			for(var i = 0; i < l; i++) {
				var bin = obj.binary[i];
				bin.name = getSymbolName(obj, bin.id, 'Binary');
				if (bin.isPBJ) bin.name = bin.pbName;
				
				arrBin.push({name:bin.name, value:bin});
			}
			
			arr.push({name:'Binary', value:arrBin});
		}
		
		if(obj.hasOwnProperty('videos')) {
			var l = obj.videos.length;
			var arrVid = [];
			for(var i = 0; i < l; i++) {
				var vid = obj.videos[i];
				vid.name = getSymbolName(obj, vid.id, 'Video');
				
				// Could be a placed video object on stage that plays a loaded FLV, skip those
				if (vid.data.length > 0) arrVid.push({name:vid.name, value:vid});
			}
			
			if (arrVid.length > 0) arr.push({name:'Videos', value:arrVid});
		}
		
		if(obj.hasOwnProperty('shapes')) {
			var l = obj.shapes.length;
			var arrShapes = [];
			for(var i = 0; i < l; i++) {
				var shp = obj.shapes[i];
				shp.name = getSymbolName(obj, shp.id, 'Shape');
				arrShapes.push({name:shp.name, value:shp});
			}
			
			if (arrShapes.length > 0) arr.push({name:'Shapes', value:arrShapes});
		}
		
		if(obj.hasOwnProperty('morph_shapes')) {
			var l = obj.morph_shapes.length;
			var arrShapes = [];
			for(var i = 0; i < l; i++) {
				var shp = obj.morph_shapes[i];
				shp.name = getSymbolName(obj, shp.id, 'Morph Shape');
				shp.start.name = shp.name + ' Start';
				shp.end.name = shp.name + ' End';
				arrShapes.push({name:shp.name, value:shp});
			}
			
			if (arrShapes.length > 0) arr.push({name:'Morph Shapes', value:arrShapes});
		}
		
		if(obj.hasOwnProperty('images')) {
			var l = obj.images.length;
			var arrImgs = [];
			for(var i = 0; i < l; i++) {
				var img = obj.images[i];
				img.name = getSymbolName(obj, img.id, 'Image');
				arrImgs.push({name:img.name, value:img});
			}
			
			if (arrImgs.length > 0) arr.push({name:'Images', value:arrImgs});
		}
		
		if(obj.hasOwnProperty('sounds')) {
			var l = obj.sounds.length;
			var arrSnds = [];
			for(var i = 0; i < l; i++) {
				var snd = obj.sounds[i];
				
				if (snd.hasOwnProperty('streamID')) {
					if (snd.data.length > 0) arrSnds.push({name:'Sound Stream ' + snd.streamID, value:snd});
				} else {
					snd.name = getSymbolName(obj, snd.id, 'Sound');
					// Buttons sometimes have unused sound streams
					if (snd.data.length > 0) arrSnds.push({name:snd.name, value:snd});
				}
			}
			
			if (arrSnds.length > 0) arr.push({name:'Sounds', value:arrSnds});
		}
		
		if(obj.hasOwnProperty('text')) {
			var l = obj.text.length;
			var arrTxt = [];
			for(var i = 0; i < l; i++) {
				var txt = obj.text[i];
				
				if (!txt.strings) txt.strings = [];
				if (txt.initialText) txt.strings = [txt.initialText];
				if (!txt.colors) txt.colors = [];
				if (txt.textColor) txt.colors = [txt.textColor];
				if (txt.variableName) {
					txt.name = txt.variableName;
				} else {
					if (txt.initialText) {
						txt.name = 'Dynamic Text ' + txt.id;
					} else {
						txt.name = 'Text ' + txt.id;
					}
				}
				
				// Don't display empty strings
				if (txt.strings.length > 0 && txt.strings[0].length > 0) arrTxt.push({name:txt.name, value:txt});
			}
			
			if (arrTxt.length > 0) arr.push({name:'Text', value:arrTxt});
		}
		
		return arr;
	}
});

// ************************************************************************************************

const SoundCompression = [
	'Raw, native-endian', /* SWF 1 */
	'ADPCM', /* SWF 1 */
	'MP3', /* SWF 4 */
	'Raw, little-endian', /* SWF 4 */
	'Nellymoser 16 kHz', /* SWF 10 */
	'Nellymoser 8 kHz', /* SWF 10 */
	'Nellymoser', /* SWF 6 */
	'',
	'',
	'',
	'',
	'Speex' /* SWF 10 */
];
const SoundRate = [
	'5.5 kHz',
	'11 kHz',
	'22 kHz',
	'44 kHz'
];
const SoundSize = [
	'8 Bit',
	'16 Bit'
];
const SoundType = [
	'Mono',
	'Stereo'
];
const VideoCompression = [
	'',
	'JPEG',
	'Sorenson Spark (H.263)',
	'Screen Video',
	'On2 Truemotion VP6',
	'On2 Truemotion VP6 with Alpha',
	'Screen Video v2',
	'AVC (H.264)'
];
const VideoDeblocking = [
	' using video packet value',
	'ing Off',
	'ing Level 1',
	'ing Level 2',
	'ing Level 3',
	'ing Level 4'
];

Flashbug.SWFInfoModule.NetInfoSWF = domplate(Firebug.Rep, {
	inspectable: false,
	
	ERROR: ERROR,
	trace: Flashbug.SWFInfoModule.trace,
	
	doc:null,
	
	sectionMetaTag:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup", onclick: '$onToggle'},
				IMG({"class": "flb-swf-twisty"}), 
				SPAN('$section.name')
			),
			TABLE({cellpadding: 0, cellspacing: 0},
				TBODY({"class": "netInfoResponseHeadersBody", "role": "list"},
					FOR('param', '$section.value',
						TR({'role': 'listitem'},
							TD({'class': 'netInfoParamName', 'role': 'presentation'},
								SPAN('$param|getParamName')
							),
							TD({'class': 'netInfoParamValue', 'role': 'list', 'aria-label': '$param.name'},
								TAG('$param|getValueTag', {object: '$param|getValue'})
							)
						)
					)
				)
			)
		),
		
	sectionFontTag:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup", onclick: '$onToggle'},
				IMG({"class": "flb-swf-twisty closed"}), 
				SPAN('$section.name ($section.value.length)')
			),
			TABLE({'class': 'flb-swf-hidden', cellpadding: 0, cellspacing: 0},
				TBODY({"class": "netInfoResponseHeadersBody", "role": "list"},
					FOR('param', '$section.value',
						TR({'role': 'listitem'},
							TD({'class': 'netInfoParamName', 'role': 'presentation'}),
							TD({"class": "flb-swf-font-row", "role": "list", "aria-label": "$param.name"},
								P({'class': 'flb-swf-font-box'}, '$param.name'),
								P({'class': 'flb-swf-font-box flb-swf-font-copy'}, '$param|getFontCaption'),
								P({'class': 'flb-swf-font-box flb-swf-font-copy'}, '$param.value.info.copyright'),
								DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export $param|hasData', onclick: '$onSave', _dataID: '$param|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoAMF.save'))
							)
						)
					)
				)
			)
		),
		
	sectionBinaryTag:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup", onclick: '$onToggle'},
				IMG({"class": "flb-swf-twisty closed"}), 
				SPAN('$section.name ($section.value.length)')
			),
			TABLE({'class': 'flb-swf-hidden', cellpadding: 0, cellspacing: 0},
				TBODY({"class": "netInfoResponseHeadersBody", "role": "list"},
					TR({'role': 'listitem'},
						TD({'class': 'netInfoParamName', 'role': 'presentation'}),
						TD({'class': 'netInfoParamValue', 'role': 'list'},
							DIV({'class': 'netInfoParamValue flb-swf-binary'},
								FOR('param', '$section.value',
									DIV({'class': 'flb-swf-thumb-box flb-swf-sound-box'},
										DIV({'class': 'flb-swf-thumb-caption'}, '$param|getFileName'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param|getFileSize'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export $param|hasData', onclick: '$onSave', _dataID: '$param|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoAMF.save')),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export $param|isBinarySWF', onclick: '$onDetail', _infoBox: '$infoBox', _file: '$file', _dataID: '$param|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoSWF.title'))
									)
								)
							)
						)
					)
				)
			)
		),
		
	sectionVideoTag:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup", onclick: '$onToggle'},
				IMG({"class": "flb-swf-twisty closed"}), 
				SPAN('$section.name ($section.value.length)')
			),
			TABLE({'class': 'flb-swf-hidden', cellpadding: 0, cellspacing: 0},
				TBODY({"class": "netInfoResponseHeadersBody", "role": "list"},
					TR({'role': 'listitem'},
						TD({'class': 'netInfoParamName', 'role': 'presentation'}),
						TD({'class': 'netInfoParamValue', 'role': 'list'},
							DIV({'class': 'netInfoParamValue flb-swf-videos'},
								FOR('param', '$section.value',
									DIV({'class': 'flb-swf-thumb-box flb-swf-sound-box', _title: 'defineVideoStream_$param.value.codecID'},
										DIV({'class': 'flb-swf-thumb-caption'}, '$param|getFileName'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param|getVideoCodec'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param|getVideoSmoothing'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param|getVideoDeblocking'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, $STRF('flashbug.netInfoSWF.dimensions', ['$param.value.width', '$param.value.height'])),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param|getFileSize'),
										TAG('$param|getUnsupportedTag', {param: '$param'}),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export $param|hasData', onclick: '$onSave', _dataID: '$param|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoAMF.save'))
									)
								)
							)
						)
					)
				)
			)
		),
		
	sectionShapeTag:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup", onclick: '$onToggle'},
				IMG({"class": "flb-swf-twisty closed"}), 
				SPAN('$section.name ($section.value.length)')
			),
			TABLE({'class': 'flb-swf-hidden', cellpadding: 0, cellspacing: 0},
				TBODY({"class": "netInfoResponseHeadersBody", "role": "list"},
					TR({'role': 'listitem'},
						TD({'class': 'netInfoParamName', 'role': 'presentation'}),
						TD({'class': 'netInfoParamValue', 'role': 'list'},
							DIV({'class': 'netInfoParamValue flb-swf-shapes'},
								FOR('param', '$section.value',
									DIV({'class': 'flb-swf-thumb-box', _title: '$param.value.tag'},
										DIV({'class': 'flb-swf-image-box', _innerHTML: '$param|getSVGTag'}),
										DIV({'class': 'flb-swf-thumb-caption'}, '$param|getFileName'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param|getFileSize'),
										TAG('$param|getUnsupportedTag', {param: '$param'}),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export $param|hasData', onclick: '$onSave', _dataID: '$param|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoAMF.save'))
									)
								)
							)
						)
					)
				)
			)
		),
		
	sectionMorphShapeTag:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup", onclick: '$onToggle'},
				IMG({"class": "flb-swf-twisty closed"}), 
				SPAN('$section.name ($section.value.length)')
			),
			TABLE({'class': 'flb-swf-hidden', cellpadding: 0, cellspacing: 0},
				TBODY({"class": "netInfoResponseHeadersBody", "role": "list"},
					TR({'role': 'listitem'},
						TD({'class': 'netInfoParamName', 'role': 'presentation'}),
						TD({'class': 'netInfoParamValue', 'role': 'list'},
							DIV({'class': 'netInfoParamValue flb-swf-morph-shapes'},
								FOR('param', '$section.value',
									DIV({'class': 'flb-swf-morph-box', _title: '$param.value.tag'},
										DIV({'class': 'flb-swf-thumb-box'},
											DIV({'class': 'flb-swf-image-box', _innerHTML: '$param.value.start|getSVGTag'}),
											DIV({'class': 'flb-swf-thumb-caption'}, '$param.value.start|getFileName'),
											DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}),
											DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param.value.start|getFileSize'),
											DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export $param.value.start|hasData', onclick: '$onSave', _dataID: '$param.value.start|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoAMF.save'))
										),
										DIV({'class': 'flb-swf-thumb-box'},
											DIV({'class': 'flb-swf-image-box', _innerHTML: '$param.value.end|getSVGTag'}),
											DIV({'class': 'flb-swf-thumb-caption'}, '$param.value.end|getFileName'),
											DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}),
											DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param.value.end|getFileSize'),
											DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export $param.value.end|hasData', onclick: '$onSave', _dataID: '$param.value.end|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoAMF.save'))
										)
									)
								)
							)
						)
					)
				)
			)
		),
		
	sectionImageTag:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup", onclick: '$onToggle'},
				IMG({"class": "flb-swf-twisty closed"}), 
				SPAN('$section.name ($section.value.length)')
			),
			TABLE({'class': 'flb-swf-hidden', cellpadding: 0, cellspacing: 0},
				TBODY({"class": "netInfoResponseHeadersBody", "role": "list"},
					TR({'role': 'listitem'},
						TD({'class': 'netInfoParamName', 'role': 'presentation'}),
						TD({'class': 'netInfoParamValue', 'role': 'list'},
							DIV({'class': 'netInfoParamValue flb-swf-images'},
								FOR('param', '$section.value',
									DIV({'class': 'flb-swf-thumb-box', _title: '$param.value.tag'},
										DIV({'class': 'flb-swf-image-box'},
											IMG({src: '$param|getValue', _param:'$param', onload: '$onLoadImage'})
										),
										DIV({'class': 'flb-swf-thumb-caption'}, '$param|getFileName'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param|getFileSize'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export $param|hasData', onclick: '$onSave', _dataID: '$param|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoAMF.save'))
									)
								)
							)
						)
					)
				)
			)
		),
		
	sectionSoundTag:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup", onclick: '$onToggle'},
				IMG({"class": "flb-swf-twisty closed"}), 
				SPAN('$section.name ($section.value.length)')
			),
			TABLE({'class': 'flb-swf-hidden', cellpadding: 0, cellspacing: 0},
				TBODY({"class": "netInfoResponseHeadersBody", "role": "list"},
					TR({'role': 'listitem'},
						TD({'class': 'netInfoParamName', 'role': 'presentation'}),
						TD({'class': 'netInfoParamValue', 'role': 'list'},
							DIV({'class': 'netInfoParamValue flb-swf-sounds'},
								FOR('param', '$section.value',
									DIV({'class': 'flb-swf-thumb-box flb-swf-sound-box', _title: 'defineSound_$param.value.soundFormat'},
										DIV({'class': 'flb-swf-thumb-caption'}, '$param|getFileName'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param|getSoundCaption'),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-font-copy'}, '$param|getFileSize'),
										TAG('$param|getUnsupportedTag', {param: '$param'}),
										TAG('$param|getAudioTag', {param: '$param'}),
										DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export', onclick: '$onSave', _dataID: '$param|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoAMF.save'))
									)
								)
							)
						)
					)
				)
			)
		),
		
	sectionTextTag:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup", onclick: '$onToggle'},
				IMG({"class": "flb-swf-twisty closed"}), 
				SPAN('$section.name ($section.value.length)')
			),
			TABLE({'class': 'flb-swf-hidden', cellpadding: 0, cellspacing: 0},
				TBODY({"class": "netInfoResponseHeadersBody", "role": "list"},
					FOR('param', '$section.value',
						TR({'role': 'listitem'},
							TD({'class': 'netInfoParamName', 'role': 'presentation'}),
							TD({"class": "flb-swf-font-row", "role": "list", "aria-label": "$param.name"},
								P({'class': 'flb-swf-font-box'}, '$param.name'),
								FOR('color', '$param.value.colors',
									DIV({}, 
										SPAN({'class': 'flb-swf-font-box flb-swf-font-copy'}, '$color|getHex'),
										DIV({'class': 'flb-swf-swatch', 'style': 'background-color: $color|getColor'})
									)
								),
								DIV({'class': 'flb-swf-clear'}),
								FOR('string', '$param.value.strings',
									P({'class': 'flb-swf-font-box flb-swf-font-copy'}, '$string')
								)
							)
						)
					)
				)
			)
		),
		
	loadingTag:
		DIV({"class": "flb-swf-loading"}),
	
	messageTag:
		TABLE({'class': 'netInfoSWFInfoTable', cellpadding: 0, cellspacing: 0, 'role': 'presentation'},
			TBODY({},
				TR({'role': 'listitem'},
					TD({'class': 'netInfoParamName', 'role': 'presentation'},
						SPAN('$param.name')
					),
					TD({'class': 'netInfoParamValue'},
						FOR('line', '$param|getParamValueIterator',
							CODE({'class': 'focusRow subFocusRow', 'role': 'listitem'}, '$line')
						)
					)
				)
			)
		),
		
	swatchTag:
		DIV({}, 
			SPAN({'class': 'focusRow subFocusRow'}, '$object|getHex'),
			DIV({'class': 'flb-swf-swatch', 'style': 'background-color:$object|getColor'})
		),
		
	codeTag:
		FOR('line', '$object|getParamValueIterator',
			CODE({'class': 'focusRow subFocusRow', 'role': 'listitem'}, '$line')
		),
		
	detailsTag:
		DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export', onclick: '$onDetail', _dataID: '$param|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoSWF.title')),
		
	exportTag:
		DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-export', onclick: '$onSave', _dataID: '$param|getParamName', _dataType: '$param.value.type'}, $FL_STR('flashbug.netInfoAMF.save')),
		
	unsupportedTag:
		DIV({'class': 'flb-swf-thumb-caption flb-swf-thumb-unsupported'}, 'Not fully supported'),
		
	emptyTag:
		DIV({'class': 'flb-swf-hidden'}, ''),
		
	audioTag:
		DIV({'class': 'flb-swf-sound-control'}, 
			TAG('$param|safeGetAudioTag', { })
		),
		
	// When used with Firebug 1.5 and Firefox 3.6, it was killing Firebug
	safeGetAudioTag: function(obj) {
		try {
			return AUDIO({ _src:this.getAudio(obj), _controls:' ' });
		} catch(e) {
			return this.emptyTag;
		}
	},
	
	onToggle: function(event) {
		var headerGroup = event.currentTarget,
			//twisty = headerGroup.getElementsByClassName('flb-swf-twisty'),
			twisty = headerGroup.childNodes,
			table = headerGroup.parentNode.getElementsByTagName('table')[0];
			
		if (twisty) twisty = twisty[0];
		if (hasClass(table, 'flb-swf-hidden')) {
			if (twisty) removeClass(twisty, 'closed');
			removeClass(table, 'flb-swf-hidden');
		} else {
			if (twisty) setClass(twisty, 'closed');
			setClass(table, 'flb-swf-hidden');
		}
		
		cancelEvent(event);
	},
	
	getAudio: function(obj) {
		return 'data:audio/wave;base64,' + btoa(obj.value.data);
	},
	
	getAudioTag: function(obj) {
		var ext = this.getFileExt(obj);
		if(ext == 'wav' && (obj.value.soundFormat == 0 || obj.value.soundFormat == 3)) return this.audioTag;
		return this.emptyTag;
	},
	
	getSVGTag: function(obj) {
		//trace('getSVGTag', obj);
		var value = obj.hasOwnProperty('value') ? obj.value : obj;
		return value.svgHeaderThumb + value.data;
	},
	
	zero: function(n) {
		if (n.length < 2) return '0' + n;
		return n;
	},
	
	getHex: function(color) {
		var str = '#';
		str += this.zero(color.red.toString(16));
		str += this.zero(color.green.toString(16));
		str += this.zero(color.blue.toString(16));
		if (color.hasOwnProperty('alpha')) str += this.zero((color.alpha * 255).toString(16));
		return str.toUpperCase();
		
		/*if (color.hasOwnProperty('alpha')) {
			str = (color.alpha << 24) | (color.red << 16) | (color.green << 8) | color.blue;
		} else {
			str = (color.red << 16) | (color.green << 8) | color.blue;
		}
		return '#' + str.toString(16).toUpperCase();*/
	},
    
	getColor: function(color) {
		if (color.hasOwnProperty('alpha')) return 'rgba(' + [color.red, color.green, color.blue, color.alpha] + ')';
		return 'rgb(' + [color.red, color.green, + color.blue] + ')';
	},
	
	isBinarySWF: function(obj) {
		if(obj.value.isSWF) return '';
		return 'flb-swf-hidden';
	},
	
	hasData: function(obj) {
		var value = obj.hasOwnProperty('value') ? obj.value : obj;
		if(value.data) return '';
		return 'flb-swf-hidden';
	},
	
	onLoadImage: function(event) {
		const maxWidth = 100, maxHeight = 80;
		var img = event.currentTarget;
		var w = img.naturalWidth, h = img.naturalHeight;
		
		// Mix-in alpha data
		var obj = img.param.value;
		if (obj.alphaData && !obj.hasAlpha) {
			var canvas = this.doc.createElement('canvas'),
				ctx = canvas.getContext('2d'),
				len = w * h;
			canvas.width = w;
			canvas.height = h;
			
			ctx.drawImage(img, 0, 0);
			
			var imgData = ctx.getImageData(0, 0, w, h),
				pxIdx = 0;
				var counter = 0;
			for (var i = 0; i < len; i++) {
				var a = obj.alphaData[i];
				if(a != undefined) imgData.data[pxIdx + 3] = a;
				pxIdx += 4;
			}
			
			ctx.putImageData(imgData, 0, 0);
			obj.hasAlpha = true;
			var uri = canvas.toDataURL(),
				timeout = CCIN('@mozilla.org/timer;1', 'nsITimer');
			timeout.initWithCallback({ notify:function(timer) { img.param.value.data = atob(uri.split(',')[1]); } }, 100, Ci.nsITimer.TYPE_ONE_SHOT);
			img.src = uri;
		}
		/////////////////////////////////
		
		if (w > maxWidth || h > maxHeight) {
			if (w > h) {
				img.style.width = maxWidth + 'px';
				img.style.height = Math.round((h / w) * maxWidth) + 'px';
			} else {
				img.style.width = Math.round((w / h) * maxHeight) + 'px';
				img.style.height = maxHeight + 'px';
			}
		}
		
		var caption = img.parentNode.nextSibling.nextSibling;
                flashfirebugPrepare.replaceHTML(caption, $STRF('flashbug.netInfoSWF.dimensions', [w, h]));
		
		// Save the height since it'll change from processThumbs
		var div = img.parentNode.parentNode;
		div.origHeight = div.offsetHeight;
		
		// Re-adjust image thumbs
		var timeout = CCIN('@mozilla.org/timer;1', 'nsITimer'),
			tabBody = getAncestorByClass(event.target, 'netInfoText');
		timeout.initWithCallback({ notify:function(timer) {
			Flashbug.SWFInfoModule.processThumbs(tabBody, 'flb-swf-images');
		} }, 500, Ci.nsITimer.TYPE_ONE_SHOT);
	},
	
	onSave: function(event) {
        var obj = this.getData(event.target);
		if(!obj) {
			trace('onSave - Can\'t find data object!');
			return;
		}
		
		// Create file
		var dir = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties);
		var file = this.getTargetFile(this.getFileName(obj));
		var value = obj.hasOwnProperty('value') ? obj.value : obj;
		var data = value.data;
		if (value.type == 'shape' || value.type == 'morph') data = value.svgHeader + data;
		if (file) Flashbug.writeFile(file, data);
		
        cancelEvent(event);
    },
	
	onDetail: function(event) {
		var target = event.target;
		var file = target.file;
		var infoBox = target.infoBox;
		var obj = this.getData(target);
		if(!obj) {
			trace('onDetail - Can\'t find data object!');
			return;
		}
		
		// Create Tab
		if (!file['response' + obj.value.tabId]) {
			obj.value.tabId = Flashbug.SWFInfoModule.tabId + (++Flashbug.SWFInfoModule.childTabs);
			obj.value.tabName = this.getFileName(obj) + ' ' + $FL_STR("flashbug.netInfoSWF.title");
			file['responseText' + Flashbug.SWFInfoModule.childTabs] = obj.value.data;
			trace('onDetail - Append Tab: ' + obj.value.tabId + ' Title:' + obj.value.tabName, infoBox);
			Firebug.NetMonitor.NetInfoBody.appendTab(infoBox, obj.value.tabId, obj.value.tabName);
		}
		
		// Select Tab
		Firebug.NetMonitor.NetInfoBody.selectTabByName(infoBox, obj.value.tabId);
		
        cancelEvent(event);
	},
	
	getFontCaption: function(obj) {
		var caption = [];
		if (obj.value.info.isItalics) caption.push('Italic');
		if (obj.value.info.isBold) caption.push('Bold');
		if (obj.value.hasOwnProperty('numGlyphs')) caption.push(obj.value.numGlyphs + ' Glyphs');
		if (obj.value.data || obj.value.dataSize) caption.push(this.getFileSize(obj));
		return caption.join(' | ');
	},
	
	getUnsupportedTag: function(obj) {
		var value = obj.hasOwnProperty('value') ? obj.value : obj;
		var ext = this.getFileExt(obj);
		if(ext == 'jpg' || ext == 'png' || ext == 'gif' || (ext == 'flv' && value.codecID <= 5) || (ext == 'wav' && (value.soundFormat == 0 || value.soundFormat == 3)) || ext == 'mp3') return this.emptyTag;
		
		// For current bug in defineShape
		if (ext == 'svg' && value.data.indexOf('patternFill') == -1 && value.data.indexOf('d="undefined"') == -1) return this.emptyTag;
		return this.unsupportedTag;
	},
	
	getData: function(target) {
		var infoBox = getAncestorByClass(target, 'netInfoBody');
		var tab = infoBox.selectedTab;
		var tabId = tab.getAttribute('view');
		var file = infoBox.repObject;
		var responseSWF = file['response' + tabId];
		
		// Find Object array
		var dataID = target.dataID.toLowerCase();
		var dataType = target.dataType.toLowerCase();
		var arrName;
		if (dataType == 'image') arrName = 'Images';
		if (dataType == 'sound') arrName = 'Sounds';
		if (dataType == 'binary') arrName = 'Binary';
		if (dataType == 'video') arrName = 'Videos';
		if (dataType == 'font') arrName = 'Fonts';
		if (dataType == 'text') arrName = 'Text';
		if (dataType == 'shape') arrName = 'Shapes';
		if (dataType == 'morph') arrName = 'Morph Shapes';
		if (!arrName) return;
		
		var arr;
		var l = responseSWF.length;
		while(l--) {
			if(responseSWF[l].name == arrName) {
				arr = responseSWF[l].value;
				break;
			}
		}
		
		// Find Object
		var obj;
		l = arr.length;
		while(l--) {
			if (dataType == 'morph') {
				if(arr[l].value.start.name == target.dataID) {
					obj = arr[l].value.start;
					break;
				}
				if(arr[l].value.end.name == target.dataID) {
					obj = arr[l].value.end;
					break;
				}
			} else {
				if(arr[l].name == target.dataID) {
					obj = arr[l];
					break;
				}
			}
		}
		
		return obj;
	},
	
	getFileExt: function(obj) {
		var value = obj.hasOwnProperty('value') ? obj.value : obj;
		if(value.hasOwnProperty('imageType')) {
			if(value.imageType == 'JPEG') return 'jpg';
			if(value.imageType == 'PNG') return 'png';
			if(value.imageType == 'GIF89a') return 'png';
			return '?';
		}
		
		if(value.hasOwnProperty('soundFormat') || value.hasOwnProperty('streamSoundCompression')) {
			var prop = value.hasOwnProperty('soundFormat') ? 'soundFormat' : 'streamSoundCompression';
			if(value[prop] == 0) return 'wav';
			if(value[prop] == 1) return 'wav';
			if(value[prop] == 2) return 'mp3';
			if(value[prop] == 3) return 'wav';
			if(value[prop] == 4) return 'nel';
			if(value[prop] == 5) return 'nel';
			if(value[prop] == 6) return 'nel';
			if(value[prop] == 11) return 'speex';
			return '?';
		}
		
		if(value.isPBJ) return 'pbj';
		if(value.isSWF) return 'swf';
		if(value.isGIF) return 'gif';
		
		if(value.type == 'font') return 'cff';
		if(value.type == 'video') return 'flv';
		if(value.type == 'shape' || value.type == 'morph') return 'svg';
		
		return 'bin';
	},
	
	getFileName: function(obj) {
		var ext = this.getFileExt(obj);
		var fullName = obj.name;
		return ext ? fullName + '.' + ext : fullName;
	},
	
	getFileSize: function(obj) {
		var value = obj.hasOwnProperty('value') ? obj.value : obj;
		if (value.hasOwnProperty('svgHeader')) {
			var data = value.svgHeader + value.data;
			return formatSize(data.length);
		}
		if (value.hasOwnProperty('data')) return formatSize(value.data.length);
		return formatSize(value.dataSize);
	},
	
	getVideoCodec: function(objVideo) {
		return VideoCompression[objVideo.value.codecID];
	},
	
	getVideoSmoothing: function(objVideo) {
		return (objVideo.value.smoothing ? 'Smoothing On' : 'Smoothing Off');
	},
	
	getVideoDeblocking: function(objVideo) {
		return 'Deblock' + VideoDeblocking[objVideo.value.deblocking];
	},
	
	getSoundCaption: function(objSound) {
		if(objSound.value.hasOwnProperty('streamSoundCompression')) return SoundCompression[objSound.value.streamSoundCompression] + ' ' + SoundRate[objSound.value.streamSoundRate] + ' ' + SoundSize[objSound.value.streamSoundSize] + ' ' + SoundType[objSound.value.streamSoundType];
		return SoundCompression[objSound.value.soundFormat] + ' ' + SoundRate[objSound.value.soundRate] + ' ' + SoundSize[objSound.value.soundSize] + ' ' + SoundType[objSound.value.soundType];
	},
	
	getTargetFile: function(defaultFileName) {
        var nsIFilePicker = Ci.nsIFilePicker;
        var fp = CCIN('@mozilla.org/filepicker;1', 'nsIFilePicker');
        fp.init(window, null, nsIFilePicker.modeSave);
        fp.appendFilter('Image Files','*.jpg, *.bmp, *.png, *.gif, *.jpeg');
        fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
        fp.filterIndex = 1;
        fp.defaultString = defaultFileName;
		
        var rv = fp.show();
        if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) return fp.file;
		
        return null;
    },
	
	getSectionTag: function(param) {
		var name = param.name;
		if(name == 'Fonts') return Flashbug.SWFInfoModule.NetInfoSWF.sectionFontTag;
		if(name == 'Binary') return Flashbug.SWFInfoModule.NetInfoSWF.sectionBinaryTag;
		if(name == 'Videos') return Flashbug.SWFInfoModule.NetInfoSWF.sectionVideoTag;
		if(name == 'Shapes') return Flashbug.SWFInfoModule.NetInfoSWF.sectionShapeTag;
		if(name == 'Morph Shapes') return Flashbug.SWFInfoModule.NetInfoSWF.sectionMorphShapeTag;
		if(name == 'Images') return Flashbug.SWFInfoModule.NetInfoSWF.sectionImageTag;
		if(name == 'Sounds') return Flashbug.SWFInfoModule.NetInfoSWF.sectionSoundTag;
		if(name == 'Text') return Flashbug.SWFInfoModule.NetInfoSWF.sectionTextTag;
		return Flashbug.SWFInfoModule.NetInfoSWF.sectionMetaTag;
	},
	
	getValueTag: function(param) {
		if(param.name == 'Background Color') return Flashbug.SWFInfoModule.NetInfoSWF.swatchTag;
		if(param.name == 'XMP') return Firebug.HTMLPanel.CompleteElement.tag; // HTMLHtmlElement CompleteElement SoloElement Element
		return this.codeTag;
	},
	
	getValue: function(param) {
		var name = this.getParamName(param, 'getValue');
		
		if (name == 'Background Color') {
			return param.value;
		} else if (name == 'XMP') {
			var parser = CCIN('@mozilla.org/xmlextras/domparser;1', 'nsIDOMParser');
			var doc = parser.parseFromString(param.value, 'text/xml');
			var root = doc.documentElement;
			
			// Error handling
			var nsURI = 'http://www.mozilla.org/newlayout/xml/parsererror.xml';
			if (root.namespaceURI == nsURI && root.nodeName == 'parsererror') {
				/*Flashbug.ConsoleModule.XMLError.tag.replace({error: {
				message: root.firstChild.nodeValue + " [" + text + "]",
				source: root.lastChild.textContent
				}}, node);*/
				// Not sure how to handle this if there is invalid XML, although this should be super rare
				return param;
			}
			
			return root;
		} else if(param.value.hasOwnProperty('type') && param.value.type == 'image') {
			var obj = param.value, 
				colorData = obj.colorData,
				width = obj.width, 
				height = obj.height, 
				uri = null;
				
			if(colorData) {
				var colorTableSize = obj.colorTableSize || 0,
					withAlpha = obj.withAlpha,
					bpp = (withAlpha || (obj.format == 5) ? 4 : 3),
					cmIdx = colorTableSize * bpp,
					pxIdx = 0,
					canvas = this.doc.createElement("canvas"),
					ctx = canvas.getContext("2d"),
					imgData = ctx.createImageData(width, height),
					pad = colorTableSize ? ((width + 3) & ~3) - width : 0;
					
				canvas.width = width;
				canvas.height = height;
				
				// If colorTableSize, then image is Colormapped
				// If no colorTableSize, then image is Direct
				//ctx.mozImageSmoothingEnabled = false;   True by default
				
				// Without Alpha
				// (BitmapFormat 3) Colormapped Images are stored RGB, canvas uses RGBA
				// (BitmapFormat 4) Direct Images 15bit are UB[1] res, UB[5] red, UB[5] green, UB[5] blue (Big Endian?)
				// (BitmapFormat 5) Direct Images 24bit are UI8 res, UI8 red, UI8 green, UI8 blue
				
				// With Alpha
				// (BitmapFormat 3) Colormapped Images are stored RGBA, canvas uses RGBA
				// (BitmapFormat 5) Direct Images 32bit are stored ARGB, canvas uses RGBA
				if(obj.format == 4) colorData = new Flashbug.BytearrayString(colorData.join(''));
				
				for (var y = 0; y < height; y++) {
					for (var x = 0; x < width; x++) {
						var idx = (colorTableSize ? colorData[cmIdx++] : cmIdx++) * bpp, r, g, b, a;
						if(withAlpha) {
							r = colorTableSize ? colorData[idx] : colorData[idx + 1];
							g = colorTableSize ? colorData[idx + 1] : colorData[idx + 2];
							b = colorTableSize ? colorData[idx + 2] : colorData[idx + 3];
							a = colorTableSize ? colorData[idx + 3] : colorData[idx];
						} else {
							if(obj.format == 3) {
								r = colorData[idx];
								g = colorData[idx + 1];
								b = colorData[idx + 2];
							} else if(obj.format == 4) {
								// PIX15
								colorData.readUB(1); // Reserved
								r = colorData.readUB(5);
								g = colorData.readUB(5);
								b = colorData.readUB(5);
							} else if(obj.format == 5) {
								// PIX24
								//colorData[idx]; // Reserved
								r = colorData[idx + 1];
								g = colorData[idx + 2];
								b = colorData[idx + 3];
							}
							a = 255;
						}
						
						if(a) {
							imgData.data[pxIdx] = r || 0; //R
							imgData.data[pxIdx + 1] = g || 0; //G
							imgData.data[pxIdx + 2] = b || 0; //B
							imgData.data[pxIdx + 3] = a; //A
						}
						pxIdx += 4;
					}
					cmIdx += pad;
				}
				
				ctx.putImageData(imgData, 0, 0);
				uri = canvas.toDataURL();
				
				param.value.data = atob(uri.split(',')[1]);
			} else {
				uri = "data:image/jpeg;base64," + btoa(obj.data);
				
				/*if (obj.alphaData) {
					var img = new Image(),
						canvas = this.doc.createElement("canvas"),
						ctx = canvas.getContext("2d"),
						len = width * height,
						data = obj.alphaData;
					img.src = uri;
					canvas.width = width;
					canvas.height = height;
					
					//Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIDOMCanvasRenderingContext2D.drawImage]
					ctx.drawImage(img, 0, 0); // <----- 
					
					var imgData = ctx.getImageData(0, 0, width, height),
						pxIdx = 0;
						
					for (var i = 0; i < len; i++) {
						imgData.data[pxIdx + 3] = data[i];
						pxIdx += 4;
					}
					ctx.putImageData(imgData, 0, 0);
					uri = canvas.toDataURL();
				}*/
			}
			
			return uri;
		}
		
        return param;
	},

    getParamName: function(param, from) {
        var name = param.name;
        var limit = Firebug.netParamNameLimit;
        if (limit <= 0) return name;
        if (name.length > limit) name = name.substr(0, limit) + "...";
        return name;
    },
	
	getParamValueIterator: function(param) {
        // This value is inserted into CODE element and so, make sure the HTML isn't escaped (1210).
        // This is why the second parameter is true.
        // The CODE (with style white-space:pre) element preserves whitespaces so they are
        // displayed the same, as they come from the server (1194).
        // In case of a long header values of post parameters the value must be wrapped (2105).
        return wrapText(param.value, true);
    },
});

//////////////////////////
// Firebug Registration //
//////////////////////////

if(CCSV("@mozilla.org/preferences-service;1", "nsIPrefBranch2").getBoolPref(Firebug.prefDomain + ".flashbug.enableSWF")) {
	Firebug.registerModule(Flashbug.SWFInfoModule);
}

/////////////////////////////
// Firebug Trace Constants //
/////////////////////////////

FBTrace.DBG_FLASH_SWF_TAB = Firebug.getPref(Firebug.prefDomain, "DBG_FLASH_SWF_TAB");

}});