/* ========================================================================= //
// vi:  ts=4:
// vim: ts=4:
#?
#? NAME
#?      EnDe.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDe.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="aes.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="crc.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="md4.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="md5.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="rmd.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="sha.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="sha512.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="blowfish.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeB64.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeMaps.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeIP.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeTS.js"></SCRIPT>
#?
#?      Additional for testing:
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeTest.js"></SCRIPT>
#?
#?      Additional user defined functions:
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeUser.js"></SCRIPT>
#?
#? DESCRIPTION
#?      Functions for encoding, decoding and converting from and to plain text.
#?      Functions for various timestamp and IP conversions.
#?
#? SEE ALSO
#?      crc.js, aes.js, md4.js, md5.js, sha.js, sha512.js, rmd.js, blowfish.js
#?      EnDeB64.js, EnDeMaps.js, EnDeUser.js, EnDeTest.js
#?
#? HACKER's INFO
#       // ToDo: character maps:
#          1. define a new data structure which distinguishes characters sets
#             from encoded characters (which is cureently mixed: see CP-1252)
#            a) one table for characters and their encodings
#            b) one table for character sets (ASCII, EBCDIC, Mac OS, ...)
#             then implemt this.cp(), this.a2e(), this.e2a() in a new general
#             function: this.c2c(from,to,src)
#?   Special tags:
#?      //#? some text
#?              The special tag  //#? is used for a short description text. It
#?              must appear right after the function definition line. The text
#?              following the tag is used as description of the function.
#?              This tag is used in some generation scripts and Makefile.
#?              Example:
#?
#?                  this.myfunc = function(parameter) {
#?                  //#? example description text
#?                  ...
#?
#?              would extract  "example description text".  The text following
#?              the tag must not contain any single or double quote.
#?              NOTE  that each function definition should be followed by such
#?              tag, otherwise some generated code is syntactically incomplete.
#?
#?      //#name? value: some text
#?              The special tag  //#name? is used for a short description text
#?              of the same function with the parameter 'name' set to 'value'.
#?              This tag is used in some generation scripts and Makefile.
#
#    Function Parameters
#       All functions which also have a public interface,  for example used in
#       the library/API, must use special names for their parameters. I.g. the
#       function definition should look like:
#           function ( type, mode, uppercase, src, prefix, suffix, delimiter )
#       where all parameters are optional (any can be missing or be named _n1_
#       .. _n7_; see below).
#       This strict naming convention is necessary so that some generators are
#       able to identify them.  All public interfaces of the functions will be
#       exported to EnDeFunc.txt (see Makefile for details). EnDeFunc.txt then
#       is used by the GUI to build menus in the  Functions  window. The menus
#       in the Functions window, when selected, then passes the generated text
#       to the dispatcher functions:  EnDe.FF.update()  and  EnDe.setObj() .
#       Unused function parameters used to be named  _na_ but due to complains
#       of some JS-lint and/or packer programs they have been renamed to _n1_,
#       _n2_, _n3_, _n4_, _n5_, _n6_, and _n7_ .
#?
#? VERSION
#?      @(#) EnDe.js 3.32 12/06/04 21:52:10
#?
#? AUTHOR
#?      07-apr-07 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

// ========================================================================= //
// Encoding, Decoding functions                                              //
// ========================================================================= //

var EnDe    = new function() {

this.SID    = '3.32';
this.sid    = function() { return('@(#) EnDe.js 3.32 12/06/04 21:52:10 EnDe'); };

	// ===================================================================== //
	// debug functions                                                       //
	// ===================================================================== //

this.trace  = 0;
this.dbx    = function(src,nl) {
//#? wrapper for EnDeGUI.dpr()
	if(this.trace<=0) { return false; }
	if(EnDeGUI.dpr===undefined) {
/*
 *** implement your code for debugging used in lib without GUI here ***
 */
		return false;
	}
	return EnDeGUI.dpr(src,nl);
}; // EnDe.dbx

	// ===================================================================== //
	// wrapper functions                                                     //
	// ===================================================================== //

this.encode = function(type,mode,uppercase,src,prefix,suffix,delimiter) { this.EN.dispatch(type,mode,uppercase,src,prefix,suffix,delimiter); };
//#? wrapper for EnDe.EN.dispatch()
this.decode = function(type,mode,uppercase,src,prefix,suffix,delimiter) { this.DE.dispatch(type,mode,uppercase,src,prefix,suffix,delimiter); };
//#? wrapper for EnDe.DE.dispatch()
this.convert= function(type,mode,uppercase,src,prefix,suffix,delimiter) { this.IP.dispatch(type,mode,uppercase,src,prefix,suffix,delimiter); };
//#? wrapper for EnDe.IP.dispatch()
this.alert  = function(func,txt) {
  //#? internal wrapper for alert()
	// this is the internal function used for delivering messages to the user
	// ** needs to be adapted to the environment where EnDe object is used **
	alert('##' + func + ': ' + txt);
}; // alert

	// ===================================================================== //
	// global constants                                                      //
	// ===================================================================== //

this.CONST  = new function() {      // ====== wrapper object for constants
  this.sid      = function() { return(EnDe.sid() + '.CONST'); };
  this.___      = '___________________________________________________ ';
	
  this.CHR      = new function() {  // ====== object for character constants
	this.sid    = function() { return(EnDe.CONST.sid() + '.CHR'); };
	
	this.DIGITS = '0123456789';                         // [0-9]
	this.LC     = 'abcdefghijklmnopqrstuvwxyz';         // [a-z]
	this.UC     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';         // [A-Z]
	this.binhex = '!"#$%&' + "'" + '()*+,- 012345689@ABCDEFGHIJKLMNPQRSTUVXYZ[`abcdefhijklmpqr'; // RFC1741
	this.hex    = this.DIGITS + 'abcdefABCDEF';         // [0-9a-fA-F]
//	this.hex    = this.b10 + 'abcdef';                  // [0-9a-f]
	/* above not used 'cause some browsers are too stupid for
	 *     str.match(/this.b10/, 'i')
	 * (namely Safari 3.x and Webkit), see this.isHex()
	 */
	this.alnum  = this.DIGITS + this.LC  + this.UC;
	this.dq     = '"';
	this.uuPad  = '`';
	this.uuAnf  = 'begin 664, filename\n';
	this.uuEnd  = '====\n';
	this.uuEndH = 'end\n';
	this.uuCount= 'M';
	this.urlReg = /[a-zA-Z0-9\$\_\.\+\!\*\~\(\)\,\&\/\:\;\=\?\@\#\'\-]/;
	this.meta   = '!"$%&/()=?`{}[]+#*,.;:<>|-_~@\'\\';
	this.lang   = '\xc4\xe4\xd6\xf6\xdc\xfc\xdf\xe1\xe2\xe3\xe5\xe6\xe7\xe0\xe9\xea\xe8\xe3\xed\xef\xec\xf4\xf2\xfa\xfb\xfc\xf9\xfd\xf1\xf0\xf3\xf5\xf6\xf7\xf8\xfe\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdd\xde'; // ToDo: not yet complete ..
  }; // .CONST.CHR

  this.INT      = new function() { // ====== object for integer constants
	this.sid    = function() { return(EnDe.CONST.sid() + '.INT'); };

	this.lng    =           4294967296; // 2^32
	this.exp32  = this.lng;
	this.exp31  =           2147483648; // 2^31
	this.MAX31  = this.exp31 - 1;       // 2^31-1
	this.exp64  = 18446744073709551616; // 2^64     // becomes string in JavaScript!
	this.exp63  =  9223372036854775808; // 2^63     // becomes string in JavaScript!
	this.MAX63  = this.exp63 - 1;       // 2^63-1   // becomes string in JavaScript!
	this.exp53  =     9007199254740992; // 2^53     // becomes string in JavaScript!
	this.MAX53  = this.exp53 - 1;       // 2^53-1
  }; // .CONST.INT

  this.CST      = new function() { // ====== object for miscelaneous constants
	this.sid    = function() { return(EnDe.CONST.sid() + '.CST'); };

	this.teaDelta    = 0x9E3779B9;
	this.yencMagic   = 42;
	this.yencShift   = 64;
	this.blocksize   = 120; // initial array size used in str2bytes()
	/* blocksize is used when adding data to arrays
	 * empiric tests showed that an array size of 120 performce best when data
	 * is > 5k bytes
	 * str2bytes() converted a 80k string to an array in
	 *   - roughly 2 hours without using blocksize
	 *   - 20 seconds with blocksize=120
	 *   - 30 seconds with blocksize=500
	 *   - 45 seconds with blocksize=1020
	 */
  }; // .CONST.CST

  this.ESC      = new function() { // ====== object for escape character lists
	this.JS     = '\'"';
	this.SQL    = "'";
	this.Quote  = '\'"';
	/* all following need to be done programatically
	this.Java   = '';
	this.HTML   = '';
	this.CSS    = '()[]{}\'";'; // but all other non 7-bit ASCII need to be \XX
	this.URL    = '';
	this.XML    = '';
	*/
  }; // .CONST.ESC

}; // EnDe.CONST

	// ===================================================================== //
	// global variables                                                      //
	// ===================================================================== //

this.maxloop= 99999;                // used to avoid time consuming loops
	/* Some loops force the browser to show an  alert window  or  even crashes
	 * the browser. To avoid this, some computations are limited to this size.
	 */

// index to array of each intMap[n], dupMap[n], a2eMap[n], e2aMap[n], ucsMap[n], etc.
this.mapInt = 0;                    // integer value (unicode base) of character
this.mapStd = 1;                    // standard
this.mapChr = 1;                    // charcter itself (a2eMap, e2aMap)
this.mapDsc = 2;                    // description of charcter (a2eMap, e2aMap)
this.mapEty = 2;                    // entity name
this.mapSet = 3;                    // ISO character set
this.mapTxt = 4;                    // description

	// ===================================================================== //
	// global arrays; see EnDeMaps.js for initialisation                     //
	// ===================================================================== //

this.pairs      = new Array(22);    // array to map characters used as pairs
this.pairs['('] = ')';
this.pairs['['] = ']';
this.pairs['{'] = '}';
this.pairs[')'] = '(';
this.pairs[']'] = '[';
this.pairs['}'] = '{';
this.pairs['<'] = '>';
this.pairs['>'] = '<';
this.pairs['"'] = '"';
this.pairs["'"] = "'";
this.pairs['/'] = '/';
this.pairs['|'] = '|';
this.pairs[':'] = ':';
this.pairs[','] = ',';
this.pairs[';'] = ';';
this.pairs['#'] = '#';
this.pairs['%'] = '%';
this.pairs['$'] = '$';
this.pairs['!'] = '!';
this.pairs['='] = '=';

// HTML Entity Name
this.intMap     = new Array(256*256);// array of [standard, Entity, Group, Description]
this.ncrMap     = new Array();      // array of char codes
this.ucsMap     = new Array();
this.dupMap     = new Array();
this.xmlMap     = new Array();      // XML entities
this.winMap     = new Array();      // for CP-1252 codings
this.winfMap    = new Array();      // for CP-1252 codings

// other characters
this.figsMap    = new Array();      // Baudot figures
this.ltrsMap    = new Array();      // Baudot letters
this.AbrMap     = new Array();      // ASCII Braille
this.DbrMap     = new Array();      // Dotless Braille
this.NbrMap     = new Array();      // NumBRL Braille
this.DadMap     = new Array();      // Dada Urka
this.BladeMap   = new Array(16);    // Blade font
this.sosMap     = new Array(50);    // Morse characters
this.osoMap     = new Array(50);    // reverse Morse characters
this.asciiMap   = new Array(256);   // ASCII characters
this.DIN66003Map= new Array(256);   // DIN 66003 characters (aka ISO 646)
this.DIN66003fMap= new Array(256);  // reverse DIN66003Map
this.ebcdicMap  = new Array(256);   // EBCDIC characters
this.ebcdicUTF  = new Array(256);   // UTF-EBCDIC characters
this.romanMap   = new Array(256);   // Mac OS Roman characters
this.a2rMap     = new Array(256);   // [ASCII] = Mac OS Roman
this.r2aMap     = new Array(256);   // [Mac OS Roman] = ASCII
this.a2eMap     = new Array(256);   // [ASCII] = EBCDIC
this.e2aMap     = new Array(256);   // [EBCDIC] = ASCII
this.spaceMap   = new Array(50);    // all Unicode space characters
this.dnaMap     = new Array(256);   // DNA/DNS (genetic) codes
/*
this.uhwMap = new Array(256);       // map with Unicode halfwidth characters
*/
this.rangeMap	= new Array(256);   // Unicode code point ranges // ToDo: not yet used

// Base64 characters
this.b64Char    = new Array(64);    // [CharCode] = Char
this.b64Code    = new Array(64);    // [Char] = CharCode
this.b64AdditionalChars = new Array();

	// ===================================================================== //
	// global functions                                                      //
	// ===================================================================== //

this.rex    = function(src) {
//#? escape meta characters for RegExp
	return src.replace(/[\$\&\#\%\.\^\?\*\+\[\]\{\}\(\)\\]/gi,function(c){return '\\'+c;});
}; // ENDe.rex

this.isBin  = function(src) { return src.match('[^01]') ===null ? true : false; };
//#? return true if string consist of 0 and 1 characters only

this.isOct  = function(src) { return src.match('[^0-7]')===null ? true : false; };
//#? return true if string consist of octal characters only

this.isInt  = function(src) { return src.match('[^0-9]')===null ? true : false; };
//#? return true if string consist of dezimal characters only

this.isHex  = function(src) { return src.match('[^' + this.CONST.CHR.hex +  ']')===null ? true : false; };
//#? return true if string consist of hex characters only

this.isB16  = function(src) { return EnDe.B64.isB16(src); };
//#? return true if string consist of Base16 characters only

this.isB32  = function(src) { return EnDe.B64.isB32(src); };
//#? return true if string consist of Base32 characters only

this.isB64  = function(src) { return EnDe.B64.isB64(src); };
//#? return true if string consist of Base64 characters only

this.isU64  = function(src) { return EnDe.B64.isU64(src); };
//#? return true if string consist of Url64 characters only

this.isalnum= function(src) { return src.match('[^' + this.CONST.CHR.alnum+ ']')===null ? true : false; };
//#? return true if string consist of alpha-numeric characters only

this.isTyp  = function(type,src) {
//#? return true if string is of given type
	switch (type) {
	  case 'bin': return EnDe.isBin(src); break;
	  case 'oct': return EnDe.isOct(src); break;
	  case 'dez': return EnDe.isInt(src); break;
	  case 'int': return EnDe.isInt(src); break;
	  case 'hex': return EnDe.isHex(src); break;
	  case 'b32':
	  case 'b64':
	  case 'u64': return EnDe.B64.is(type, src); break;
	  default         :
		if (/^base/.test(type)===true) {
			return EnDe.B64.is(type, src); break;
		}
		break;
	}
	return false;
// ToDo: using if instead of switch would improve performance
}; // EnDe.isTyp

	// ===================================================================== //
	// global text utility functions                                         //
	// ===================================================================== //

this.join   = function(type,mode,_n3_,src,prefix,suffix,delimiter) {
//#? global replace newlinw or tab character
//#type? arg: global replace newline by &
//#type? key: global replace tabs by =
//#type? del: global replace newline by given delimiter
	var rex = /\n/;
	var ccc = '';
	switch (type) {
	  case 'arg': rex = /\n/g; ccc = '&';       break;
	  case 'key': rex = /\t/g; ccc = '=';       break;
	  case 'del': rex = /\n/g; ccc = delimiter; break;
	}
	var bux = src.replace(rex,ccc);
	rex = null;
	return bux;
}; // EnDe.join

this.split  = function(type,mode,_n3_,src,prefix,suffix,delimiter) {
//#? global split
//#type? arg: global split, replace & by newline by &
//#type? key: global split, replace = by tabs by =
//#type? del: global split, replace given delimiter by newline
	var rex = null;
	var ccc = '';
	switch (type) {
	  case 'arg': ccc = '\n';  rex = new RegExp('&','g');       break;
	  case 'key': ccc = '\t';  rex = new RegExp('=','g');       break;
	  case 'del': ccc = '\n';  rex = new RegExp(delimiter,'g'); break;
	  default   : ccc = '';    rex = new RegExp('&=','g');      break;
	}
	var bux = src.replace(rex,ccc);
	rex = null;
	return bux;
}; // EnDe.split

this.trim   = function(src) {
//#? trim leading and trailing white spaces
	if (src===undefined) { return src; } // some JavaScript engines are picky
	while (src.substring(0, 1)===' ') {
		src = src.substring(1, src.length);
	}
	while (src.substring(src.length-1, src.length)===' ') {
		src = src.substring(0, src.length-1);
	}
	return src;
}; // EnDe.trim

this.chr2bytes  = function(src) {
//#? convert (unicode) character to array of 1 or 2 bytes; src is a single character
	var bux = [];
	var ccc = src.charCodeAt(0);
	var c1  = 0, c2 = 0;
	if (ccc<256) { // 1 byte
		bux.push(ccc);
	} else if(ccc<65536) { // 2 bytes
		c1 = ccc >> 8;
		c2 = ccc - (c1*256);
		bux.push(c1);
		bux.push(c2);
	} else {     // 3 bytes
		// ToDo: not supported
	}
	ccc = null; c1 = null; c2 = null;
	return bux;
}; // EnDe.chr2bytes

this.str2bytes  = function(src) {
//#? convert (unicode) character string to array of bytes
	var bux = [], kkk = [];
	var i   = 0;
	if (src.length < EnDe.CONST.CST.blocksize) {
		/* this case just for documentation how it should be
		 * but this results in crappy perfromance with JavaScript
		 * see comment about  EnDe.CONST.CST.blocksize  also */
		for (i=0; i<src.length; i++) {
			bux = bux.concat(this.chr2bytes(src[i]));
		}
	} else {
		for (i=0; i<src.length; i++) {
			kkk = kkk.concat(this.chr2bytes(src[i]));
			if (kkk.length >= EnDe.CONST.CST.blocksize) { bux = bux.concat(kkk); kkk.length = 0; }
		}
		bux = bux.concat(kkk);
		kkk.length = 0;
	}
	return bux;
}; // EnDe.str2bytes

this.chr2code = function(src) {
//#? convert plain text to JavaScript char codes (integer of unicode); src is a single character
// ToDo: this.dez(), this.ncr() and this.ucs() are very similar
	var bux = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		bux += src.charCodeAt(i);
		if (i<(src.length-1)) {
			bux += ',';
		}
	}
	return bux;
}; // EnDe.chr2code

this.chr2bin_DoesNotWork = function(type,src) {
//#? convert character to n-bit binary string; src is a single character; type is number of bits
	var bux = '';
	var i   = 0;
	for (i=(type-1); i>-1; i--) {
		if (src >= Math.pow(2,i)) {
			src -= Math.pow(2,i);
			bin += '1';
		} else {
			bin += '0';
		}
	}
	return bux;
}; // chr2bin_DoesNotWork

this.chr2bin = function(type,src) {
//#? convert character to n-bit binary string; src is a single character; type is number of bits
	var bux = '';
	var i   = 0;
	for (i=0; i<type; i++) {
		if (src >= Math.pow(2,(type-1)-i)) {
			src -= Math.pow(2,(type-1)-i);
			bux += '1';
		} else {
			bux += '0';
		}
	}
	return bux;
}; // EnDe.chr2bin

this.java2chr = function(src) {
//#? convert char code to character using java.lang.Character()
	var bux = '';
	var i   = 0;
	while (i<src.length) {
		bux += java.lang.Character(src.charCodeAt(i));
		i++;
	}
	return bux;
}; // EnDe.java2chr

this.code2chr = function(src) {
//#? convert JavaScript char codes (integer of unicode) to plain text
// ToDo: EnDe.DE.dez() is very similar
	var bux = '';
	var ccc = '';
	var kkk = src.split(',');
	while ((ccc=kkk.shift())!==undefined) {
// TODo: loop obsolete wenn die Integer durch , getrennt
		bux += String.fromCharCode(ccc);
	}
	return bux;
}; // EnDe.code2chr

this.code2prn = function(src) {
//#? convert JavaScript char code (integer of unicode) to printable (ASCII) character
/*
 * src is a single character
 * NOTE: this is not a real conversion/coding just pretty printing!
 */
	var bux = '';
	var ccc = String.fromCharCode(src);
	if ((src > 31) && (src <= 127)) {
		bux += ' ' + ccc;
	} else if ((src > 127) && (src <= 255)) {
		bux += ' ' + ccc;
	} else if ((src > 255) && (src <= 65635)) {
		bux += ' ' + ccc;
	} else if ((src > 65635)) {
		bux += ' ' + ccc;
	} else {
		switch(src) {
		  case 0:   bux += '\\0'; break;
		  case 7:   bux += '\\b'; break;
		  case 8:   bux += '\\v'; break;
		  case 9:   bux += '\\t'; break;
		  case 10:  bux += '\\n'; break;
		  case 13:  bux += '\\r'; break;
		  default:  bux += ' .';  break;
		}
	}
	return bux;
}; // EnDe.code2prn

this.prn2code = function(src) {
//#? convert printable (ASCII) character to JavaScript char code (integer of unicode)
/*
 * NOTE: this is not a real conversion/coding just pretty printing!
 */
	var bux = '';
	var i   = 0;
	while (i < src.length) {
		if (src[i]==='\\') {
			switch(src[i+1]) {
			  case '0': bux += '\0'; break;
			  case 'b': bux += '\b'; break;
			  case 'h': bux += '\h'; break;
			  case 'v': bux += '\v'; break;
			  case 't': bux += '\t'; break;
			  case 'n': bux += '\n'; break;
			  case 'r': bux += '\r'; break;
			  default:  bux += src[i] + src[i+1];  break;
			}
			i++;
		} else {        bux += src[i]; }
		i++;
	}
	return bux;
}; // EnDe.prn2code

this.chr2prn = function(type,src) {
//#? convert JavaScript character to printable (ASCII) character, non-printable are \xXX
//#type? null: convert non-printable to hex (no padding, see EnDe.i2h())
//#type? 3:    convert non-printable to 3-digit hex (see EnDe.i2h())
//#type? n:    convert non-printable to n-digit hex (see EnDe.i2h())
// ToDo: to be integrated into EnDeMenu.js (but concept mssing how to
//       pass new mode "Straight -> Hex (ASCII only)"
	var bux = '';
	var ccc = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if ((ccc > 31) && (ccc <= 127) && (ccc != 92)) { // all except \ (backslash)
			bux += String.fromCharCode(ccc);
		} else {
			bux += '\\x' + EnDe.i2h(type,src.charCodeAt(i));
		}
	}
	ccc = '';
	return bux;
}; // EnDe.chr2prn

this.str2bin = function(type,src,prefix,suffix,delimiter) {
//#? convert string to n-bit binary string; type is number of bits
	var bux  = '';
	var i   = 0;
	for (i=0; i < src.length; i++) {
		bux += delimiter + prefix + EnDe.chr2bin(type,src.charCodeAt(i).toString()) + suffix;
	}
	bux = bux.substring(delimiter.length, bux.length);  // remove leading delimiter
	return bux;
}; // EnDe.str2bin

this.str2chr = function(src,prefix,suffix,delimiter) {
//#? convert string to list of characters with prefix, delimiter and suffix
	return prefix + src.split('').join(suffix + delimiter + prefix) + suffix
}; // EnDe.str2chr

this.str2lng = function(src) {
//#? convert a string to an array of long integers
	if (typeof(src) == 'number') {
		// ToDo: not really correct, should depend on strict mode
		return src;
	}
	var len = Math.ceil(src.length/4);
	var arr = new Array(len);
	var i   = 0;
	for (i=0; i<len; i++) {
// ToDo: * oder >>
		arr[i] = src.charCodeAt( i*4) +
				(src.charCodeAt((i*4) + 1)<<8 ) +
				(src.charCodeAt((i*4) + 2)<<16) +
				(src.charCodeAt((i*4) + 3)<<24);
	}
	return arr;
}; // EnDe.str2lng

this.lng2str = function(src) {
//#? convert an array of long integers to a string
	var arr = new Array(src.length);
	var i   = 0;
	for (i=0; i<arr.length; i++) {
		arr[i] = String.fromCharCode(
				src[i]      & 0xff,
				src[i]>>>8  & 0xff,
				src[i]>>>16 & 0xff,
				src[i]>>>24 & 0xff
			);
	}
	return arr.join('');
}; // EnDe.lng2str

	// ===================================================================== //
	// global number convertion functions                                    //
	// ===================================================================== //

this.z2n    = function(src) {
//#? convert negative numbers to numbers (2^32)
	var bux = parseInt(src, 10);
	if (bux < 0) {
		// if negative we try to treat the number as (2^32)
		if (bux > -EnDe.CONST.INT.MAX31) {
			bux = bux + EnDe.CONST.INT.exp32;
		}
	}
	return bux;
}; // EnDe.z2n

this.n2z    = function(src) {
//#? convert numbers (2^32) to negative numbers
	var bux = parseInt(src, 10);
	if (bux > EnDe.CONST.INT.MAX31) {
		bux = bux - EnDe.CONST.INT.exp32;
	}
	return bux;
}; // EnDe.n2z

this.z2n64  = function(src) {
//#? convert negative numbers to numbers (2^64)
	// Note that number > .INT.MAX53 throw an exception
	var bux = parseInt(src, 10);
	if (bux < 0) {
		// if negative we try to treat the number as (2^64)
		if (bux > -EnDe.CONST.INT.MAX63) {
			bux = bux + EnDe.CONST.INT.exp64;
		}
	}
	return bux;
}; // EnDe.z2n64

this.n2z64  = function(src) {
//#? convert numbers (2^64) to negative numbers
	// Note that number > .INT.MAX53 throw an exception
	var bux = parseInt(src, 10);
	if (bux > EnDe.CONST.INT.MAX63) {
		bux = bux - EnDe.CONST.INT.exp64;
	}
	return bux;
}; // EnDe.n2z64

this.h2i    = function(src) {
//#? convert hex value (string) to integer
	var bux = parseInt(src, 16).toString(10);
	if (isNaN(bux)) { return ''; } // ToDo: depends on mode what to do here
	return bux;
}; // EnDe.h2i

this.i2h    = function(type,src) {
//#? convert integer (string) value to hex
//#type? null: converted hex (no padding)
//#type? hex0: converted hex (no padding)
//#type? hex1: converted hex (no padding)
//#type? 3:    converted 3-digit hex
//#type? n:    converted n-digit hex
	if ((src!==0) && (src==='')) { return ''; } // ToDo: depends on mode what to do here
	/*
	 *  (src != 0) check necessary for buggy Mozilla, which treats a binary 0
	 * as an empty string too :-((
	 */
	var bux = parseInt(src, 10).toString(16);
	var kkk = 2;
	if (bux.match(/[^0-9a-f]/i)!==null) { return ''; } // ToDo: depends on mode what to do here (should only occour if parseInt() returned NaN)
	switch (type) {
	  case 'null':
	  case 'hex0':
	  case 'hex1': kkk = 1; break;
	  default    :
		kkk = parseInt(type, 10);
		if (isNaN(kkk)) { kkk = 1; }
		break;
	}
	while (bux.length<kkk) { bux = '0' + bux; }
	return bux;
}; // EnDe.i2h

this.h2c    = function(src) {
//#? convert hex value (string) to characters
	/* this is the same as EnDe.EN.hex(2,'','','',''); */
	var bux = '';
	var ccc = null;
	var i   = 0;
	for (i=0; i<src.length; i+=2) {
		ccc  = parseInt(src[i]+src[i+1], 16);
		if (isNaN(ccc)) { // ToDo: depends on mode what to do here
			bux += src[i] + src[i+1];
		} else {
			bux += String.fromCharCode(parseInt(src[i]+src[i+1], 16));
		}
	}
	return bux;
}; // EnDe.h2c

this.h2b    = function(src) {
//#? convert hex value (string) to binary
	var bux = parseInt(src, 16).toString(2);
	if (isNaN(bux)) { return ''; } // ToDo: depends on mode what to do here
	return bux;
}; // EnDe.h2b

this.b2h    = function(src) {
//#? convert binary value (string) to hex (binary limeted to 2^53)
//ToDo: if src > this.MAX53 the result may be random
	var bux = parseInt(src, 2).toString(16);
	if (bux==='NaN') { return ''; } // ToDo: depends on mode what to do here
	/* Note: NaN is only returned if converion fails,
	 * cannot use isNaN() 'cause it would return false for hex values
	 */
	if ((bux==='1') && (src!=='1')) { return ''; } // ToDo: 2^53 overflow
	return bux;
}; // EnDe.b2h

this.i2b    = function(src) {
//#? convert integer (string) value to binary
	var bux = parseInt(src, 10).toString(2);
	if (isNaN(bux)) { return ''; } // ToDo: depends on mode what to do here
	return bux;
}; // EnDe.i2b

this.b2i    = function(src) {
//#? convert binary value (string) to hex (binary limeted to 2^53)
//ToDo: if src > this.MAX53 the result may be random
	var bux = parseInt(src, 2).toString(10);
	if ((bux==='1') && (src!=='1')) { return ''; } // ToDo: 2^53 overflow
	if (isNaN(bux)) { return ''; } // ToDo: depends on mode what to do here
	return bux;
}; // EnDe.b2i

this.i2bcd  = function(src) {
//#? convert digit to BCD code (4 dual digits)
	var bux = parseInt(src, 10).toString(2);
	while (bux.length < 4) { bux = '0' + bux; }
	return bux;
}; // EnDe.i2bcd

this.bcd2i  = function(src) {
//#? convert BCD code (4 dual digits) to digit
	if (src.match(/^0+$/)!== null) { return '0'; }
	var bux = src.replace(/^0/g, '');
	bux = parseInt(bux, 2).toString(10);
	if (isNaN(bux)) { return src; }
	if (bux > 9)    { return src; }
	return bux;
}; // EnDe.bcd2i

	// ===================================================================== //
	// global symetric en-, decoding functions                               //
	// ===================================================================== //

this.reverse = function(src) {
//#? reverse characters in string (mirror sring)
	var bux = '';
	var i   = src.length;
	while (i>0) { i--; bux += src[i]; }
	return bux;
}; // EnDe.reverse

this.atbash = function(src) {
//#? convert plain text to Atbash encoding
	var bux = '';
	var ccc = 0;
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if ((64<ccc) && (ccc<91)) {
			bux += String.fromCharCode((((78-ccc)*2)-1+ccc));
			continue;
		}
		if ((96<ccc) && (ccc<123)) {
			bux += String.fromCharCode((((110-ccc)*2)-1+ccc));
			continue;
		}
		bux += src[i];
	}
	return bux;
}; // EnDe.atbash

this.a2e    = function(src) {
//#? convert ASCII to EBCDIC characters
	var bux = '';
	var ccc = 0;
	var i   = 0;
	for(i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if (ccc > 255) {
			bux += '[EnDe.a2e: value ('+src[i]+'='+ccc+') out of range]'; // ToDo: depends on mode what to do here
			continue;
		}
		bux += String.fromCharCode(EnDe.a2eMap[ccc]);
	}
	return bux;
}; // EnDe.a2e

this.e2a    = function(src) {
//#? convert EBCDIC to ASCII characters
	var bux = '';
	var ccc = 0;
	var i   = 0;
	for(i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if (ccc > 255) {
			bux += '[EnDe.e2a: value ('+src[i]+'='+ccc+') out of range]'; // ToDo: depends on mode what to do here
			continue;
		}
		bux += String.fromCharCode(EnDe.e2aMap[ccc]);
	}
	return bux;
}; // EnDe.e2a

this.xor    = function(src,key) {
//#? XOR each character with first character from key
	var bux = '';
	var xor = key.charCodeAt();
	var i   = 0;
	for (i=0; i<src.length; i++) {
		bux += String.fromCharCode(xor^src.charCodeAt(i));
	}
	return bux;
}; // EnDe.xor

this.rot    = function(src,key) {
//#? convert string to rot-N-encoded text (aka Caesar encoding); key is number/position of character: 1..26
	var bux = '';
	var kkk = '';
	var i   = 0;
	var b;
	if ((key<1) || (key>26)) { return src; }
	for(i=0; i<src.length; i++) {
		kkk = 0;
		b = src.charCodeAt(i);
		if (b>96) { kkk = 32; }
		b -= kkk;
		if ((b>64) && (b<91)) {
			b += key;
			if (b>90) { b -= 26; }
		}
		b += kkk;
		bux += String.fromCharCode(b);
	}
	return bux;
}; // EnDe.rot

	// ===================================================================== //
	// global convertion functions                                           //
	// ===================================================================== //

this.dez2hex = function(type,mode,uppercase,src,prefix,suffix,_n7_) {
//#? convert decimal encoded text to hex encoded text
//#type? null: converted hex value without prefix
//#type? qp2:  converted hex value prefixed with =
//#type? url2: converted hex value prefixed with %
//#type? url3: converted hex value prefixed with %0
//#type? url4: converted hex value prefixed with %00
//#type? ncr2: converted hex value prefixed with &#x
//#type? ncr4: converted hex value prefixed with &#x00
	var bux = '';
	var pre = '';
	var modulo = 2;
	switch (type) {
	  case 'null'   : pre = '';         modulo = 9999; break; //quick&dirty
	  case 'qp2'    : pre = '=';        modulo = 2;    break;
	  case 'url2'   : pre = '%';        modulo = 2;    break;
	  case 'url3'   : pre = '%';        modulo = 2;    break;
	  case 'url4'   : pre = '%';        modulo = 4;    break;
	  case 'ncr2'   : pre = '&#x';                     break;
	  case 'ncr4'   : pre = '&#x00';                   break; // ToDo: buggy for chr>255
	  default       : pre = '';         modulo = 9999; break;
	}
	if(src===0) { return pre + '00'; }
	var mask = 0xf;
	var pos  = 1;
	var bbb  = '';
	var kkk  = '';
	while (src != 0) {
// ToDo: probably fails if src ends with 0-byte
		kkk = this.CONST.CHR.hex.charAt(src & mask);
		if (uppercase) {
			kkk = kkk.toUpperCase();
		}
		bbb = kkk + bbb;
		if ((pos % modulo)===0) {
			if ((bbb.length===1) || (bbb.length===3)) {  // quick&dirty
				// pad with zero (pre also missing)
				bbb = '0' + bbb;
			}
			bux = pre + bbb + bux;
			if (src > 255) { // quick&dirty
				bux = suffix + bux;
			}
			bbb = '';
		}
		pos++;
		src>>>=4;
	}
	if (bbb!=='') {
		if ((bbb.length===1) || (bbb.length===3)) {  // quick&dirty
			// pad with zero (pre also missing)
			bbb = '0' + bbb;
		}
		bux = pre + bbb + bux;
		if (src > 255) { // quick&dirty
			bux = suffix + bux;
		}
	}
	return bux;
}; // EnDe.dez2hex

this.h2n    = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
//#? convert hex value to its nibble hex values (1-byte values supported only)
//#type? nibbles: convert hex value to its nibble hex values
//#type? nibble1: convert hex value to its first nibble hex value
//#type? nibble2: convert hex value to its second nibble hex value
	var bux = '';
	var bbb = '';
	var ccc = '';
	var kkk = this.i2h(type,src).toString();
	var k   = 0;
/*
	A %2541   (double percent)
	A %%34%31 (double nibble)
	A %%341   (first nibble)
	A %4%31   (second nibble)
*/
// ToDo: if(src>256) error
	switch (type) {
	  case 'nibble1':
		bbb = this.i2h(2,kkk.charCodeAt(0));
		if (uppercase===true) { bbb = bbb.toUpperCase(); }
		if (kkk.length>1) {
			ccc = kkk[1];
			if (uppercase===true) { ccc = ccc.toUpperCase(); }
		} else {
			ccc = bbb;
			bbb = '0';
		}
		bux += prefix + bbb + suffix + delimiter + ccc + suffix + delimiter;
		break;
	  case 'nibble2':
		ccc = kkk[0];
		if (uppercase===true) { ccc = ccc.toUpperCase(); }
		bbb = this.i2h(2,kkk.charCodeAt(1));
		if (uppercase===true) { bbb = bbb.toUpperCase(); }
		bux += ccc + suffix + delimiter + prefix + bbb + suffix + delimiter;
		break;
	  case 'nibbles':
		for (k=0; k<kkk.length; k++) {
			bbb = this.i2h(2,kkk.charCodeAt(k));
			if (uppercase===true) { bbb = bbb.toUpperCase(); }
			bux += prefix + bbb + suffix + delimiter;
		}
		break;
	  default: bux += src; break;
	}
	bbb = null;
	ccc = null;
	kkk = null;
	return bux;
}; // EnDe.h2n


	// ===================================================================== //
	// global encryption, hashing, checksum (CRC) functions                  //
	// ===================================================================== //

//this.AES    = EnDe.AES;     // already done in aes.js
//this.CRC    = EnDe.CRC;     // already done in crc.js
//this.MD4    = EnDe.MD4;     // already done in md4.js
//this.MD5    = EnDe.MD5;     // already done in 5md.js
//this.SHA    = EnDe.SHA;     // already done in sha.js
//this.SHA5   = EnDe.SHA5;    // already done in sha512.js
//this.RMD    = EnDe.RMD;     // already done in rmd.js
//this.Blowfish= EnDe.CRC;    // already done in blowfish.js

	// ===================================================================== //
	// global Base64 functions                                               //
	// ===================================================================== //

//this.B64    = EnDe.B64;     // already done in EnDeB64.js 

	// ===================================================================== //
	// IP functions                                                          //
	// ===================================================================== //

//this.IP     = EnDe.IP;      // already done in EnDeIP.js

	// ===================================================================== //
	// Timestamp functions                                                   //
	// ===================================================================== //

//this.TS     = EnDe.TS;      // already done in EnDeTS.js

	// ===================================================================== //
	// global Unicode / UTF functions                                        //
	// ===================================================================== //

this.UCS    = new function() {
  this.sid      = function() { return(EnDe.sid() + '.UCS'); };
  this.dbx      = function(src,nl) { return EnDe.dbx(src,nl); };

/*
  UCS-2  [0 .. 0xffff]
  UCS-4  [0 .. 0x7fffffff]
  UTF-8
  UTF-16 (aka UCS-2)
  UTF-32 (aka UCS-4)
  BOM  - Byte Order Mark
  BMP  - Basic Multilingual Plane
  BOCU - Binary Ordered Compression for Unicode
  SCSU - Standard Compression Scheme for Unicode
 */

  // constants/values for BOM (byte order mark)
  this.UTF32BE  = '0000FEFF';   // UTF-32, big-endian
  this.UTF32LE  = 'FFFE0000';   // UTF-32, little-endian
  this.UTF16BE  = 'FEFF';       // UTF-16, big-endian
  this.UTF16LE  = 'FFFE';       // UTF-16, little-endian
  this.UTF8     = 'EFBBBF';     // UTF-8

/* invalid code points:
  D800 to DBFF16 not followed by a value in the range DC00 to DFFF
  DC00 to DFFF not preceded by a value in the range D800 to DBFF
  DC00 to DFFF
  FDD0 to FDEF
  FFEF to FEFF
  ---------------
  Tcl only supports  [0 .. 0xffff] ??
 */

/* invalid code points, surrogate pairs:
  UTF-16       UTF-8          UCS-4
 -----------+--------------+-----------
  D83F DFFx    F0 9F BF Bx    0001FFFx
  D87F DFFx    F0 AF BF Bx    0002FFFx
  D8BF DFFx    F0 BF BF Bx    0003FFFx
  D8FF DFFx    F1 8F BF Bx    0004FFFx
  D93F DFFx    F1 9F BF Bx    0005FFFx
  D97F DFFx    F1 AF BF Bx    0006FFFx
  ...
  DBBF DFFx    F3 BF BF Bx    000FFFFx
  DBFF DFFx    F4 8F BF Bx    0010FFFx
 -----------+--------------+-----------
  where   x = E or F
 */

/* invalid code points:
  0x0750 0x077F
  0x07C0 0x08FF
  0x1380 0x139F
  0x18B0 0x18FF
  0x1980 0x19DF
  0x1A00 0x1CFF
  0x1D80 0x1DFF
  0x2C00 0x2E7F
  0x2FE0 0x2FEF
  0x31C0 0x31EF
  0x9FB0 0x9FFF
  0xA4D0 0xABFF
  0xD7B0 0xD7FF
  0xD800 0xDBFF
  0xDC00 0xDFFF
  0xFE10 0xFE1F
  0x10140 0x102FF
  0x104B0 0x107FF
  0x10840 0x1CFFF
  0x1D200 0x1D2FF
  0x1D360 0x1D3FF
  0x1D800 0x1FFFF
  0x2A6E0 0x2F7FF
  0x2FAB0 0x2FFFF
  0xE0080 0xE00FF
  0xE01F0 0xEFFFF
  0xFFFFE 0xFFFFF
 */

  this.isUCS    = function(src) {
  //#? return true if charcter is valid code point; src is a single character
// ToDo: EnDe.UCS.isUCS() to be implemented (according above definitions)
	return false;
  }; //isUCS

  this.isUTF7   = function(src) {
  //#? return true if charcter is UTF-7 character; src is a single character
	var bux = src.charCodeAt(0);
	if (   ( bux == 9)
	    || ( bux == 10)
	    || ( bux == 13)
	    || ( bux == 32)
	    || ( bux == 58)
	    || ((bux >= 39) && (bux <= 41))
	    || ((bux >= 44) && (bux <= 57))
	    || ((bux >= 65) && (bux <= 90))
	    || ((bux >= 97) && (bux <= 122))
	   ) { return true; }
	return false;
  }; // isUTF7

  this.isBOM    = function(type,src) {
  //#? dispatcher to check for BOM
  //#type? UTF32BE: return true for UTF32BE BOM
  //#type? UTF32LE: return true for UTF32LE BOM
  //#type? UTF16BE: return true for UTF16BE BOM
  //#type? UTF16LE: return true for UTF16LE BOM
  //#type? UTF8   : return true for UTF8 BOM
	var bux = '';
	var bom = '';
	var ccc = 99;
	var i   = 0;
	switch(type) {
	  case 'UTF32BE': ccc = 3; bom = this.UTF32BE; break; // ToDo: fails 'cause of NUll-bytes
	  case 'UTF32LE': ccc = 3; bom = this.UTF32LE; break; // ToDo: fails 'cause of NUll-bytes
	  case 'UTF16BE': ccc = 1; bom = this.UTF16BE; break;
	  case 'UTF16LE': ccc = 1; bom = this.UTF16LE; break;
	  case 'UTF8'   : ccc = 2; bom = this.UTF8;    break;
	}
	var kkk = src.substring(0,(ccc*2)); // may have 2 bytes per character
	var bbb = EnDe.str2bytes(kkk);
	if (bbb.length < ccc) { return false; }
	//var bux = EnDe.dez2hex('null','lazy',true,bbb.join(''),'','','');
// ToDo: above fails, need to convert byte by byte
	for (i=0; i<=ccc; i++) {
		bux += EnDe.dez2hex('null','lazy',true,bbb[i],'','','');
	}
	if (bbb.length) { bbb.length = 0; }; bbb = null; kkk = null;
	return (bux == bom);
  }; // isBOM

  this.getBOM   = function(type) {
  //#? get (character) value for BOM
  //#type? UTF32BE: return UTF32BE BOM bytes
  //#type? UTF32LE: return UTF32LE BOM bytes
  //#type? UTF16BE: return UTF16BE BOM bytes
  //#type? UTF16LE: return UTF16LE BOM bytes
  //#type? UTF8   : return UTF8 BOM bytes
	var bux = '';
	switch(type) {
	  case 'UTF32BE': bux = this.UTF16BE; break;
	  case 'UTF32LE': bux = this.UTF16LE; break;
	  case 'UTF16BE': bux = this.UTF16BE; break;
	  case 'UTF16LE': bux = this.UTF16LE; break;
	  case 'UTF8'   : bux = 'EFBB';       break; // this.UTF8 result in 3 bytes
	}
	bux = String.fromCharCode(EnDe.h2i(bux));
	switch(type) { // UTF-32 are 4 bytes, but JavaScript's Unicode is 2 bytes
	  case 'UTF8'   : bux += '\xBF';         break;
	  case 'UTF32BE': bux  = '\u0000' + bux; break;
	  case 'UTF32LE': bux += '\u0000';       break;
		// must be \u to pass 2 bytes, \x will passes 1 byte only !!
	}
	return bux;
  }; // getBOM

  this.str32BE  = function(src) {
  //#? return true if string starts with UTF-32 big-endian BOM
	return this.isBOM('UTF32BE',src);
// ToDo: fails 'cause of NUll-bytes
  };

  this.str32LE  = function(src) {
  //#? return true if string starts with UTF-32 little-endian BOM
	return this.isBOM('UTF32LE',src);
// ToDo: fails 'cause of NUll-bytes
  };

  this.str16BE  = function(src) {
  //#? return true if string starts with UTF-16 big-endian BOM
	return this.isBOM('UTF16BE',src);
  };

  this.str16LE  = function(src) {
  //#? return true if string starts with UTF-16 little-endian BOM
	return this.isBOM('UTF16LE',src);
  };

  this.strUTF8  = function(src) {
  //#? return true if string starts with UTF-8 BOM
	return this.isBOM('UTF8',src);
  };

  this.f2h      = function(src) {
  //#? convert fullwidth Unicode to halfwidth Unicode characters
	var bux = '';
	var ccc = 0;
	var i   = 0;
// ToDo: lazy implementation does not check for undefined halfwidth characters
	for(i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if ((ccc>65279) && (ccc<65519)) {   // 0xFF00 .. 0xFFEF
			bux += String.fromCharCode(ccc-65248); // 0xFF00 = 65248+32
		} else {
			bux += src[i];
		}
	}
	return bux;
  }; // f2h

  this.h2f      = function(src) {
  //#? convert halfwidth Unicode to fullwidth Unicode characters
	var bux = '';
	var ccc = 0;
	var i   = 0;
// ToDo: lazy implementation does not check for undefined halfwidth characters
	for(i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if ((ccc>31) && (ccc<127)) {
			bux += String.fromCharCode(ccc+65248); // 0xFF00 = 65248+32
		} else {
			bux += src[i];
		}
	}
	return bux;
  }; // h2f

  this.utf16le  = function(src) {
  //#? convert Unicode to UTF-16-LE characters
	var bux = '';
	var i   = 0;
	for(i=0; i<src.length; i++) {
		bux += String.fromCharCode(src.charCodeAt(i)&0xff, (src.charCodeAt(i)>>>8)&0xff);
	}
	return bux;
  }; // utf16le

  this.utf16be  = function(src) {
  //#? convert Unicode to UTF-16-BE characters
	var bux = '';
	var i   = 0;
	for(i=0; i<src.length; i++) {
		bux += String.fromCharCode((src.charCodeAt(i)>>>8)&0xff, src.charCodeAt(i)&0xff);
	}
	return bux;
  }; // utf16be

  this.utf32le  = function(src) {
  //#? convert Unicode to UTF-32-LE characters
// ToDo: experimental (last character gets scrambled)
	var bux = '';
	var kkk = this.utf16be(src); // ToDo: does this work for real 32-bit characters?
	var i   = 0;
	var c1  = 0, c2 = 0, u32 = 0;
	for(i=0; i<kkk.length; i++) {
		c1 = kkk.charCodeAt(i);
		c2 = kkk.charCodeAt(i+1); // ToDo: i may be out of bounds
		if ((c1>=0xd800) && (c1<=0xdfff)) {
			if ((c2>=0xdc00) && (c2<=0xdfff)) {
				u32 = (((c1&0x3ff) << 10) | (c2&0x3ff)) + 0x10000;
				bux += String.fromCharCode(
					0xf0 | ( u32>>18        ),
					0x80 | ((u32>>12) & 0x3f),
					0x80 | ((u32>>6)  & 0x3f),
					0x80 | ( u32      & 0x3f)
					);
				i++;
			} else {
				bux += kkk[i];
			}
		} else {
				bux += kkk[i];
		}
		bux += '\u0000';
	}
	return bux;
  }; // utf32le

}; // EnDe.UCS

	// ===================================================================== //
	// global IDN(A) / Punycode functions                                    //
	// ===================================================================== //

this.IDN    = new function() {
/* Punycode en-/decoding according http://www.ietf.org/rfc3492.txt */
  this.sid      = function() { return(EnDe.sid() + '.IDN'); };
  this.dbx      = function(src,nl) { return EnDe.dbx(src,nl); };

  // constants
  this.BASE     = 36;
  this.TMIN     = 1;
  this.TMAX     = 26;
  this.SKEW     = 38;
  this.DAMP     = 700;
  this.BIAS     = 72;
  this.N        = 128;
  this.DELIMITER= '-';  // must be a single character, otherwise decoding fails, see RegEx in puny2str()
  this.PREFIX   = 'xn--';
  this.MAXINT   = 2147483647; // EnDe.CONST.INT.MAX31 does not work ??

  function adapt(delta,num,first) {
	if (first===true) {
		delta = parseInt((delta / EnDe.IDN.DAMP), 10);
	} else {
		delta = parseInt((delta / 2), 10);
	}
	delta += parseInt((delta / num), 10);
	var k = 0;
	while(delta>parseInt((((EnDe.IDN.BASE-EnDe.IDN.TMIN)*EnDe.IDN.TMAX)/2), 10)) {
		delta = parseInt((delta / (EnDe.IDN.BASE-EnDe.IDN.TMIN)), 10);
		k += EnDe.IDN.BASE;
	}
	return parseInt(k + (((EnDe.IDN.BASE-EnDe.IDN.TMIN+1)*delta)/(delta+EnDe.IDN.SKEW)), 10);
  };

  function get_digit(chr) {
	if (chr.match(/[A-Z]/)!==null)  { return chr.charCodeAt()-65; } // 65 == 'A'.charCodeAt()
	if (chr.match(/[a-z]/)!==null)  { return chr.charCodeAt()-97; } // 97 == 'a'.charCodeAt()
	if (chr.match(/[0-9]/)!==null)  { return chr.charCodeAt()-22; } // 48 == 'a'.charCodeAt(); -48+26
	return null; // ToDo: internal error
  };

  function get_code(dig) {
	if ((0<=dig) && (dig<26))       { return dig + 97; }// 97 == 'a'.charCodeAt()
	if ((25<dig) && (dig<36))       { return dig + 22; }// 48 == '0'.charCodeAt(); 48-26
	return null; // ToDo: internal error
  };

  function get_t(k,bias) {
	if (k<=(bias              ))    { return EnDe.IDN.TMIN; }
	if (k>=(bias+EnDe.IDN.TMAX))    { return EnDe.IDN.TMAX; }
	return (k - bias);
  };

  this.libidn   = function(src,suffix) {
  //#? check for trailing suffix and remove it
	var bux = src;
	if (suffix!=='') {
		if (bux[bux.length-1]===suffix) { bux = bux.substr(0,bux.length-1); }
		// NOTE: bux.length--  does not work reliable !
	}
	return bux;
  };

  this.str2puny = function(src) {
  //#? convert plain text to punycode
	var n     = this.N;
	var bias  = this.BIAS;
	var delta = 0;
	var basic = '';
	var ccc = null;
	var i   = 0, k = 0, x = 0, m = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if ((0<=ccc) && (ccc<128)) {
			basic += src[i];
		}
	}
	var bux = basic;
	var b   = basic.length;
	var h   = b;
	if (bux.length>=src.length){ return bux; } // don't waste time
	if (bux.length< src.length){ if (bux.length>0) { bux += this.DELIMITER; } }
	var kkk = EnDe.maxloop; // ToDo: pedantic check if someone passes too long strings
	while ((h<src.length) && (kkk>0)) {
		kkk--;
		m = this.MAXINT;
		for (x=0; x<src.length; x++){
			var c = src.charCodeAt(x);
			if ((c>=n) && (c<m)) { m = c; }
		}
		delta += ((m-n) * (h+1));
		n = m;
		if (delta>this.MAXINT) { break; } // ToDo: should never happen
		for (i=0; i<src.length; i++) {
			kkk--;
			if (kkk<0) { EnDe.alert('EnDe.IDN.str2puny:',EnDe.maxloop); return src; } // ToDo: internal error
			ccc = src.charCodeAt(i);
			if (ccc < n) { delta++; }
			if (ccc===n) {
				var q = delta;
				for (k=this.BASE; true; k+=this.BASE) {
					kkk--;
					if (kkk<0) { EnDe.alert('EnDe.IDN.str2puny:','+'+EnDe.maxloop); break; } // ToDo: internal error
					t  = get_t(k,bias);
/*
// ToDo: Punycode.pm uses above logic in get_t()
// ToDo: jkode_pjc.compressed.js uses below logic; both seem to work :-/
					if (    k<=(bias+this.TMIN)) { t = this.TMIN; }
					else {
						if (k>=(bias+this.TMAX)) { t = this.TMAX; }
						else                     { t = k - bias;  }
					}
*/
					if (q<t) { break; }
					bux += String.fromCharCode(get_code(t + ((q-t)%(this.BASE-t))));
					q = parseInt(((q-t) / (this.BASE-t)), 10);
					q = Math.floor(q); // ToDo: JavaScript special ?? #5dec09: may be obsolete as we use parseInt() now
				}
				bux  += String.fromCharCode(get_code(q));
				bias  = adapt(delta,(h+1),(h===b));
				delta = 0;
				h++;
			}
		}
		delta++;
		n++;
	}
	return bux;
  }; // str2puny

  this.str2idn  = function(src) {
  //#? convert plain text to IDN/punycode
	var bux = this.str2puny(src);
	if (bux===src) { return src; }
	return this.PREFIX + this.str2puny(src);
  };

  this.puny2str = function(src) {
  //#? convert punycode to plain text
	var bux = src;
	var n   = this.N;
	var bias= this.BIAS;
	var i   = 0;
	var x   = 0;
	var kkk = src.match(/[\x80-\uffff]+/); // hope there are no larger code points than \xffff
	if (kkk!==null) { // contains invalid code points
		kkk.pop();
		return bux;
	}
	kkk = null;
	if (src[src.length-1]===this.DELIMITER){ return src; } // not a punycode
	/*
		we may get something like "a----ooa" which is the punycode for "a---Ã¤"
		only the last - (DELIMITER) will be discarded, all others are part of
		the original string
	*/
	x = src.lastIndexOf(this.DELIMITER);
	if (x>=0) {
		bux = src.substr(0,x);
		kkk = src.substr((x+1), src.length);
	}
	if (kkk===null)   { return src; }   // not a punycode
	if (kkk===bux)    { return src; }   // not a punycode
	if (kkk.length<3) { return src; }   // not a punycode
	x = 0;
	var ccc = '';
	var old = i;
	var w   = 1;
	var t   = 0;
	var k   = 0;
	while (x<kkk.length) {
		ccc = '';
		old = i;
		w   = 1;
		k   = 0;
		for (k=this.BASE; true; k+=this.BASE) {
			if (x>=EnDe.maxloop) {    return bux; } // ToDo: '[DE.puny2str: input too large (>' + EnDe.maxloop + '); aborted]';
			if (kkk[x]===undefined) { return bux; } // no more valid letters, invalid punycode
			ccc = get_digit(kkk[x]);
			x++;
			i += (ccc * w);
			t  = get_t(k,bias);
			if (ccc<t) { break; }
			w *= (this.BASE - t);
		}
		bias = adapt((i-old), (bux.length+1), (old===0));
		n   += parseInt(i / (bux.length+1), 10);
		i    = parseInt(i % (bux.length+1), 10);
		bux  = bux.substr(0, i) + String.fromCharCode(n) + bux.substr(i);
		i++;
	}
	return bux;
  }; // puny2str

  this.idn2str  = function(src) {
  //#? convert IDN/punycode plain text
	if (src.match(new RegExp('^' + this.PREFIX, ''))!==null) {
		return this.puny2str(src.replace(new RegExp('^' + this.PREFIX, ''), ''));
	} else {
		return src;
	}
  }; // idn2str

}; // EnDe.IDN

	// ===================================================================== //
	// Encoding functions                                                    //
	// ===================================================================== //

this.EN     = new function() {
  this.sid      = function() { return(EnDe.sid() + '.EN'); };
  this.dbx      = function(src,nl) { return EnDe.dbx(src,nl); };

  this.chr      = function(_n1_,_n2_,_n3_,src,prefix,suffix,delimiter) { return EnDe.str2chr(src,prefix,suffix,delimiter); };
  //#? convert string to list of characters with prefix, delimiter and suffix

  this.hex      = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? convert plain text to hex encoded text
  //#type? null: converted hex value without prefix and no padding
  //#type? qp2:  converted hex value prefixed with =
  //#type? hex0: converted hex value (no padding)
  //#type? hex1: converted hex value (no padding)
  //#type? 2:    converted 2-digit hex
  //#type? 3:    converted 3-digit hex
  //#type? n:    converted n-digit hex
  //#type? url2: converted hex value prefixed with %
  //#type? url3: converted hex value prefixed with %0
  //#type? url4: converted hex value prefixed with %00
  //#type? urlc: set high bit in hex encoding (results in %c0 prefix)
  //#type? ncr2: converted hex value prefixed with &#x
  //#type? ncr4: converted hex value prefixed with &#x00
  //#type? nibbles: convert hex value to its nibble hex values
  //#type? nibble1: convert hex value to its first nibble hex value
  //#type? nibble2: convert hex value to its second nibble hex value
	var bux = '';
	var bbb = 0;
	var kkk = '';
	var i   = 0;
	switch (type) {
	  case 'urlc'   : prefix = prefix + '%c0'; bbb = 128; break; // ToDo: prefix is dirty hack
	  case 'ncr2'   : suffix = ';' + suffix; break;
	  case 'ncr4'   : suffix = ';' + suffix; break;
	  default       : break;   // anything else don't change
	}
	kkk = parseInt(type, 10);
	if ((isNaN(kkk)) && (type!=='null')) {
// ToDo: old code, needs to be replaced with EnDe.i2h()
		if (type.match(/nibble/)!==null) {
			for (i=0; i<src.length; i++) {
				//kkk = EnDe.h2n(type,mode,uppercase,src.charCodeAt(i),'','','');
				kkk = EnDe.h2n(type,mode,uppercase,src.charCodeAt(i),prefix,suffix,delimiter);
// ToDo: should distinguish 2 modes: delimiter between nibbles and delimiter at end of both nibbles
				bux += prefix + kkk + suffix; // + delimiter;
			}
		} else {
			for (i=0; i<src.length; i++) {
				bux += prefix + EnDe.dez2hex(type,mode,uppercase,src.charCodeAt(i)+bbb,prefix,suffix,'') + suffix + delimiter;
			}
		}
	} else {
		for (i=0; i<src.length; i++) {
			kkk = EnDe.i2h(type,src.charCodeAt(i));
			if (uppercase==true) { kkk = kkk.toUpperCase(); }
			bux += prefix + kkk + suffix + delimiter;
		}
	}
	if (delimiter!=='') {   // remove trailing delimiter
		bux = bux.substring(0,bux.length-delimiter.length);
	}
	kkk = null;
	return bux;
  }; // hex

  this.url      = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? convert plain text to URL encoded text
  //#type? null: converted URL (hex) value without prefix and no padding
  //#type? qp2:  converted URL (hex) value prefixed with =
  //#type? hex0: converted URL (hex) value (no padding)
  //#type? hex1: converted URL (hex) value (no padding)
  //#type? 3:    converted 3-digit URL (hex)
  //#type? n:    converted n-digit URL (hex)
  //#type? url2: converted URL (hex) value prefixed with %
  //#type? url3: converted URL (hex) value prefixed with %0
  //#type? url4: converted URL (hex) value prefixed with %00
  //#type? urlc: set high bit in URL (hex) encoding (results in %c0 prefix)
  //#type? ncr2: converted URL (hex) value prefixed with &#x
  //#type? ncr4: converted URL (hex) value prefixed with &#x00
  //#type? ucs:  converted URL (hex) value prefixed with % (hex values for Unicode character)
  //#type? utf8: converted URL (hex) value prefixed with % (hex values for UTF-8 character)
  //#type? utf8c: set high bit in URL (hex) encoding (results in %c0 prefix)
  //#type? nibbles: convert URL (hex) value to its nibble hex values
  //#type? nibble1: convert URL (hex) value to its first nibble hex value
  //#type? nibble2: convert URL (hex) value to its second nibble hex value
// ToDo: check  for RFC conformance
	var len = 0;
	var bux = '';
	var hex = '';
	var ccc = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		len = src.charCodeAt(i).toString(16).length;
		if (EnDe.CONST.CHR.urlReg.test(src.charAt(i))===true) {
			// leave character as is
			bux += src.charAt(i);
		} else {
			// encode anything else
			switch (type) {
			  case 'utf8' : ccc = this.utf8('null',mode,uppercase,src.charAt(i),prefix,suffix,delimiter); break;
			  case 'utf8c':
				ccc = src.charCodeAt(i) + 128;
				ccc = this.utf8('null',mode,uppercase,String.fromCharCode(ccc),prefix,suffix,delimiter);
				break;
			  case 'ucs'  : ccc = src.charAt(i); break;
			  case 'nibbles':
			  case 'nibble1':
			  case 'nibble2':
				ccc = EnDe.h2n(type,mode,uppercase,src.charCodeAt(i),'%','','');
				bux += prefix + ccc + suffix + delimiter;
				continue;
				break;
			  default     : ccc = src.charAt(i); break;
			}
			hex = this.hex('url2',mode,uppercase,ccc,prefix,suffix,delimiter);
			//if (src.charCodeAt(i) < 128) {
			//	hex = this.hex('url2',mode,uppercase,src.charAt(i),prefix,suffix,delimiter);
			//} else {        // convert to hex
// ToDo: "strict" only
			//	hex = this.hex('url2',mode,uppercase,src.charAt(i),prefix,suffix,delimiter);
			//}
			if (uppercase) { hex = hex.toUpperCase(); }
			bux += hex;
		}
	}
	hex = null;
	ccc = null;
	return bux;
  }; // url

  this.dez      = function(type,mode,_n3_,src,prefix,suffix,delimiter) {
  //#? convert plain text to decimal encoded text
  //#type? null: converted decimal value with variable length (2-3 digits)
  //#type? ncr2: converted decimal value prefixed with &#x
  //#type? 3:    converted 3-digit decimal
  //#type? n:    converted n-digit decimal
	var bux = '';
	var kkk = 2;
	var ccc;
	var pre = prefix;
	var i   = 0;
	switch (type) {
	  case 'ncr2'   : pre  = '&#'; suffix = ';' + suffix; break;
	  default       : pre += '';
			kkk = parseInt(type, 10);
			if (isNaN(kkk)) { kkk = 2; }
		break;   // anything else don't change
	}
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i).toString();
		if (ccc.length>0) {
			while (ccc.length<kkk) { ccc = '0' + ccc; }
			bux += pre + ccc + suffix + delimiter;
		} else {
			bux += ' ['+ ccc +' invalid] ';
		}
	}
	if (delimiter!=='') {   // remove trailing delimiter
		bux = bux.substring(0,bux.length-delimiter.length);
	}
	return bux;
  }; // dez

  this.oct      = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? convert plain text to octal encoded text
  //#type? null: converted octal value with variable length (2-3 digits)
  //#type? 3:    converted 3-digit octal
  //#type? n:    converted n-digit octal
	var bux = '';
	var kkk = 0;
	switch (type) {
	  case 'null': kkk = 0; break;
	  default    :
		kkk = parseInt(type, 10);
		if (isNaN(kkk)) { kkk = 0; }
		break;
	}
	var oct  = '';
	var ccc  = 0;
	var i   = 0;
	for (i=0; i<src.length; i++) {
		oct  = parseInt(src.charCodeAt(i), 10).toString(8);
		while (oct.length<kkk) { oct = '0' + oct; }
		bux += prefix + oct + suffix + delimiter;
	}
	if (delimiter!=='') {   // remove trailing delimiter
		bux  = bux.substring(0,bux.length-delimiter.length);
	}
	return bux;
  }; // oct

  this.bin      = function(type,mode,_n3_,src,prefix,suffix,delimiter) {
  //#? convert string to n-bit binary string
  //#type? 6:    converted 6-digit binary
  //#type? 7:    converted 7-digit binary
  //#type? 8:    converted 8-digit binary
  /* wrapper for EnDe.str2bin() */
// ToDo: buggy for chr>255
	return EnDe.str2bin(type,src,prefix,suffix,delimiter);
  }; // bin

  this.bcd      = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert numbers in text to BCD coded numbers
	var bux = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		if (src[i].match(/\d/)!==null) {
			bux += EnDe.i2bcd(src[i]) + delimiter; // ToDo: last delimiter should be avoided
		} else {
			bux += src[i];
		}
	}
	return bux;
  }; // bcd

  this.aiken    = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert numbers in text to Aiken coded numbers
	var bux = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		switch (src[i]) { // quick&dirty // ToDo: should be defined in EnDeMaps.js
		  case '0'  : bux += '0000' + delimiter; break;
		  case '1'  : bux += '0001' + delimiter; break;
		  case '2'  : bux += '0010' + delimiter; break;
		  case '3'  : bux += '0011' + delimiter; break;
		  case '4'  : bux += '0100' + delimiter; break;
		  case '5'  : bux += '1011' + delimiter; break;
		  case '6'  : bux += '1100' + delimiter; break;
		  case '7'  : bux += '1101' + delimiter; break;
		  case '8'  : bux += '1110' + delimiter; break;
		  case '9'  : bux += '1111' + delimiter; break;
		  default   : bux += src[i]; break;
		}
	}
	return bux;
  }; // aiken

  this.stibitz  = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert numbers in text to Stibitz coded numbers
	var bux = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		switch (src[i]) { // quick&dirty (is BCD + 3) // ToDo: should be defined in EnDeMaps.js
		  case '0'  : bux += '0011' + delimiter; break;
		  case '1'  : bux += '0100' + delimiter; break;
		  case '2'  : bux += '0101' + delimiter; break;
		  case '3'  : bux += '0110' + delimiter; break;
		  case '4'  : bux += '0111' + delimiter; break;
		  case '5'  : bux += '1000' + delimiter; break;
		  case '6'  : bux += '1001' + delimiter; break;
		  case '7'  : bux += '1010' + delimiter; break;
		  case '8'  : bux += '1011' + delimiter; break;
		  case '9'  : bux += '1100' + delimiter; break;
		  default   : bux += src[i]; break;
		}
	}
	return bux;
  }; // stibitz

  this.cp   = function(src) {
  //#? convert all characters from unicode base to Windows CP-1252 characters
	var bux = '';
	var ccc = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if (EnDe.winfMap[ccc]===undefined) {
			bux += src.charAt(i);
		} else {
			bux += String.fromCharCode(EnDe.winfMap[ccc][EnDe.mapInt]);
		}
	}
	return bux;
  }; // cp

  this.dta  = function(src) {
  //#? convert all characters from ASCII to DIN66003 characters
	var bux = '';
	var ccc = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if (EnDe.DIN66003Map[ccc]===undefined) {
			if ((ccc>96) && (ccc<=123)) {   // convert lower case to upper case
				bux += String.fromCharCode(ccc-32);
			} else {
				bux += src.charAt(i);
			}
			continue;
		} else {
			bux += String.fromCharCode(EnDe.DIN66003Map[ccc][EnDe.mapChr]);
		}
	}
	return bux;
  }; // dta

  this.ucs      = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? convert plain text to Unicode UCS-2 encoded text
  //#type? null: converted Unicode without prefix
  //#type? url4: converted Unicode prefixed %u
  //#type? ucs4: converted Unicode prefixed \u
  //#type? IE4:  converted Unicode prefixed \u
	var len = 0;
	var pre = '';
	var kkk = '';
	var bux = '';
	var i   = 0, k = 0;
	switch (type) {
	  case 'null':  pre = '';     break;
	  case 'url4':  pre = '%u';   break;
	  case 'ucs4':
	  case 'IE4':   pre = '\\u';  break;
	  default:      pre = '%u';   break;
	}
	for (i=0; i<src.length; i++) {
		len = src.charCodeAt(i).toString(16).length;
		if (len >0) {
			kkk = src.charCodeAt(i).toString(16);
			if (uppercase===true) {
				kkk = kkk.toUpperCase();
			}
			bux += pre;
			for (k=len; k<4; k++) { // add leading 0
				bux += '0';
			}
			bux += kkk + suffix + delimiter;
		} else {
			bux += ' ['+ src.charAt(i) +' invalid] ' + suffix + delimiter;
		}
	}
	if (delimiter!=='') {   // remove trailing delimiter
		bux = bux.substring(0,bux.length-delimiter.length);
	}
	return bux;
  }; // ucs

  this.utf7     = function(type,_n2_,_n3_,src,_n5_,_n6_,_n7_) {
  //#? convert plain text to UTF-7 encoded text
  //#type? null: convert UTF-7 unsave characters only
  //#type? all:  convert all characters
	function _isUTF7(type,c) {
		switch (type) {
		  case 'null': return EnDe.UCS.isUTF7(c); break;
		  case 'all' : return false;              break;
		}
		return false; // fall back
	}
	function _code2chr(charid) {
	// return Base64 character from character code //ToDo: replace by proper function from EnDeB64.js
		var ccc = charid;
		if      (ccc <= 25) { ccc += 65; } //
		else if (ccc <= 51) { ccc += 71; } // 3
		else if (ccc <= 61) { ccc -= 4;  } // =
		else if (ccc == 62) { ccc  = 43; } // >
		else                { ccc  = 47; }
		return String.fromCharCode(ccc);
	};
	var bux = '';
	var kkk = '';
	var c1  = 0, c2 = 0, c3 = 0, c4 = 0;
	for (c1=0; src.charAt(c1); c1++) {
		if (_isUTF7(type,src.charAt(c1))===true) {
			bux += src.charAt(c1);
		} else if (src.charAt(c1) == '+') {
			bux += '+-';
		} else {
			for (c2=c1; src.charAt(c2) && !_isUTF7(type,src.charAt(c2)); c2++);
			kkk = src.substring(c1,c2);
			c1 = c2 - 1;
			c2 = 0;
			bux += '+';
			for (c3=0; kkk.charAt(c3); c3++) {
				c4 = kkk.charCodeAt(c3);
				if (c2 != 0) {
					c4 = c4 | ((kkk.charCodeAt(c3-1) - ((kkk.charCodeAt(c3-1) >>> c2) << c2)) << 16);
				}
				bux += _code2chr((c4 >>> (10 + c2)) & 0x3F) + _code2chr((c4 >>> (4 + c2)) & 0x3F);
				c2 += 4;
				if (c2 >= 6) {
					c2 -= 6;
					bux += _code2chr((c4 >>> c2) & 0x3F);
				}
			}
			if (c2 != 0) {
				bux += _code2chr((kkk.charCodeAt(c3-1) - ((kkk.charCodeAt(c3-1) >>> c2) << c2)) << (6 - c2));
			}
			bux += '-';
		}
	}
	return bux;
  }; // utf7

  this.utf      = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return bux; };
  //#? dispatcher/wrapper for EnDe.UCS.* calls

  this.utf16le  = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.UCS.getBOM('UTF16LE') + EnDe.UCS.utf16le(src); };
  //#? wrapper for EnDe.UCS.utf16le

  this.utf16be  = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.UCS.getBOM('UTF16BE') + EnDe.UCS.utf16be(src); };
  //#? wrapper for EnDe.UCS.utf16be

  this.utf16    = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.UCS.utf16be(src); };
  //#? wrapper for EnDe.UCS.utf16be

  this.utf32le  = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.UCS.getBOM('UTF32LE') + EnDe.UCS.utf32le(src); };
  //#? wrapper for EnDe.UCS.utf32le

  this.utf32be  = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.UCS.getBOM('UTF32BE') + EnDe.UCS.utf32be(src); };
  //#? wrapper for EnDe.UCS.utf32be

  this.utf8bom  = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.UCS.getBOM('UTF8') + this.utf8(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_); };
  //#? convert plain text to UTF-8 encoded text with BOM

  this.utf8     = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) {
  //#? convert plain text to UTF-8 encoded text
// ToDo: The implemented conversion works for UCS-2 (16 bit) characters only
//       means that characters which are composed of 2 UCS-2 characters may
//       be display in the browser correctly as on character but will be
//       encoded then as 6 bytes, which usually results in a CESU-8 coding.
/* Example:
 * Unicode
 * code point   U+10400
 * character    ¿
 * UTF-8        F0 90 90 80
 * UTF-16       D801 DC00
 * CESU-8       ED A0 81 ED B0 80
 */
	var bux = '';
	var c   = 0;
	var i   = 0;
	src = src.replace(/\r\n/g, '\n');
	for(i=0; i<src.length; i++) {
		c=src.charCodeAt(i);
		if (c<128) { // 1 byte: 0x00 - 0x7F
			bux += String.fromCharCode( c );
		} else if((c>127) && (c<2048)) { // 2 byte: 0x80 - 0x7FF
			bux += String.fromCharCode( (c>>6)    |192); // 0xC0 in first byte
			bux += String.fromCharCode( (c    &63)|128);
		} else {     // 3 byte: 0x800 - 0xFFFF
			bux += String.fromCharCode( (c>>12)   |224); // 0xE0 in first byte
			bux += String.fromCharCode(((c>>6)&63)|128);
			bux += String.fromCharCode( (c    &63)|128);
		}
	}
	return bux;
  }; // utf8

  this.f2h      = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.UCS.f2h(src); };
  //#? convert fullwidth Unicode to halfwidth Unicode characters; wrapper for EnDe.UCS.f2h()

  this.h2f      = function(type,mode,uppercase,src,_n5_,_n6_,_n7_) {
  //#? convert halfwidth Unicode to fullwidth Unicode characters (UTF-16, 2 bytes)
  //#type? null: converted fullwidth Unicode characters are UTF-16, 2 bytes
  //#type? utf8: converted fullwidth Unicode characters are UTF-8, 3 bytes
  /* wrapper for EnDe.UCS.h2f() */
	switch (type) {
	  case 'utf8'   : return this.utf8('null', mode, uppercase, EnDe.UCS.h2f(src), '', '', ''); break;
	  default       : return EnDe.UCS.h2f(src);
	}
	return ''; // fallback, never reached but keeps lint quiet
  }; // h2f

  this.ncr      = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? convert plain text to named/numbered HTML-Entity
  //#type? null: assume standard character map; using HTML named Entities
  //#type? name: assume standard character map; using HTML named Entities
  //#type? css:  assume standard character map; using HTML hex numberd Entities
  //#type? dez:  assume standard character map; using HTML decimal numberd Entities
  //#type? winf: assume force convertion as from Windows CP-1252 character map
  //#type? win:  assume Windows CP-1252 character map
	var bux = '';
	var ccc = '';
	var map = null;
	var pre = '';
	var i   = 0;
	switch (type) {
	  case 'name'   : pre = '&';  map = EnDe.intMap;  break;
	  case 'winf'   : pre = '&';  map = EnDe.winfMap; break;
	  case 'win'    : pre = '&';  map = EnDe.winMap;  break;
	  case 'css'    : pre = '\\'; map = EnDe.intMap;  break;
	  default       : pre = '&#'; map = EnDe.intMap;  break;
	}
	// loop through source should be faster than using replace(), usually ..
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if (map[ccc]===undefined) {
			switch (type) {
			case 'win'  :
				if (EnDe.intMap[ccc]!==undefined) {
					bux += pre + EnDe.intMap[ccc][EnDe.mapEty] + suffix + delimiter; break;
				} else {
					bux += src.charAt(i);
					//bux += EnDe.dez2hex('ncr2',mode,uppercase,ccc,prefix,'','') + suffix + delimiter; break;
					// ToDo: dez2hex() fails if ';' passed as delimiter
				}
				break;
// ToDo: case 'winf':  missing
			case 'css'  : bux += src.charAt(i); break;
			case 'dez'  :
// ToDo: think about this functionalty: ncrDEC
				if ((EnDe.isalnum(src.charAt(i))===true) || (ccc>127)) {
					bux += src.charAt(i);
				} else {
					bux += pre + ccc + suffix + delimiter;
				}
				break;
			case 'name' :
			default     : bux += src.charAt(i); break;
			}
		} else {
			switch (type) {
			case 'null' :
			case 'name' :
			case 'win'  :
				if (EnDe.intMap[ccc]!==undefined) {
					bux += pre + EnDe.intMap[ccc][EnDe.mapEty] + suffix + delimiter; break;
				} else {
					bux += src.charAt(i);
					// bux += EnDe.dez2hex('ncr2',mode,uppercase,ccc,prefix,'','') + suffix + delimiter; break;
					// ToDo: dez2hex() fails if ';' passed as delimiter
				}
				break;
			case 'winf' : bux += pre + map[ccc][EnDe.mapEty] + suffix + delimiter;  break;
			//case 'win'  : bux += EnDe.dez2hex('ncr2',mode,uppercase,ccc,prefix,'','') + ';' + suffix; break;
			case 'css'  : bux += pre + EnDe.dez2hex('null','lazy',uppercase,ccc,'','','') + suffix + delimiter;break;
			case 'dez'  : bux += pre + ccc + suffix + delimiter;                    break;
			default     : bux += src.charAt(i); break;
		    //default     : bux += '[EnDe.DE.ncr: invalid type "' + type + '"]';      break; // ToDo: depends on mode
			}
		}
	}
	map = null;
	return bux;
  }; // ncr

  this.toCode   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.chr2code(src); };
  //#? wrapper for EnDe.chr2code()

  this.fromCode = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.code2chr(src); };
  //#? wrapper for EnDe.code2chr()

  this.fromJava = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.java2chr(src); };
  //#? wrapper for EnDe.java2chr()

  this.xml      = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) {
  //#? convert plain text to XML-escaped text
	var bux = '';
	var ccc = '';
	var i   = 0;
	// don't use RegExp() here 'cause it depends on sequence of characters in EnDe.xmlMap
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if (EnDe.xmlMap[ccc]!==undefined) {
			bux += '&' + EnDe.xmlMap[ccc] + ';'; // ToDo: for mode lazy
			//bux += '&#' + ccc + ';'; // ToDo: for mode strict
		} else {
			bux += src.charAt(i);
		}
	}
	ccc = null;
	return bux;
  }; // xml

  this.esc      = function(type,_n2_,uppercase,src,_n5_,_n6_,_n7_) {
  //#? convert plain text to escaped text
  //#type? escCSS:  use CSS hex numbered entities
  //#type? escHTML: use HTML named Entities
  //#type? escURL:  use URL encoding
  //#type? escJS:   use \-escaped \ and " and '
  //#type? escSQL:  use '' for '
  //#type? escQuote:  use URL encoding
  //#type? escXML:  use XML named Entities
  //#type? escJava: use \-escaped " and \uHHHH for other non-US-ASCII
	var bux = '';
	var bbb = 0;
	var ccc = 0;
	switch (type) {
	  case 'escCSS':    bux = this.ncr('css', '',uppercase,src,'\\','',''); break;
	  case 'escHTML':   bux = this.ncr('name','',uppercase,src, '',';',''); break;
	  case 'escURL':    bux = this.url('utf8','',uppercase,src, '', '',''); break;
	  case 'escJS':     bux = src.replace(/['"\\]/g, function(c){return '\\'+c;}); break;
	  case 'escSQL':    bux = src.replace(/'/g, "''"); break;
	  case 'escQuote':  bux = src.replace(/"/g, '\\"').replace(/'/g, "\\'"); break;
	  case 'escXML':    bux = this.xml('', '',uppercase,src,'','',''); break;
	  case 'escJava':
	  case 'escJavaProp':
		for (bbb=0; bbb<src.length; bbb++) {
			if (/["\\]/.test(src.charAt(bbb))===true) { // ToDo: are there more such characters?
				bux += '\\' + src.charAt(bbb);
			} else {
				ccc = src.charCodeAt(bbb);
				if(ccc > 127) {
					bux += '\\' + parseInt(ccc,10).toString(16);
				} else {
					bux += src.charAt(bbb);
				}
			}
		}
		break;
	}
	return bux;
  }; // esc

/* irgendwas falsch hier
	darum ist der "ByteCount" am Zeilenanfang auch nicht implementiert
  this.uuChars  = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
  this.uu_DoesNotWork       = function(src) {
  //#? **trash**
	var bux = '';
	var i   = 0;
	while(src.length % 3 != 0) { src[src.length] = ' '; } // pad with spaces
	for (i=0; i<src.length; i+=3) {
		var n = (((src.charCodeAt(0) ^ 67)<<8) | (src.charCodeAt(i+1) ^ 67))<<8 | (src.charCodeAt(i+2) ^ 67);
		bux += this.uuChars[(n>>18) & 0x3f] +
			this.uuChars[(n>>12) & 0x3f] +
			this.uuChars[(n>> 6) & 0x3f] +
			this.uuChars[ n      & 0x3f];
	}
	return bux;
  }; // uu_DoesNotWork
*/

  this.uu       = function(type,mode,_n3_,src,prefix,suffix,delimiter) {
  //#? convert plain text to UUencode text; delimiter is the padding character
  //#type? null:
  //#type? raw:  convert UUencode without prefix and suffix
  //#type? all:  convert all characters
  //# type? user:
	var bux = '';
	var pad = 0;
	var i   = 0;
	var c1  = 0, c2 = 0, c3 = 0;
	if (type==='raw') { pad = -1; }    // avoid padding
	for (i=0; i<src.length; i+=3) {
		c1 = src.charCodeAt(i);
		c2 = src.charCodeAt(i+1);
		c3 = src.charCodeAt(i+2);
		if (isNaN(c2)) { c2 = 0; }
		if (isNaN(c3)) { c3 = 0; }
		if (type!=='raw') {
			if (pad == 0)  { bux += EnDe.CONST.CHR.uuCount; } // line count
			pad += 3;
		}
		bux += String.fromCharCode(
			0x20 + (( c1>>2                   ) & 0x3F),
			0x20 + (((c1<<4) | ((c2>>4) & 0xF)) & 0x3F),
			0x20 + (((c2<<2) | ((c3>>6) & 0x3)) & 0x3F),
			0x20 + (( c3                      ) & 0x3F)
		    );
		if ((pad % 45) == 0) { bux += '\n'; pad = 0; }
	}
	if (type!=='raw') {
// ToDo: padd count wrong
		while (pad<52) { bux += delimiter; pad++; } // add padding
		if  (pad===52) { bux += '\n' }
		bux  = bux.replace(/ /g, delimiter);
		bux  = prefix    + bux;   // begin line
		bux += delimiter + '\n';  // final empty line
		bux += suffix;            // nd line
	}
	c1 = null; c2 = null; c3 = null;
	return bux;
  }; // uu

  this.qp       = function(type,mode,_n3_,src,_n5_,_n6_,_n7_) {
  //#? convert plain text to quoted printable text
  //#type? null: convert all characters
  //#type? raw:  do not convert \n and \r characters
	var specials = '()<>@,;:\\"/[]?=';
	var bux = '';
	var ccc = -1;
	var len = 0;
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charAt(i);
		if ((ccc < ' ') || (ccc==='=') || (ccc > '~')) {
			// literal: 33-60, 62-126
			if ((type!=='raw') && (ccc!=='=')) {
				// keep \r\n as line break
				if ((ccc==='\r') && (src.charAt(i+1)==='\n'))  {
					bux += '=\r\n'; // quick&dirty
					len = 2;
					continue;
				}
				if (ccc==='\n') { bux += '\n'; len = 1; continue; }
				if (ccc==='\t') { ccc  = '\t'; }
			} else {
				ccc = EnDe.dez2hex('qp2',mode,true,src.charCodeAt(i),'','','');
			}
		}
		// 9 and 32 as is but not at last char in line
		if (((ccc===' ') || (ccc==='\t')) && (len===76)) { len++; }
		len += ccc.length;
		if (len > 76) {
			bux += '=\r\n';
			len = ccc.length;
		}
		bux += ccc;
	}
	return bux;
  }; // qp

  this.idn      = function(type,_n2_,_n3_,src,_n5_,suffix,_n7_) {
  //#? convert string to punycode or IDNA-punycode
  //#type? IDN:  convert URI only
  //#type? PNY:  convert FQDN only (strip off leading schema and trailing search parameter)
  //#type? PNY_: convert complete string
  //#type? IDN_: convert complete string
  // suffix used for libidn compatible mode (trailing -)
  /*
   *            schema://ANY.THING.HERE?whatever
   */
// ToDo: same as DE.idn() except conversion function
	var bux = src;
	switch (type) {
	  case 'PNY_':  bux = EnDe.IDN.str2puny(src);   break;
	  case 'IDN_':  bux = EnDe.IDN.str2idn(src);    break;
	  case 'PNY':
	  case 'IDN':
		//var kkk = src.match(/([a-zA-Z]+:\/\/)?([^\?\/]+)\?(.*)$/); // JavaScript is too stupid for this
		var ccc = '';
		var idn = '';
		var sch = '';
		var uri = '';
		var fqdn= '';
		var rest= '';
		var kkk = src.match(/^(\s*[a-zA-Z]*:\/\/)((?:.|\s)*)/);
		if (kkk!==null) {  // got schema
			sch = kkk[1];
			uri = kkk[2];
		} else {
			uri = src;
		}
		kkk = uri.match(/([^\?]+)\/((?:.|\s)*)$/);
		if (kkk!==null) {  // got search
			fqdn = kkk[1];
			rest = '/' + kkk[2];
		} else {
			fqdn = uri;
		}
		kkk = fqdn.split('.');
		while ((ccc=kkk.shift())!==undefined) {
			switch (type) {
			  case 'PNY': idn += '.' + EnDe.IDN.str2puny(ccc);  break;
			  case 'IDN': idn += '.' + EnDe.IDN.str2idn(ccc);   break;
			}
		}
		if (idn!=='') {
			fqdn = idn.substring(1, idn.length);  // remove leading .
		}
		bux = sch + fqdn + rest;
		break;
	}
	if (bux===src) { bux += suffix; }
	return bux;
  }; // idn

  this.a2e      = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.a2e(src); };
  //#? convert ASCII to EBCDIC characters

  this.e2a      = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,_n7_) { return EnDe.e2a(src); };
  //#? convert EBCDIC to ASCII characters

  this.rot      = function(_n1_,_n2_,_n3_,src,_n5_,key,_n7_)  { return EnDe.rot(src,key); };
  //#? convert string to rot-N-encoded text (aka Caesar encoding)

  this.sos      = function(_n1_,mode,_n3_,src,prefix,suffix,delimiter) {
  //#? convert to morse characters
	var bux = '';
	var ccc = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charAt(i).toLowerCase(); // ToDo: should depend on mode lazy
		if (EnDe.sosMap[ccc]!==undefined) {
			bux += EnDe.sosMap[ccc];
			if (i<src.length-1) { bux += ' '; }
		}
// ToDo: implement delimiter
	}
	bux = bux.substring(0,bux.length-1); // strip off trailung space
	return bux;
  }; // sos

  this.baudot   = function(_n1_,mode,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert to Baudot characters
	var bux = '';
	var ccc = '';
	var ltr = 1;
	var baud= '';
	var isfig=0;
	var isltr=0;
	var i   = 0;
// ToDo: lazy&stupid implementation
	for (i=0; i<src.length; i++) {
		ccc = src.charAt(i).toUpperCase(); // ToDo: should depend on mode lazy
		isltr = 0;
		for(baud in EnDe.ltrsMap) {
			if (EnDe.ltrsMap[baud]===ccc) { isltr = 1; break; }
		}
		if (isltr===1) {
			if (ltr===0) {
				bux += '11111' + ' ';
				ltr  = 1;
			}
			bux += baud + ' ';
			continue;
		}
		isfig = 0;
		for(baud in EnDe.figsMap) {
			if (EnDe.figsMap[baud]===ccc) { isfig = 1; break; }
		}
		if (isfig===1) {
			if (ltr===1) {
				bux += '11011' + ' ';
				ltr  = 0;
			}
			bux += baud + ' ';
			continue;
		}
		// fallback if nothing matches
		bux += '00000' + ' '; // ToDo: should depend on mode lazy
// ToDo: implement delimiter
	}
	bux = bux.substring(0,bux.length-1); // strip off trailung space
	return bux;
  }; // baudot

  this.braille  = function(type,mode,_n3_,src,prefix,_n6_,delimiter) {
  //#? convert to Braille characters
  //#type? ASCIIBr:  use ASCII-Braille symbols
  //#type? dotBr:    use dot-Braille symbols
  //#type? NumBr:    use number symbols
  //#type? DadaUrka: use Dada Urka symbols
	var bux = '';
	var bbb = new Array();
	var ccc = '';
	var kkk = null;
	var c   = 0;
	var i   = 0;
	var dot = (delimiter != '') ? delimiter : ' ';
	    dot = dot.substring(0,1);
	bbb[0] = ''; bbb[1] = ''; bbb[2] = ''; bbb[3] = '';
	for (i=0; i<src.length; i++) {
		ccc = src.charAt(i).toLowerCase();
		switch (type) {
		  case 'ASCIIBr': ccc = EnDe.AbrMap[ccc]; break;
		  case 'dotBr'  : ccc = EnDe.DbrMap[ccc]; break;
		  case 'NumBr'  : ccc = EnDe.NbrMap[ccc]; break;
		  case 'DadaUrka':ccc = EnDe.DadMap[ccc]; break;
		  case 'Blade'  : ccc = EnDe.Blademap[ccc]; break;
		  //case 'Blade'  : (/^[]$/.test(ccc)===true) ? ccc = EnDe.BladeMap[ccc] : ccc; break;
			// ToDo: purpose above test got Blade unknown; probaly browser issue
		  default       : ccc = EnDe.DbrMap[ccc]; break;
		}
		if (ccc != undefined) {
			bbb[0] += prefix + '  ' + ' ';
			kkk  = ccc.replace(/ /g, dot).split('\n');
			for (c=0; c<kkk.length; c++) {
				bbb[c+1] += prefix + kkk[c] + ' ';
			}
		} else {
			// Dada Urka only
			if (type == 'DadaUrka') {
				bbb[0] += prefix + '    ';
				bbb[1] += prefix + '    ';
				bbb[2] += prefix + ' ' + src.charAt(i) + '  ';
				bbb[3] += prefix + '    ';
			}
		}
		// force line break
		if ((bbb[1].length % 75)<(3+prefix.length)) { // ToDo: replace hardcoded value
			bux += bbb[0] + '\n' + bbb[1] + '\n' + bbb[2] + '\n' + bbb[3] + '\n';
			bbb[0] = ''; bbb[1] = ''; bbb[2] = ''; bbb[3] = '';
		}
	}
	bux += bbb[0] + '\n' + bbb[1] + '\n' + bbb[2] + '\n' + bbb[3] + '\n';
	while (kkk.pop()!=null) {}
	while (bbb.pop()!=null) {}
	return bux;
  }; // braille

  this.blade    = function(type,mode,_n3_,src,_n5_,_n6_,_n7_) {
  //#? convert digits to Blade (ASCII) symbols
	var bux = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charAt(i);
		if (/^[0-9]$/.test(ccc)===true) {
			bux += EnDe.BladeMap[ccc];
		} else {
			bux += ccc;
		}
	}
	return bux;
  }; // blade

  this.dmp      = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? convert to traditional xdump style: hex values left, characters right
	var bux = '';
	var str = '';
	var ccc = '';
	var left= '';
	var right= '';
	var c   = 0;
	var i   = 0;
	var k   = 0;
// ToDo: Safari and Firefox return different results
	var len = 16; // handle multi-byte characters
	while (i<src.length) {
// ToDo: replace following with EnDe.code2prn()  {
		ccc   = src.charAt(i);
		left += this.hex('hex2',mode,uppercase,ccc,prefix,suffix,delimiter) + delimiter;
		c     = src.charCodeAt(i);
		if ((c > 31) && (c <= 127)) {
			right += ' ' + ccc;
		} else if ((c > 127) && (c <= 255)) {
// ToDo: probably need additionl checks here
			right += ' ' + ccc;
		} else if ((c > 255) && (c <= 65635)) {
			right += ' ' + ccc;
			k += 1;
		} else if ((c > 65635)) {
			right += ' ' + ccc;
			k += 2;
		} else {
			str = '';
// ToDo: to be improved
// ToDo: replace ISO-8859 chars by UTF-8 chars or use charCode() with int
			switch(c) {
			  case 0:   str += '\\0'; break;
			  case 7:   str += '\\b'; break;
			  case 8:   str += '\\v'; break;
			  case 9:   str += '\\t'; break;
			  case 10:  str += '\\n'; break;
			  case 13:  str += '\\r'; break;
		/* following for windows-1252/CP-1252 mode only
			  case 196: str += ' Ä';  break;
			  case 214: str += ' Ö';  break;
			  case 220: str += ' Ü';  break;
			  case 232: str += ' ß';  break;
			  case 228: str += ' ä';  break;
			  case 246: str += ' ö';  break;
			  case 252: str += ' ü';  break;
		*/
			  default:  str += ' .';  break;
			}
			right += str;
		}
// ToDo: replace above with EnDe.code2prn()  }
		k++;
		if (k===len) {
			bux  += left + ' | ' + right + '\n';
			left  = '';
			right = '';
			k     = 0;
		}
		i++;
	}
	for (i=k; i<len; i++) {
		left += '   '; // + delimiter;
	}
	bux += left + ' | ' + right + '\n';
	return bux;
  }; // dmp

  this.odx      = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? convert to traditional "od -x" style: double hex values with space as delimiter
  //#type? ODx: od -x style big endian
  //#type? xOD: od -x style little endian
	function _hex (src) {
		var _x = parseInt(src, 10).toString(16);
		var _z = 0;
		for (_z=_x.length; _z<8; _z++) { _x = '0' + _x; }
		return _x;
	};
	function _bbb (_typ,_b1,_b2) {
		if (_b1==='') { return ''; }
		if (_b2==='') { return ''; }
		switch (_typ) {
		  case 'xDO':   return ' ' + _b2 + _b1; break;
		  case 'ODx':   return ' ' + _b1 + _b2; break;
		  default:      return ' ' + _b1 + ' ' + _b2; break;
		}
		return ''; // keep lint silent
	};
	var bux = _hex(0);
	var str = '';
	var ccc = '';
	var bbb = '';
	var bb1 = '';
	var bb2 = '';
	var i   = 0;
	var k   = 0;
	while (i<src.length) {
		ccc = src.charAt(i);
		i++;
		if (bb1==='') {
			bb1 = this.hex('hex1',mode,uppercase,ccc,prefix,suffix,delimiter);
			k++;
			if (bb1.length<=2) { continue; }
			// got more than 2 bytes
			k++;
			bb2 = bb1.substr(2,2);
			bb1 = bb1.substr(0,2);
		} else {
			bb2 = this.hex('hex1',mode,uppercase,ccc,prefix,suffix,delimiter);
			k++;
			if (bb2.length>2) {
				// got more than 2 bytes
				kkk = bb2;
				bb2 = bb2.substr(0,2);
				str += _bbb(type, bb1, bb2);
				if ((k%16)===0) {
					bux += str + '\n' + _hex(k);
					str = '';
				}
				bb1 = kkk.substr(2,2);
				bb2 = '';
				kkk = '';
				k++;
				continue;
			}
		}
		str += _bbb(type, bb1, bb2);
		bb1  = '';
		bb2  = '';
		if ((k%16)===0) {
			bux += str + '\n' + _hex(k);
			str = '';
		}
	}
	if (bb1!=='') { str += _bbb(type, bb1, '00'); }
	if (str!=='') { bux += str + '\n' + _hex(k); }
	return bux;
  }; // odx

  this.crc      = function(type,mode,uppercase,src,iv,mask,polynom) {
  //#? wrapper for CRC functions
	var bux = '';
	//#dbx this.dbx('.EN.crc(' + type + ', ' + iv + ', ' + mask + ', ' + polynom + ')');
	// iv, mask and polynom may be passed as integer or string
	// convert to integer values if it is a string, ignore leading \x or 0x
	if ((typeof   iv).match(/number/i)===null) { iv   = parseInt(iv.replace(/(^[\\0]x)/g,  ''), 16); }
	if ((typeof mask).match(/number/i)===null) { mask = parseInt(mask.replace(/(^[\\0]x)/g,''), 16); }
	var crctype = 'user';
	// workaound 'til there is a better GUI
	switch (polynom) {
	  case 'test':   type = 'test';      break;
	  case 'ARCtab':
	  case 'PPPtab':
	  case 'MODtab': crctype = polynom;  break; // NOTE that polynom is a string here
// ToDo: all above pass polynom as string to .CRC.dispatch assuming that it is not used
	  default:       crctype = 'user';
		if ((typeof polynom).match(/number/i)===null) {
			polynom = parseInt(polynom.replace(/(^[\\0]x)/g,''), 16);
		}
		break;
	} // workaround

	switch (type) {
	  case 'test':  return EnDe.CRC.dispatch('test',  src,iv,mask,polynom); break;
	  case 'h_8':   bux  = EnDe.CRC.dispatch('C8tab', src,iv,mask,polynom); break;
	  case 'user':  bux  = EnDe.CRC.dispatch(crctype, src,iv,mask,polynom); break; // all CRC-16
	  case 'h32':   bux  = EnDe.CRC.dispatch('C32tab',src,iv,mask,polynom); break;
	}
// ToDo: support raw, hex and base64
	bux = EnDe.i2h(2, EnDe.z2n(bux));
	if (uppercase===true) {
		bux = bux.toUpperCase();
	} else {
		bux = bux.toLowerCase();
	}
	return bux;
  }; // crc

  this.md4      = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? wrapper for str_md4()
	EnDe.MD4.hexcase = (uppercase===true) ? 1 : 0;
	switch (type) {
	  case 'hex':   return EnDe.MD4.hex_md4(src);           break;
	  case 'b64':   return EnDe.MD4.b64_md4(src);           break;
	  case 'raw':   return EnDe.MD4.str_md4(src);           break;
	  case 'hhex':  return EnDe.MD4.hex_hmac_md4(key, src); break;
	  case 'hb64':  return EnDe.MD4.b64_hmac_md4(key, src); break;
	  case 'hraw':  return EnDe.MD4.str_hmac_md4(key, src); break;
	}
	return null; // ToDo: internal error
  }; // md4

  this.md5      = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? wrapper for str_md5()
	EnDe.MD5.hexcase = (uppercase===true) ? 1 : 0;
	switch (type) {
	  case 'hex':   return EnDe.MD5.hex_md5(src);           break;
	  case 'b64':   return EnDe.MD5.b64_md5(src);           break;
	  case 'raw':   return EnDe.MD5.str_md5(src);           break;
	  case 'hhex':  return EnDe.MD5.hex_hmac_md5(key, src); break;
	  case 'hb64':  return EnDe.MD5.b64_hmac_md5(key, src); break;
	  case 'hraw':  return EnDe.MD5.str_hmac_md5(key, src); break;
	}
	return null; // ToDo: internal error
  }; // md5

  this.sha      = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? wrapper for sha1()
	EnDe.SHA.hexcase = (uppercase===true) ? 1 : 0;
	switch (type) {
	  case 'hex':   return EnDe.SHA.sha1.hex(src);          break;
	  case 'b64':   return EnDe.SHA.sha1.b64(src);          break;
	  case 'raw':   return EnDe.SHA.sha1.str(src);          break;
	  case 'hhex':  return EnDe.SHA.sha1.hmac.hex(key, src);break;
	  case 'hb64':  return EnDe.SHA.sha1.hmac.b64(key, src);break;
	  case 'hraw':  return EnDe.SHA.sha1.hmac.str(key, src);break;
	}
	return null; // ToDo: internal error
  }; // sha

  this.sha256   = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? wrapper for sha2()
	EnDe.SHA.hexcase = (uppercase===true) ? 1 : 0;
	switch (type) {
	  case 'hex':   return EnDe.SHA.sha2.hex(src);          break;
	  case 'b64':   return EnDe.SHA.sha2.b64(src);          break;
	  case 'raw':   return EnDe.SHA.sha2.str(src);          break;
	}
	return null; // ToDo: internal error
  }; // sha256

  this.sha384   = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? wrapper for sha384()
	EnDe.SHA5.hexcase = (uppercase===true) ? 1 : 0;
	switch (type) {
	  case 'hex'  : return EnDe.SHA5.hex_sha(src,'SHA-384'); break;
	}
	return null; // ToDo: internal error
  }; // sha384

  this.sha512   = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? wrapper for sha512()
	EnDe.SHA5.hexcase = (uppercase===true) ? 1 : 0;
	switch (type) {
	  case 'hex'  : return EnDe.SHA5.hex_sha(src,'SHA-512'); break;
	}
	return null; // ToDo: internal error
  }; // sha512

  this.blowfish = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? wrapper for blowfish()
	var bux = EnDe.Blowfish.EN.blowfish(key, src); // returns uppercase
	if (uppercase===false) { return bux.toLowerCase(); }
	return bux;
  }; // blowfish

  this.aes      = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? wrapper for AES(); uppercase parameter is escCtl (see aes.js)
	EnDe.AES.escCtl    = uppercase;
	switch (type) {
	  case 'b128':  return EnDe.AES.EN.aes(key, src, 128);  break;
	  case 'b192':  return EnDe.AES.EN.aes(key, src, 192);  break;
	  case 'b256':  return EnDe.AES.EN.aes(key, src, 256);  break;
	}
	return null; // ToDo: internal error
  }; // aes

  this.rmd      = function(type,mode,uppercase,src,_n5_,key,delimiter) {
  //#? wrapper for gen_otp_rmd160(); delimiter is the number of iterations
	/* follwing would be nice, but fails in some browsers
	var toCase = String.toUpperCase; // default anyway
	if (uppercase==false) { toCase = String.toLowerCase; }
	return toCase(EnDe.RMD.word(key, src, delimiter)); break;
	*/
	if (uppercase===true) {
		switch (type) {
		  case 'word':  return EnDe.RMD.word(key, src, delimiter).toUpperCase(); break;
		  case 'hex':   return EnDe.RMD.hex( key, src, delimiter).toUpperCase(); break;
		}
	} else {
		switch (type) {
		  case 'word':  return EnDe.RMD.word(key, src, delimiter).toLowerCase(); break;
		  case 'hex':   return EnDe.RMD.hex( key, src, delimiter).toLowerCase(); break;
		}
	}
	return null; // ToDo: internal error
  }; // rmd

  this.tea      = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? encrypt a string using the Block Tiny Encryption Algorithm
  /* see http://www.movable-type.co.uk/scripts/tea-block.html */
// ToDo: note: for unicode code-point<256 only (should depend on mode)
	function escNoASCII(type,str) {
		/* this function must match EnDe.DE.tea._unescNoASCII() */
		switch (type) {
		  case 'esc'  : return str.replace(/[\x00-\x2f\x7f-\xff'"!]/g, function(c) { return '!' + c.charCodeAt(0) + '!'; }); break;
		  case 'some' : return str.replace(/[\0\t\n\v\f\r\xa0'"!]/g,   function(c) { return '!' + c.charCodeAt(0) + '!'; }); break;
		}
		return str;
	}
	var bux = EnDe.str2lng(src);
	var k   = EnDe.str2lng(key.slice(0,16)); // use first 16 chars only
	if (n == 0) { return '';  }
	if (bux.length <= 1) { bux[1] = 0; }
	var n   = bux.length;
	var y   = bux[0];
	var z   = bux[n-1];
	var sum = 0;
	var e   = 0;
	var q   = Math.floor(6+(52/n));
	var p   = 0;
	while (q-- > 0) {
		sum += EnDe.CONST.CST.teaDelta;
		e = sum>>>2&3;
/* irgendwas falsch hier
		for (p=0; p<(n-1); p++) {
			y = bux[p+1];
			z = bux[p] += (z>>>5^y<<2) + (y>>>3^z<<4)^(sum^y) + (k[p&3^e]^z);
		}
		y   = bux[0];
		z   = bux[n-1] += (z>>>5^y<<2) + (y>>>3^z<<4)^(sum^y) + (k[p&3^e]^z);
*/
		for (p=0; p<n; p++) {
			y = bux[(p+1)%n];
			z = bux[p] += (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3^e]^z);
		}
	}
	return escNoASCII(type,EnDe.lng2str(bux));
  }; // tea

  this.yenc     = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? yEncode
	var bux = '';
	var ccc = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		ccc = ccc + EnDe.CONST.CST.yencMagic;
		// CASE 0, 9, 10, 13, 32, 46, 61   'escape NUL,TAB,LF,CR,=,.
		switch (ccc) {
		  case 0:
		  case 10:
		  case 13:
		  case 61: bux += '='; ccc += EnDe.CONST.CST.yencShift; break;
		}
		bux += String.fromCharCode(ccc);
// ToDo:   case 09: for Version <1.2
// ToDo:   case 32,46: optional
		// >(1.2) Careful writers of encoders will encode TAB (09h) SPACES (20h)
		// >if they would appear in the first or last column of a line.
		// >Implementors who write directly to a TCP stream will care about the
		// doubling of dots in the first column - or also encode a DOT in the
		// first column.
		//
// ToDo:
		// A typical header line should look similar to this:
		// =ybegin line=128 size=123456 name=mybinary.dat
		// =yend size=123456
	}
	return bux;
  }; // yenc

  this.rsaz     = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? **not yet implemented**
/* Text:
xxx1: !"§$%&/()=?
xxx2: {[]}\`´
xxx3: +#*'~
xxx4: ,.-;:_
xxx5: <>|@

 * encoded:
xxx1Z3A+!Z22ZA7$Z25Z26Z2F()Z3DZ3FZ0DZ0Axxx2Z3A+Z7BZ5BZ5DZ7DZ5CZ60ZB4Z0DZ0Axxx3Z3A+Z2BZ23*'Z7EZ0DZ0Axxx4Z3A+Z2C.-Z3BZ3A_Z0DZ0Axxx5Z3A+Z3CZ3EZ7C@
 */
  }; // rsaz

  this.guess    = function(_n1_,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? **depricated**
	return 'EnDe.EN.guess() **OBSOLETE**';
  }; // guess

  this.dispatch = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? dispatcher for encoding functions
	this.dbx('.EN.dispatch: '+type+'\t:uppercase='+uppercase+'\tprefix='+prefix+'\tsuffix='+suffix+'\tdelimiter='+delimiter);
	if (type==='') {  return ''; }
	switch (type) {
	case 'urlCHR'   : return this.url('ucs',   mode, uppercase, src, '',     '',     ''       ); break; // just for compatibility to 1.165
	case 'urlUni'   : return this.url('ucs',   mode, uppercase, src, '',     '',     ''       ); break;
	case 'urlUTF8'  : return this.url('utf8',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'urlUTF8c' : return this.url('utf8c', mode, uppercase, src, '',     '',     ''       ); break;
/*
	case 'urlNibbles':return this.url('nibbles',mode,uppercase, src, '',     '',     ''       ); break;
	case 'urlNibble1':return this.url('nibble1',mode,uppercase, src, '',     '',     ''       ); break;
	case 'urlNibble2':return this.url('nibble2',mode,uppercase, src, '',     '',     ''       ); break;
*/
	case 'urlNibbles':return this.hex('nibbles',mode,uppercase, src, '%',    '',     ''       ); break;
	case 'urlNibble1':return this.hex('nibble1',mode,uppercase, src, '%',    '',     ''       ); break;
	case 'urlNibble2':return this.hex('nibble2',mode,uppercase, src, '%',    '',     ''       ); break;
	case 'oct0'     : return this.oct( 0,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'oct1'     : return this.oct( 1,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'oct2'     : return this.oct( 2,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'oct3'     : return this.oct( 3,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'oct4'     : return this.oct( 4,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'oct5'     : return this.oct( 5,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'oct6'     : return this.oct( 6,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'oct7'     : return this.oct( 7,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'oct'      : return this.oct('null',  mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dez0'     : return this.dez( 1,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dez1'     : return this.dez( 1,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dez2'     : return this.dez( 2,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dez3'     : return this.dez( 3,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dez4'     : return this.dez( 4,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dez5'     : return this.dez( 5,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dez6'     : return this.dez( 6,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dez7'     : return this.dez( 7,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dez'      : return this.dez('null',  mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'ncrNUM'   : return this.dez('ncr2',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'hex0'     : return this.hex( 0,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'hex1'     : return this.hex( 1,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'hex2'     : return this.hex( 2,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'hex3'     : return this.hex( 3,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'hex4'     : return this.hex( 4,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'hex5'     : return this.hex( 5,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'hex6'     : return this.hex( 6,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'hex7'     : return this.hex( 7,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'hex'      : return this.hex('null',  mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'urlHEX'   : return this.hex('url2',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'urlHEXc'  : return this.hex('urlc',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'ncrHEX'   : return this.hex('ncr2',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'ncrHEX4'  : return this.hex('ncr4',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'nibbles'  : return this.hex('nibbles',mode,uppercase, src, prefix, suffix, delimiter); break;
	case 'nibble1'  : return this.hex('nibble1',mode,uppercase, src, prefix, suffix, delimiter); break;
	case 'nibble2'  : return this.hex('nibble2',mode,uppercase, src, prefix, suffix, delimiter); break;
	case 'bin6'     : return this.bin( 6,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'bin7'     : return this.bin( 7,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'bin8'     : return this.bin( 8,      mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dualBCD'  : return this.bcd(     0,  mode, uppercase, src, '',     '',     delimiter); break;
	case 'dual_3'   : return this.stibitz( 0,  mode, uppercase, src, '',     '',     delimiter); break;
	case 'dualAiken': return this.aiken(   0,  mode, uppercase, src, '',     '',     delimiter); break;
	case 'urlUCS'   : return this.ucs('url4',  mode, uppercase, src, prefix, '',     ''       ); break;
	case 'ucsUTF8'  : return this.utf8('null', mode, uppercase, src, '',     '',     ''       ); break;
	case 'ucsUTF7'  : return this.utf7('null', mode, uppercase, src, prefix, '',     ''       ); break;
	case 'ucsUTF7_' : return this.utf7('all',  mode, uppercase, src, prefix, '',     ''       ); break;
	case 'ucsHALFw' : return this.f2h('null',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'ucsFULLw' : return this.h2f('null',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'ucsFULL8' : return this.h2f('utf8',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'ucsUTF8b' : return this.utf8bom('null',mode,uppercase,src, '',     '',     ''       ); break;
	case 'ucsUTF16' : return this.utf16(  'null',mode,uppercase,src, '',     '',     ''       ); break;
	case 'ucs16LEb' : return this.utf16le('null',mode,uppercase,src, '',     '',     ''       ); break;
	case 'ucs16BEb' : return this.utf16be('null',mode,uppercase,src, '',     '',     ''       ); break;
	case 'ucs32LEb' : return this.utf32le('null',mode,uppercase,src, '',     '',     ''       ); break;
	case 'ucs32be'  : return this.utf32le('null',mode,uppercase,src, '',     '',     ''       ); break;
	case 'dumphex'  : return this.dmp('hex',   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dumpODx'  : return this.odx('ODx',   mode, uppercase, src, '',     '',     ''       ); break;
	case 'dumpxDO'  : return this.odx('xDO',   mode, uppercase, src, '',     '',     ''       ); break;
	case 'ncrNAME'  : return this.ncr('name',  mode, uppercase, src, prefix, '',     ';'      ); break;
	case 'ncrWIN'   : return this.ncr('win',   mode, uppercase, src, prefix, '',     ';'      ); break;
	case 'ncrWINf'  : return this.ncr('winf',  mode, uppercase, src, prefix, '',     ';'      ); break;
	case 'ncrDEC'   : return this.ncr('dez',   mode, uppercase, src, prefix, '',     ';'      ); break;
	case 'url64'    : return EnDe.B64.EN.dispatch(type,mode,uppercase,src,'','',     delimiter); break;
	case 'uu'       : return this.uu( 'null',  mode, uppercase, src, EnDe.CONST.CHR.uuAnf, EnDe.CONST.CHR.uuEnd, EnDe.CONST.CHR.uuPad ); break;
	case 'uuhist'   : return this.uu( 'hist',  mode, uppercase, src, EnDe.CONST.CHR.uuAnf, EnDe.CONST.CHR.uuEndH, ' ' ); break;
	case 'uuraw'    : return this.uu( 'raw',   mode, uppercase, src, '',     '',     ''       ); break;
	case 'uuuser'   : return this.uu( 'user',  mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'qp'       : return this.qp( 'null',  mode, uppercase, src, prefix, suffix, delimiter); break;
	// ToDo: \r is part of result but gets lost in destination input field, seems to be a browser bug
	case 'qpraw'    : return this.qp( 'raw',   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'ascii'    : return this.e2a('null',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'ebcdic'   : return this.a2e('null',  mode, uppercase, src, '',     '',     ''       ); break;
	case 'caesar'   : return this.rot('null',  mode, uppercase, src, '',      3,     ''       ); break;
	case 'rot13'    : return this.rot('null',  mode, uppercase, src, '',     13,     ''       ); break;
	case 'rotN'     : return this.rot('null',  mode, uppercase, src, '',     suffix, ''       ); break;
	case 'urlIDN'   : return this.idn('IDN',   mode, uppercase, src, '',     suffix, ''       ); break;
	case 'urlIDN_'  : return this.idn('IDN_',  mode, uppercase, src, '',     suffix, ''       ); break;
	case 'urlPNY'   : return this.idn('PNY',   mode, uppercase, src, '',     suffix, ''       ); break;
	case 'urlPNY_'  : return this.idn('PNY_',  mode, uppercase, src, '',     suffix, ''       ); break;
	case 'SOS'      : return this.sos('null',  mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'Baudot'   : return this.baudot('null',mode,uppercase, src, prefix, suffix, delimiter); break;
	case 'ASCIIBr'  : return this.braille(type,mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dotBr'    : return this.braille(type,mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'NumBr'    : return this.braille(type,mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'DadaUrka' : return this.braille(type,mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'Blade'    : return this.blade(type,  mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'crc_8'    : return this.crc('h_8',   mode, uppercase, src, 0x0000, 0x0000, ''       ); break;
	case 'crc_16'   : return this.crc('user',  mode, uppercase, src, 0x0000, 0x0000, 'ARCtab' ); break;
	case 'crc_cciitt':return this.crc('user',  mode, uppercase, src, 0xffff, 0x0000, 0x1021   ); break;
	case 'crc_user' : return this.crc('user',  mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'crc_32'   : return this.crc('h32',   mode, uppercase, src, 0xffffffff, 0xffffffff,0x04c11db7); break;
/* not yet used
	case 'crc32raw' : return this.crc('i32',   mode, uppercase, src, '',     '',     ''       ); break;
	case 'crc32hex' : return this.crc('h32',   mode, uppercase, src, '',     '',     ''       ); break;
	case 'crc32b64' : return this.crc('b64',   mode, uppercase, src, '',     '',     delimiter); break;
*/
	case 'md4hex'   : return this.md4('hex',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md4b64'   : return this.md4('b64',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md4raw'   : return this.md4('raw',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md4hmachex':return this.md4('hhex',  mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md4hmacb64':return this.md4('hb64',  mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md4hmacraw':return this.md4('hraw',  mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md5hex'   : return this.md5('hex',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md5b64'   : return this.md5('b64',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md5raw'   : return this.md5('raw',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md5hmachex':return this.md5('hhex',  mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md5hmacb64':return this.md5('hb64',  mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'md5hmacraw':return this.md5('hraw',  mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha1hex'  : return this.sha('hex',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha1b64'  : return this.sha('b64',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha1raw'  : return this.sha('raw',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha1hmachex':return this.sha('hhex', mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha1hmacb64':return this.sha('hb64', mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha1hmacraw':return this.sha('hraw', mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha256hex': return this.sha256('hex',mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha256b64': return this.sha256('b64',mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha256raw': return this.sha256('raw',mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha384hex': return this.sha384('hex',mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'sha512hex': return this.sha512('hex',mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'ripemdhex': return this.rmd('hex',   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'ripemdword':return this.rmd('word',  mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'aes128'   : return this.aes('b128',  mode, true,      src, prefix, suffix, ''       ); break; // suffix is key here
	case 'aes192'   : return this.aes('b192',  mode, true,      src, prefix, suffix, ''       ); break; // suffix is key here
	case 'aes256'   : return this.aes('b256',  mode, true,      src, prefix, suffix, ''       ); break; // suffix is key here
	case 'aes128r'  : return this.aes('b128',  mode, false,     src, prefix, suffix, ''       ); break; // suffix is key here
	case 'aes192r'  : return this.aes('b192',  mode, false,     src, prefix, suffix, ''       ); break; // suffix is key here
	case 'aes256r'  : return this.aes('b256',  mode, false,     src, prefix, suffix, ''       ); break; // suffix is key here
	case 'blowfish' : return this.blowfish('', mode, uppercase, src, prefix, suffix, ''       ); break; // suffix is key here
	case 'tearaw'   : return this.tea('raw',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'teacor'   : return this.tea('some',  mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'teaesc'   : return this.tea('esc',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'yenc'     : return this.yenc('null', mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'xor'      : return EnDe.xor(src,suffix);      break;
	case 'EnDeSerial':EnDe.alert('EnDe.EN.dispatch','EnDeSerial not yet implemented'); return '';   break;
	case 'escHTML'  : return this.esc( type,   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'escCSS'   : return this.esc( type,   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'escJS'    : return this.esc( type,   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'escURL'   : return this.esc( type,   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'escSQL'   : return this.esc( type,   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'escXML'   : return this.esc( type,   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'escJava'  : return this.esc( type,   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'escJavaProp':return this.esc(type,   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'escQuote' : return this.esc( type,   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'escJSesc' : return escape(src);               break;
	case 'JSescape' : return escape(src);               break;
	case 'JS2code'  : return this.toCode('null',mode, uppercase,src, prefix, suffix, delimiter); break;
	case 'JS2char'  : return this.fromCode('null',mode,uppercase,src,prefix, suffix, delimiter); break;
	case 'JChar'    : return this.fromJava('null',mode,uppercase,src,prefix, suffix, delimiter); break;
	case 'JSURI'    : return encodeURI(src);            break;
	case 'JSURICom' : return encodeURIComponent(src);   break;
	case 'JSbtoa'   : return btoa(src);                 break;
	case 'JSatob'   : return btoa(src);                 break; // this is just for compatibility with test()
	case 'JSlc'     : return src.toLowerCase();         break;
	case 'JSuc'     : return src.toUpperCase();         break;
	case 'intHEX'   : return EnDe.i2h('null', src);     break;
	case 'intBIN'   : return EnDe.i2b(src);             break;
	case 'hexINT'   : return EnDe.h2i(src);             break;
	case 'hexBIN'   : return EnDe.h2b(src);             break;
	case 'hexCHR'   : return EnDe.h2c(src);             break;
	case 'binINT'   : return EnDe.b2i(src);             break;
	case 'binHEX'   : return EnDe.b2h(src);             break;
	case 'reverse'  : return EnDe.reverse(src);         break;
	case 'atbash'   : return EnDe.atbash(src);          break;
	case 'toCP1252' : return this.cp(src);              break;
	case 'fromCP1252':return EnDe.DE.cp(src);           break;
	case 'toDIN66003':  return this.dta(src);           break;
	case 'fromDIN66003':return EnDe.DE.dta(src);        break;
	case 'b64tou64' : return src.replace(/\+/g, '-').replace(/\//g, '_');   break;
	case 'u64tob64' : return src.replace(/\-/g, '+').replace(/_/g,  '/');   break;
	case 'splitArg' : return EnDe.split('arg', mode, uppercase, src, prefix, '', '&'          ); break;
	case 'splitKey' : return EnDe.split('key', mode, uppercase, src, prefix, '', '='          ); break;
	case 'splitDel' : return EnDe.split('del', mode, uppercase, src, prefix, '', delimiter    ); break;
	case 'joinArg'  : return EnDe.join( 'arg', mode, uppercase, src, prefix, '', '&'          ); break;
	case 'joinKey'  : return EnDe.join( 'key', mode, uppercase, src, prefix, '', '='          ); break;
	case 'joinDel'  : return EnDe.join( 'del', mode, uppercase, src, prefix, '', delimiter    ); break;
	case 'chr'      : return this.chr(   type, mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'copy'     : return src;                       break;
	default         :
//	case 'base*'    :
		if (/^base/.test(type)===true) { // Base-XX has its own disptcher
			this.dbx('.EN.dispatch: .B64.EN.dispatch('+type+', ...)');
			return EnDe.B64.EN.dispatch( type, mode, uppercase, src, prefix, '', delimiter );
			break;
		}
		// try some other functions, they return null if not available
		this.dbx('.EN.dispatch: .User.EN.dispatch('+type+', ...)');
		var bux = null;
		bux = EnDe.User.EN.dispatch( type, mode, uppercase, src, prefix, suffix, delimiter );
		if (bux!==null) { return bux; }
// ToDo: no alert() here 'cause EnDeTest.test()
/*
		EnDe.alert('EnDe.EN.dispatch','unknown "'+type+'"'); return '';
*/
		break;
	}
	return ''; // ToDo: internal error
  }; // dispatch

 }; // EnDe.EN

	// ===================================================================== //
	// Decoding functions                                                    //
	// ===================================================================== //

this.DE     = new function() {
  this.sid      = function() { return(EnDe.sid() + '.DE'); };
  this.dbx      = function(src,nl) { return EnDe.dbx(src,nl); };

  this.chr      = function(_n1_,_n2_,_n3_,src,prefix,suffix,delimiter) { return EnDe.str2chr(src,prefix,suffix,delimiter); };
  //#? convert string to list of characters with prefix, delimiter and suffix

  this.url      = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert URL encoded text to plain text
  //#type? null: just convert each %HH value
  //#type? utf8: convert each %HH value, then convert UTF-8 characters
  // #type? utf8c: convert each %HH value, then convert UTF-8 characters (with high bit set)
// ToDo: convertion fails for character codes > 255
	var bux = '';
	var ccc = null;
	var i   = 0;
	for (i=0; i<src.length; i++) {
		// suffix.length will be 0 if there is no suffix, so we need
		// no special check if suffix (trailing characters) is given
		if (src.charAt(i) == '%') {
			// bux += unescape(src.charAt(i) + src.charAt(i+1) + src.charAt(i+2));
			//         here---/^^^^^ mozilla fails
			ccc = parseInt(src.charAt(i+1) + src.charAt(i+2), 16);
// ToDo: utf8c
			/*
			if (type==='utf8c') {
			 * needs its own parser 'cause only the first (left-most)  of two
			 * bytes is affected by the initial "add 128"
				if (ccc>128) { ccc -= 128; }
			}
			*/
			bux += String.fromCharCode(ccc);
			i = i+2+suffix.length;
		} else {
			bux += src.charAt(i);
		}
	}
	if (type==='utf8') {
		return this.utf8('','',bux,'','','');
		/* this is just a shortcut for  this.utf8(... this.url(... src, ...), ...)
		 * it was added to have a symetric decoding for urlUTF8
		 */
	}
	return bux;
  }; // url

  this.ucs      = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert URL encoded (none US ASCII Unicode) text to plain text
  //#type? url2: convert %HH%HH strings
  //#type? url4: convert %uHHHH strings (see EnDe.DE.num('hex',...) also)
  //#type? ucs4: convert \uHHHH strings
	switch (type) {
	  case 'url2': return src.replace(/((?:%(?:[0-9a-f]){2}){2})/ig,function(c){return String.fromCharCode(parseInt(c.replace(/%/g,''),16));}); break;
	  case 'url4': return src.replace(/(%u(?:[0-9a-f]){4})/ig,function(c){return String.fromCharCode(parseInt(c.replace(/%u/g,''),16));}); break;
	  case 'ucs4': return src.replace(/(\\u(?:[0-9a-f]){4})/ig,function(c){return String.fromCharCode(parseInt(c.replace(/\\u/g,''),16));}); break;
	}
	return bux;
  }; // ucs

  this.num      = function(type,mode,src,prefix,suffix,delimiter,len) {
  //#? convert numeric encoded text to plain text; internal function, don't use in API
// ToDo: check if still requiered (5/2008), see this.ucs() also
	/*
	 * General function to convert various  numeric encodings  to plain text
	 * this function should not be used as decoding function directly but be
	 * called from various functions like this.hex(), this.dez(), etc..
	 * It's just a loop through the input text and calls the proper decoding
	 * for each numeric string.
	 *   type  is used to pass the decoding type:  bin, oct, dez, hex
	 *   len   is the expected length of the numeric string to be decoded if
	 *         neither  prefix, suffix and delimiter is given;
	 *         it's ignored if either  prefix, suffix and delimiter is given
	 * All other parameters *must* be set by the caller.
	 * Example:  "numeric string" looks like:  prefixHHHHsuffixdelimiter
	 * where  HHHH is the numeric string to be decoded, if prefix and suffix
	 * and delimiter is missing (length 0), then  len  must be set  (to 4 in
	 * this example), otherwise decoding fails.
	 *
	 * For %uHHHH and \uHHHH pattern see this.ucs() above also.
	 */
// ToDo: convertion fails for character codes > 255
	var bux = '';
	var ccc = '';
	var num = 0;
	var kkk = 10;
	var d = delimiter.length;
	var p = prefix.length;
	var s = suffix.length;
	var j = 0, k = 0, x = 0;
	var u = '';
	switch(type) {
	  case 'bin': kkk =  2; break;
	  case 'oct': kkk =  8; break;
	  case 'dez': kkk = 10; break;
	  case 'hex': kkk = 16; break;
	  default   : return '[EnDe.DE.num: unknown type "'+type+'"]'; break; // ToDo: depends on mode what to return here
	}
	if ((p<=0) && (s<=0) && (d<=0)) { // no prefix, suffix and delimiter
		if (len<=0) { return '[EnDe.DE.num: illegal length "'+len+'"]'; } // ToDo: depends on mode what to return here
	} else { // some kind of separation allows variable length numeric strings
		len = 0; // don't need it anymore
		// "numeric string" looks like:  prefixHHHHsuffixdelimiter
		/* using a lazy aproach to extract the characters:
		 * if there is a suffix, check for its first character
		 * otherwise use first character of prefix
		 * except when there is a delimiter where thats first
		 * character will be used
		 * ToDo: neither suffix nor delimiter may start with a
		 */
		if (s>0) {
			u = suffix[0];
		} else {
			if (d>0) {
				u = delimiter[0];
			} else {
				u = prefix[0];
				// ToDo: following not for strict mode
				/* we copy all leading characters before very first prefix
				 * this is a tolerant aproach and should cause an error in strict
				 * mode
				 */
				while ((j<src.length) && (src.charAt(j)!==u)) { bux += src.charAt(j); j++; }
			}
		}
		/* now we have a separator character in u */
	}
	while (j<src.length) {
		x++;
		if(x>EnDe.maxloop){
			bux += '[EnDe.DE.num: input too large (>' + EnDe.maxloop + '); aborted]';
			break;
		}
		ccc = '';
		k = 0;
		j += p;         // skip prefix
		if (len===0) {  // variable length character
			while ((src.charAt(j+k)!==u) && ((j+k)<src.length)) { ccc += src.charAt(j+k); k++; }
			j += k;
		} else {        // fixed length character
			for (k=0; k<len; k++) {
				if ((j+k)>=src.length) { break; };
				ccc += src.charAt(j+k);
			}
			j += len;
		}
		num = parseInt(ccc, kkk);
		if (num<(256*256)) {
			// EnDe.intMap[num][EnDe.mapInt] // ToDo: implement other mappings
			bux += String.fromCharCode(num);
		} else {
			bux += '[EnDe.DE.num: value ('+ccc+'='+num+')out of range]'; // ToDo: depends on mode what to do here
		}
		j += s;  // skip trailing characters
		j += d;  // skip delimiters
	}
	ccc = null; num = null;
	return bux;
  }; // num

  this.numstr   = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert hex, decimal or octal encoded text to plain text
	/* parse string until delimiter or end of string is found and converts
	 * every 2 or 3 characters to its text representation
	 * starts parsing after prefix
	 * unknown sequences are returned as is
	 * if prefix is used, it will be omitted in output
	 *
	 * Example with prefix '0x':
	 *  0x3c646561643e,0x3c626565663e  converts to  <dead><beef>
	 * Example without prefix:
	 *  0x3c646561643e,0x3c626565663e  converts to  0x<dead>0x<beef>
	 */
	var bux = '';
	var typ = type;
	var len = 10;
	var k   = 0;
	var bbb = '';
	var ccc = '';
	var kkk = null;
	if (delimiter.length>0) {
		if (src.match(new RegExp(EnDe.rex(delimiter) + '$',''))===null) {
			src += delimiter; // add delimiter so that following split works
		}
		kkk = src.split(suffix+delimiter);
	} else {
		kkk = new Array(src); // use array so that following while works
	}
	switch(type) {
	  case 'bin': len =  8; break;
	  case 'oct': len =  3; break;
	  case 'dez': len =  3; break;
	  case 'hex': // no break
	  case 'hex2':len =  2; typ = 'hex'; break;
	  case 'hex4':len =  4; typ = 'hex'; break;
	  default   : return '[EnDe.DE.numstr: unknown type "'+type+'"]'; break; // ToDo: internal error: depends on mode what to return here
	}
	var x   = 0;
	while ((ccc=kkk.shift())!==undefined) {
		k = prefix.length;  // parse string starting after prefix
		while (k<ccc.length) {
			bbb = '';
			for (x=0; x<len; x++) { bbb += ccc[k+x]; }// extract number to be converted
			if (EnDe.isTyp(typ,bbb)===true) {       // check if proper number
				bux += this.num(typ, mode, bbb, '', '', '', len);
				k   += len;
			} else {
				/* string starting at position k does not match required format
				 * add first (current) character to result and continue with rest
				 */
				bux += ccc[k];
				k   += 1;
			}
		}
		bbb = '';
	}
	bbb = null; ccc = null; kkk = null;
	return bux;
  }; // numstr

  this.hex      = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert hex-based encoded text to plain text
// ToDo: check if still requiered (5/2010), see this.ucs() also
	var bux = '';
	var len = 0;
	switch(type) {
	  case 'null': prefix = '';    len = 2; break;
	  case 'qp2' : prefix = '=';   len = 2; break;
	  case 'url2': prefix = '%';   len = 2; break;
	  case 'url4': prefix = '%u';  len = 4; break;
	  case 'ucs4': prefix = '\\u'; len = 4; break;
	  case 'ncr2': prefix = '&#x'; len = 2; suffix = ';' + suffix; break;
	  case 'ncr4': prefix = '&#x'; len = 4; suffix = ';' + suffix; break; // &#x00
	  default    :
		len = parseInt(type, 10);    // got 2, 3, ... 7
		if (isNaN(len)) { len = 2; } // fall back
		break;
	}
	return this.num('hex',mode,src,prefix,suffix,delimiter,len);
  }; // hex

  this.dez      = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert decimal-based encoded text to plain text
	var bux = '';
	var len = 0;
	switch(type) {
	  case 'null'   : prefix = '';    break;
	  case 'ncr0'   : prefix = '&#'; suffix = '';           break; // &#DD
	  case 'ncr2'   : prefix = '&#'; suffix = ';' + suffix; break; // &#DD;
	  case 'ncr4'   : prefix = '&#'; suffix = ';' + suffix; break; // &#00DD;
	  default    :
		len = parseInt(type, 10);    // got 2, 3, ... 7
		if (isNaN(len)) { len = 2; } // fall back
		break;
	}
	return this.num('dez',mode,src,prefix,suffix,delimiter,len);
  }; // dez

  this.oct      = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert octal-based encoded text to plain text
	var bux = '';
	var len = 0;
	switch(type) {
	  case 'null': len = 3; break;
	  default    :
		len = parseInt(type, 10);    // got 2, 3, ... 7
		if (isNaN(len)) { len = 3; } // fall back
		break;
	}
	return this.num('oct',mode,src,prefix,suffix,delimiter,len);
  }; // oct

  this.bin      = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert binary-based encoded text to plain text
// ToDo: should work the same way as this.hex, this.dez() above
	var bux = '';
	var ccc = '';
	var kkk = src.split(suffix+delimiter);
	while ((ccc=kkk.shift())!==undefined) {
		bux += String.fromCharCode(parseInt(ccc, 2));
	}
	return bux;
  }; // bin

  this.bcd      = function(_n1_,_n2_,src,_n5_,_n6_,delimiter) {
  //#? convert BCD coded numbers to digits
	var rex = new RegExp('([01]{4}' + delimiter + '?)', 'g');
	return src.replace(rex, function(c) { return EnDe.bcd2i(c); });
  }; // bcd

  this.aiken    = function(_n1_,_n2_,src,_n5_,_n6_,delimiter) {
  //#? convert Aiken coded numbers in text to digits

	function _todigit(ccc) {
	// convert Aiken coded number to digits
		switch (ccc) { // quick&dirty // ToDo: should be defined in EnDeMaps.js
		  case '0000' : return '0'; break;
		  case '0001' : return '1'; break;
		  case '0010' : return '2'; break;
		  case '0011' : return '3'; break;
		  case '0100' : return '4'; break;
		  case '1011' : return '5'; break;
		  case '1100' : return '6'; break;
		  case '1101' : return '7'; break;
		  case '1110' : return '8'; break;
		  case '1111' : return '9'; break;
		  default     : return ccc; break;
		}
		return ccc; // dummy, never reached
	};
	var rex = new RegExp('([01]{4})' + delimiter + '?', 'g');
	return src.replace(rex, function(c,d) { return _todigit(d); });
  }; // aiken

  this.stibitz  = function(_n1_,_n2_,src,_n5_,_n6_,delimiter) {
  //#? convert Stibitz coded numbers in text to digits
	function _todigit(ccc) {
	// convert Stibitz coded number to digits
		switch (ccc) { // quick&dirty (is BCD + 3) // ToDo: should be defined in EnDeMaps.js
		  case '0011' : return '0'; break;
		  case '0100' : return '1'; break;
		  case '0101' : return '2'; break;
		  case '0110' : return '3'; break;
		  case '0111' : return '4'; break;
		  case '1000' : return '5'; break;
		  case '1001' : return '6'; break;
		  case '1010' : return '7'; break;
		  case '1011' : return '8'; break;
		  case '1100' : return '9'; break;
		  default     : return ccc; break;
		}
		return ccc; // dummy, never reached
	};
	var rex = new RegExp('([01]{4})' + delimiter + '?', 'g');
	return src.replace(rex, function(c,d) { return _todigit(d); });
  }; // stibitz

  this.cp   = function(src) {
  //#? convert all characters from Windows CP-1252 to unicode base characters
	var bux = '';
	var ccc = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if (EnDe.winMap[ccc]===undefined) {
			bux += src.charAt(i);
		} else {
			bux += String.fromCharCode(EnDe.winMap[ccc][EnDe.mapStd]);
		}
	}
	return bux;
  }; // cp

  this.dta  = function(src) {
  //#? convert all characters from DIN66003 to ASCII characters
	// Note that EnDe.DIN66003fMap[] is different to EnDe.DIN66003Map[]
	var bux = '';
	var ccc = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if (EnDe.DIN66003fMap[ccc]===undefined) {
			bux += src.charAt(i);
		} else {
			bux += String.fromCharCode(EnDe.DIN66003fMap[ccc]);
		}
	}
	return bux;
  }; // dta

  this.utf7     = function(_n1_,_n2_,src,_n5_,_n6_,_n7_) {
  //#? convert UTF-7 encoded text to plain text

	function _chr2code(chr) {
	// return character code of Base64 character //ToDo: replace by proper function from EnDeB64.js
		var ccc = chr.charCodeAt(0);
		if      (ccc == 43) { ccc  = 62; } // +
		else if (ccc == 47) { ccc  = 63; } // /
		else if (ccc <= 57) { ccc += 4;  } // 9
		else if (ccc <= 90) { ccc -= 65; } // Z
		else                { ccc -= 71; } // all others
		return ccc;
	};
	var bux = '';
	var kkk = '';
	var c30 = 0, c31 = 0, c32 = 0, c33 = 0;
	var u1  = 0, u2  = 0, u3  = 0;
	for (u1=0; src.charAt(u1); u1++) {
		if (src.charAt(u1)!=='+') {
			bux += src.charAt(u1);
		} else if (src.charAt(u1+1) && (src.charAt(u1+1)==='-')) {
			bux += '+';
			u1++;
		} else {
			for (u2=u1; src.charAt(u2) && EnDe.B64.isB64(src.charAt(u2)); u2++);
			kkk = src.substring(u1+1,u2);
			u1 = u2;
			if (src.charAt(u1) && (src.charAt(u1)!=='-')) {
				u1++;
			}
			u2 = 0;
			for (u3=0; kkk.charAt(u3); u3++) {
				u2 += 6;
				c30 = _chr2code(kkk.charAt(u3-0));
				c31 = _chr2code(kkk.charAt(u3-1));
				c32 = _chr2code(kkk.charAt(u3-2));
				c33 = _chr2code(kkk.charAt(u3-3));
				if (u2 == 16) { bux += String.fromCharCode(((c32&0x0F)<<12)+((c31&0x3F)<<6)+( c30&0x3F)                     ); }
				if (u2 == 18) { bux += String.fromCharCode(((c32&0x3F)<<10)+((c31&0x3F)<<4)+((c30&0x3C)                >>>2)); }
				if (u2 == 20) { bux += String.fromCharCode(((c33&0x03)<<14)+((c32&0x3F)<<8)+((c31&0x3F)<<2)+((c30&0x30)>>>4)); }
				if (u2 >= 16) { u2 -= 16; }
			}
		}
	}
	return bux;
  }; // utf7

  this.utf8     = function(_n1_,_n2_,src,_n5_,_n6_,_n7_) {
  //#? convert UTF-8 encoded text to plain text
	var bux = '';
	var i  = 0;
	var c  = 0, c1 = 0, c2 = 0;
	while(i<src.length) {
		c = src.charCodeAt(i);
		if (c<128) { // 0x00 - 0x7F
			bux += String.fromCharCode(c);
			i++;
		} else if((c>191) && (c<224)) { // 0x80 - 0x7FF
			c2   = src.charCodeAt(i+1);
			bux += String.fromCharCode(((c&31)<<6) | (c2&63));
			i   += 2;
		} else { // 0x800 - 0xFFFF
			c2   = src.charCodeAt(i+1);
			c3   = src.charCodeAt(i+2);
			bux += String.fromCharCode(((c&15)<<12) | ((c2&63)<<6) | (c3&63));
			i   += 3;
		}
	}
	return bux;
  }; // utf8

  this.f2h      = function(_n1_,_n2_,src,_n5_,_n6_,_n7_) { return EnDe.UCS.f2h(src); };
  //#? convert fullwidth Unicode to halfwidth Unicode characters; wrapper for EnDe.UCS.f2h()

  this.h2f      = function(_n1_,_n2_,src,_n5_,_n6_,_n7_) { return EnDe.UCS.h2f(src); };
  //#? convert halfwidth Unicode to fullwidth Unicode characters; wrapper for EnDe.UCS.h2f()

  this.ncr      = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert named HTML-Entity to plain text
	var bux = src;
	var ent = '';
	var num = '';
	var str = '';
	var rex = /[\$\&\#\%\.\^\?\*\+\[\]\\]/gi;  // escapes RegEx meta characters
	var i   = 0;
// ToDo: probably need a global regExpEscape
	if (suffix.match(rex)!==null) {
		suffix = '\\' + suffix;
	}
	rex = null;

// ToDo: ugly slow, replace with loop through source which should be faster ..
	switch (type) {
	  case 'name':
		for (ent in EnDe.ncrMap) {    // we only get the 'defined' entries
			str = '&' + ent + suffix + delimiter;
			rex = new RegExp(str,'g');
			bux = bux.replace(rex,String.fromCharCode(EnDe.ncrMap[ent]));
			rex = null;
		}
		break;
	  case 'dez' :
		for (num in EnDe.intMap) {    // we only get the 'defined' entries
			str = '&#' + num + suffix + delimiter;
			rex = new RegExp(str,'g');
			bux = bux.replace(rex,String.fromCharCode(num));
			rex = null;
		}
		// no convert remaining NCRs to their ASCII representation
// ToDo: bux = bux.replace(/&#([0-9]{1,3});/g,String.fromCharCode($1)); // does not work
		for (i=32; i<127; i++) {
			str = '&#' + i + suffix + delimiter;
			rex = new RegExp(str,'g');
			bux = bux.replace(rex,String.fromCharCode(i));
			rex = null;
		}
// ToDo: leaves other entities like &#4242; (if exists) as is
		break;
	  case 'win' :
		for (ent in EnDe.winMap) {    // we only get the 'defined' entries
			str = '&' + ent + suffix + delimiter;
			rex = new RegExp(str,'g');
			bux = bux.replace(rex,String.fromCharCode(EnDe.winMap[ent][EnDe.mapStd]));
			rex = null;
		}
		break;
	  case 'winf':
		for (ent in EnDe.winfMap) {    // we only get the 'defined' entries
			str = '&' + EnDe.winfMap[ent][EnDe.mapEty] + suffix + delimiter;
			rex = new RegExp(str,'g');
			bux = bux.replace(rex,String.fromCharCode(EnDe.winfMap[ent][EnDe.mapInt]));
			rex = null;
		}
		break;
	  default      : bux += '[EnDe.DE.ncr: invalid type "' + type + '"]'; break; // ToDo: depends on mode
	}
	rex = null; str = null;
	return bux;
  }; // ncr

  this.toCode   = function(type,mode,src,prefix,suffix,delimiter) { return EnDe.chr2code(src); };
  //#? wrapper for EnDe.chr2code()

  this.fromCode = function(type,mode,src,prefix,suffix,delimiter) { return EnDe.code2chr(src); };
  //#? wrapper for EnDe.code2chr()

  this.fromJava = function(type,mode,src,prefix,suffix,delimiter) { return EnDe.java2chr(src); };
  //#? wrapper for EnDe.java2chr()

  this.xml      = function(_n1_,_n2_,src,_n5_,_n6_,_n7_) {
  //#? convert XML encoded text to plain text
	/* this should be roughly the same as this.ncr('name',...), but stricht XML uses only EnDe.xmlMap */
	var rex = '';
	var bux = src;
	var i   = 0;
	for (i in EnDe.xmlMap) {
		if (i==='indexOf') { continue; } // contribution to Mozilla 1.x (fails sometimes here)
		rex = new RegExp('&' + EnDe.xmlMap[i] + ';','g');// NCE
		bux = bux.replace(rex,String.fromCharCode(i));
		rex = new RegExp('&#' + i + ';','g');            // NCR
		bux = bux.replace(rex,String.fromCharCode(i));
		rex = null;
	}
	rex = null;
	return bux;
  }; // xml

  this.esc      = function(type,_n2_,src,_n5_,_n6_,_n7_) {
  //#? convert enscaped text to plain text
  //#type? escCSS:  expect CSS hex numbered entities
  //#type? escHTML: expect HTML named Entities
  //#type? escURL:  expect URL encoding
  //#type? escJS:   expect JavaScript escaping
  //#type? escSQL:  convert '' to '
  //#type? escXML:  expect XML named Entities
  //#type? escQuote: convert \' and \" to ' "
  //#type? escJava: expect Java escaping
	var bux = '';
	switch (type) {
	  case 'escCSS':    bux = src
			.replace(/\\([0-9a-f][0-9a-f][0-9a-f][0-9a-f])/ig, function(c,d){return String.fromCharCode(parseInt(d,16));})
			.replace(/\\([0-9a-f][0-9a-f])/ig,                 function(c,d){return String.fromCharCode(parseInt(d,16));});
		break;
	  case 'escHTML':   bux = this.ncr('name','',src, '',';','');               break;
	  case 'escURL':    bux = this.url('utf8','',src, '', '','');               break;
	  case 'escJS':     bux = src.replace(/\\/g, '');                           break;
	  case 'escSQL':    bux = src.replace(/('')/g, "'");                        break;
	  case 'escQuote':  bux = src.replace(/\\"/g, '"').replace(/\\'/g, "'");    break;
	  case 'escXML':    bux = this.xml('', '',src,'','','');                    break;
	  case 'escJavaProp':
	  case 'escJava':   bux = this.esc('escCSS','',src,'','','').replace(/\\"/g, '"').replace(/\\\\/g, '\\'); break;
	}
	return bux;
  }; // esc

  this.uu       = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert UUencode text to plain text; delimiter is the padding character
  //#type? hist:
  //#type?  raw:
  //#type? user:

	function uubuffer(src) {
		var bux = [];
		var c1  = ((src[1]>>4) | (src[0]<<2)) & 0xFF;
		var c2  = ((src[2]>>2) | (src[1]<<4)) & 0xFF;
		var c3  = ((src[3]   ) | (src[2]<<6)) & 0xFF;
		if (c1) { bux += String.fromCharCode(c1); }
		if (c2) { bux += String.fromCharCode(c2); }
		if (c3) { bux += String.fromCharCode(c3); }
		return bux;
	};

	var i   = 0;
	var bux = '';
	var bnv = 0;
	var ccc = 0;
	var kkk = []; // decoding buffer
	var idx = 0;  // next valid element in buffer
	if (type!=='raw') {
		/* if we're in (user) (hist) or normal mode, there is a begin and a
		 * end line as well as a final empty line which are not part of the
		 * encoding, they're simply removed as we don't need anything from
		 * them */
		var rex = '';
		if (prefix.length > 0) {
			rex = new RegExp(prefix + '.*\n', '');
			if (src.match(rex)!==null) {// strip off begin line
				src = src.slice(src.search(/\n/)+1);
			}
		}
		if (suffix.length > 0) {
			rex = new RegExp(suffix, '');
			if (src.match(rex)!==null) {// strip off end line
				src = src.slice(0,src.length-suffix.length);
			}
		}
		if (delimiter.length > 0) {
			rex = new RegExp('\n' + delimiter + '\n', '');
			if (src.match(rex)!==null) {// strip off empty line
				src = src.slice(0,src.length-delimiter.length-2);
			}
		}
		/* we don't care about the byte count character, should be M in most
	     * cases, but may be different in last encoded line. Hence we simply
		 * remove the very first character in each line, it's not checked anyway.
		 */
		src = src.replace(/^./,'');     // strip off byte count in first line
		src = src.replace(/\n./g,'');   // strip off byte counts
		src = src.replace(/\n/g,'');    // if there're still newlines ..
		src = src.replace(/\r/g,'');    // ToDo: should depend on strict mode
		//rex = new RegExp('(' + delimiter + ')*$', 'g');
		rex = new RegExp(delimiter, 'g');
		src = src.replace(rex,' ');     // padding needs to be space (0x20)
	}
	for (i=0; i<src.length; ++i) {
		ccc = src.charCodeAt(i) - 0x20;
		bnv = ((ccc < 0x00) || (ccc > 0x3F));
		if (bnv) {     // decode
			for (; idx<4; ++idx) { kkk[idx] = 0; }
		} else {        // store as is
			kkk[idx++] = ccc;
		}
		if (idx===4) {  // enough data or invalid char
			idx = 0;
			bux += uubuffer(kkk);
			if (bnv) { bux += src[i]; }
		}
	}
	if (idx>0) {
		for (; idx<4; ++idx) { kkk[idx] = 0; }
		bux += uubuffer(kkk);
	}
	if (kkk!==null) { if (kkk.length) { kkk.length = 0; }; kkk = null; }
	rex = null;
	return bux;
  }; // uu

  this.qp       = function(_n1_,mode,src,_n5_,_n6_,_n7_) {
  //#? convert quoted printable text to plain text
	var bux = '';
	src = src.replace(/=\r?\n/g,''); // remove soft line breaks
	// -----------------^^^-- \r optional as we don't get it from our input field, seems to be a bug in the browser
	var ccc = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charAt(i);
		if (ccc==='=') {
// ToDo: upper case hex letters requiered according RFC 2045 in strict mode
// ToDo: more than 76 char per line is illegal in strict mode
// = followed by anything else than 0-9a-f or CRLF is illegal
			bux += EnDe.DE.hex('qp2',mode,src.charAt(i)+src.charAt(i+1)+src.charAt(i+2),'','','');
			i += 2;
		} else {
			bux += ccc;
		}
	}
	return bux;
  }; // qp

  this.idn      = function(type,_n3_,src,_n5_,suffix,_n7_) {
  //#? convert punycode or IDNA-punycode to string
  //#type? IDN:  convert URI only
  //#type? PNY:  convert FQDN only (strip off leading schema and trailing search parameter)
  //#type? PNY_: convert complete string
  //#type? IDN_: convert complete string
  // suffix used for libidn compatible mode (trailing -)
  /*
   *            schema://ANY.THING.HERE?whatever
   */
// ToDo: same as EN.idn() except conversion function
	switch (type) {
	  case 'PNY_':  return EnDe.IDN.puny2str(EnDe.IDN.libidn(src,suffix));  break;
	  case 'IDN_':  return EnDe.IDN.idn2str( EnDe.IDN.libidn(src,suffix));  break;
	  case 'PNY':
	  case 'IDN':
		//var kkk = src.match(/([a-zA-Z]+:\/\/)?([^\?]+)\?(.*)$/); // JavaScript is too stupid for this
		var ccc = '';
		var idn = '';
		var sch = '';
		var uri = '';
		var fqdn= '';
		var rest= '';
		var kkk = src.match(/^(\s*[a-zA-Z]*:\/\/)((?:.|\s)*)/);
		if (kkk!==null) {  // got schema
			sch = kkk[1];
			uri = kkk[2];
		} else {
			uri = src;
		}
		kkk = uri.match(new RegExp('([^/]+)(/(?:.|\\s)*)$', ''));
		if (kkk!==null) {  // got search
			fqdn = kkk[1];
			rest = kkk[2];
		} else {
			fqdn = uri;
		}
		kkk = fqdn.split('.');
		while ((ccc=kkk.shift())!==undefined) {
			switch (type) {
			  case 'PNY': idn += '.' + EnDe.IDN.puny2str(EnDe.IDN.libidn(ccc,suffix));  break;
			  case 'IDN': idn += '.' + EnDe.IDN.idn2str( EnDe.IDN.libidn(ccc,suffix));  break;
			}
		}
		if (idn!=='') {
			fqdn = idn.substring(1, idn.length);  // remove leading .
		}
		return sch + fqdn + rest;
		break;
	}
// ToDo: depends on mode
	return src;
  }; // idn

  this.a2e      = function(_n1_,_n2_,src,_n5_,_n6_,_n7_) { return EnDe.a2e(src); };
  //#? convert ASCII to EBCDIC characters

  this.e2a      = function(_n1_,_n2_,src,_n5_,_n6_,_n7_) { return EnDe.e2a(src); };
  //#? convert EBCDIC to ASCII characters

  this.rot      = function(_n1_,_n2_,src,_n5_,key,_n7_)  { return EnDe.rot(src,key); };
  //#? convert string to rot-N-encoded text (aka Caesar encoding)

  this.sos      = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert morse characters to plain text
	var bux = '';
// ToDo: implement delimiter
	var ccc = '';
	var kkk = src.split(suffix + '\ ');
	while ((ccc=kkk.shift())!==undefined) {
		bux += EnDe.osoMap[ccc];
	}
	return bux;
  }; // sos

  this.baudot   = function(type,mode,src,prefix,suffix,delimiter) {
  //#? convert Baudot characters to plain text
	var bux = '';
	var bbb = '';
	var ccc = '';
	var ltr = 1;
// ToDo: implement delimiter
	var kkk = src.split(' ');
	while ((ccc=kkk.shift())!==undefined) {
		if (ltr===1) {
			bbb = EnDe.ltrsMap[ccc];
			if (bbb==='FIGS') {
				bbb = EnDe.figsMap[ccc];
				ltr = 0;
				continue;
			}
		} else {
			bbb = EnDe.figsMap[ccc];
			if (bbb==='LTRS') {
				bbb = EnDe.ltrsMap[ccc];
				ltr = 1;
				continue;
			}
		}
		bux += bbb;
	}
	return bux;
  }; // baudot

  this.dmp      = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? convert from traditional xdump or od style: (hex values left only)
  //#type? hex: 'xdump' style input (space seperated hex values left, strings right)
  //#type? ODx: 'od -x' style input (count, 2- or 4-byte hex values)
  //#type? xDO: 'od -x' style input (count, 4-byte hex values little endian)
 	/* allowed formats:
	 * left side with hex values separated by delimiter, right side any character
	 *     de,ad,beef | string
	 * left and right side are separated by |
	 *     de ad beef | string
	 * or right side may be missing, but not the separators
	 *     de ad beef |
	 * Separator is any character which is not a hex [a-f0-9] character.
	 *     de ad beef string
	 *     de ad beef  $
	 * all 4 lines decode the hex values 'de' 'ad' and 'beef'
	 * For type ODx or xDO the first field and all following spaces are ignored.
	 * Example: prefix=x
	 *     0000 de ad | string
	 *     0010 beef  | string
	 * decodes the hex values 'de' 'ad' and 'beef'
	 */

	var bux = '';
	var ccc = '';
	var bbb = null;
	var arr = src.split('\n');
	var kkk = '';
	var xxx = EnDe.maxloop; // pedantic check if someone passes too long strings
	while ((kkk=arr.shift())!==undefined && (xxx>0)) {
		xxx--;
		if (kkk.length<=0) { continue; }
		if (kkk.match(/^\s+\|\s*$/)!==null) { continue; } // ignore empty lines
		if (type!=='hex') { kkk += ' | '; } //add delimiter required for match below
		bbb = kkk.match(new RegExp('((?:[a-fA-F0-9][a-fA-F0-9]+( +|'+delimiter+'))+)(?:(?: +)|( *\|)|(?:[^a-fA-F0-9]))','')); // allows any number of spaces between fields
		if (bbb===null) { bux += '\n[EnDe.DE.dmp: invalid format, line '+(EnDe.maxloop-xxx)+': '+kkk+']\n'; continue; } // ToDo: internal error
		if (bbb.length<=0) { continue; }
		kkk = EnDe.trim(bbb[1]);
		if (delimiter.length > 0) {
			kkk = kkk.split(delimiter);
			while ((ccc=kkk.shift())!==undefined) {
				switch (ccc.length) {
				  case 1:  ccc = '%u000' + ccc; break;
				  case 2:  ccc = '%u00'  + ccc; break;
				  case 2:  ccc = '%u0'   + ccc; break;
				  case 4:  ccc = '%u'    + ccc; break;
				  default: if (ccc.length>0) {ccc = '%u' + ccc;}; break; // ToDo: ??
				}
				bux += this.hex('url4', mode, ccc, prefix, suffix, '');
			}
		} else {
			if (type=='hex') {
				bux += this.hex('null', mode, kkk, prefix, suffix, delimiter);
			} else {
				bbb = kkk.split(/\s+/);
				bbb.shift(); // first field ignored
				while ((ccc=bbb.shift())!==undefined) {
					ccc = EnDe.trim(ccc);
					if (ccc ==='') { continue; }
					if (type==='xDO') { // little endian: swap first 2 with last 2 bytes
						bux += EnDe.h2c(ccc[2]+ccc[3]);
						bux += EnDe.h2c(ccc[0]+ccc[1]);
					} else {
						bux += EnDe.h2c(ccc);
					}
					//bux += this.hex('null', mode, ccc, '', '', '');
				}
			}
		}
	}
	if(xxx===0){
		bux += '[EnDe.DE.dmp: input too large (>' + EnDe.maxloop + '); aborted]';
	}
	return bux;
  }; // dmp

  this.blowfish = function(type,mode,uppercase,src,prefix,key,delimiter) { return EnDe.Blowfish.DE.blowfish(key, src); };
  //#? wrapper for blowfish()

  this.aes      = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? wrapper for AES(); uppercase parameter is escCtl (see aes.js)
	EnDe.AES.escCtl    = uppercase;
	switch (type) {
	  case 'b128':  return EnDe.AES.DE.aes(key, src, 128);  break;
	  case 'b192':  return EnDe.AES.DE.aes(key, src, 192);  break;
	  case 'b256':  return EnDe.AES.DE.aes(key, src, 256);  break;
	}
	return null; // ToDo: internal error
  }; // aes

  this.tea      = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? decrypt a string using the Block Tiny Encryption Algorithm
  /* see http://www.movable-type.co.uk/scripts/tea-block.html */
	function _unescNoASCII(type,str) {
		/* this function must match EnDe.EN.tea.NoASCII() */
		if (type!=='raw') {
			return str.replace(/!\d\d?\d?\d?\d?!/g, function(c) { return String.fromCharCode(c.slice(1,-1)); });
		} else {
			return str;
		}
	};
	if (key.length <= 0) { return ''; }
	var bux = EnDe.str2lng(_unescNoASCII(type,src));
	var n   = bux.length;
	if (n == 0) { bux = null; return ''; }
	var k   = EnDe.str2lng(key.slice(0,16)); // use first 16 chars only
	var z   = bux[n-1];
	var y   = bux[0];
	var e   = 0;
	var q   = Math.floor((6+52 / n));
	var p   = 0;
	var sum = q * EnDe.CONST.CST.teaDelta;
	while (sum!==0) {
		e = sum>>>2&3;
/* something wrong with original code ???
		for (p=(n-1); p>0; p--) {
			z = bux[p-1];
			y = bux[p] -= (z>>>5^y<<2) + (y>>>3^z<<4)^(sum^y) + (k[p&3^e]^z);
		}
		z = bux[n-1];
		y = bux[0] -= (z>>>5^y<<2) + (y>>>3^z<<4)^(sum^y) + (k[p&3^e]^z);
*/
		for (p=(n-1); p>=0; p--) {
			z = bux[p>0 ? p-1 : n-1];
			y = bux[p] -= (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3^e]^z);
		}
		sum -= EnDe.CONST.CST.teaDelta;
	}
	e = k = q = y = z = null;
	return EnDe.lng2str(bux).replace(/\x00+$/,'');
	// we use \x00 instead of \0 to avoid error in some browsers
	// Warnung: non-octal digit in an escape sequence that doesn't match a back-reference
  }; // tea

  this.yenc     = function(type,mode,uppercase,src,prefix,key,delimiter) {
  //#? yDecode
	var bux = '';
	var ccc = '';
	var add = 0;
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charCodeAt(i);
		if (ccc===61) {
			add = EnDe.CONST.CST.yencMagic;
			continue;
		} else {
			add = 0;
		}
		ccc -= EnDe.CONST.CST.yencMagic;
		bux += String.fromCharCode(ccc);
	}
	return bux;
  }; // yenc

  this.fuzzy    = function(type,mode,src,prefix,suffix,delimiter) {
  //#? fuzzy decoding ..
  //#type? fuzOCTsq: decode octal inside single quotes
  //#type? fuzOCTdq: decode octal inside double quotes
  //#type? fuzHEXsq: decode hex inside single quotes
  //#type? fuzHEXdq: decode hex inside double quotes
  //#type? fuzUCSsq: decode Unicode inside single quotes
  //#type? fuzUCSdq: decode Unicode inside double quotes
  //#type? ...
	/* type may be:
	 *   fuzOCTsq, fuzOCTdq, fuzHEXsq, fuzHEXdq, fuzUCSsq, fuzUCSdq,
	 *   fuzURLsq, fuzURLdq, fuzNCRsq, fuzNCRdq,
	 *   fuzHEXrb, fuzHEXsb, fuzHEXcb, fuzHEXab, ...
	 * where this string consist of following 3 parts:
	 *   fuz    : constant literal prefix; ignored
	 *   XXX    : type of decoding
	 *   sq, dq : check inside single ' or double " quotes
	 *   rb, sb : check inside round () or square brackets []
	 *   cb, ab : check inside curly {} or angle brackets <>
	 * prefix, suffix, delimiter are only used for type fuzOPT*
	 */
	var bux = '';
	var bbb = '';   // set to quote character if inside quoted string
	var ccc = '';
	var kkk = '';
	var qot = '';   // contains current quote character
	var typ = '';
	var dec = 0;    // set to 1 if something to decode
	var rex = null;

	function _try(_map,_src,_pre,_suf,_del) {
	// check for encoding; returns length of match and converted string
	/* _map : a hash where key is type for EnDe.DE.dispatch and the value is
	 *        a RegEx to match the encoded string
	 * _src : the string to match for encoding
	 * _pre,_suf,_del : as for this.fuzzy
	 */
		var __b = '';
		var __c = '';
		var __k = null;
		//#dbx this.dbx('.DE.fuzzy: 1 '+_src+'  -  '+_pre);
		for (__b in _map) {
			//#dbx this.dbx('.DE.fuzzy: __b=' + __b);
			var dbx = _map[__b][0];
			__k = _src.match(new RegExp('^' + EnDe.rex(_pre) + _map[__b], ''));
			if ((__k===undefined) || (__k===null)) { continue; }  // no match, try next
			//#dbx this.dbx('.DE.fuzzy: __k=' + __k);
			__c = EnDe.DE.dispatch(__b,mode,false,__k[0],_pre,_suf,_del);
			if  (__c.match(/out of range/i)!==null) { continue; }  // conversion failed, try next
			//#dbx this.dbx('.DE.fuzzy: __c=' + __c);
			return([__k[0].length, __c]);
		}
		return([0,'']);
	};

	// fuzOPT* not needed here as they can be called directly
	//if (type.match(/^fuzOPT.*/) != null) {
	//	typ = type.substr(6,4); // extract type after 'fuzOPT'
	//	return this.numstr(typ, mode, src, prefix, suffix, delimiter);
	//}

	// detect decoding modes from given type
	if (type.match(/^fuz.*sq$/)!==null) { qot = "'"; }
	if (type.match(/^fuz.*dq$/)!==null) { qot = '"'; }
	if (type.match(/^fuz.*rb$/)!==null) { qot = '('; }
	if (type.match(/^fuz.*sb$/)!==null) { qot = '['; }
	if (type.match(/^fuz.*cb$/)!==null) { qot = '{'; }
	if (type.match(/^fuz.*ab$/)!==null) { qot = '<'; }
	if (type.match(/^fuzOPT.*/)!==null) { typ = 'OPT'; }
	if (type.match(/^fuzOCT.*/)!==null) { typ = 'OCT'; }
	if (type.match(/^fuzHEX.*/)!==null) { typ = 'HEX'; }
	if (type.match(/^fuzUCS.*/)!==null) { typ = 'UCS'; }
	if (type.match(/^fuzURL.*/)!==null) { typ = 'URL'; }
	if (type.match(/^fuzNCR.*/)!==null) { typ = 'URL'; }
	if (type.match(/^fuz0XX.*/)!==null) { typ = 'hex'; }

	// simple parser, quick&dirty
	var i   = -1;
	while (i<src.length) {
		i++;
		dec = 0;
		ccc = src.charAt(i);
		switch (ccc) { // pre-check
		  case '\\':
			if (src.charAt(i+1)==='\\') {   // escaped \ itself
				bux += ccc;
				i++;
				bux += src.charAt(i);
				continue;
			}
			if (bbb!=='') {     // inside quoted string
				if (src.charAt(i+1)===bbb) {
					bux += ccc;
					i++;
					bux += src.charAt(i);
					continue;
				}
				dec = 1;
			}
			break;
		  case ')':
		  case ']':
		  case '}':
			if (bbb!=='') {     // end string in brackets
				bbb = '';
			}
			break;
		  case '(':
		  case '[':
		  case '{':
			if (bbb==='') {     // start string in brackets
				if (qot===ccc) {
					bbb = EnDe.pairs[ccc];  // must be complement for \\ escaped ones, see above
				}
			}
			break;
		  case '"':
		  case "'":
			if (bbb==='') {     // start quoted string
				if (qot===ccc) {
					bbb = ccc;
				}
			} else {            // end quoted string
				if (bbb===ccc) {// ensure same quote
					bbb = '';
				}
			}
			break;
		  default:
			if (bbb!=='') {     // inside quoted string
				if (src.substr(i,10).match(EnDe.rex(prefix))!==null) { dec = 1; }
			}
			break;
		} // pre-check
		if (dec!==0) {
			// pass string starting at current character and max. 10 characters
			/* Note that first element in hash below is a RegEx. If we need a
			 * backslash (\) as literal there it needs to be \\\\ to become an
			 * escaped \ in the Regex.
			 */
			switch (typ) {
// ToDo: OPT not yet ready
			  case 'OPT':
				kkk = _try( {},src.substr(i,10),prefix,suffix,delimiter );
				break;
			  case 'hex':
				kkk = _try( {'hex4': '[0-9A-Fa-f]{4}',
							 'hex3': '[0-9A-Fa-f]{3}',
							 'hex2': '[0-9A-Fa-f]{2}'
							},
							src.substr(i,10), '0x',  '',  ''
						);
				break;
			  case 'OCT':
				kkk = _try( {'oct4': '[0-7]{4}',
							 'oct3': '[0-7]{3}',
							 'oct2': '[0-7]{2}'
							},
							src.substr(i,10), '\\',  '',  ''
						);
				break;
			  case 'HEX':
				//kkk = _try(map_hex, src.substr(i,10), '\\x', '',  '');
				kkk = _try( {'hex4': '[0-9A-Fa-f]{4}',
							 'hex3': '[0-9A-Fa-f]{3}',
							 'hex2': '[0-9A-Fa-f]{2}'
							},
							src.substr(i,10), '\\x', '',  ''
						);
				if (kkk[0]!==0) {
					i   += kkk[0] - 1;  // -1 as leading char already counted
					bux += kkk[1].toString();
					kkk.length = 0;
					continue;
				}
				kkk.length = 0;
				kkk = _try( {'urlUCS': '[0-9A-Fa-f]{4}' },
							src.substr(i,10), '\\u', '',  ''
						);
				break;
			  case 'UCS':
				kkk = _try( {'ucs4': '[0-9A-Fa-f]{4}' },
							src.substr(i,10), '\\u', '',  ''
						);
				break;
			  case 'URL':
				kkk = _try( {'urlUCS': '[0-9A-Fa-f]{4}'
							},
							src.substr(i,10), '%u',  '',  ''
						);
				if (kkk[0]!==0) {
					i   += kkk[0] - 1;
					bux += kkk[1].toString();
					kkk.length = 0;
					continue;
				}
				kkk = _try( {/*'urlUTF8':'[0-9A-Fa-f]{2}', NOT YET IMPLEMENTED
							 'urlUni': '[0-9A-Fa-f]{2}',*/
							 'urlCHR': '[0-9A-Fa-f]{2}',
							 'urlHEX': '[0-9A-Fa-f]{2}'
							},
							src.substr(i,10), '%',   '',  ''
						);
				break;
			  case 'NCR':
				kkk = _try( {'ncrDEC': '[0-9]{1,3};'
							},
							src.substr(i,10), '&#',  ';', ''
						);
				if (kkk[0]!==0) {
					i   += kkk[0] - 1;
					bux += kkk[1].toString();
					kkk.length = 0;
					continue;
				}
				kkk = _try( {'ncrHEX4':'[0-9A-Fa-f]{4};',
							 'ncrHEX': '[0-9A-Fa-f]{2};'
							},
							src.substr(i,10), '&#x', ';', ''
						);
				break;
			} // typ
			if (kkk[0]!==0) {
				i   += kkk[0] - 1;
				bux += kkk[1].toString();
				kkk.length = 0;
				continue;
			}
		}
		bux += ccc;
	}
	rex = null;
	if (typeof(kkk)==='object') { while (kkk.pop()!=null) {} }
	return bux;
  }; // fuzzy

  this.guess    = function(_n1_,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? **depricated**
	return 'EnDe.DE.guess() **OBSOLETE**';
  }; // guess

  this.dispatch = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? dispatcher for decoding functions
	this.dbx('.DE.dispatch: '+type+'\t:uppercase='+uppercase+'\tprefix='+prefix+'\tsuffix='+suffix+'\tdelimiter='+delimiter);
	if (type==='') {  return ''; }
	switch (type) {
	case 'urlCHR'   : return this.url('null',  mode, src, prefix, '',     ''       ); break;
	case 'urlUTF8'  : return this.url('utf8',  mode, src, '',     '',     ''       ); break;
//	case 'urlUTF8c' : return this.url('utf8c', mode, src, '',     '',     ''       ); break;
	case 'urlUni'   : return this.ucs('url2',  mode, src, '',     '',     ''       ); break;
//	case 'urlUCS'   : return this.ucs('url4',  mode, src, '',     '',     ''       ); break; // not yet used
	case 'urlUCS'   : return this.hex('url4',  mode, src, prefix, '',     ''       ); break;
/*
	case 'urlNibbles':return this.url('nibbles',mode,src, '%',    '',     ''       ); break;
	case 'urlNibble1':return this.url('nibble1',mode,src, '%',    '',     ''       ); break;
	case 'urlNibble2':return this.url('nibble2',mode,src, '%',    '',     ''       ); break;
*/
	case 'oct0'     : return this.oct( 0,      mode, src, prefix, suffix, delimiter); break;
	case 'oct1'     : return this.oct( 1,      mode, src, prefix, suffix, delimiter); break;
	case 'oct2'     : return this.oct( 2,      mode, src, prefix, suffix, delimiter); break;
	case 'oct3'     : return this.oct( 3,      mode, src, prefix, suffix, delimiter); break;
	case 'oct4'     : return this.oct( 4,      mode, src, prefix, suffix, delimiter); break;
	case 'oct5'     : return this.oct( 5,      mode, src, prefix, suffix, delimiter); break;
	case 'oct6'     : return this.oct( 6,      mode, src, prefix, suffix, delimiter); break;
	case 'oct7'     : return this.oct( 7,      mode, src, prefix, suffix, delimiter); break;
	case 'oct'      : return this.oct('null',  mode, src, prefix, suffix, delimiter); break;
	case 'oct3str'  : return this.numstr('oct',mode, src, prefix, suffix, delimiter); break;
	case 'dez0'     : return this.dez( 0,      mode, src, prefix, suffix, delimiter); break;
	case 'dez1'     : return this.dez( 1,      mode, src, prefix, suffix, delimiter); break;
	case 'dez2'     : return this.dez( 2,      mode, src, prefix, suffix, delimiter); break;
	case 'dez3'     : return this.dez( 3,      mode, src, prefix, suffix, delimiter); break;
	case 'dez4'     : return this.dez( 4,      mode, src, prefix, suffix, delimiter); break;
	case 'dez5'     : return this.dez( 5,      mode, src, prefix, suffix, delimiter); break;
	case 'dez6'     : return this.dez( 6,      mode, src, prefix, suffix, delimiter); break;
	case 'dez7'     : return this.dez( 7,      mode, src, prefix, suffix, delimiter); break;
	case 'dez'      : return this.dez('null',  mode, src, prefix, suffix, delimiter); break;
	case 'ncrNUM0'  : return this.dez('ncr0',  mode, src, prefix, '',     ''       ); break;
	case 'ncrNUM'   : return this.dez('ncr2',  mode, src, prefix, '',     ''       ); break;
	case 'dez3str'  : return this.numstr('dez',mode, src, prefix, suffix, delimiter); break;
	case 'hex0'     : return this.hex( 0,      mode, src, prefix, suffix, delimiter); break;
	case 'hex1'     : return this.hex( 1,      mode, src, prefix, suffix, delimiter); break;
	case 'hex2'     : return this.hex( 2,      mode, src, prefix, suffix, delimiter); break;
	case 'hex3'     : return this.hex( 3,      mode, src, prefix, suffix, delimiter); break;
	case 'hex4'     : return this.hex( 4,      mode, src, prefix, suffix, delimiter); break;
	case 'hex5'     : return this.hex( 5,      mode, src, prefix, suffix, delimiter); break;
	case 'hex6'     : return this.hex( 6,      mode, src, prefix, suffix, delimiter); break;
	case 'hex7'     : return this.hex( 7,      mode, src, prefix, suffix, delimiter); break;
	case 'hex'      : return this.hex('null',  mode, src, prefix, suffix, delimiter); break;
	case 'hex2str'  : return this.numstr('hex2',mode,src, prefix, suffix, delimiter); break;
	case 'hex4str'  : return this.numstr('hex4',mode,src, prefix, suffix, delimiter); break;
	case 'ucs4'     : return this.ucs('ucs4',  mode, src, prefix, '',     ''       ); break;
	case 'urlHEX'   : return this.hex('url2',  mode, src, prefix, '',     ''       ); break;
	case 'ncrHEX'   : return this.hex('ncr2',  mode, src, prefix, '',     ''       ); break;
	case 'ncrHEX4'  : return this.hex('ncr4',  mode, src, prefix, '',     ''       ); break;
	case 'bin6'     : return this.bin( 6,      mode, src, prefix, suffix, delimiter); break;
	case 'bin7'     : return this.bin( 7,      mode, src, prefix, suffix, delimiter); break;
	case 'bin8'     : return this.bin( 8,      mode, src, prefix, suffix, delimiter); break;
	case 'dualBCD'  : return this.bcd(     0,  mode, src, '',     '',     delimiter); break;
	case 'dual_3'   : return this.stibitz( 0,  mode, src, '',     '',     delimiter); break;
	case 'dualAiken': return this.aiken(   0,  mode, src, '',     '',     delimiter); break;
	case 'ucsUTF8'  : return this.utf8('null', mode, src, prefix, '',     ''       ); break;
	case 'ucsUTF7'  : return this.utf7('null', mode, src, prefix, '',     ''       ); break;
	case 'ucsHALFw' : return this.f2h('null',  mode, src, prefix, '',     ''       ); break;
	case 'ucsFULLw' : return this.h2f('null',  mode, src, prefix, '',     ''       ); break;
	case 'ncrNAME'  : return this.ncr('name',  mode, src, prefix, '',     ';'      ); break;
	case 'ncrWIN'   : return this.ncr('win',   mode, src, prefix, '',     ';'      ); break;
	case 'ncrWINf'  : return this.ncr('winf',  mode, src, prefix, '',     ';'      ); break;
	case 'ncrDEC'   : return this.ncr('dez',   mode, src, prefix, '',     ';'      ); break;
	case 'url64'    : return EnDe.B64.DE.dispatch(type,mode,uppercase,src,'','',delimiter); break;
	case 'uu'       : return this.uu( 'null',  mode, src, EnDe.CONST.CHR.uuAnf, EnDe.CONST.CHR.uuEnd, EnDe.CONST.CHR.uuPad ); break;
	case 'uuhist'   : return this.uu( 'hist',  mode, src, EnDe.CONST.CHR.uuAnf, EnDe.CONST.CHR.uuEndH, ' ' ); break;
	case 'uuraw'    : return this.uu( 'raw',   mode, src, '',     '',     ''       ); break;
	case 'uuuser'   : return this.uu( 'user',  mode, src, prefix, suffix, delimiter); break;
	case 'qp'       : return this.qp( 'null',  mode, src, prefix, suffix, delimiter); break;
	case 'ascii'    : return this.e2a('null',  mode, src, prefix, '',     ''       ); break;
	case 'ebcdic'   : return this.a2e('null',  mode, src, prefix, '',     ''       ); break;
	case 'caesar'   : return this.rot('null',  mode, src, '',     23,     ''       ); break; // 23 = 26-3  !!
	case 'rot13'    : return this.rot('null',  mode, src, '',     13,     ''       ); break; // 13 = 26-13
	case 'rotN'     : return this.rot('null',  mode, src, '',     suffix, ''       ); break;
	case 'urlIDN'   : return this.idn('IDN',   mode, src, '',     suffix, ''       ); break;
	case 'urlIDN_'  : return this.idn('IDN_',  mode, src, '',     suffix, ''       ); break;
	case 'urlPNY'   : return this.idn('PNY',   mode, src, '',     suffix, ''       ); break;
	case 'urlPNY_'  : return this.idn('PNY_',  mode, src, '',     suffix, ''       ); break;
	case 'SOS'      : return this.sos('null',  mode, src, prefix, suffix, delimiter); break;
	case 'Baudot'   : return this.baudot('null',mode,src, prefix, suffix, delimiter); break;
	case 'dumphex'  : return this.dmp('hex',   mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'dumpODx'  : return this.dmp('ODx',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'dumpxDO'  : return this.dmp('xDO',   mode, uppercase, src, prefix, suffix, ''       ); break;
	case 'aes128'   : return this.aes('b128',  mode, true,      src, prefix, suffix, ''       ); break; // suffix is key here
	case 'aes192'   : return this.aes('b192',  mode, true,      src, prefix, suffix, ''       ); break; // suffix is key here
	case 'aes256'   : return this.aes('b256',  mode, true,      src, prefix, suffix, ''       ); break; // suffix is key here
	case 'aes128r'  : return this.aes('b128',  mode, false,     src, prefix, suffix, ''       ); break; // suffix is key here
	case 'aes192r'  : return this.aes('b192',  mode, false,     src, prefix, suffix, ''       ); break; // suffix is key here
	case 'aes256r'  : return this.aes('b256',  mode, false,     src, prefix, suffix, ''       ); break; // suffix is key here
	case 'blowfish' : return this.blowfish('', mode, uppercase, src, prefix, suffix, ''       ); break; // suffix is key here
	case 'tearaw'   : return this.tea('raw',   mode, uppercase, src, prefix, suffix, ''       ); break; // suffix is key here
	case 'teacor'   : return this.tea('some',  mode, uppercase, src, prefix, suffix, ''       ); break; // suffix is key here
	case 'teaesc'   : return this.tea('esc',   mode, uppercase, src, prefix, suffix, ''       ); break; // suffix is key here
	case 'yenc'     : return this.yenc('null', mode, uppercase, src, prefix, suffix, ''       ); break; // suffix is key here
	case 'xor'      : return EnDe.xor(src,suffix);      break;
	case 'EnDeSerial':EnDe.alert('EnDe.DE.dispatch','EnDeSerial not yet implemented'); return '';   break;
	case 'escCSS'   : return this.esc( type,   mode, src, '',     '',     ''       ); break;
	case 'escHTML'  : return this.esc( type,   mode, src, '',     '',     ''       ); break;
	case 'escJS'    : return this.esc( type,   mode, src, '',     '',     ''       ); break;
	case 'escURL'   : return this.esc( type,   mode, src, '',     '',     ''       ); break;
	case 'escSQL'   : return this.esc( type,   mode, src, '',     '',     ''       ); break;
	case 'escXML'   : return this.esc( type,   mode, src, '',     '',     ''       ); break;
	case 'escJava'  : return this.esc( type,   mode, src, '',     '',     ''       ); break;
	case 'escJavaProp':return this.esc(type,   mode, src, '',     '',     ''       ); break;
	case 'escQuote' : return this.esc( type,   mode, src, '',     '',     ''       ); break;
	case 'escJSesc' : return unescape(src);             break;
	case 'JSescape' : return unescape(src);             break;
	case 'JS2code'  : return this.toCode('null',mode,src, prefix, suffix, delimiter); break;
	case 'JS2char'  : return this.fromCode('null',mode,src,prefix,suffix, delimiter); break;
	case 'JChar'    : return this.fromJava('null',mode,src,prefix,suffix, delimiter); break;
	case 'JSURI'    : return decodeURI(src);            break;
	case 'JSURICom' : return decodeURIComponent(src);   break;
	case 'JSatob'   : return atob(src);                 break;
	case 'JSbtoa'   : return atob(src);                 break; // this is just for compatibility with test()
	case 'JSlc'     : return src.toLowerCase();         break;
	case 'JSuc'     : return src.toUpperCase();         break;
	case 'intHEX'   : return EnDe.i2h('null', src);     break;
	case 'intBIN'   : return EnDe.i2b(src);             break;
	case 'hexINT'   : return EnDe.h2i(src);             break;
	case 'hexBIN'   : return EnDe.h2b(src);             break;
	case 'hexCHR'   : return EnDe.h2c(src);             break;
	case 'binINT'   : return EnDe.b2i(src);             break;
	case 'binHEX'   : return EnDe.b2h(src);             break;
	case 'reverse'  : return EnDe.reverse(src);         break;
	case 'atbash'   : return EnDe.atbash(src);          break;
	case 'toCP1252' : return EnDe.EN.cp(src);           break;
	case 'fromCP1252':return this.cp(src);              break;
	case 'toDIN66003':  return EnDe.EN.dta(src);        break;
	case 'fromDIN66003':return this.dta(src);           break;
	case 'b64tou64' : return src.replace(/\+/g, '-').replace(/\//g, '_');   break;
	case 'u64tob64' : return src.replace(/\-/g, '+').replace(/_/g,  '/');   break;
	case 'splitArg' : return EnDe.split('arg', mode, uppercase, src, prefix, '', '&'      ); break;
	case 'splitKey' : return EnDe.split('key', mode, uppercase, src, prefix, '', '='      ); break;
	case 'splitDel' : return EnDe.split('del', mode, uppercase, src, prefix, '', delimiter); break;
	case 'joinArg'  : return EnDe.join( 'arg', mode, uppercase, src, prefix, '', '&'      ); break;
	case 'joinKey'  : return EnDe.join( 'key', mode, uppercase, src, prefix, '', '='      ); break;
	case 'joinDel'  : return EnDe.join( 'del', mode, uppercase, src, prefix, '', delimiter); break;
  //case 'chr'      : return EnDe.str2chr(                      src, prefix, suffix, delimiter); break; // same as below
	case 'chr'      : return this.chr(   type, mode, uppercase, src, prefix, suffix, delimiter); break;
	case 'copy'     : return src;                       break;
	default         :
//	case 'base*'    :
		if (/^base/.test(type)===true) { // Base-XX has its own disptcher
			this.dbx('.DE.dispatch: .B64.DE.dispatch('+type+', ...)');
			return EnDe.B64.DE.dispatch( type, mode, uppercase, src, prefix, '', delimiter );
			break;
		}
		// try some other functions, they return null if not available
//	case 'fuz*'     :
		if (type.match(/^fuz/)!==null) {
			this.dbx('.DE.dispatch: .fuzzy('+type+', ...)');
			return this.fuzzy( type,  mode, src, prefix, suffix, delimiter );
			break;
		}
		this.dbx('.DE.dispatch: .user.DE.dispatch('+type+', ...)');
		var bux = null;
		bux = EnDe.User.DE.dispatch( type, mode, uppercase, src, prefix, suffix, delimiter );
		if (bux!==null) { return bux; }
// ToDo: no alert() here 'cause EnDeTest.test()
/*
			EnDe.alert('EnDe.DE.dispatch','unknown "'+type+'"'); return;  break;
*/
		break;
	}
	return ''; // ToDo: internal error
  }; // dispatch

 }; // EnDe.DE

}; // EnDe


// ========================================================================= //
// unsorted functions                                                        //
// ========================================================================= //

EnDe.Misc = new function() {
this.sid        = function()  { return('@(#) EnDe.js 3.32 12/06/04 21:52:10 EnDeMisc'); };

	// ===================================================================== //
	// global variables                                                      //
	// ===================================================================== //

this.rfc2396    = function() {
//#? container for RFC2396 definitions ** NOT YET USED **
	/* see: http://www.ietf.org/rfc/rfc2396.txt */
	var control     = '\x00-\x1f,\x7f';
	var reserved    = ';/?:@&=+$,';
	var unreserved  = "-_.!~*'()";
	var delims      = '<>#%"';
	var unwise      = '{}|\\^[]`';
	var scheme      = '+-.';
	var path        = ':@&+$,';
		/* NOTE that RFC 2396 is ambigious here as it allows = in path also
		 * but then defines = as reserved character for a path component.
		 * It also define @, + nd $ as reserved but alows it as path.
		 */
	// Within a path segment, the characters "/", ";", "=", and "?" are reserved.
	var pathreserved= '/;=?';
	// Within a query component, the characters ";", "/", "?", ":", "@", "&", "=", "+", ",", and "$" are reserved.
	var queryreserved= reserved;

  this.encode   = function(src,uppercase) {
  //#? encode string according RFC 2396
	var bux = '';
	var ccc = '';
	var kkk = src.split('//');
	if (kkk.length > 1) {
		bux = kkk.shift();
		kkk = kkk.join('//');
	}
	for (ccc in kkk.split('/')) {
		// bux += ccc.replace();
	}
	kkk.length = 0;
	return bux;
  };
};

	// ===================================================================== //
	// misc functions                                                        //
	// ===================================================================== //

this.additionalBase64Encoding = function(src) {
//#? additional Base64 character encoding ** NOT YET USED **
	// ToDo:
	var bux = '';
	if (src != '') {
		bux = src.replace(/\+/g, EnDe.b64AdditionalChars[0]);
		bux = bux.replace(/\//g, EnDe.b64AdditionalChars[1]);
		bux = bux.replace(/\=/g, EnDe.b64AdditionalChars[2]);
	}
	return bux;
};

this.additionalBase64Decoding = function(src) {
//#? additional Base64 character decoding ** NOT YET USED **
	// ToDo: should be changed to EnDe.b64AdditionalChars using regex
	var bux = '';
	var i   = 0;
	if ((src != '') && (typeof src != typeof undefined)) {
		for (i=0; i<src.length; i++) {
			if (src.charAt(i) == EnDe.b64AdditionalChars[0]) {
				bux += '+';
			} else if (src.charAt(i) == EnDe.b64AdditionalChars[1]) {
				bux += '/';
			} else if (src.charAt(i) == EnDe.b64AdditionalChars[2]) {
				bux += '=';
			} else {
				bux += src.charAt(i);
			}
		}
	}
	return bux;
};
}; // EnDe.Misc

