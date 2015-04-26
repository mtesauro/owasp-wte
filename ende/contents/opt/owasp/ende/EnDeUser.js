/* ========================================================================= //
# vi:  ts=4:
# vim: ts=4:
#?
#? NAME
#?      EnDeUser.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeGUI.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeUser.js"></SCRIPT>
#?
#? DESCRIPTION
#?      This file contains user defined functions/methods used in  EnDe.js .
#?      It defines the  EnDe.User  object with following functions:
#?          .EN.vs      - fold viewstate (ASP.NET 1.x only, 2.x experimental)
#?          .EN.dispatch- dispatcher for user encoding functions
#?          .DE.vs      - parse viewstate (ASP.NET 1.x only, 2.x experimental)
#?          .DE.dispatch- dispatcher for user decoding functions
#?          .Check.dispatch - dispatcher for checksum functions
#?          .Check.quess- guessing checksums
#?          .DAT        - data structure for identifying data format
#?          .DAT.isXXX  - return true if given data is of format XXX
#?          .DAT.guess  - try to identify data format
#?          .IMG        - data structure for reading image data
#?          .IMG.isXXX  - return true if given data is of image format XXX
#?                       XXX: BMP, GIF, JPG, PNG, SVG, TXT, XPM
#?          .IMG.guess  - try to identify image format
#?          .IMG.getMIME64  - get MIME type prefix for base64 encoded image data
#?          .init       - initialize user data
#?
#? PRE-REQUESTS
#?      Some functions herein rely on variables and functions set elsewhere:
#?          EnDeGUI.alert()
#?          EnDeGUI.isKonqueror
#?
#?      If they are missing, somehow, they can simply be implemented as follows
#?      (which is the default anyway):
#?          EnDeGUI.alert    = function(f,s){alert(f+':'+s);}
#?          EnDeGUI.isKonqueror = false;
#?
#? SEE ALSO
#?      EnDe.js
#?      EnDeGUI.js
#?      EnDeFile.xml
#?      EnDeSamp.xml
#?
# HACKER's INFO
#       Simple debugging available if  userdebug  given in QUERY_STRING.
#
#? VERSION
#?      @(#) EnDeUser.js 3.17 12/06/03 12:34:41
#?
#? AUTHOR
#?      27-nov-07 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

// ========================================================================= //
// EnDe.User object methods                                                  //
// ========================================================================= //

if (typeof(EnDe)==='undefined') { EnDe = new function() {}; }

EnDe.User   = new function() {
	this.SID    = '3.17';
	this.sid    = function() { return('@(#) EnDeUser.js 3.17 12/06/03 12:34:41 EnDe.User'); };

	// ===================================================================== //
	// global variables                                                      //
	// ===================================================================== //
	this.trace  = false;
	this.mode   = 'lazy';   // lazy and strict used in .vs() only
		/*
		 * use of globals to avoid passing on stack, see _v2_parse() for details, 
		 */
	this.ident  = '|  ';
	this.str    = '';   // current string to be prased
	this.pos    = 0;    // current position of parser in string
	this.typ    = null; // current object type being parsed
	this.level  = [];   // stack of objects
	this.idxed  = false;// set to true if a index [n] was written with identation
	this.maxloop= EnDe.maxloop || 99999;

	// ===================================================================== //
	// internal/private functions                                            //
	// ===================================================================== //

	function __dbx(t,n) { if(EnDe.User.trace===true) { EnDeGUI.dpr(t,n); } };

	// ===================================================================== //
	// viewstate functions                                                   //
	// ===================================================================== //

	this.EN     = new function() {
		this.sid  = function() { return(EnDe.User.sid() + '.EN'); };
		this.vs   = function(src) {
		//#? convert data to ViewState 1.x format
			src = src.replace(/\|   /g, '');
			src = src.replace(/\n/g, '');
			return src;
		}; // vs

		this.dispatch = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
		//#? dispatcher for user encoding functions
			__dbx(this.sid()+'.dispatch: '+type+'\t:uppercase='+uppercase+'\tprefix='+prefix+'\tsuffix='+suffix+'\tdelimiter='+delimiter);
			switch (type) {
			  case 'viewstate': return this.vs(src); break;
			}
			return null;
		}; // dispatch
	}; // .EN

this.DE     = new function() {
  this.sid  = function() { return(EnDe.User.sid() + '.DE'); };
  this.vs   = function(mode,src) {
  //#? convert data from ViewState 1.x format
  //#mode: 'XML':  for XML output (open tag)
  //#mode: '/XML': for XML output (close tag)
  //#mode: 'txt':  for simple text output
	if (EnDeGUI.isKonqueror){
		EnDeGUI.alert('** Sorry, Konqueror cannot use this function **');
		return src;
	}
	if (mode === 'XML') {
		EnDe.User.ident = '   ';
	} else {
		EnDe.User.ident = '|  ';
	}
	EnDe.User.level = [];


	function _bytes(src,i,len) { return src.substr(i,len); }
	function _vs1(src,i) {
		// parse Viewstate 1.x format
		// this code is build on reverse engeneering sample data
		var _v1 = '';
		var lev = 0;
		var bbb = '';
		var ccc = '';
		var arr = null;
		var rex = null;
		var esc = 0;    // set to 1 if \ found, reset at next character
		var key = 0;    // incremented if < or ; decremented for [tpli]  and >
	                	// used to beautify idents
	    	key = 1;    // we assume that the viewstate's first character is a key
		while (i<src.length) {
			if (i>EnDe.User.maxloop) { EnDeGUI.alert('viewstate too large'); return _v1; break; }
			ccc = src.charAt(i);
			i++;
			if (esc==1) {
				esc = 0;
				_v1 += ccc;
				continue;
			}
			switch (ccc) {
			  case 'l'   :
			  case 't'   :
			  case 'p'   :
			  case 'i'   :
				if (key>0) {  // got a special key (tripple, tuplet)
					_v1 += '\n' + bbb + ccc;
					key = -1;
				} else {
					_v1 += ccc;
				}
				break;
			  case '\\': esc = 1; _v1 += ccc; break;
			  case '<':
				lev++;
				if (key>=0) { _v1 += '\n' + bbb; }
				//_v1 += '\n' + bbb + ccc;
				_v1 += ccc;
				key=1;
				/*
				 * limited JavaScript in Firefox (2.0.0.10), returns error
				 *    Error: overlarge minimum (67395) ....
				 * hence no sophisticated compact parsing for huge data
				 */
				if (src.length < 67390 ) {
					rex = new RegExp( '(?:^.{'+i+'})([a-zA-Z0-9.,;:/\(\)\\_-]+>)' );
					arr = src.match(rex);
					if (arr!=null) {
						_v1 += arr[1];
						i += arr[1].length;
						arr.length = 0;
					} else {
						bbb += '|   ';
					}
				} else {
					bbb += '|   ';
				}
				break;
			  case '>':
				key=0;
				lev--;
				bbb  = bbb.substr(0,(bbb.length-4));
				_v1 += '\n' + bbb + ccc;
				break;
			  case ';':
				key++;
				//_v1 += '\n' + bbb + ccc;
				_v1 += ccc;
				break;
			  default: _v1 += ccc; key = 0; break;
			}
		}
		rex = null;
		return _v1;
	} // _vs1

	function _short() {
		// return integer16 from next 2 bytes
		// it's assumed that bytes start at EnDe.User.pos and are in LSB order
		// increments EnDe.User.pos by 1
		EnDe.User.pos++;
		return  (parseInt(EnDe.User.str.charCodeAt(EnDe.User.pos)) << 8) + (parseInt(EnDe.User.str.charCodeAt(EnDe.User.pos-1)));
	} // _short

	function _unsigned() {
		// return unsigned integer from next one, two or three bytes
		// it's assumed that bytes start at EnDe.User.pos and are in LSB order
		// increments EnDe.User.pos by 1, 2 or 3
		EnDe.User.pos++;
		var __y;
		var __u = parseInt(EnDe.User.str.charCodeAt(EnDe.User.pos));
		if (__u > 127) {
			__u &= 0x7f;
			EnDe.User.pos++;
			__y = parseInt(EnDe.User.str.charCodeAt(EnDe.User.pos));
			if (__y > 127) {
				EnDe.User.pos++;
				__u += (parseInt(EnDe.User.str.charCodeAt(EnDe.User.pos)&0x7f) << 14);
			}
			__y = (__y & 0x7f) << 7;
			__u += __y;
		}
		return __u;
	} // _unsigned

	function _long() {
		// return 4-byte integer from next 4 bytes
		// it's assumed that bytes start at EnDe.User.pos and are in LSB order
		// increments EnDe.User.pos by 4
		EnDe.User.pos++;
// ToDo: experimental
		var __l = 0;
		__l += (parseInt(EnDe.User.str.charCodeAt(EnDe.User.pos)) << 24); EnDe.User.pos++;
		__l += (parseInt(EnDe.User.str.charCodeAt(EnDe.User.pos)) << 16); EnDe.User.pos++;
		__l += (parseInt(EnDe.User.str.charCodeAt(EnDe.User.pos)) <<  8); EnDe.User.pos++;
		__l += (parseInt(EnDe.User.str.charCodeAt(EnDe.User.pos)) );
		return __l;
	} // _long

	function _scope(tag) {
		// return 1 if given data is a scope, 0 otherwise
		switch (tag) {
		  case '\x03':
		  case '\x0f':
		  case '\x10':
		  case '\x15':
		  case '\x16':
		  case '\x17':
		  case '\x18':
		  case '\x3c':
		  case '\xfe':
		  case '\xff': return 1; break;
		  case '\x19':
		  case '\x1a': return 1; break;
		}
		return 0;
	} // _scope

	function _ident(mode,idx) {
		var __i = '';
		for (var _j=0; _j<idx; _j++, __i += EnDe.User.ident){};
		return '\n'+__i;
	} // _ident

	function _start(mode,src) {
		var __a = '';
		if (EnDe.User.idxed === false) { __a = _ident(mode,EnDe.User.level.length); }
		if (src === _mask('txt',src)) { // check if known key
			__a += _mask(mode,'\x1d');  // unknown key, use data
			EnDe.User.level.push('\x1d');
		} else {
			__a += _mask(mode,src);
			EnDe.User.level.push(src);
		}
		EnDe.User.idxed = false;
		return __a;
	} // _start

	function _stopp(mode) {
		var __e = '';
		var src = EnDe.User.level.pop();
		if (mode !== 'XML') { return ''; }
		if (_scope(src) === 1) { __e  = _ident(mode,EnDe.User.level.length); }
		__e += _mask('/'+mode,src);
		return __e;
	} // _stopp

	function _count(mode,num) {
		var __c = '';
		if (mode === 'XML') {
			// pos= nur ausgeben fuer dispatch-mode=verbose
			__c += '<!-- pos="' + EnDe.User.pos + '" (' + num + ') -->';
		} else {
			__c += '(' + num + ') ';
		}
		return __c;
	} // _count

	function _index(mode,num) {
		var __f = _ident(mode,EnDe.User.level.length);
		if (mode === 'XML') {
			// pos= nur ausgeben fuer dispatch-mode=verbose
			__f += '<!-- pos="' + EnDe.User.pos + '" [' + num + '] -->';
		} else {
			__f += '[' + num + '] ';
		}
		EnDe.User.idxed = true; // set to true only here !
		return __f;
	} // _count

	function _is_hash() {
		// check for possible hash
		// retrun number of remaining characters (16 or 20), 0 otherwise
		var __i = EnDe.User.str.length - EnDe.User.pos;
		switch (__i) {
		  case 16:
		  case 20: return __i; break;
		}
		return 0;
	} // _is_hash

	function _string(mode,num) {
		var __s = '';
		var __t = 0;
		for (t=0; t<num; t++) {
			EnDe.User.pos++;
			__s += EnDe.User.str[EnDe.User.pos];
		}
		return __s;
	} // _string

	function _hash(mode,tag) {
		// return hash if any
		var __h = '';
		var hhh = '';
		switch (_is_hash()) {
		  case 16: __h += _start(mode,'\x1b'); break;
		  case 20: __h += _start(mode,'\x1c'); break;
		}
		while (EnDe.User.pos<EnDe.User.str.length) {
			hhh += EnDe.User.str[EnDe.User.pos];
			EnDe.User.pos++;
		}
		__h += _daten(mode,EnDe.EN.hex(2,'lazy',false,hhh,'\\x','',''));
		__h += _stopp(mode);
		return __h;
	} // _hash

	function _daten(mode,tag) {
		// write human readable data dependeing on mode (XML or text)
		var __d = '';
		if (mode !== 'XML')  { __d += ' ';  }
		switch (tag) {
		  case '\xfe': __d += 'v1.0';   break;
		  case '\xff': __d += 'v2.0';   break;
		  case '\x0b': __d += ''     ;  break;
		  case '\x64': __d += 'NULL' ;  break;
		  case '\x65': __d += ''     ;  break;
		  case '\x66': __d += '0'    ;  break;
		  case '\x67': __d += 'true' ;  break;
		  case '\x68': __d += 'false';  break;
		  case '#':    __d += 'false';  break;
		  default    : __d += tag;      break;
		}
		if (EnDe.User.mode === 'strict') { __d = EnDe.EN.dispatch('escXML','lazy',true,__d,'','',''); }
		return __d;
	} // _daten

	function _mask(mode,src) {
		// return human readable scope; returns given src itself if src unknown
		// uses global EnDe.User.pos and EnDe.User.typ in XML mode
		// mode: see vs()
		var __m = '';
		if (mode === 'XML')  { __m += '<';  }
		if (mode === '/XML') { __m += '</'; }
		switch (src) {
		  // ViewState types
		  case '\xfe': __m += 'Viewstate_v1.0'; break;
		  case '\xff': __m += 'Viewstate_v2.0'; break;
		  case '\x01': __m += 'Integer16'     ; break;
		  case '\x02': __m += 'Integer'       ; break;
		  case '\x03': __m += 'Array_Boolean' ; break;
		  case '\x04': __m += 'Integer64'     ; break; // ToDo: unsure
		  case '\x05': __m += 'String'        ; break;
		  case '\x0b': __m += 'String0'       ; break;
		  case '\x0c': __m += 'StringC'       ; break; // ToDo: unsure
		  case '\x0f': __m += 'Pair'          ; break;
		  case '\x10': __m += 'Triple'        ; break;
		  case '\x15': __m += 'Array_Strings' ; break; // aka List
		  case '\x16': __m += 'Array_Objects' ; break; // aka List
		  case '\x17': __m += 'Arraylist'     ; break;
		  case '\x18': __m += 'Controlstate'  ; break; // aka Hashlist aka HybridDictionary
		  case '\x1e': __m += 'IndexedString' ; break;
		  case '\x1f': __m += 'IndexedNumber' ; break;
		  case '\x3c': __m += 'Array_SysObject';break; // ToDo: unsure
		  case '\x64': __m += 'Pair'          ; break; // pair node is NULL
		  case '\x65': __m += 'String'        ; break; // string value is NULL
		  case '\x66': __m += 'Integer'       ; break; // integer value is NULL
		  case '\x67': __m += 'Boolean'       ; break;
		  case '\x68': __m += 'Boolean'       ; break;
		  // private types
		  case '\x19': __m += 'HybridDictionary';break;
		  case '\x1a': __m += 'DictionaryEntry';break;
		  case '\x1b': __m += 'MAC_MD5'       ; break;
		  case '\x1c': __m += 'MAC_SHA1'      ; break;
		  case '\x1d': __m += 'data'          ; break;
		  default    : return( src )          ; break;
		}
		if (mode === 'XML') {
			__m  = __m.replace(/\./g, '_'); // XML tags must not contain .
			__m += ' pos="' + EnDe.User.pos + '"';
			__m += ' typ="' + EnDe.EN.hex(2,'lazy',false,src,'\\x','','') + '"';
			__m += ' >';
		}
		if (mode === '/XML') { __m += '>'; }
		return __m; // fallback
	} // _mask

	function _v2_parse(mode) {
	/* parse src starting at anf */
		//#mode?: see vs()
		// parse Viewstate 2.x format
		// start parsing at EnDe.User.pos
		// this ugly code is build on reverse engeneering sample data
		// ToDo: _v2_parse() still incomplete and buggy
		__dbx('EnDe.User.DE._v2(){ [' + EnDe.User.pos + '], level=' + EnDe.User.level.length,'');
		var _v2 = '';
		var bbb = '';
		var ccc = 0; // count items in list, hashlist, arraylist, ...
		if (EnDe.User.pos>199999) { EnDeGUI.alert('viewstate too large'); return _v2; }
		EnDe.User.typ = EnDe.User.str[EnDe.User.pos];
		//bbb = EnDe.EN.hex(2,'lazy',false,EnDe.User.typ,'\\x','','');
		//__dbx(', typ=' + bbb,'');
		//bbb = '';
		if (EnDe.User.typ != undefined) {
			__dbx(', typ=' + EnDe.EN.hex(2,'lazy',false,EnDe.User.typ,'\\x','',''),'');
			//return '**ERROR: undefined';
		}
		_v2 += _start(mode,EnDe.User.typ);
		switch (EnDe.User.typ) {
		  //case '\u1f64':  special end; skip
		  case '\x64':
		  case '\x65':
		  case '\x66':
		  case '\x67':
		  case '\x68':
				__dbx(' B ');
				_v2 += _daten(mode,EnDe.User.typ);
				EnDe.User.pos++;
				break;
		  case '\x01':  // Integer16
				__dbx(' I ', '');
				EnDe.User.pos++;
				ccc  = _short();
				_v2 += _daten(mode,ccc);
				__dbx(ccc);
				break;
		  case '\x02':  // Integer
				__dbx(' i ', '');
				ccc  = _unsigned();
				_v2 += _daten(mode,ccc);
				__dbx(ccc);
				EnDe.User.pos++;
				break;
		  case '\x04':  // ToDo: integer probably 4 bytes fixed
				__dbx(' I ', '');
				ccc  = _long();
				_v2 += _daten(mode,ccc);
				__dbx(ccc);
				EnDe.User.pos++;
				break;
		//case '\x0c':  // {bytes} {00} NULL-terminated String  ??
		  case '\x0b':  // {bytes} {00} NULL-terminated String 
				__dbx(' 0 ');
				bbb  = '';
				while (EnDe.User.pos<EnDe.User.str.length) {
					EnDe.User.pos++;
					if (EnDe.User.str[EnDe.User.pos] == '\x00') {
						break;
					} else {
						bbb += EnDe.User.str[EnDe.User.pos-1];
					}
				}
				_v2 += _daten(mode,bbb);
				EnDe.User.pos++;
				bbb = null;
				break;
		  case '\x05':  // {size} {bytes} String, {size} indicates number of bytes 
		  case '\x1e':  // {size} {bytes} String, {size} indicates number of bytes 
				__dbx(' S ');
				bbb  = '';
				ccc =  _unsigned();
//#dbx# if (ccc == 279) ccc = 234;  // fuer das Beispiel: //wEPDwUJNzI3N ... ujKjWEoh7QoW
				_v2 += _count(mode,ccc);
				if (ccc > 127) { // ToDo: seems to be Integer32; calculation unknown
					// we have one more bytes
					_v2 += '\n<ERROR pos=' + EnDe.User.pos + ' "unknown string size; following data corrupted" />\n';
				}
/* // ToDo: when structure is known herein
				if (ccc > 127) { // ToDo: see above
					while (EnDe.User.pos<EnDe.User.str.length) { // ugly workaround
						ccc = EnDe.User.str[EnDe.User.pos];
						if ((ccc > 127) || (ccc < 32)) { break; }
						bbb += EnDe.User.str[EnDe.User.pos];
						EnDe.User.pos++;
					}
				}
*/
				_v2 += _daten(mode,_string(mode,ccc));
				EnDe.User.pos++;
				bbb = null;
				break;
		  case '\x15':  // {size} Array of Strings 
				__dbx(' A ');
				var b = 0;
				bbb  = '';
				ccc  = _unsigned();
				_v2 += _count(mode,ccc);
				for (b=0; b<ccc; b++) {
					_v2 += _start(mode,'\x05');
					bbb  = _unsigned();
					_v2 += _count(mode,ccc);
					_v2 += _daten(mode,_string(mode,bbb));
					_v2 += _stopp(mode);
				}
				ccc = null;
				break;
		  case '\x3c':  // Array System.Object
	// ToDo: structure unknown, simply occupay next 5 bytes, then continue as usual
				__dbx(' Y ');
				var k = 0;
				for (k=0; k<5; k++) {
					EnDe.User.pos++;
					_v2 += _start(mode,'\x1d');
					_v2 += _daten(mode,EnDe.EN.hex(2,'lazy',false,EnDe.User.str[EnDe.User.pos],'\\x','',''));
					_v2 += _stopp(mode);
				}
				EnDe.User.pos++;
				_v2 += _v2_parse(mode);
				break;
		  case '\x03':  // {size} Array of Booleans 
		  case '\x16':  // {size} Array of objects 
				__dbx(' B ');
				var a = 0;
				ccc  = _unsigned();
				_v2 += _count(mode,ccc);
				EnDe.User.pos++;
				for (a=0; a<ccc; a++) {
					_v2 += _index(mode,a);
					_v2 += _v2_parse(mode);
				}
				ccc = null;
				break;
		  case '\x18':  // {size} ControlState object 
				__dbx(' C ');
				var a = 0;
				_v2 += _start(mode,'\x19');     // HybridDictionary
				ccc  = _unsigned();             // number of DictionaryEntries
				_v2 += _count(mode,ccc);
				EnDe.User.pos++;
				for (a=0; a<ccc; a++) {
					_v2 += _index(mode,a);
					_v2 += _start(mode,'\x1a'); // DictionaryEntry
					_v2 += _v2_parse(mode);     // String
					_v2 += _v2_parse(mode);
					_v2 += _stopp(mode);        // /DictionaryEntry
				}
				_v2 += _stopp(mode);            // /HybridDictionary
				// hash may follow, printed at end of parser
				ccc = null;
				break;
		  case '\x0f':  // Pair (tuple with two members) 
		  case '\x10':  // Triple (tuple with three members) 
				__dbx(' P ' + EnDe.EN.hex(2,'lazy',false,EnDe.User.typ,'\\x','','') );
				var __t  = EnDe.User.typ;
				EnDe.User.pos++;
				_v2 += _v2_parse(mode);
				_v2 += _v2_parse(mode);
				if (__t === '\x10') { _v2 += _v2_parse(mode); }
				break;
		  case '\x1f':  // {number} Indexed element, {number} indicates the index within an array 
				__dbx(' N');
				ccc  = _unsigned();
				_v2 += _daten(mode,ccc);
				EnDe.User.pos++;
				break;
		  default:
				__dbx(' default');
				/*
				 * if (_is_hash() && level==1) ...
				 * no check for rest of data, this ensures that there is no MAC
				 * printed if it immediately follows 'data' elements
				 */
				bbb += EnDe.User.str[EnDe.User.pos];
				if (EnDe.User.typ != undefined) {
					if (mode === 'XML') {
						_v2 += EnDe.EN.hex('ncr2','lazy',false,bbb,'','','');
					} else {
						_v2 += _daten(mode,EnDe.EN.hex(2,'lazy',false,bbb,'\\x','',''));
					}
				} else { // parsed over end of EnDe.User.str
					_v2 += '<ERROR pos=' + EnDe.User.pos + ' "undefined" />';
				}
				EnDe.User.pos++;
				break;
		} // switch
		_v2 += _stopp(mode);
		if ((EnDe.User.level.length ===1) && (_is_hash() !== 0)) { _v2 += _hash(); }
		__dbx('EnDe.User.DE._v2} (pos='+EnDe.User.pos+')');
		return _v2;
	}; // _v2_parse

	function _vs2(mode) {
	/* parse src starting at EnDe.User.pos */
		// mode: see vs()
		__dbx('EnDe.User.DE._vs2{ src=' + EnDe.EN.hex(2,'lazy',false,EnDe.User.str,'\\x','','') + '}');
		var __v = _start(mode,'\xff');
		var __p = EnDe.User.pos;
		while (EnDe.User.pos<EnDe.User.str.length) {
			__v += _v2_parse(mode);
			if (__p === EnDe.User.pos) {
				__v += '\n' + '**ERROR: EnDe.User.DE.vs: infinite loop at position: ' + EnDe.User.pos + '; exit\n';
				break;
			}
			__p = EnDe.User.pos;
		}
		__v += _stopp(mode);
		if (EnDe.User.level.length !== 0) {
			_v2 += '<ERROR level=' + EnDe.User.level.length + ' "something wrong" />';
		}
		return __v;
	}; // _vs2

	var net = 0;    // version 1.x or version 2.x
	var ccc = 0;
	var anf = 1;    // where to start parsing
	var bux = '';
	//#dbx# bux += src + '\n\n'; __dbx(src + '\n');
	EnDe.User.str = src; // store in a global
	while (ccc<src.length) { // detect viewstate, silently ignore anything before
		if (ccc>99999) { EnDeGUI.alert('viewstate too large'); break; }
		switch (src[ccc]) {
		  case '\uff01':                                    net = 2;    break;
		  case '\xff'  : if (src[ccc+1] == '\x01') { ccc++; net = 2; }; break; 
		  case 't'     : if (src[ccc+1] == '<')    { ccc++; net = 1; }; break; 
		}
		ccc++;
		if (net != 0) { break; } // found start of viewstate
		bux += src[ccc-1];
	}
	EnDe.User.pos = ccc;
	if (net == 1) { bux += 't<\n' +_vs1(src,ccc); } // t<  stripped above ..
	if (net == 2) { bux += _vs2(mode); }
	return bux;
  }; // vs

  this.dispatch = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? dispatcher for user decoding functions
	__dbx(this.sid()+'.disPatch: '+type+'\t:uppercase='+uppercase+'\tprefix='+prefix+'\tsuffix='+suffix+'\tdelimiter='+delimiter);
	EnDe.User.mode = mode;   // ToDo: only supported in *.vs()
	// first URL-decode which is idempotent and hence doesn't harm
	switch (type) {
	  case 'VSb64':     return this.vs( 'txt', EnDe.DE.dispatch('base64',mode,true,EnDe.DE.dispatch('urlCHR',mode,true,src,'', '', ''),prefix, '', '') ); break;
	  case 'VSb64XML':  return this.vs( 'XML', EnDe.DE.dispatch('base64',mode,true,EnDe.DE.dispatch('urlCHR',mode,true,src,'', '', ''),prefix, '', '') ); break;
	  case 'VSb64txt':  return this.vs( 'txt', EnDe.DE.dispatch('base64',mode,true,EnDe.DE.dispatch('urlCHR',mode,true,src,'', '', ''),prefix, '', '') ); break;
	  case 'VSraw':     return this.vs('null',src); break;
	  case 'viewstate': return this.vs(src);        break; // for historical backward compatibility
	}
	return null;
  }; // dispatch

}; // .DE

	// ===================================================================== //
	// checksum functions                                                    //
	// ===================================================================== //
	
this.Check  = new function() {
  this.sid  = function() { return(EnDe.User.sid() + '.Check'); };
  this.dispatch= function(tst) {
  //#? dispatcher for various checksum functions
	function $(id) { return document.getElementById(id); };
	var bux = '';
	var ccc = ' checksum: ';
	var src = $('EnDeDOM.DE.text').value;
        if ($('EnDeDOM.GUI.select').checked===true) {
		// use selection if there is one
		var kkk = EnDeGUI.selectionGet( $('EnDeDOM.EN.text') );
		if ((kkk!=null) && (kkk!='')) { src = kkk; }
		kkk = null;
        }
	switch (tst) {
	  case 'getISBN' : bux = EnDe.Check.ISBN.get( src );    ccc = 'get ISBN'      + ccc; break;
	  case 'getIBAN' : bux = EnDe.Check.IBAN.get( src );    ccc = 'get IBAN'      + ccc; break;
	  case 'getLuhn' : bux = EnDe.Check.Luhn.get( src );    ccc = 'get Luhn'      + ccc; break;
	  case 'getUPC'  : bux = EnDe.Check.UPC.get( src );     ccc = 'get UPC '      + ccc; break;
	  case 'getEAN'  : bux = EnDe.Check.EAN.get( src );     ccc = 'get EAN '      + ccc; break;
	  case 'getGLN'  : bux = EnDe.Check.GLN.get( src );     ccc = 'get GLN '      + ccc; break;
	  case 'getEFT'  : bux = EnDe.Check.EFT.get( src );     ccc = 'get EFT '      + ccc; break;
	  case 'getD5'   : bux = EnDe.Check.D5.get( src );      ccc = 'get D5  '      + ccc; break;
	  case 'isISBN'  : bux = EnDe.Check.ISBN.is( src );     ccc = 'check ISBN'    + ccc; break;
	  case 'isIBAN'  : bux = EnDe.Check.IBAN.is( src );     ccc = 'check IBAN'    + ccc; break;
	  case 'isLuhn'  : bux = EnDe.Check.Luhn.is( src );     ccc = 'check Luhn'    + ccc; break;
	  case 'isUPC'   : bux = EnDe.Check.UPC.is( src );      ccc = 'check UPC '    + ccc; break;
	  case 'isEAN'   : bux = EnDe.Check.EAN.is( src );      ccc = 'check EAN '    + ccc; break;
	  case 'isGLN'   : bux = EnDe.Check.GLN.is( src );      ccc = 'check GLN '    + ccc; break;
	  case 'isEFT'   : bux = EnDe.Check.EFT.is( src );      ccc = 'check EFT '    + ccc; break;
	  case 'isD5'    : bux = EnDe.Check.D5.is( src );       ccc = 'check D5  '    + ccc; break;
	  case 'valISBN' : bux = EnDe.Check.ISBN.valid( src );  ccc = 'validate ISBN' + ccc; break;
	  case 'valIBAN' : bux = EnDe.Check.IBAN.valid( src );  ccc = 'validate IBAN' + ccc; break;
	  case 'valLuhn' : bux = EnDe.Check.Luhn.valid( src );  ccc = 'validate Luhn' + ccc; break;
	  case 'valUPC'  : bux = EnDe.Check.UPC.valid( src );   ccc = 'validate UPC ' + ccc; break;
	  case 'valEAN'  : bux = EnDe.Check.EAN.valid( src );   ccc = 'validate EAN ' + ccc; break;
	  case 'valGLN'  : bux = EnDe.Check.GLN.valid( src );   ccc = 'validate GLN ' + ccc; break;
	  case 'valEFT'  : bux = EnDe.Check.EFT.valid( src );   ccc = 'validate EFT ' + ccc; break;
	  case 'valD5'   : bux = EnDe.Check.D5.valid( src );    ccc = 'validate D5  ' + ccc; break;
	  case 'isSSN'   : bux = EnDe.Check.SSN.is( src );      ccc = 'check SSN    ' + ccc; break;
	  case 'guess'   : EnDeGUI.cont(EnDe.User.Check.guess( src )); return false;          break;
	}
	prompt(ccc, bux);
	bux = null;
	return false;
  }; // dispatch
  
  this.guess     = function(src) {
  //#? guessing checksums
	var bux = '<table border="1"><tr><th colspan="4">' + src + '</th></tr>';
	bux += '<tr><td>&#160;</td><td>get()'   + '</td><td>' +'is()'                  + '</td><td>' +'valid()'                  + '</td></tr>';
	bux += '<tr><th>Luhn</th>';
	bux += '<td>' + EnDe.Check.Luhn.get(src) + '</td><td>' + EnDe.Check.Luhn.is(src) + '</td><td>' + EnDe.Check.Luhn.valid(src) + '</td></tr>';
	bux += '<tr><th>IBAN</th>';
//	bux += '<td>' + EnDe.Check.IBAN.get(src) + '</td><td>' + EnDe.Check.IBAN.is(src) + '</td><td>' + EnDe.Check.IBAN.valid(src) + '</td></tr>';
	bux += '<td>' + '??' + '</td><td>' + '??' + '</td><td>' + '??' + '</td></tr>';
	bux += '<tr><th>ISBN</th>';
	bux += '<td>' + EnDe.Check.ISBN.get(src) + '</td><td>' + EnDe.Check.ISBN.is(src) + '</td><td>' + EnDe.Check.ISBN.valid(src) + '</td></tr>';
	bux += '<tr><th>EFT</th>';
	bux += '<td>' + EnDe.Check.EFT.get(src)  + '</td><td>' + EnDe.Check.EFT.is(src)  + '</td><td>' + EnDe.Check.EFT.valid(src)  + '</td></tr>';
	bux += '<tr><th>UPC</th>';
	bux += '<td>' + EnDe.Check.UPC.get(src)  + '</td><td>' + EnDe.Check.UPC.is(src)  + '</td><td>' + EnDe.Check.UPC.valid(src)  + '</td></tr>';
	bux += '<tr><th>EAN</th>';
	bux += '<td>' + EnDe.Check.EAN.get(src)  + '</td><td>' + EnDe.Check.EAN.is(src)  + '</td><td>' + EnDe.Check.EAN.valid(src)  + '</td></tr>';
	bux += '<tr><th>GLN</th>';
	bux += '<td>' + EnDe.Check.GLN.get(src)  + '</td><td>' + EnDe.Check.GLN.is(src)  + '</td><td>' + EnDe.Check.GLN.valid(src)  + '</td></tr>';
	bux += '<tr><th>Verhoeff</th>';
	bux += '<td>' + EnDe.Check.D5.get(src)   + '</td><td>' + EnDe.Check.D5.is(src)   + '</td><td>' + EnDe.Check.D5.valid(src)   + '</td></tr>';
	bux += '<tr><th>GLN, ILN</th><td colspan="3">' + EnDe.Check.EAN.code(src) + '</td></tr>';
	bux += '<tr><th>EAN, IAN</th><td colspan="3">' + EnDe.Check.GLN.code(src) + '</td></tr>';
	bux += '<tr><th>IIN</th><td colspan="3">' + EnDe.Check.CC.get(src) + '</td></tr>';
	bux += '<tr><th>SSN</th><td colspan="3">' + EnDe.Check.SSN.is(src) + '</td></tr>';
	bux += '</table>';
	return(bux);
  }; // guess

}; // .Check

this.DAT    = new function() {
  this.sid  = function() { return(EnDe.User.sid() + '.DAT'); };

  this.isGZ     = function(src) {
  //#? check if data is gzip compressed data
	return (src.substr(0,12).match(/^\x1f\x8b\x08.....\x02\x03\xec/)===null) ? false : true;
  }; // isGZ

  this.isSWF    = function(src) {
  //#? check if data is Adobe SWF file
	return (src.substr(0,12).match(/^[FC]WS[\x04-\x09]/)===null) ? false : true;
  }; // isSWF

  this.isZIP    = function(src) {
  //#? check if data is ZIP archive
	return (src.substr(0,12).match(/^PK\x03\x04[\x09-\x14]/)===null) ? false : true;
  }; // isZIP

  this.guess    = function(src) {
  //#? try to identify data format
	if (this.isGZ( src)===true) { return 'gz';  }
	if (this.isSWF(src)===true) { return 'swf'; }
	if (this.isZIP(src)===true) { return 'zip'; }
	return '';
  }; // guess

  this.type     = function(src) {
  //#? return human readable string for data format
	switch(src) {
	  case 'gz':  return 'gzip compressed data'; break;
	  case 'swf': return 'Adobe SWF (flash) file'; break;
	  case 'zip': return 'ZIP archive'; break;
	}
	return '';
  }; // guess

}; // .DAT

this.IMG    = new function() {
  this.sid  = function() { return(EnDe.User.sid() + '.IMG'); };

  this.isBMP    = function(src) {
  //#? check if data is image in BMP format (lazy check only!)
	return (src.substr(0,12).match(/^BM..\x00\x00\x00\x00/)===null) ? false : true;
  }; // isBMP

  this.isTXT    = function(src) {
  //#? check if data is image in BMP format as C data structure
	return (src.substr(0,99).match(/#define\s+.*table_/)===null) ? false : true;
  }; // isTXT

  this.isPNG    = function(src) {
  //#? check if data is image in PNG format (lazy check only!)
	return (src.substr(0,12).match(/^.PNG[\r\n]/)===null) ? false : true;
	// we use a lazy check, following more strict
	//return (src.substr(0,12).match(/^\x89PNG\r\n/)===null) ? false : true;
  }; // isPNG

  this.isGIF    = function(src) {
  //#? check if data is image in GIF format (lazy check only!)
	return (src.substr(0,12).match(/^GIF89a/)===null) ? false : true;
  }; // isGIF

  this.isJPG    = function(src) {
  //#? check if data is image in JPG format (lazy check only!)
	return (src.substr(0,12).match(/^.....\x10JFIF/)===null) ? false : true;
  }; // isJPG

  this.isSVG    = function(src) {
  //#? check if data is image in SVG format (lazy check only!)
	return (src.substr(0,12).match(/DOCTYPE\s+svg/i)===null) ? false : true;
  }; // isSVG

  this.isXPM    = function(src) {
  //#? check if data is image in XPM format (lazy check only!)
// /* XPM */
// static char * ssh_xpm[] = 
	return false;
  }; // isXPM

  this.guess    = function(src) {
  //#? try to identify image format
	if (this.isGIF(src)===true) { return 'gif'; }
	if (this.isJPG(src)===true) { return 'jpg'; }
	if (this.isPNG(src)===true) { return 'png'; }
	if (this.isBMP(src)===true) { return 'bmp'; }
	if (this.isSVG(src)===true) { return 'svg'; }
	if (this.isTXT(src)===true) { return 'txt'; }
	if (this.isXPM(src)===true) { return 'xpm'; }
	return '';
  }; // guess

  this.getMIME  = function(src) {
  //#? get MIME type prefix for image data (returns data:image/x-icon for unknown format)
	var bux = 'data:image/';
	switch (src.toLowerCase()) {
	  case 'bmp': bux += 'bmp'; break;
	  case 'txt': bux += 'bmp'; break;
	  case 'gif': bux += 'gif'; break;
	  case 'jpg': bux += 'jpg'; break;
	  case 'png': bux += 'png'; break;
	  case 'svg': bux += 'svg'; break;
	  default   : bux += 'x-icon'; break;
	}
	return bux + ',';
  }; // isMIME

  this.getMIME64= function(src) {
  //#? get MIME type prefix for base64 encoded image data
	return this.getMIME(src).replace(/,$/, ';base64,');
  }; // isMIME64

}; // .IMG
  
this.init      = function() {
//#? initialize user data
}; // init

}; // EnDe.User
