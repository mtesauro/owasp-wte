/* ========================================================================= //
# vi:  set ts=4:
# vim: set ts=4:
#
# // ToDo: http://blog.modsecurity.org/2010/04/impedance-mismatch-and-base64.html
# // ToDo:      Impedance Mismatch and Base64
#               1) Take an attack string: <script>alert(1)</script>
#               2) Base64 encode it to: PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==
#               3) Now add an illegal character: P.HNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==
#               4) Notice that most decoders will not work, but PHP's will (act surprised)
# was ist: PHNjcml«ÔÑÒÉŽ!!!» wdD5hbGVydCgxKTwvc2NyaXB0Pg==  (siehe Link)
#
# // ToDo: .B64.DE  NOT YET IMPLEMENTED
#?
#? NAME
#?      EnDeB64.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDe.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeB64.js"></SCRIPT>
#?
#? DESCRIPTION
#?      Definitions and functions for various Base-XX functions.
#?
#?      Defines  EnDe.B64 object.
#?
#?      Notes on RFCs:
#?      RFC4648 based on: RFC3548
#?      RFC3548 based on: RFC1521
#?      RFC1521 based on: RFC1341 MIME: Multipurpose Internet Mail Extensions
#?      RFC1341 based on: RFC1113 Privacy Enhancement for Internet Electronic Mail
#?     		(RFC1341 does not allow * in Base64 !! )
#?      RFC1421: Privacy Enhancement for Internet Electronic Mail
#?      RFC1113: Privacy Enhancement for Internet Electronic Mail
#?     		(RFC1113 allows * in Base64 !! )
#?      HTTP Basic Auth is supposed to be RFC2045 (MIME), not RFC3548/4648.
#?
#?      Cites from above RFCs:
#?      Both RFC3548 and the revised version of that (RFC4648) state:
#?          "Implementations MUST reject the encoded data if it contains
#?           characters outside the base alphabet when interpreting base-
#?           encoded data, unless the specification referring to this
#?           document explicitly states otherwise."
#?
#?      Other resources:
#?          http://www.crockford.com/wrmg/base32.html
#?          http://en.wikipedia.org/wiki/Base64
#?      Url64 based on: RFC1521
#?     	    http://help.sap.com/SAPHELP_NW04S/helpdata/EN/cb/7d533b8286ad4fb7ab481f5866b6b3/content.htm
#?     	    http://help.sap.com/saphelp_nwes70/helpdata/EN/cb/7d533b8286ad4fb7ab481f5866b6b3/content.htm
#?     	    https://cw.sdn.sap.com/cw/docs/DOC-39850
#?
#?      (all above references as seen in May 2010)
#?
#?      Note that the object name `B64' may be related to `base64' even this
#?      object covers more such encodings. Consider B64 as a historic name.
#?
#? SEE ALSO
#?      EnDe.js
#?
#? HACKER's INFO
#?      This file executes some initializations of EnDe.* when loaded see at
#?      end of file here. This requires that some object are already defined
#?      in EnDe.js.
#?      Usage of EnDe.Text.Entity() must be only for debugging as this object
#?      EnDe.Text is not yet part or the librray.
#?
#? VERSION
#?      @(#) EnDeB64.js 3.1 12/06/05 00:02:10
#?
#? AUTHOR
#?      29-mai-10 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

// ========================================================================= //
// Encoding, Decoding Base-XX functions                                      //
// ========================================================================= //

if (typeof(EnDe)==='undefined') { EnDe = new function() {}; }

EnDe.B64    = new function() {
	this.SID    = '3.1';
	this.sid    = function() {       return(EnDe.sid() + '.B64'); };

	this.trace  = false;

	// ===================================================================== //
	// internal/private functions                                            //
	// ===================================================================== //

	function __dbx(t,n) { if (EnDe.B64.trace===true) { EnDeGUI.dpr(t,n); } };
	function __spr(src) { EnDeGUI.spr(src); };
	/* __spr() wrapper needs to be defined this way as this file may be included
	 * before or without EnDeGUI.js which results in an undefined EnDeGUI object
	 * // ToDo: still not perfect ..
	 */

	// ===================================================================== //
	// global constants                                                      //
	// ===================================================================== //

	// borrow from EnDe.CONST.CHR. ...
	this.LC     = EnDe.CONST.CHR.LC;                    // [a-z]
	this.UC     = EnDe.CONST.CHR.UC;                    // [A-Z]
	this.b10    = EnDe.CONST.CHR.DIGITS;                // [0-9]
	this.b26    = this.LC  + this.b10;                  // [a-z0-9]
	this.base64 = this.UC  + this.LC  + this.b10;       // [A-Za-z0-9] temporary, for useage below
	/* Note that for Base64 sequence *must* be A-Za-z0-9 !  */
	// no ToDo: above 4 assignments most likely fail in IE8
	// Base-XX constants
	this.line   = 76;                                   // max line size according RFC1521
//	this.line   = 64;                                   // alternate max line size according RFC4648
	this.crnl   = '\r\n';                               // line separator if needed
	this.pad    = '=';                                  // padding character RFC1521
	this.map    = {
		// text encodings
		'base16': this.b10 + 'ABCDEF',                  // [0-9A-F]
		'base26': this.LC,                              // [a-z]
		'base32': this.UC  + '234567',                  // [A-Z2-7] RFC3548, RFC4648
		'base32h':'0123456789ABCDEFGHIJKLMNOPQRSTUV',   // [0-9A-V] RFC4648
		'base32c':'0123456789ABCDEFGHJKMNPQRSTVWXYZ',   // [0-9A-HJKMNP-TV-Z] Crockford Alphabet
		'base32n':'0123456789BCDFGHJKLMNPQRSTVWXYZ.',   // [0-9BCDFGHJKLMNPQRSTVWXYZ.] (no vowels)
		'base32z':'ybndrfg8ejkmcpqxot1uwisza345h769',   // [A-UW-Z3-9] z-Base32 optimized
		'base36': this.b26 + this.b10,                  // [a-z0-9]
		'base52': this.UC  + this.LC,                   // [A-Za-z]
		'base64': this.base64 + '+/',                   // RFC1521, RFC2045, RFC3548, RFC4648
		'base64f':this.base64 + '+-',                   // modified Base64 for filenames, SAP
		'base64p':this.base64 + '_-',                   // modified Base64 for program identifiers (var. 1)
		'base64q':this.base64 + '._',                   // modified Base64 for program identifiers (var. 2)
		'base64r':this.base64 + '!-',                   // modified Base64 for regular Expressions
		'base64u':this.base64 + '-_',                   // modified Base64 for URL, RFC4648
		'base64x':this.base64 + '.-',                   // modified Base64 for XML name tokens
		'base64y':this.base64 + '_:',                   // modified Base64 for XML identifiers
		'base85': this.b10 + this.UC + this.LC + '!#$%&()*+-;<=>?@^_`{|}~', // RFC1941, RFC1924
			/* Adobe's PostScript adds 33 to each (4-bit) byte, hence the values are 33 .. 117
			 * which represents the ASCII range ! .. u
			 */
		// number encodings
		'base91': this.UC + this.LC + this.b10 + '!#$%&()*+,./:;<=>?@[]^_`{|}~"',
		'basE91': '',  // same as base91, set at end
		'base34': '123456789ABCDEFGHIJKLMNPQRSTUVWXYZ', // [1-9A-NP-Z]
		'base62': this.b10 + this.LC  + this.UC,        // [0-9A-Za-z]
		'base62x':this.b10 + this.UC  + this.LC,        // [0-9a-zA-Z] alternate, // ToDo: is this valid?
		'base58': '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz', // [0-9A-Za-z] exclude IOio
		// misc (unknown) encodings
		'base94': '!#$%&' + "'" + '()*+,-./' + this.b10 + ':;<=>?@' + this.UC + '[\]^_`' + this.LC + '{|}~',
		'base95': '', // needs be set at end
		'dumm':  ''
		};
	this.bits   = {                                     // number of bits used for encoding
		'base16':   4,
		'base26':   5,
		'base32':   5,
		'base32c':  5,
		'base32h':  5,
		'base32z':  5,
		'base34':   6,
		'base36':   6,
		'base52':   6,
		'base58':   6,
		'base62':   6,
		'base64':   6,
		'base64f':  6,
		'base64p':  6,
		'base64q':  6,
		'base64r':  6,
		'base64u':  6,
		'base64x':  6,
		'base64y':  6,
		'base85':   7,
		'base91':   7,
		'base94':   7,
		'base95':   7,
		'dumm':     8
	};
	this.map['b64'] = this.map['base64'];               // backward compatibility
	this.map['u64'] = this.map['base64u'];              // backward compatibility

	// ===================================================================== //
	// global functions                                                      //
	// ===================================================================== //

	this.isB16  = function(src) { return this.is('base16',  src); }
	//#? return true if string consist of base16 characters only

	this.isB26  = function(src) { return this.is('base26',  src); }
	//#? return true if string consist of base64 characters only

	this.isB34  = function(src) { return this.is('base34',  src); }
	//#? return true if string consist of base34 characters only

	this.isB36  = function(src) { return this.is('base36',  src); }
	//#? return true if string consist of base64 characters only

	this.isB52  = function(src) { return this.is('base52',  src); }
	//#? return true if string consist of base64 characters only

	this.isB58  = function(src) { return this.is('base58',  src); }
	//#? return true if string consist of base64 characters only

	this.isB62  = function(src) { return this.is('base62',  src); }
	//#? return true if string consist of base64 characters only

	this.isB32c = function(src) { return this.is('base32c', src); }
	//#? return true if string consist of Crockford base32 characters only

	this.isB32h = function(src) { return this.is('base32h', src); }
	//#? return true if string consist of base32hex characters only

	this.isB32z = function(src) { return this.is('base32z', src); }
	//#? return true if string consist of z-base32 characters only

	this.isB32  = function(src) { return this.is('base32',  src); }
	//#? return true if string consist of base32 characters only

	this.isB64  = function(src) { return this.is('base64',  src); }
	//#? return true if string consist of base64 characters only

	this.isU64  = function(src) { return this.is('base64u', src); }
	//#? return true if string consist of url64 characters only

	this.init     = function() {
	//# initialize some arrays
		var a = 0;
		// ------------ define Base64  Array for old (<=0.1.69) .b64() function
		for (a=0; a<this.map['base64'].length ;a++) {
			EnDe.b64Char[a] = this.map['base64'].charAt(a);
			EnDe.b64Code[this.map['base64'].charAt(a)] = a;
		}
	}; // .init

	this.is   = function(type,src) {
	//#? return true if string is of given type
		switch (type) {
		  case 'b64':     // for backward compatibility (<= 0.1.69)
		  case 'u64':     // for backward compatibility (<= 0.1.69)
		  case 'base16':
		  case 'base26':
		  case 'base32c':
		  case 'base32h':
		  case 'base32z':
		  case 'base32':
		  case 'base34':
		  case 'base36':
		  case 'base52':
		  case 'base58':
		  case 'base62':
		  case 'base64':
		  case 'base64f':
		  case 'base64p':
		  case 'base64q':
		  case 'base64r':
		  case 'base64u':
		  case 'base64x':
		  case 'base64y':
		  case 'base85':
		  case 'base91':
		  case 'base94':
		  case 'base95':
			return src.match('[^' + this.map[type]  + this.pad + ']')===null ? true : false;
			break;
		}
		// no ToDo: IE8 bails out with error in last case; seems that only 19 continous cases are possible there, stupid ...
		return false;
	}; // .is

  this.EN    = new function() {

	this.b_N      = function(type,src,linewrap) {
	//#? convert plain text to BaseXX encoded text
	//#type? base16:   Base16
	//#type? base26:   Base26
	//#type? base32:   Base32
	//#type? base32c:  Base32 (Crockford alphabet)
	//#type? base32h:  Base32hex
	//#type? base32z:  z-Base32
	//#type? base34:   Base34
	//#type? base36:   Base36
	//#type? base52:   Base52
	//#type? base64:   Base64 as in RFC1521, RFC2045, RFC3548, RFC4648
	//#type? base64f:  modified Base64 for filenames, SAP
	//#type? base64p:  modified Base64 for program identifiers (var. 1)
	//#type? base64q:  modified Base64 for program identifiers (var. 2)
	//#type? base64r:  modified Base64 for regular Expressions
	//#type? base64u:  modified Base64 for URL, RFC4648
	//#type? base64x:  modified Base64 for XML name tokens
	//#type? base64y:  modified Base64 for XML identifiers
	//#type? base85:   Base85
	//#type? base91:   basE91
	//#type? base94:   base94
	//#type? base95:   base95
	// type? base34:   Base34
	// type? base58:   Base58
	// type? base62:   Base62
		__dbx('EnDe.B64.EN.d_N(' + type + ', >>' + EnDe.Text.Entity(src) + '<<, ' + linewrap + ')');
		var bux = [];
		var i   = 0;
		var arr = EnDe.str2bytes(src); // byte encoding but we may get Unicode as well ..
		var ccc = 0;
		var pos = 0;
		var bits= 6;     // default, for Base64
		var mask= 0x3f;  // 63
		switch (type) {
		  case 'base16':
		  case 'base26':
		  case 'base32':
		  case 'base32c':
		  case 'base32h':
		  case 'base32z':
		  case 'base34':
		  case 'base36':
		  case 'base52':
		  case 'base58':
		  case 'base64':
		  case 'base64f':
		  case 'base64p':
		  case 'base64q':
		  case 'base64r':
		  case 'base64u':
		  case 'base64x':
		  case 'base64y':
		  case 'base85':
	      case 'base91':
	      case 'base94':
	      case 'base95':
			bits = EnDe.B64.bits[type];
			break;
		  default:  // ToDo: NOT YET IMPLEMENTED
			bits = parseInt(type, 10);
			if (isNaN(bits)) { bits = 6; }
			return ''; // ToDo: wrong usage
			break;
		}
		mask = (1 << bits) - 1;
		while (i<arr.length) {
			if (i>=(arr.length-1) && (pos>=8)) { break; }
			if ((8 - pos)>=bits) {
				ccc = arr[i] >> (8 - bits - pos);
			    bux[bux.length] = EnDe.B64.map[type].charAt(ccc & mask);
				pos = pos + bits
				if (pos===8) {
					pos = 0;
					i++;
				}
			} else {
				ccc = arr[i] << (bits - (8 - pos));
				pos = pos + bits
				if (pos>8) {
					pos = pos - 8;
					i++;
					if (i<arr.length) {
						ccc = ccc | (arr[i] >> (8 - pos));
					}
				}
			    bux[bux.length] = EnDe.B64.map[type].charAt(ccc & mask);
			}
		}
	
		// finalize padding
		switch (type) {
		  case 'base16':  break; // not necessary
		  case 'base32':
		  case 'base32c':
		  case 'base32h':
		  case 'base32z': while ((bux.length%8)>0) { bux[bux.length] = EnDe.B64.pad; }; break;
		  case 'base64':
		  case 'base64f':
		  case 'base64p':
		  case 'base64q':
		  case 'base64r':
		  case 'base64u':
		  case 'base64x':
		  case 'base64y': while ((bux.length%4)>0) { bux[bux.length] = EnDe.B64.pad; }; break;
		  default:        break; // nothing to do
		}
		if (linewrap > 3) {
			/* need to check myself as JavaScript's RegExp is too stupid for some
			 * values (i.e. negative values), also less than 3 is not practicable */
			/* need to remove trailing \n added by left-most replace() */
			var rex = new RegExp('(.{1,'+linewrap+'})','g');
			bux = bux.join('').toString().replace(rex, function(c){return c+'\n';}).replace(/\n$/, '');
			//return bux.join('').toString().replace(rex, function(c){return c+'\n';});
		} else {
			bux = bux.join('');
		}
		__dbx('EnDe.B64.EN.d_N: >>' + EnDe.Text.Entity(bux) + '<<');
		return bux;
	}; // .b_N

	this.b64      = function(src,linewrap) {
	//#? convert plain text to Base64 encoded text
		__spr('EnDe.B64.EN.b64(<src>): DEPRECATED Base64 encoder');
		var bux = [];
		var i   = 0;
		var arr = EnDe.str2bytes(src); // Base64 is a byte encoding ..
		var len =arr.length;
		var c1  = 0, c2 = 0, c3 = 0;
		// prepare padding (ensure that string is multiple of 6 bit)
		if ((len % 3)===1) { arr.push(0); }
		if ((len % 3)===2) { arr.push(0); }
		while (i<arr.length) {
			c1 = arr[i]; c2 = arr[i+1]; c3 = arr[i+2];
			i += 3;
			bux[bux.length] = EnDe.b64Char[ (c1   )>>2];
			bux[bux.length] = EnDe.b64Char[((c1& 3)<<4) | (c2>>4)];
			bux[bux.length] = EnDe.b64Char[((c2&15)<<2) | (c3>>6)];
			bux[bux.length] = EnDe.b64Char[ (c3&63)];
		}
		// finalize padding
		if ((len % 3)===1) { bux[bux.length-1] = bux[bux.length-2] = EnDe.B64.pad; }
		if ((len % 3)===2) { bux[bux.length-1] = EnDe.B64.pad; }
		if (linewrap > 3) {
			/* need to check myself as JavaScript's RegExp is too stupid for some
			 * values (i.e. negative values), also less than 3 is not practicable */
			var rex = new RegExp('(.{1,'+linewrap+'})','g');
			return bux.join('').toString().replace(rex, function(c){return c+'\n';});
		} else {
			return bux.join('');
		}
		__dbx('EnDe.B64.EN.b64: >>' + EnDe.Text.Entity(bux) + '<<');
	}; // .b64

	this.u64      = function(src,linewrap) {
	//#? convert plain text to Url64 encoded text
		return this.b64(src, linewrap).replace(/\//g,'_').replace(/\+/g,'-'); // RFC3548
	}; // .u64

	this.b62      = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,linewrap) {
	//#? convert plain text to Base62 encoded text
// ToDo: ** not yet ready **
	function to(chr) {
		var ccc = EnDe.b64Code[chr];
		if (ccc===undefined) { return EnDe.b64Char[0]; }
		var bux = '';
		while(ccc > 0) {
            bux = EnDe.b64Char[ccc%62] + bux;
            ccc = parseInt((ccc / 62), 10);
        }
		return bux;
		}
		var bux = '';
		var i   = 0;
		for (i=0; i<src.length; i++) {
			bux += to(src[i]);
		}
		return bux;
	}; // .b62

	this.dispatch = function(type,_n2_,_n3_,src,_n5_,_n6_,linewrap) {
	//#? wrapper for base-XX functions
		__spr('EnDe.B64.EN.dispatch(' + type + ', >>' +  EnDe.Text.Entity(src) + '<<,' + linewrap + ')');
		switch (type) {
			// text encodings
		  case 'base16':
		  case 'base26':
		  case 'base32h':
		  case 'base32c':
		  case 'base32z':
		  case 'base32':
		  case 'base36':
		  case 'base52':
		  case 'base64':
		  case 'base64f':
		  case 'base64p':
		  case 'base64q':
		  case 'base64r':
		  case 'base64u':
		  case 'base64x':
		  case 'base64y':
		  case 'base85':
		  case 'base91':
		  case 'base94':
		  case 'base95':    return this.b_N(type, src, linewrap); break;
		  case 'base64old': return this.b64(      src, linewrap); break;
		  case 'url64':     return this.u64(      src, linewrap); break;
			// number encodings
		  case 'base34':
		  case 'base58':
		  case 'base62':    return this.b62('null',  '', '', src, '', '', linewrap); break;
			// NOT YET IMPLEMENTED: return empty string
		  case 'basexx':    return ''; break; // ToDo:
		  default:                     break;
		}
		return null; // ToDo: internal error
	}; // .dispatch

  }; // .EN

  this.DE   = new function() {

/*
 * from: http://www.ietf.org/rfc/rfc1341.txt

   ... All line breaks
   or other characters not found in Table 1 must be ignored  by
   decoding  software.   In  base64 data, characters other than
   those in  Table  1,  line  breaks,  and  other  white  space
   probably  indicate  a  transmission  error,  about  which  a
   warning  message  or  even  a  message  rejection  might  be
   appropriate under some circumstances.

 * from: http://www.ietf.org/rfc/rfc1521.txt

   Any characters outside of the base64 alphabet are to be ignored in
   base64-encoded data.  The same applies to any illegal sequence of
   characters in the base64 encoding, such as "====="

   Care must be taken to use the proper octets for line breaks if base64
   encoding is applied directly to text material that has not been
   converted to canonical form.  In particular, text line breaks must be
   converted into CRLF sequences prior to base64 encoding. The important
   thing to note is that this may be done directly by the encoder rather
   than in a prior canonicalization step in some implementations.

 * from: http://www.ietf.org/rfc/rfc3548.txt
 * and:  http://www.ietf.org/rfc/rfc4648.txt

   Implementations MUST reject the encoding if it contains characters
   outside the base alphabet when interpreting base encoded data, unless
   the specification referring to this document explicitly states
   otherwise.  Such specifications may, as MIME does, instead state that
   characters outside the base encoding alphabet should simply be
   ignored when interpreting data ("be liberal in what you accept").
   Note that this means that any CRLF constitute "non alphabet
   characters" and are ignored.  Furthermore, such specifications may
   consider the pad character, "=", as not part of the base alphabet
   until the end of the string.  If more than the allowed number of pad
   characters are found at the end of the string, e.g., a base 64 string
   terminated with "===", the excess pad characters could be ignored.

 */

	this.b_N    = function(type,src) {
	//#? convert BaseXX encoded text to plain text
	//#type? base16:   Base16
	//#type? base26:   Base26
	//#type? base32:   Base32
	//#type? base32c:  Base32 (Crockford alphabet)
	//#type? base32h:  Base32hex
	//#type? base32z:  z-Base32
	//#type? base36:   Base36
	//#type? base52:   Base52
	//#type? base64:   Base64 as in RFC1521, RFC2045, RFC3548, RFC4648
	//#type? base64f:  modified Base64 for filenames, SAP
	//#type? base64p:  modified Base64 for program identifiers (var. 1)
	//#type? base64q:  modified Base64 for program identifiers (var. 2)
	//#type? base64r:  modified Base64 for regular Expressions
	//#type? base64u:  modified Base64 for URL, RFC4648
	//#type? base64x:  modified Base64 for XML name tokens
	//#type? base64y:  modified Base64 for XML identifiers
	// type? base34:   Base34
	// type? base58:   Base58
	// type? base62:   Base62
		__dbx('EnDe.B64.DE.b_N(' + type + ', >>' + EnDe.Text.Entity(src) + '<<');
		var bux = '';
		var i   = 0;
		var ccc = 0;
		var pos = 0;
		var bits= 6;     // default, for Base64
		var mask= 0x3f;  // 63
		switch (type) {
		  case 'base16':
		  case 'base26':
		  case 'base32':
		  case 'base32c':
		  case 'base32h':
		  case 'base32z':
		  case 'base34':
		  case 'base36':
		  case 'base52':
		  case 'base58':
		  case 'base62':
		  case 'base64':
		  case 'base64f':
		  case 'base64p':
		  case 'base64q':
		  case 'base64r':
		  case 'base64u':
		  case 'base64x':
		  case 'base64y':
		  case 'base85':
		  case 'base91':
		  case 'base94':
		  case 'base95':
			bits = EnDe.B64.bits[type];
			break;
		  default:  // ToDo: NOT YET IMPLEMENTED
			bits = parseInt(type, 10);
			if (isNaN(bits)) { bits = 6; }
			return ''; // ToDo: wrong usage
			break;
		}
		mask = (1 << bits) - 1;
		src=src.replace(/\n|\r/g,'');   // remove formating line breaks
		src=src.replace(/=/g,'');       // remove padding
		while (i<src.length) {
			/*
			if ((8 - pos)>=bits) {
				ccc = src.charAt(i) << (8 - bits - pos);
			} else {
			}
			r[r.length] = ( (EnDe.b64Code[c1]    <<2) | (EnDe.b64Code[c2]>>4));
			r[r.length] = (((EnDe.b64Code[c2]&15)<<4) | (EnDe.b64Code[c3]>>2));
			r[r.length] = (((EnDe.b64Code[c3]&3 )<<6) | (EnDe.b64Code[c4])   );
			i += 4;
			*/
			i++;
		}
		__dbx('EnDe.B64.DE.b_N: >>' + EnDe.Text.Entity(bux) + '<<');
	 	return bux;
	}; // .b_N

	this.b64    = function(src) {
	//#? convert Base64 encoded text to plain text
// ToDo: convertion fails for character codes > 255
		__spr('EnDe.B64.DE.b64(<src>): DEPRECATED Base64 decoder');
		var bux = '';
		var r   = [];
		var i   = 0;
		var c1  = 0, c2 = 0, c3 = 0, c4 = 0;
		src=src.replace(/\n|\r/g,'');   // remove formating line breaks
		src=src.replace(/=/g,'');       // remove padding
		while (i<src.length) {
			c1 = src.charAt(i);
			c2 = src.charAt(i+1);
			c3 = src.charAt(i+2);
			c4 = src.charAt(i+3);
			r[r.length] = ( (EnDe.b64Code[c1]    <<2) | (EnDe.b64Code[c2]>>4));
			r[r.length] = (((EnDe.b64Code[c2]&15)<<4) | (EnDe.b64Code[c3]>>2));
			r[r.length] = (((EnDe.b64Code[c3]&3 )<<6) | (EnDe.b64Code[c4])   );
			i += 4;
		}
		// finalize padding
		if ((src.length % 4)===2) { r = r.slice(0, r.length-2); }
		if ((src.length % 4)===3) { r = r.slice(0, r.length-1); }
		// convert back to string
		for (i=0; i<r.length; i++) {
			bux += String.fromCharCode(r[i]);
		}
		c1 = null; c2 = null; c3 = null; c4 = null;
		__dbx('EnDe.B64.DE.b64: >>' + EnDe.Text.Entity(bux) + '<<');
	 	return bux;
	}; // .b64

	this.u64    = function(src) {
	//#? convert Url64 encoded text to plain text
		return this.b64(src.replace(/\-/g,'+').replace(/_/g,'/'));
	}; // .u64

	this.dispatch   = function(type,mode,_n3_,src,_n5_,_n6_,_n7_) {
	//#? wrapper for base-XX functions; mode may be used to allow "Impedanz Mismatch"
	//#mode? strict:  allow valid chars only and need proper padding
	//#mode? lazy:    allow valid chars only but padding is optional
	//#mode? verbose: invalid characters are ignored, padding is optional
		__spr('EnDe.B64.DE.dispatch(' + type + ', ' + mode + ', >>' + EnDe.Text.Entity(src) + '<<)');
		var regexReg = /[\/\[\]\\]/gi;  // escape / too, as some engines are too stupid
		var validChr = EnDe.B64.pad + EnDe.B64.map[type];
		validChr = RegExp('[^' + validChr.replace(regexReg, function(c){return '\\' + c;}) + ']', 'g');
		switch (mode) {
		  case 'verbose':   src = src.replace(validChr, ''); break;
		  case 'strict':    if (validChr.test(src)===true) { return src; }; break;
// ToDo: strict needs to check for proper padding
		  case 'lazy':
		  default:          if (validChr.test(src)===true) { return src; }; break;
		}
		switch (type) {
			// text encodings
		  case 'base16':
		  case 'base26':
		  case 'base32h':
		  case 'base32c':
		  case 'base32z':
		  case 'base32':
		  case 'base36':
		  case 'base52':
		  case 'base64f':
		  case 'base64p':
		  case 'base64q':
		  case 'base64r':
//		  case 'base64u':
		  case 'base64x':
		  case 'base64y':
		  case 'base85':
		  case 'base91':
		  case 'base94':
		  case 'base95':    return this.b_N(type, src); break;
		  case 'base64':    return this.b64(      src); break;
		  case 'base64old': return this.b64(      src); break;
		  case 'base64u':
		  case 'url64':     return this.u64(      src); break;
			// number encodings
		  case 'base34':
		  case 'base58':
//		  case 'base62':    return this.b62('null',  mode, '', src, '', '', ''); break;
			// NOT YET IMPLEMENTED: return empty string
		  case 'base62':    return ''; break; // ToDo:
		  case 'basexx':    return ''; break; // ToDo:
		  default:                     break;
		}
		return null; // ToDo: internal error
	}; // .dispatch

  }; // .DE

}; // EnDe.B64
EnDe.B64.map['base95'] = ' ' + EnDe.B64.map['base94'];
EnDe.B64.map['basE91'] = EnDe.B64.map['base91'];

// ========================================================================= //
// Initializations when loading                                              //
// ========================================================================= //

EnDe.B64.init();
