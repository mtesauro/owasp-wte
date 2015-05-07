function ShapeWithStyle(ba, obj, tag) {
	function cloneEdge(edge) {
		return {
			i: edge.i,
			f: edge.f,
			x1: edge.x1, y1: edge.y1,
			cx: edge.cx, cy: edge.cy,
			x2: edge.x2, y2: edge.y2
		};
	}
	
	function pt2key(x, y) {
		return (x + 50000) * 100000 + y;
	}
	
	var tagType = tag.header.type;
	this.fillStyles = new FillStyleArray(ba, obj, tagType);
	this.lineStyles = new LineStyleArray(ba, obj, tagType);
	this.numFillBits = ba.readUB(4);
	this.numLineBits = ba.readUB(4);
	
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
	
	this.shapeRecords = [];
	do {
		var type = ba.readUB(1), record = null, flags = null;
		if (type) {
			var cx = null;
			var cy = null;
			var x1 = x2;
			var y1 = y2;
			
			var isStraight = ba.readBoolean();
			if (isStraight) {
				record = new StraightEdgeRecord(ba);
				if (record['deltaX'] !== undefined) x2 += record.deltaX;
				if (record['deltaY'] !== undefined) y2 += record.deltaY;
			} else {
				record = new CurvedEdgeRecord(ba);
				cx = x1 + record.controlDeltaX;
				cy = y1 + record.controlDeltaY;
				x2 = cx + record.anchorDeltaX;
				y2 = cy + record.anchorDeltaY;
			}
			
			// Get edge segment
			seg.push({
				i: i++,
				f: isFirst,
				x1: x1, y1: y1,
				cx: cx, cy: cy,
				x2: x2, y2: y2
			});
			
			isFirst = false;
		} else {
			// each seg is a edge record
			if (seg.length) {
				// Add edge records to general edges array
				push.apply(edges, seg);
				
				// Add edge records that have a left fill to left fill array
				if (leftFill) {
					var idx = fsOffset + leftFill,
						list = leftFillEdges[idx] || (leftFillEdges[idx] = []);
					for (var j = 0, edge = seg[0]; edge; edge = seg[++j]) {
						var e = cloneEdge(edge),
							tx1 = e.x1,
							ty1 = e.y1;
						e.i = i++;
						e.x1 = e.x2;
						e.y1 = e.y2;
						e.x2 = tx1;
						e.y2 = ty1;
						list.push(e);
					}
				}
				
				// Add edge records that have a right fill to right fill array
				if (rightFill) {
					var idx = fsOffset + rightFill,
						list = rightFillEdges[idx] || (rightFillEdges[idx] = []);
					push.apply(list, seg);
				}
				
				// Add edge records that have a line style to line style array
				if (line) {
					var idx = lsOffset + line,
						list = lineEdges[idx] || (lineEdges[idx] = []);
					push.apply(list, seg);
				}
				
				seg = [];
				isFirst = true;
			}
			
			flags = ba.readUB(5);
			if (flags) {
				record = new StyleChangeRecord(ba, obj, tagType, flags, this.numFillBits, this.numLineBits);
				if (record.stateMoveTo) {
					x2 = record.moveDeltaX;
					y2 = record.moveDeltaY;
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
					fsOffset = this.fillStyles.fillStyles.length;
					lsOffset = this.lineStyles.length;
					push.apply(this.fillStyles.fillStyles, record.fillStyles.fillStyles);
					push.apply(this.lineStyles, record.lineStyles);
					this.numFillBits = record.numFillBits;
					this.numLineBits = record.numLineBits;
					useSinglePath = false;
				}
			} else {
				record = new EndShapeRecord(ba, flags);
			}
		}
		
		this.shapeRecords.push(record);
	} while(type || flags);
	
	ba.align();
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	// Get edges
	var edges;
	if (useSinglePath) {
		// If single path, return object
		var fill = leftFill || rightFill;
		edges = {
			fill : fill ? this.fillStyles.fillStyles[fsOffset + fill - 1] : null,
			line : this.lineStyles.lineStyles[lsOffset + line - 1],
			records : edges
		};
	} else {
		// If multipath, return array
		var segments = [], fillStyle;
		for (var i = 0; (fillStyle = this.fillStyles.fillStyles[i]); i++) {
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
						
						var entry;
						for (var k = 0; (entry = list[k]); k++) {
							if (entry == favEdge && !entry.c) {
								list.splice(k, 1);
								nextEdge = entry;
							}
					    }
					    
					    if (!nextEdge) {
							for(var k = 0; (entry = list[k]); k++) {
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
					fill: this.fillStyles.fillStyles[i],
					_index: recs[l - 1].i
				});
			}
		}
		
		var i = this.lineStyles.length;
		while (i--) {
			var recs = lineEdges[i + 1];
			if (recs) {
				segments.push({
					records: recs,
					line: this.lineStyles.lineStyles[i],
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
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	// Get segments
	if (edges instanceof Array) {
		var segments = this.segments = [];
		for (var i = 0, seg = edges[0]; seg; seg = edges[++i]) {
			segments.push({
				type: 'Shape',
				id: tag.id + '-' + (i + 1),
				commands: edges2cmds(seg.records, !!seg.line),
				fill: seg.fill,
				line: seg.line
			});
		}
	} else if (edges) {
		this.segments = [{
			type: 'Shape',
			id: tag.id,
			commands: edges2cmds(edges.records, !!edges.line),
			fill: edges.fill,
			line: edges.line
		}];
	}
};