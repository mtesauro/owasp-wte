//(function() {
// TODO: Parse AS3 https://github.com/magicalhobo/SWFWire
importScripts('../lib/byteArray.js', '../lib/cff.js', '../lib/wav.js', '../lib/zip.js', '../lib/flv.js', '../lib/gif.js', '../lib/jpeg.js', '../lib/png.js', '../lib/pbj.js', '../lib/swf.js', '../lib/xml.js', 'constants.js', 'importTags.js', 'importTypes.js'
, 'tagCodes.js');

var soundStreamID = 1,
	hasSoundBlock = false;

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

function Frame() {
	this.actions = [];
	this.label = '';
	this.displayList = [];
};

//////////////////////////////////////
// From String util in Firebug

var escapeNewLines = function(value) {
    return value.replace(/\r/gm, "\\r").replace(/\n/gm, "\\n");
};

/////////////////////////////////////////

function edges2cmds(edges, stroke) {
	var firstEdge = edges[0],
		x1 = 0,
		y1 = 0,
		x2 = 0,
		y2 = 0,
		cmds = [];
		
	/*
	The following commands are available for path data:

	M = moveto
	L = lineto
	H = horizontal lineto
	V = vertical lineto
	C = curveto
	S = smooth curveto
	Q = quadratic Belzier curve
	T = smooth quadratic Belzier curveto
	A = elliptical Arc
	Z = closepath
	*/
	
	if (firstEdge) {
		for(var i = 0, edge = firstEdge; edge; edge = edges[++i]) {
			x1 = edge.x1;
			y1 = edge.y1;
			if (x1 != x2 || y1 != y2 || !i) cmds.push('M' + twip2px(x1) + ',' + twip2px(y1));
			x2 = edge.x2;
			y2 = edge.y2;
			if (null == edge.cx || null == edge.cy) {
				if (x2 == x1) {
					cmds.push('V' + twip2px(y2));
				} else if (y2 == y1) {
					cmds.push('H' + twip2px(x2));
				} else {
					cmds.push('L' + twip2px(x2) + ',' + twip2px(y2));
				}
			} else {
				cmds.push('Q' + twip2px(edge.cx) + ',' + twip2px(edge.cy) + ',' + twip2px(x2) + ',' + twip2px(y2));
			}
		};
		if (!stroke && (x2 != firstEdge.x1 || y2 != firstEdge.y1)) cmds.push('L' + twip2px(firstEdge.x1) + ',' + twip2px(firstEdge.y1));
	}
	return cmds.join(' ');
};

function twip2px(num) {
	return num / 20;
}

function getStyle(fill, line, id) {
	var t = this,
		attrs = {};
		
	var fillAttr = '';
	if (fill) {
		if (fill.type != 'solid') {
			fillAttr += ' fill="url(#' + id + 'gradFill)"';
		} else {
			var color = fill.hasOwnProperty('startColor') ? fill.startColor : fill.color,
				alpha = color.alpha;
			fillAttr += ' fill="' + color.toString() + '"';
			if (alpha != undefined && alpha < 1) fillAttr += ' fill-opacity="' + alpha + '"';
		}
	} else {
		fillAttr += ' fill="none"';
	}
	
	if (line) {
		if (line.hasOwnProperty('hasFillFlag')) {
			// Filled line, gradient line
			fillAttr += ' stroke="url(#' + id + 'gradFill)"';
			fillAttr += ' stroke-width="' + Math.max(line.width, 1) + '"';
		} else {
			var color = line.hasOwnProperty('startColor') ? line.startColor : line.color,
				width = line.hasOwnProperty('startWidth') ? line.startWidth : line.width,
				alpha = color.alpha;
			fillAttr += ' stroke="' + color.toString() + '"';
			fillAttr += ' stroke-width="' + Math.max(width, 1) + '"';
			if (undefined != alpha && alpha < 1) fillAttr += ' stroke-opacity="' + alpha + '"';
		}
		
		if (line.hasOwnProperty('joinStyle') && line.joinStyle == 2) fillAttr += ' stroke-miterlimit="' + line.miterLimitFactor + '"'; // Miter limit factor is an 8.8 fixed-point value.
		
		if (line.hasOwnProperty('startCapStyle') && line.startCapStyle instanceof Number) {
			var lineCap = ['butt','round', 'square'];
			fillAttr += ' stroke-linecap="' + lineCap[line.startCapStyle] + '"'; // endCapStyle ignored for now
		}
		
		if (line.hasOwnProperty('joinStyle') && line.joinStyle instanceof Number) {
			var lineJoin = ['round','bevel','miter'];
			fillAttr += ' stroke-linejoin="' + lineJoin[line.joinStyle] + '"';
		}
	}
	
	return fillAttr;
};

function getFill(fill, id) {
	var t = this,
		type = fill.type,
		svg = '';
		
	switch(type) {
		case "linear":
		case "radial":
			svg += '<' + type + 'Gradient';
			svg += ' id="' + id + 'gradFill"';
			svg += ' gradientUnits="userSpaceOnUse"';
			svg += ' gradientTransform="' + fill.gradientMatrix.toString() + '"';
			var s = SpreadModes,
				i = InterpolationModes,
				stops = fill.gradient.gradientRecords;
			if (type == 'linear') {
				svg += ' x1="-819.2"'; 
				svg += ' x2="819.2"'; 
			} else {
				svg += ' cx="0"'; 
				svg += ' cy="0"'; 
				svg += ' r="819.2"'; 
			}
			
			switch (fill.gradient.spreadMode) {
				case s.REFLECT:
					svg += ' spreadMethod="reflect"';
					break;
				case s.REPEAT:
					svg += ' spreadMethod="repeat"';
					break;
			}
			
			if (fill.gradient.interpolationMode == i.LINEAR_RGB) svg += ' color-interpolation="linearRGB"';
			
			svg += '>';
			
			stops.forEach(function(stop) {
				svg += '<stop';
				var color = stop.hasOwnProperty('startColor') ? stop.startColor : stop.color,
					offset = stop.hasOwnProperty('startRatio') ? stop.startRatio : stop.offset;
				svg += ' offset="' + offset + '"';
				svg += ' stop-color="' + color.toString() + '"';
				svg += ' stop-opacity="' + (!color.hasOwnProperty('alpha') ? 1 : color.alpha) + '"';
				svg += ' />'
			});
			
			svg += '</' + type + 'Gradient>';
			
			break;
		case "pattern":
			svg += '<g id="' + id + 'patternFill">';
			//svg += '<rect transform="' + getMatrix(fill.matrix, morphIdx) + '"  width="' + fill.image.width + '" height="' + fill.image.height + '" y="0" x="0" fill="#ff0000"/>';
			
		
			svg += '<image';
			//svg += ' id="' + id + 'patternFill"';
			svg += ' transform="' + fill.bitmapMatrix.toString() + '"';
			svg += ' width="' + fill.image.width + '"';
			svg += ' height="' + fill.image.height + '"';
			
			/*var node = t._createElement("image"),
				width = obj.width,
				height = obj.height;
			if (obj.data) {
				var s = new Gordon.Stream(obj.data),
					dataSize = width * height * 4,
					canvas = doc.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext("2d"),
					imgData = ctx.createImageData(width, height),
					data = imgData.data;
				for(var i = 0; i < dataSize; i += 4){
					data[i] = s.readUI8();
					data[i + 1] = s.readUI8();
					data[i + 2] = s.readUI8();
					data[i + 3] = 255;
				}
				ctx.putImageData(imgData, 0, 0);
				var uri = canvas.toDataURL();
			} else { var uri = obj.uri; }*/
			svg += ' xlink:href="$$$_' + fill.image.id + '_URI$$$"';
			svg += '/>';
			
			svg += '</g>';
			break;
	}
	
	return svg;
};

function union(rect1, rect2) {
	return {
			left: rect1.left < rect2.left ? rect1.left : rect2.left,
			right: rect1.right > rect2.right ? rect1.right : rect2.right,
			top: rect1.top < rect2.top ? rect1.top : rect2.top,
			bottom: rect1.bottom > rect2.bottom ? rect1.bottom : rect2.bottom
		};
};

/*
Normal: start.edges{records, fill, line}
Multipath: start.edges[{records, fill, _index}, {records, line, _index}]
*/
function morph2SVG(shp) {
	// Union bounds
	shp.bounds = union(shp.startBounds, shp.endBounds);
	
	// Convert to SVG //
	var b = shp.bounds,
		svg = '',
		cmds = '',
		defs = '<defs>';
	
	// SVG Header
	svg += '<g fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision" image-rendering="optimizeQuality"  text-rendering="geometricPrecision" color-rendering="optimizeQuality">';
	
	// SVG Body
	var id = shp.id,
		fill = shp.startEdges.segment ? shp.startEdges.segment.fill : null,
		line = shp.startEdges.segment ? shp.startEdges.segment.line : null;
		
	if (fill && 'pattern' == fill.type && !fill.repeat) {
		defs += getFill(fill, id);
		cmds += '<use xlink:href="#' + id + 'patternFill" transform="' + fill.bitmapMatrix.toString() + '" />';
	} else {
		if (fill && 'pattern' != fill.type) defs += getFill(fill, id);
		if (line && line.hasOwnProperty('hasFillFlag')) defs += getFill(line.fillType, id);
		cmds += '<path id="' + id + '" d="' + shp.startEdges.commands + '"' + getStyle(fill, line, id) + '>';
		cmds += '<animate dur="10s" repeatCount="indefinite" attributeName="d" values="' + shp.startEdges.commands + '; ' + shp.endEdges.commands + '; ' + shp.endEdges.commands + '" />';
		cmds += '</path>';
	}
	
	// SVG Footer
	defs += '</defs>';
	svg += defs;
	svg += cmds;
	svg += '</g></svg>';
	
	// For displaying in Flashbug
	var w = (b.right - b.left),
		h = (b.bottom - b.top),
		vB = ('' + [b.left, b.top, b.right - b.left, b.bottom - b.top]);
	
	shp.svgHeaderThumb = '<svg preserveAspectRatio="none" width="' + w + '" height="' + h + '" viewBox="' + vB + '">';
	// For export
	shp.svgHeader = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="none" width="' + w + '" height="' + h + '" viewBox="' + vB + '">';
	shp.data = svg;
};

function shape2SVG(shp) {
	// Convert to SVG //
	var segments = shp.shapes.segments,
		b = shp.bounds,
		svg = '',
		cmds = '',
		defs = '<defs>';
	
	// SVG Header
	svg += '<g fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision" image-rendering="optimizeQuality"  text-rendering="geometricPrecision" color-rendering="optimizeQuality">';
	
	if (segments) { // TODO: Figure out why http://lickitysplitsigns.com/index2.html breaks here
		for (var i = 0, seg = segments[0]; seg; seg = segments[++i]) {
			var id = seg.id,
				fill = seg.fill,
				line = seg.line;
			if (fill && fill.type == 'pattern' && !fill.repeat) {
				defs += getFill(fill, id);
				cmds += '<use xlink:href="#' + id + 'patternFill" />';
			} else {
				if (fill && fill.type != 'solid') defs += getFill(fill, id);
				if (line && line.hasFillFlag) defs += getFill(line.fillType, id);
				cmds += '<path id="' + id + '" d="' + seg.commands + '"' + getStyle(fill, line, id) + ' />';
			}
		}
	}
	
	// SVG Footer
	defs += '</defs>';
	svg += defs;
	svg += cmds;
	svg += '</g></svg>';
	
	// For displaying in Flashbug
	var w = (b.right - b.left),
		h = (b.bottom - b.top),
		vB = ('' + [b.left, b.top, b.right - b.left, b.bottom - b.top]);
	
	shp.svgHeaderThumb = '<svg preserveAspectRatio="none" width="' + w + '" height="' + h + '" viewBox="' + vB + '">';
	// For export
	shp.svgHeader = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="none" width="' + w + '" height="' + h + '" viewBox="' + vB + '">';
	shp.data = svg;
};

function strip(str) {
	if (!str) return str;
	return str.toString().indexOf('"') != -1 ? str.toString().split('"')[1] : str;
}

function readTags(ba, obj) {
	var startPos = ba.position,
		tags = [],
		tagLog = [],
		header = new RecordHeader(ba);
	ba.position = startPos;
	
	// Utility to merge stored objects together
	function store(tag) {
		obj.dictionary[tag.id] = obj.dictionary[tag.id] || { };
		for (var prop in tag) {
			obj.dictionary[tag.id][prop] = tag[prop];
		}
	}
	
	while (header) {
		var strTrace = 'LOG - ' + ba.position + ' - ' + TAGS[header.type].name + ' (' + header.type + ') - ' + header.contentLength;
	
		var o = TAGS[header.type];
		if (o) {
			var tag = new o.func(ba, obj);
			//trace(strTrace, tag);
			switch(header.type) {
				case TAG_CODES.Header : break;
				case TAG_CODES.DefineScalingGrid :
					store({id:tag.id, scale9Grid:tag.splitter});
					break;
				case TAG_CODES.DefineSceneAndFrameLabelData :
					obj.scenes = tag.scenes;
					obj.frameLabels = tag.frameLabels;
					break;
				case TAG_CODES.VideoFrame :
					// Find VideoStream this data belongs to and append it //
					var vid = obj.dictionary[tag.streamID];
					if (vid) {
						vid.duration += 20; // TODO: Figure out frame duration in MS
						vid.data += Flashbug.FLV(vid, obj.frameRate, tag.videoData, tag.frameNum);
					} else {
						trace('VideoFrame - unable to find video');
					}
					break;
				case TAG_CODES.EnableDebugger :
					obj.debugPassword = tag.password;
					break;
				case TAG_CODES.EnableDebugger2 :
					if (tag.hasOwnProperty('password')) obj.debugPassword = tag.password;
					break;
				case TAG_CODES.End :
					//if (hasSoundBlock) obj.streams.pop(); // ???
					obj.stage.pop();
					break;
				case TAG_CODES.ExportAssets :
				case TAG_CODES.ImportAssets :
				case TAG_CODES.ImportAssets2 :
					var i = tag.count;
					while(i--) {
						store(tag.assets[i]);
					}
					break;
				case TAG_CODES.FileAttributes :
					obj.attributes = tag;
					break;
				case TAG_CODES.FrameLabel :
					obj.stage[obj.stage.length - 1].label = tag.name;
					break;
				case TAG_CODES.JPEGTables :
					obj.jpegData = tag.jpegData;
					break;
				case TAG_CODES.Metadata :
					obj.metadata = tag.metadata;
					break;
				case TAG_CODES.ProductInfo :
					obj.productInfo = tag;
					break;
				case TAG_CODES.PlaceObject :
				case TAG_CODES.PlaceObject2 :
				case TAG_CODES.PlaceObject3 :
					obj.stage[obj.stage.length - 1].displayList.push(tag);
					break;
				case TAG_CODES.Protect :
					if (tag.hasOwnProperty('password')) obj.password = tag.password;
					break;
				case TAG_CODES.ScriptLimits :
					obj.maxRecursionDepth = tag.maxRecursionDepth;
					obj.scriptTimeoutSeconds = tag.scriptTimeoutSeconds;
					break;
				case TAG_CODES.SetBackgroundColor :
					obj.backgroundColor = tag.backgroundColor;
					break;
				case TAG_CODES.DefineButtonSound :
					obj.dictionary[tag.buttonId].sounds = tag;
					break;
				case TAG_CODES.DefineButtonCxform :
					obj.dictionary[tag.buttonId].colorTransform = tag.buttonColorTransform;
					break;
				case TAG_CODES.CSMTextSettings :
					obj.dictionary[tag.textID].csm = tag;
					break;
				case TAG_CODES.DefineFontAlignZones :
					obj.dictionary[tag.fontID].alignZones = tag;
					break;
				case TAG_CODES.DefineFontInfo :
				case TAG_CODES.DefineFontInfo2 :
					obj.dictionary[tag.fontID].info = tag;
					break;
				case TAG_CODES.DefineFontName :
					obj.dictionary[tag.fontID].fontName = tag;
					break;
				case TAG_CODES.ShowFrame :
					obj.stage.push(new Frame());
					break;
				case TAG_CODES.SymbolClass :
					var i = tag.numSymbols;
					while(i--) {
						store(tag.symbols[i]);
					}
					break;
				case TAG_CODES.SoundStreamHead :
					obj.streams.push(tag);
					break;
				case TAG_CODES.DefineBits :
				case TAG_CODES.DefineBitsJPEG2 :
				case TAG_CODES.DefineBitsJPEG3 :
				case TAG_CODES.DefineBitsJPEG4 :
				case TAG_CODES.DefineBitsLossless :
				case TAG_CODES.DefineBitsLossless2 :
				case TAG_CODES.DefineShape :
				case TAG_CODES.DefineShape2 :
				case TAG_CODES.DefineShape3 :
				case TAG_CODES.DefineShape4 :
				case TAG_CODES.DefineVideoStream :
				case TAG_CODES.DefineBinaryData :
				case TAG_CODES.DefineSound :
				case TAG_CODES.DefineFont :
				case TAG_CODES.DefineFont2 :
				case TAG_CODES.DefineFont3 :
				case TAG_CODES.DefineFont4 :
				case TAG_CODES.DefineText :
				case TAG_CODES.DefineText2 :
				case TAG_CODES.DefineEditText :
				case TAG_CODES.DefineMorphShape :
				case TAG_CODES.DefineMorphShape2 :
				case TAG_CODES.DefineSprite :
				case TAG_CODES.DefineButton :
				case TAG_CODES.DefineButton2 :
					store(tag);
					break;
				case TAG_CODES.DoInitAction :
					obj.dictionary[tag.spriteID].initAction = tag;
					break;
				case TAG_CODES.DoAction :
					obj.stage[obj.stage.length - 1].actions.push(tag);
					break;
			}
			
			// Re-align in the event a tag was read improperly
			if (0 != (header.tagLength - (ba.position - startPos))) trace('Error reading ' + TAGS[header.type].name + ' tag! Start:' + startPos + ' End:' + ba.position + ' BytesAvailable:' + (header.tagLength - (ba.position - startPos)), tag);
			ba.seek(header.tagLength - (ba.position - startPos));
			
			tags.push(ba.position + ' - ' + TAGS[header.type].name + ' (' + header.type + ') - ' + header.tagLength);
			//tags.push(tag);
		} else {
			trace('Unknown tag type', header.type);
			ba.seek(header.tagLength); // Skip bytes
		}
		
		// End Tag
		if (header.type == 0) break;
		
		startPos = ba.position;
		header = new RecordHeader(ba);
		ba.position = startPos;
		
		postMessage({
			type: "progress",
			percent: ' ' + ((ba.position / ba.length) * 100).toFixed(2) + '%'
		});
	}
	
	return tags;
};

onmessage = function(event) {
	var ba = new Flashbug.ByteArray(event.data.text, Flashbug.ByteArray.LITTLE_ENDIAN),
		swf = {};
	
	swf.header = new SWFHeader(ba);
	swf.streams = [];
	swf.dictionary = [];
	swf.stage = [new Frame()];
	
	// Shortcuts to match DefineSprite
	swf.version = swf.header.version;
	swf.frameRate = swf.header.frameRate;
	
	// Hack to return two variables
	ba = swf.header.byteArray;
	delete swf.header.byteArray;
	
	if (!ba) {
		postMessage(swf);
		return;
	}
	
	swf.tags = readTags(ba, swf);
	
	postMessage(swf);
};

//})();