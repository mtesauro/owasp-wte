/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
  * @class Util class
  * Class for gunzipping, unzipping and base64 decoding of files.
  * It is used for reading GEONExT, Geogebra and Intergeo files.
  *
  * Only Huffman codes are decoded in gunzip.
  * The code is based on the source code for gunzip.c by Pasi Ojala 
  * @see <a href="http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c">http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c</a>
  * @see <a href="http://www.cs.tut.fi/~albert">http://www.cs.tut.fi/~albert</a>
  */

(function() {

/**
 * Unzip zlib files
 */
Flashbug.Zip = function (barray) {
    var outputArr = [],
        debug = false,
        buf32k = new Array(32768),
        bIdx = 0,
		
        bitReverse = [
        0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0,
        0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0,
        0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
        0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8,
        0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4,
        0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
        0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec,
        0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc,
        0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
        0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2,
        0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea,
        0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
        0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6,
        0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6,
        0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
        0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
        0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1,
        0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
        0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9,
        0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9,
        0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5,
        0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5,
        0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed,
        0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
        0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3,
        0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3,
        0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb,
        0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb,
        0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7,
        0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
        0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef,
        0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff
    ],
    
    cplens = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
    ],

    cplext = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
        3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99
    ], /* 99==invalid */

    cpdist = [
        0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d,
        0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1,
        0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01,
        0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001
    ],

    cpdext = [
        0,  0,  0,  0,  1,  1,  2,  2,
        3,  3,  4,  4,  5,  5,  6,  6,
        7,  7,  8,  8,  9,  9, 10, 10,
        11, 11, 12, 12, 13, 13
    ],
    
    border = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
    
    bA = barray,

    bb = 1,
    bits = 0;
    
    this.readByte = function() {
		bits += 8;
		
		if(bA.position < bA.length) {
			return bA.readUnsignedByte();
		} else {
			return -1;
		}
    };
	var readByte = this.readByte;

    function byteAlign() {
        bb = 1;
    };
    
    function readBit() {
        var carry;
        bits++;
        carry = (bb & 1);
        bb >>= 1;
        if (bb == 0){
            bb = readByte();
            carry = (bb & 1);
            bb = (bb >> 1) | 0x80;
        }
        return carry;
    };

    function readBits(a) {
        var res = 0, i = a;
		
        while(i--) {
            res = (res << 1) | readBit();
        }
		
        if(a) res = bitReverse[res] >> (8 - a);
        return res;
    };
	
    function flushBuffer() {
        //trace('FLUSHBUFFER:'+buf32k);
        bIdx = 0;
    };
	
    function addBuffer(a, raw) {
        buf32k[bIdx++] = a;
        outputArr.push(raw ? a : String.fromCharCode(a));
        if(bIdx == 0x8000){
            //trace('ADDBUFFER:'+buf32k);
            bIdx = 0;
        }
    };
    
    function HufNode() {
        this.b0 = 0;
        this.b1 = 0;
        this.jump = null;
        this.jumppos = -1;
    };

    var literalTree = new Array(288);
    var distanceTree = new Array(32);
    var treepos = 0;
    var Places = null;
    
    var len = 0;
    var fpos = new Array(17);
    fpos[0]=0;
    var flens;
    var fmax;
    
    function IsPat() {
        while (1) {
            if (fpos[len] >= fmax) return -1;
            if (flens[fpos[len]] == len) return fpos[len]++;
            fpos[len]++;
        }
    };

    function Rec() {
        var curplace = Places[treepos];
        var tmp;
       // if (debug) trace("len:"+len+" treepos:"+treepos);
        if(len == 17) return -1; //war 17
        treepos++;
        len++;
    	
        tmp = IsPat();
       // if (debug) trace("IsPat "+tmp);
        if(tmp >= 0) {
            curplace.b0 = tmp;    /* leaf cell for 0-bit */
           // if (debug) trace("b0 "+curplace.b0);
        } else {
			/* Not a Leaf cell */
			curplace.b0 = 0x8000;
			//if (debug) trace("b0 "+curplace.b0);
			if (Rec()) return -1;
        }
        tmp = IsPat();
        if(tmp >= 0) {
            curplace.b1 = tmp;    /* leaf cell for 1-bit */
            //if (debug) trace("b1 "+curplace.b1);
            curplace.jump = null;    /* Just for the display routine */
        } else {
            /* Not a Leaf cell */
            curplace.b1 = 0x8000;
            //if (debug) trace("b1 "+curplace.b1);
            curplace.jump = Places[treepos];
            curplace.jumppos = treepos;
            if (Rec()) return -1;
        }
        len--;
        return 0;
    };

    function CreateTree(currentTree, numval, lengths, show) {
        var i;
        /* Create the Huffman decode tree/table */
        //trace("createtree");
        Places = currentTree;
        treepos = 0;
        flens = lengths;
        fmax  = numval;
		
		i = 17;
		while(i--) {
            fpos[i] = 0;
		}
		
        len = 0;
		
        if (Rec()) {
            if (debug) trace("invalid huffman tree");
            return -1;
        }
        return 0;
    };
    
    function DecodeValue(currentTree) {
        var len, i = 0,
            xtreepos = 0,
            X = currentTree[xtreepos],
            b;
		
        /* decode one symbol of the data */
        while(1) {
            b = readBit();
            if(b) {
                if(!(X.b1 & 0x8000)) return X.b1;    /* If leaf node, return data */
                X = X.jump;
                len = currentTree.length;
				while(i < len) {
                    if (currentTree[i] === X) {
                        xtreepos = i;
                        break;
                    }
					i++;
                }
                //xtreepos++;
            } else {
                if(!(X.b0 & 0x8000)) return X.b0;    /* If leaf node, return data */
                //X++; //??????????????????
                xtreepos++;
                X = currentTree[xtreepos];
            }
        }
        return -1;
    };
	
	this.deflate = function(parseLimit) {
		var t = this,
			b = bA._buffer,
			o = bA.position,
			data = b.substr(0, o) + t.unzip(false, parseLimit);
		bA.length = data.length;
		bA.position = o;
		bA._buffer = data;
		return bA;
	},
    
	this.unzip = function(raw, parseLimit) {
		var last, c, type, i, len;
		
		var tmp = [];
		tmp[0] = readByte();
		tmp[1] = readByte();
		if (tmp[0] == 0x78 && tmp[1] == 0xDA && debug) trace('Is ZLIB');
		
		do {
			postMessage({
				type: "progress",
				percent: 'Unzipping... ' + ((bA.position / bA.length) * 100).toFixed(2) + '%'
			});
			
			/*if((last = readBit())){
				trace("Last Block: ");
			} else {
				trace("Not Last Block: ");
			}*/
			last = readBit();
			type = readBits(2);
			switch(type) {
				case 0:
					if (debug) trace("Stored");
					break;
				case 1:
					if (debug) trace("Fixed Huffman codes");
					break;
				case 2:
					if (debug) trace("Dynamic Huffman codes");
					break;
				case 3:
					if (debug) trace("Reserved block type!!");
					break;
				default:
					if (debug) trace("Unexpected value %d!", type);
					break;
			}
			
			if(type == 0) {
				var blockLen, cSum;
				
				// Stored 
				byteAlign();
				blockLen = readByte();
				blockLen |= (readByte()<<8);
				
				cSum = readByte();
				cSum |= (readByte()<<8);
				
				if(((blockLen ^ ~cSum) & 0xffff)) {
					trace("BlockLen checksum mismatch");
				}
				
				while(blockLen--) {
					c = readByte();
					addBuffer(c, raw);
				}
			} else if(type == 1) {
				var j;
				
				/* Fixed Huffman tables -- fixed decode routine */
				while(1) {
					/*
						256    0000000        0
						:   :     :
						279    0010111        23
						0   00110000    48
						:    :      :
						143    10111111    191
						280 11000000    192
						:    :      :
						287 11000111    199
						144    110010000    400
						:    :       :
						255    111111111    511
						
						Note the bit order!
						*/
						
					j = (bitReverse[readBits(7)] >> 1);
					
					if(j > 23) {
						j = (j << 1) | readBit();    /* 48..255 */
						
						if(j > 199) {    /* 200..255 */
							j -= 128;    /*  72..127 */
							j = (j << 1) | readBit();        /* 144..255 << */
						} else {        /*  48..199 */
							j -= 48;    /*   0..151 */
							if(j > 143) {
								j = j+136;    /* 280..287 << */
								/*   0..143 << */
							}
						}
					} else {    /*   0..23 */
						j += 256;    /* 256..279 << */
					}
					
					if(j < 256) {
						addBuffer(j, raw);
						//trace("out:"+String.fromCharCode(j));
						/*trace("@%d %02x\n", SIZE, j);*/
					} else if(j == 256) {
						/* EOF */
						break;
					} else {
						var len, dist;
						
						j -= 256 + 1;    /* bytes + EOF */
						len = readBits(cplext[j]) + cplens[j];
						
						j = bitReverse[readBits(5)]>>3;
						if(cpdext[j] > 8) {
							dist = readBits(8);
							dist |= (readBits(cpdext[j]-8)<<8);
						} else {
							dist = readBits(cpdext[j]);
						}
						dist += cpdist[j];
						
						/*trace("@%d (l%02x,d%04x)\n", SIZE, len, dist);*/
						j = 0;
						while(j < len) {
							var c = buf32k[(bIdx - dist) & 0x7fff];
							addBuffer(c, raw);
							j++;
						}
					}
				} // while
			} else if(type == 2) {
				var j = 19, n, literalCodes, distCodes, lenCodes, ll = new Array(288+32);    // "static" just to preserve stack
				
				// Dynamic Huffman tables 
				
				literalCodes = 257 + readBits(5);
				distCodes = 1 + readBits(5);
				lenCodes = 4 + readBits(4);
				//trace("param: "+literalCodes+" "+distCodes+" "+lenCodes+);
				while(j--) {
					ll[j] = 0;
				}
				
				// Get the decode tree code lengths
				
				j = 0;
				while(j < lenCodes) {
					ll[border[j]] = readBits(3);
					//trace(ll[border[j]]+" ");
					j++;
				}
				//trace('ll:'+ll);
				i = distanceTree.length;
				while(i--) {
					distanceTree[i] = new HufNode();
				}
				
				if(CreateTree(distanceTree, 19, ll, 0)) {
					flushBuffer();
					return 1;
				}
				
				//trace('tree created');
				
				//read in literal and distance code lengths
				n = literalCodes + distCodes;
				i = 0;
				var z = -1;
				
				while(i < n) {
					z++;
					j = DecodeValue(distanceTree);
					//if (debug) trace(z+" i:"+i+" decode: "+j+"\tbits "+bits);
					if(j < 16) {    // length of code in bits (0..15)
						ll[i++] = j;
					} else if(j == 16) {    // repeat last length 3 to 6 times 
						var l;
						j = 3 + readBits(2);
						
						if(i + j > n) {
							flushBuffer();
							return 1;
						}
						
						l = i ? ll[i-1] : 0;
						while(j--) {
							ll[i++] = l;
						}
					} else {
						if(j == 17) {        // 3 to 10 zero length codes
							j = 3 + readBits(3);
						} else {        // j == 18: 11 to 138 zero length codes 
							j = 11 + readBits(7);
						}
						
						if(i+j > n) {
							flushBuffer();
							return 1;
						}
						
						while(j--) {
							ll[i++] = 0;
						}
					}
				}
				
				// Can overwrite tree decode tree as it is not used anymore
				i = literalTree.length;
				while(i--) {
					literalTree[i] = new HufNode();
				}
				
				if(CreateTree(literalTree, literalCodes, ll, 0)) {
					flushBuffer();
					return 1;
				}
				
				i = literalTree.length;
				while(i--) {
					distanceTree[i] = new HufNode();
				}
				
				var ll2 = new Array();
				i = literalCodes;
				len = ll.length;
				while(i < len) {
					ll2[i - literalCodes] = ll[i];
					i++;
				}
				
				if(CreateTree(distanceTree, distCodes, ll2, 0)) {
					flushBuffer();
					return 1;
				}
				
				if (debug) trace("literalTree");
				while(1) {
					j = DecodeValue(literalTree);
					if(j >= 256) {        // In C64: if carry set
						var len, dist;
						j -= 256;
						if(j == 0) break;// EOF
						j--;
						len = readBits(cplext[j]) + cplens[j];
						
						j = DecodeValue(distanceTree);
						if(cpdext[j] > 8) {
							dist = readBits(8);
							dist |= (readBits(cpdext[j]-8)<<8);
						} else {
							dist = readBits(cpdext[j]);
						}
						
						dist += cpdist[j];
						while(len--) {
							var c = buf32k[(bIdx - dist) & 0x7fff];
							addBuffer(c, raw);
						}
					} else {
						addBuffer(j, raw);
					}
				}
			}
			
			if(parseLimit > 0 && outputArr.length > parseLimit) last = true;
			
		} while(!last);
		
		return raw ? outputArr : outputArr.join('');
	};
};

})();