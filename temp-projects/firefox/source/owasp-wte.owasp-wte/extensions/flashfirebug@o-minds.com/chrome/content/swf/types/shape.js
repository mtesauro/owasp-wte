function Shape(ba, obj, tag) {
	var tagType = tag.header.type;
	function loRes(value) {
		if (tagType == 75 || tagType == 46 || tagType == 84) return value / 20;
		return value;
	}
	
	this.numFillBits = ba.readUB(4);
	this.numLineBits = ba.readUB(4);
	
	var x = 0,
		y = 0,
		cmds = [],
		b = {left:0, right:0, top:0, bottom:0};
		
	var push = Array.prototype.push;
	var x1 = 0,
		y1 = 0,
		x2 = 0,
		y2 = 0,
		seg = [],
		i = 0,
		isFirst = true,
		edges = [],
		leftFill = 0,
		rightFill = 0,
		fsOffset = 0,
		lsOffset = 0,
		leftFillEdges = {},
		rightFillEdges = {},
		line = 0,
		lineEdges = {},
		countFChanges = 0,
		countLChanges = 0,
		useSinglePath = true;
		
	function updateBounds(x, y) {
		if (x < b.left) b.left = x;
		if (x > b.right) b.right = x;
		if (y < b.top) b.top = y;
		if (y > b.bottom) b.bottom = y;
	}
	
	this.shapeRecords = [];
	do {
		var type = ba.readUB(1), record = null, flags = null;
		if (type) {
			var isStraight = ba.readBoolean();
			if (isStraight) {
				// StraightEdgeRecord
				record = new StraightEdgeRecord(ba);
				if (record['deltaX'] !== undefined) x += loRes(record.deltaX);
				if (record['deltaY'] !== undefined) y += loRes(record.deltaY);
				
				if (record.generalLineFlag) {
					cmds.push('L' + x + ',' + y); // lineto
					updateBounds(x, y);
				} else if (record.vertLineFlag) {
					cmds.push('V' + y); // vertical lineto
					updateBounds(0, y);
				} else {
					cmds.push('H' + x); // horizontal lineto
					updateBounds(x, 0);
				}
			} else {
				// CurvedEdgeRecord
				record = new CurvedEdgeRecord(ba);
				var cx = x + loRes(record.controlDeltaX);
				var cy = y + loRes(record.controlDeltaY);
				var x = cx + loRes(record.anchorDeltaX);
				var y = cy + loRes(record.anchorDeltaY);
				
				cmds.push('Q' + cx + ',' + cy + ',' + x + ',' + y); // quadratic Bézier curveto
				updateBounds(x, y);
			}
		} else {
			flags = ba.readUB(5);
			if (flags) {
				// StyleChangeRecord
				record = new StyleChangeRecord(ba, obj, tagType, flags, this.numFillBits, this.numLineBits);
				
				if (record.stateMoveTo) {
					x = loRes(record.moveDeltaX);
					y = loRes(record.moveDeltaY);
					cmds.push('M' + x + ',' + y); // moveto
					updateBounds(x, y);
				}
				
				if (record.stateFillStyle0) {
					leftFill = record.fillStyle0;
					countFChanges++;
				}
				
				if (record.stateFillStyle1) {
					rightFill = record.fillStyle1;
					countFChanges++;
				}
				
				if (record.stateLineStyle) {
					line = record.lineStyle;
					countLChanges++;
				}
				
				if ((leftFill && rightFill) || countFChanges + countLChanges > 2) useSinglePath = false;
				
				if (record.stateNewStyles) {
					fsOffset = tag.morphFillStyles.fillStyles.length;
					lsOffset = tag.morphLineStyles.length;
					push.apply(tag.morphFillStyles.fillStyles, record.fillStyles.fillStyles);
					push.apply(tag.morphLineStyles, record.lineStyles);
					this.numFillBits = record.numFillBits;
					
					this.numLineBits = record.numLineBits;
					useSinglePath = false;
				}
			} else {
				// EndShapeRecord
				record = new EndShapeRecord(ba, flags);
			}
		}
		this.shapeRecords.push(record);
	} while(type || flags);
	
	ba.align();
	
	// Morphshape only, not for fonts
	if (tag.hasOwnProperty('morphFillStyles')) {
		// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		// Get edges
		var edges;
		if (useSinglePath) {
			// If single path, return object
			var fill = leftFill || rightFill;
			edges = {
				fill : fill ? tag.morphFillStyles.fillStyles[fsOffset + fill - 1] : null,
				line : tag.morphLineStyles.lineStyles[lsOffset + line - 1],
				records : edges
			};
		} else {
			// If multipath, return array
			var segments = [];
			for (var i = 0, fillStyle; (fillStyle = tag.morphFillStyles.fillStyles[i]); i++) {
				var fill = i + 1,
					list = leftFillEdges[fill],
					fillEdges = [],
					edgeMap = {};
					
				// Append all left fill edges to general fill edges array
				if (list) push.apply(fillEdges, list);
				
				// Append all right fill edges to general fill edges array
				list = rightFillEdges[fill];
				if (list) push.apply(fillEdges, list);
				
				for (var j = 0, edge = fillEdges[0]; edge; edge = fillEdges[++j]) {
					var key = pt2key(edge.x1, edge.y1),
						list = edgeMap[key] || (edgeMap[key] = []);
					list.push(edge);
				}
				
				var recs = [],
					countFillEdges = fillEdges.length,
					l = countFillEdges - 1;
				for (var j = 0; j < countFillEdges && !recs[l]; j++) {
					var edge = fillEdges[j];
					if (!edge.c) {
						var seg = [],
							firstKey = pt2key(edge.x1, edge.y1),
							usedMap = {};
						do {
							seg.push(edge);
							usedMap[edge.i] = true;
							var key = pt2key(edge.x2, edge.y2),
								list = edgeMap[key],
								favEdge = fillEdges[j + 1],
								nextEdge = null;
							if (key == firstKey) {
								var k = seg.length;
								while (k--) {
									seg[k].c = true;
								}
								push.apply(recs, seg);
								break;
							}
							
							if (!(list && list.length)) break;
							
							for (var k = 0; list[k]; k++) {
								var entry = list[k];
								if(entry == favEdge && !entry.c) {
									list.splice(k, 1);
									nextEdge = entry;
								}
							}
							
							if (!nextEdge) {
								for(var k = 0; list[k]; k++) {
									var entry = list[k];
									if (!(entry.c || usedMap[entry.i])) nextEdge = entry;
								}
							}
							edge = nextEdge;
						} while(edge);
					}
				}
				
				var l = recs.length;
				if (l) {
					segments.push({
						records: recs,
						fill: tag.morphFillStyles.fillStyles[i],
						_index: recs[l - 1].i
					});
				}
			}
			
			var i = tag.morphLineStyles.length;
			while (i--) {
				var recs = lineEdges[i + 1];
				if (recs) {
					segments.push({
						records: recs,
						line: tag.morphLineStyles.lineStyles[i],
						_index: recs[recs.length - 1].i
					});
				}
			}
			
			segments.sort(function(a, b) {
				return a._index - b._index;
			});
			
			if (segments.length > 1) {
				edges = segments;
			} else {
				edges = segments[0];
			}
		}
		
		this.segment = edges;
	}
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	// Get SVG
	
	// For displaying in Flashbug
	var w = (b.right - b.left),
		h = (b.bottom - b.top),
		vB = ('' + [b.left, b.top, b.right - b.left, b.bottom - b.top]);
	
	// Convert to SVG //
	cmds = cmds.join(' ');
	var svg = '<svg preserveAspectRatio="none" width="' + (w * .05) + '" height="' + (h * .05) + '" viewBox="' + vB + '">'
	svg += '<g fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision" image-rendering="optimizeQuality"  text-rendering="geometricPrecision" color-rendering="optimizeQuality">';
	svg += '<path d="' + cmds + '" fill="#000" />';
	svg += '</g></svg>';
	
	this.commands = cmds; // *
	this.svg = svg; // *
};