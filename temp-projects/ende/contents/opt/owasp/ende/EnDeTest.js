/* ========================================================================= //
// vi:  ts=4: encoding=utf-8
// vim: ts=4: encoding=utf-8
#?
#? NAME
#?      EnDeTest.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDe.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeTest.js" charset="utf-8"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeMaps.js"></SCRIPT>
#?
#?      Note that it should be used with  language="JavaScript1.5"  because
#?      try{..}catch(){..}  is used herein.
#?
#? DESCRIPTION
#?      Perform tests for encoding, decoding and converting functions.
#?      Provided object:
#?           EnDe.Test
#?      Provided object methods:
#?           EnDe.Test.sid()   - return version string
#?           EnDe.Test.test()  - return array with test results
#?           EnDe.Test.b64_test()   - performance tests for EnDe.B64.EN.b64()
#?
#? SEE ALSO
#?      EnDe.js
#?      EnDeGUI.js
#?      EnDeTest-Sample.txt
#?
# HACKER's INFO
#		This file conatins UTF-8 characters!
#
#       The syntax of the test data is described in EnDeTest-Sample.txt.
#       The objects and functions herein should be part of EnDe.js  but are
#       separated into its own file to keep  EnDe.js  as small as possible.
#       All functions return an object or an array of objects.  They do not
#       change any data.
#
#       The test simply calls the encoding function, then the corresponding
#       decoding function with the result from the encoding function.
#       Finally the result of the encoding is compared with the expected
#       result and the the result of the decoding with the original string.
#?
#?
#? VERSION
#?      @(#) EnDeTest.js 3.7 12/06/09 18:28:35
#?
#? AUTHOR
#?      22-jun-07 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

// ========================================================================= //
// Object with data and methods for testing Encoding, Decoding functions     //
// ========================================================================= //

if (typeof(EnDe)==='undefined') { EnDe = new function() {}; }

EnDe.Test   = new function() {
	this.SID    = '3.7';
	this.sid    = function() { return '@(#) EnDeTest.js 3.7 12/06/09 18:28:35 EnDe.Test'; },

	// ===================================================================== //
	// global variables                                                      //
	// ===================================================================== //

	this.text   = 'EnDe: Tu was du willst!';// not yet used
	this.mite	= 'Ückück';                 // not yet used
	this.cipher = 'Mondenkind';             // not yet used
	this.maxloop= 999;

	this.reverseMap = {
	/* Results of some functions cannot be reverted simply, we need to use
	 * the corresponding function to get the correct result.
	 * This table contains the corresponding decoding() functions.
	 * If the value is empty string, then no decoding() function exists.
	 */
	'lc':          'uc',
	'uc':          'lc',
//	'JSlc':        'JSuc',      // don't use, otherwise reverse test fails
	'JSuc':        'JSlc',
//	'JS2char':     'JS2code',   // fails 'cause encoding fails first
	'JS2code':     'JS2char',
	'b64tou64':    'u64tob64',
	'u64tob64':    'b64tou64',
//	'urlHEX':      'urlCHR',
	'urlUTF8c':    '',
//	'ucsHALFw':    'ucsHALFw',  // if we feed half-width characters
//	'ucsHALFw':    'ucsFULLw',  // if we feed full-width characters
	'ucsFULLw':    'ucsHALFw',  // if we feed half-width characters
	'ucsUTF7_':    'ucsUTF7',
	'splitArg':    'joinArg',
	'splitKey':    'joinKey',
	'splitDel':    'joinDel',
	'joinArg':     'splitArg',
	'joinKey':     'splitKey',
	'joinDel':     'splitDel'
	};

	// ===================================================================== //
	// debug functions                                                       //
	// ===================================================================== //

	this.trace    = 1;  // enabled by default
	this.dbx      = function(src,nl) {
	//#? wrapper for EnDeGUI.dpr()
		if(this.trace<=0) { return false; }
		if(EnDeGUI.dpr===undefined) {
/*
 *** implement your code for debugging used in lib without GUI here ***
 */
			return false;
		}
		return EnDeGUI.dpr(src,nl);
	}; // dbx


	// ===================================================================== //
	// testing functions                                                     //
	// ===================================================================== //

	this.b64_test = function(src) {
	//#? performance tests for EnDe.B64.EN.b64()
		var b = '';
		// var t1 = new Date();            // #dbx performance tests
		// var t3 = new Date();            // #dbx performance tests
		// this.dbx('\n'+t3+'\n  '+len);   // #dbx performance tests
		EnDe.CONST.CST.blocksize  = 120;//  < 25k
		b += EnDe.B64.EN.b64('','','',src,_n5_,_n6_,linewrap) + '\n';
		EnDe.CONST.CST.blocksize  = 250;
		b += EnDe.B64.EN.b64('','','',src,_n5_,_n6_,linewrap) + '\n';
		EnDe.CONST.CST.blocksize  = 500;
	  	b += EnDe.B64.EN.b64('','','',src,_n5_,_n6_,linewrap) + '\n';
		EnDe.CONST.CST.blocksize  = 1010;
		b += EnDe.B64.EN.b64('','','',src,_n5_,_n6_,linewrap) + '\n';
		EnDe.CONST.CST.blocksize  = 2020;
		b += EnDe.B64.EN.b64('','','',src,_n5_,_n6_,linewrap) + '\n';
		return b;
	}; // b64_test

	this.test   = function(src) {
	//#? run test for data given in src; returns array with results
// ToDo: need to describe format of returned array
		_dpr('EnDe.Test.test(\n'+src+'\n)\n');

		function _txt(src) {
		// #? check if plain text, convert \uHHHH and \xHH to text; return raw text enclosed in ' or "
			var bux = src;
			if (src[0]===src[src.length-1]) {
				if ((src[0]==='"') || (src[0]==="'")) {
					return src.substr(1,src.length-2);
				}
			}
			bux = src.replace(/\\u([a-f0-9]{4})/ig,function(c,d){return String.fromCharCode(parseInt(d,16))});
			bux = bux.replace(/\\x([a-f0-9]{2})/ig,function(c,d){return String.fromCharCode(parseInt(d,16))});
			return bux;
		};

		var bux = new Array();
		var uppercase = false;
		var delimiter = ',';
		var prefix  = '';
		var suffix  = '';
		var cipher  = '';
		var isHex   = false;
		var size    = 2;
		var i       = 0;
		var r       = null;
		var max     = this.maxloop;
		var skip    = true;
		var mode    = 'en-/decode';
		var func    = '';
		var title   = '';
		var expect  = '';
		var except  = '';
		var fileerr = '';
		var tmp     = '';
		var txt     = '';
		var err     = null;
		var enc     = '';
		var dec     = '';
		var key     = '';
		var val     = '';
		var line    = '';
		var oldmode = '';
		var oldtitle= '';
		var oldtxt  = '';
		var data    = src.split(/\n/);
		while((line=data.shift())!==undefined) {
			i++;
			if (i>max) { fileerr += '**ERROR: too much data: ' + i + ' lines; aborted'; break; }
			if (line.search(/^__DATA/)>=0) { skip = false; continue; } // start of data
			if (skip===true)               { continue; }//
			if (line.search(/^\s*$/)>=0)   { continue; }// skip empty lines
			if (line.search(/^\s*#/)>=0)   { continue; }// skip comment lines
			if (line.search(/^__END/)>=0)  { break; }   // end of data
			// don't split on tab like:
			// kkk = line.replace(/\t\t*/, '\t').split(/\t/);
			// as this would destroy tabs in the value part (right column)
			// instead we extract key left to first tab, and value anything 
			// right to all continous left tabs following key
			key = line.replace(/^([^\t]+)\t+.*$/,"$1");
			val = line.replace(/^[^\t]+\t+(.*)$/,"$1");
			if (val===line) {
				fileerr += '**ERROR: unknown syntax in line ' + i + ': ' + line;
				continue;
			}
			switch (key) {   // keyword or alias
			  case '_data':      txt       = _txt(val); continue; break;
			  case '_title':     title     =      val;  continue; break;
			  case '_mode':      mode      =      val;  continue; break;
			  case '_size':      size      =      val;  continue; break;
			  case '_salt':                /* same as _cipher; no break; */
			  case '_cipher':    cipher    = _txt(val); continue; break;
			  case '_prefix':    prefix    = _txt(val); continue; break;
			  case '_suffix':    suffix    = _txt(val); continue; break;
			  case '_delimiter': delimiter = _txt(val); continue; break;
			  case '_uppercase': uppercase = (val==='true')?true:false; continue; break;
			  default:           expect    = _txt(val); func = key; break;
			}
			// got a function
			if ((txt!==oldtxt) || (title!==oldtitle) || (mode!==oldmode)) { // new _data line
				oldtxt  = txt;
				oldtitle= title;
				oldmode = mode;
				bux.push(new Array('_data',title,mode,txt,null));
			}
			// reset results
			enc = '';
			dec = '';
			err = null;
			try { // run test
				if ((mode==='encode') || (mode==='en-/decode')) {
					enc = EnDe.EN.dispatch(func,'strict',uppercase,txt,prefix,suffix,delimiter);
					if (enc!==expect) { // failed, no more tests possible
						bux.push(new Array(func,expect,enc,((mode==='en-/decode')?'-undef-':null),err));
						continue;
					}
					if (mode!=='en-/decode') {
						if (enc===expect) {
							bux.push(new Array(func,null,null,'-undef-',err));
						}
						continue;
					}
					tmp = txt;
				} else {
					enc = txt;        // in mode=decode no enc set yet
					txt = expect;
				}
				if ((mode==='decode') || (mode==='en-/decode')) {
					r = func;
					if (this.reverseMap[func]!==undefined) {
						r = this.reverseMap[func];
						if (r==='') { // no proper decoding available, ready
							bux.push(new Array(func,null,null,null,err));
							continue;
						}
					}
					if (r!=='') {
						dec = EnDe.DE.dispatch(r,'strict',false,enc,prefix,suffix,delimiter);
					}
					if (dec!==txt) { // failed, no more tests possible
//#dbx# alert ('de:\n'+dec+'\n'+expect+'\n'+txt);
						bux.push(new Array(func,expect,null,dec,err));
						continue;
					}
					bux.push(new Array(func,null,null,null,err));
				}
			} catch(e) {
				bux.push(new Array(func,expect,enc,dec,e));
			}
		} // while line
		if (fileerr!=='') {
			bux.push(new Array('_error','errors found in ' + src + ':\n' + fileerr,null,null,null));
		}
		_dpr('EnDe.Test.test {\n'+bux.join('\n}\n'));
		return bux;
	}; // text

}; // EnDe.Test
