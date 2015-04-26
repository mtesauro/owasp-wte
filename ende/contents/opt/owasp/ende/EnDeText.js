/* ========================================================================= //
# vi:  set ts=4:
# vim: set ts=4:
#?
#? NAME
#?      EnDeText.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDe.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeText.js"></SCRIPT>
#?
#? DESCRIPTION
#?      This file contains functiosn/methods used general text manipulations.
#?      It defines the  EnDe.Text  object with following functions:
#?          dprinit()       - initilize tracing
#?          dispatch()      - manipulate text accoding given mode
#?          modes are:
#?              txtNULL     : set text tu NULL
#?              txtClear    : clear text (empty string)
#?              txtUC       : uppercase: convert [a-z] to [A-Z]
#?              txtLC       : lowercase: convert [A-Z] to [a-z]
#?              txtAPP00    : add  \0  at end of text
#?              txtAPPnl    : add  \n  at end of text
#?              txtAPPcr    : add  \r  at end of text
#?              txtAPPht    : add  \t  at end of text
#?              txtAPPvt    : add  \v  at end of text
#?              txtAPPsp    : add  space at end of text
#?              txtDEL00    : delete  \0  anywhere in text
#?              txtDELnl    : delete  \n  anywhere in text
#?              txtDELcr    : delete  \r  anywhere in text
#?              txtDELht    : delete  \t  anywhere in text
#?              txtDELvt    : delete  \v  anywhere in text
#?              txtDELsp    : delete  space  anywhere in text
#?              txtDELnon7b : delete all non-printable chars anywhere in text
#?              txtDELnon7bn: delete non-printable chars (except \t \n) anywhere in text
#?              txtDELnon128: delete characters outside range [1..127] anywhere in text
#?              txtDELnon256: delete characters outside range [1..255] anywhere in text
#?              txtDELalnum : delete all non-alhpanumeric characters
#?              txtDELwhite : delete all white space characters (space,\t, \r, \n) anywhere
# ?             txtDELascii : delete all non-printable characters
#?              txtDELsgml  : delete all < > </ /> <!
#?              txtDELmixed : delete \t \r \n + " and space  anywhere in text
#?              txtDELfffx  : delete all characters in range [fff0..ffff] anywhere in text
#?              txtINS00    : insert  \0  at given position in text
#?              txtINSnl    : insert  \n  at given position in text
#?              txtINScr    : insert  \r  at given position in text
#?              txtINSht    : insert  \t  at given position in text
#?              txtINSvt    : insert  \v  at given position in text
#?              txtINSUCS*  : insert  special Unicode sequencet at given position in text
#?              txtREPplus  : replace + by space anywhere in text
#?              txtREPspace : replace space by + anywhere in text
#?              txtREPdouble: replace (duplicate) \ by \\ anywhere in text
#?              txtREPreduce: replace (redeuce) \\ by \ anywhere in text
#?              txtREPalnum : replace all non-alhpanumeric characters by spaces
#?              txtREPurl   : replace all non-printable chars by their %hex value
#?              txtREPascii : replace all non-printable chars by their %hex value
#?              txtREPsgml  : replace all < > </ /> <! by a single space
#?              txtREPsqdq  : replace all ' by "
#?              txtREPsqdq  : replace all " by '
#?              txtREPsqbt  : replace all ' by `
#?              txtREPqqqq  : replace ' by " and " by ' anywhere in text, honor \-escaped quotes
#?              txtREPstrdq : concatenate strings (remove " + ")
#?              txtREPascii : replace all non-printable 7-bit ASCII with hex value
#?              txtREP4ucs  : replace all \uhhhh by corresponding character
#?              txtREP4hex  : replace all \xhh by corresponding character
#?              txtREP4url  : replace all %hh or %hh%hh by corresponding character
#?              txtREPstrsq : concatenate strings (remove ' + ')
#?              txtPAD10    : pad leading 0 if number < 10
#?              txtPAD100   : pad leading 0 if number < 100
#?              txtTrimL    : remove leading spaces
#?              txtTrimR    : remove trailing spaces
#?              txtTrim     : remove leading and trailing spaces
#?              txtXesc     : convert hex values to \x-escaped values
#?              txtEntity   : simple replacement of Entities: " < > &
#?              txtEntity0  : simple replacement of Entities:   < > &
#?              txturl2     : convert %hx to %%hxhx
#?              txturl4     : convert %h23x to %%h23xh23x
#?              txtncrNAME  : convert &name; to &&name;name;
#?              txtncrNUMBER: convert &#dd; to &&#dd;#dd; (works fo decimal and hex)
#?
# HACKER's INFO
#       -----------------------------------------------------------------------
#?
#? VERSION
#?      @(#) EnDeText.js 3.15 12/06/02 22:05:07
#?
#? AUTHOR
#?      08-sep-08 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

// ========================================================================= //
// EnDe.Text object methods                                                  //
// ========================================================================= //

if (typeof(EnDe)==='undefined') { EnDe = new function() {}; }

EnDe.Text   = new function() {
	this.SID    = '3.15';
	this.sid    = function() { return('@(#) EnDeText.js 3.15 12/06/02 22:05:07 EnDe.Text'); };

	this.trace  = false;

	// ===================================================================== //
	// internal/private functions                                            //
	// ===================================================================== //

	function __dbx(t,n) { if (EnDe.Text.trace===true) { EnDeGUI.dpr(t,n); } };

	// ===================================================================== //
	// public functions                                                      //
	// ===================================================================== //

// ToDo: support international (Unicode) characters
	this.uc     = function(src) {
	//#? convert [a-z] to [A-Z]
		return src.replace(/[a-z]/g, function(c){return String.fromCharCode(c.charCodeAt()-32); });
	}; // uc

	this.lc     = function(src) {
	//#? convert [A-Z] to [a-z]
		return src.replace(/[A-Z]/g, function(c){return String.fromCharCode(c.charCodeAt()+32); });
	}; // uc

	this.rec    = function(type,src) {
	//#? embed some special codings inside themself
	//#type? url2: convert %hx to %%hxhx
	//#type? url4: convert %h23x to %%h23xh23x
	//#type? ncrNAME:    convert &name; to &&name;name;
	//#type? ncrNUMBER:  convert &#dd; to &&#dd;#dd;
		__dbx('EnDe.Text.rec(' + type + ', ...)');
		switch (type) {
		// JavaScript's RegEx are picky, hence we need a group for %, otherwise it would not match
		  case 'url2':      return src.replace(/(%)([0-9a-fA-F]{2})/g,  function(b,c,d){return c + c + d + d; }); break;
		  case 'url4':      return src.replace(/(%)(u?[0-9a-fA-F]{4})/g,function(b,c,d){return c + c + d + d; }); break;
		  case 'ncrNAME':   return src.replace(/(&)([0-9a-zA-Z]+);/g,   function(b,c,d){return c + c + d + ';' + d + ';'; }); break;
		  case 'ncrNUMBER': return src.replace(/(&)(#x?[0-9a-fA-F]+);/g,function(b,c,d){return c + c + d + ';' + d + ';'; }); break;
		}
		return src; // fallback; should never occour
	}; // uc

	// ===================================================================== //
	// dispatch method                                                       //
	// ===================================================================== //

	this.dispatch = function(src,item,pos) {
	//#? wrapper for various text manipulations
		/* src   : text to be modified
		 * item  : mode of modification
		 * pos   : position where modification takes place (default: 0)
		 */
		__dbx('EnDe.Text.dispatch(`' + src + "', " + item + ', ' + pos + ')');
		if (src===null) { return ''; }
		var bux = src;
		var bbb = '';
		var ccc = '';
		var kkk = null;
		var i   = 0;
		/* NOTE: we use \x00 instead of \0 to avoid error in some browsers like:
		 *    Warnung: non-octal digit in an escape sequence that doesn't match a back-reference
		 */
		switch (item) {
		  case 'txtNULL'    : bux = null;                           break;
		  case 'txtUC'      : bux = this.uc( src);                  break;
		  case 'txtLC'      : bux = this.lc( src);                  break;
		  case 'txtRECurl2' : bux = this.rec('url2', src);          break;
		  case 'txtRECurl4' : bux = this.rec('url4', src);          break;
		  case 'txtRECncrNAME':bux= this.rec('ncrNAME', src);       break;
		  case 'txtRECncrNUMBER': bux = this.rec('ncrNUMBER', src); break;
		  case 'txtClear'   : bux = '';                             break;
		  case 'txtAPP00'   : bux += '\0';                          break;
		  case 'txtAPPnl'   : bux += '\n';                          break;
		  case 'txtAPPcr'   : bux += '\r';                          break;
		  case 'txtAPPht'   : bux += '\t';                          break;
		  case 'txtAPPvt'   : bux += '\v';                          break;
		  case 'txtAPPsp'   : bux += ' ';                           break;
		  case 'txtDEL00'   : bux = bux.replace(/\x00/g, '');       break;
		  case 'txtDELnl'   : bux = bux.replace(/\n/g,   '');       break;
		  case 'txtDELcr'   : bux = bux.replace(/\r/g,   '');       break;
		  case 'txtDELht'   : bux = bux.replace(/\t/g,   '');       break;
		  case 'txtDELvt'   : bux = bux.replace(/\v/g,   '');       break;
		  case 'txtDELsp'   : bux = bux.replace(/ /g,    '');       break;
		  case 'txtDELnon7bn':bux = bux.replace(/[^\x09\x0a\x0d\x20-\x7e]/g, ''); break;
		  case 'txtDELnon7b': bux = bux.replace(/[^\x20-\x7e]/g,     '');       break;
		  case 'txtDELnon128':bux = bux.replace(/[^\x01-\x7f]/g,     '');       break;
		  case 'txtDELnon256':bux = bux.replace(/[^\x01-\xff]/g,     '');       break;
		  case 'txtDELascii': bux = bux.replace(/[^\S]/g,            '');       break; // ToDo: ??
		  case 'txtDELalnum': bux = bux.replace(/[^\w0-9]/g,         '');       break;
		  case 'txtDELwhite': bux = bux.replace(/[\t \r\n]/g,        '');       break;
		  case 'txtDELsgml' : bux = bux.replace(/(<(\/!)?)|(\/?>)/g, '');       break;
		  case 'txtDELmixed': bux = bux.replace(/[\t \r\n\+"\']/g,   '');       break;
		  case 'txtDELfffx' : bux = bux.replace(/[\ufff0-\uffff]/g,  '');       break;
		  case 'txtINS00'   : bux = bux.slice(0,pos) + '\0' + bux.slice(pos);   break;
		  case 'txtINSnl'   : bux = bux.slice(0,pos) + '\n' + bux.slice(pos);   break;
		  case 'txtINScr'   : bux = bux.slice(0,pos) + '\r' + bux.slice(pos);   break;
		  case 'txtINSht'   : bux = bux.slice(0,pos) + '\t' + bux.slice(pos);   break;
		  case 'txtINSvt'   : bux = bux.slice(0,pos) + '\v' + bux.slice(pos);   break;
		  case 'txtREPplus' : bux = bux.replace(/\+/g,            ' '   );      break;
		  case 'txtREPspace': bux = bux.replace(/ /g,             '+'   );      break;
		  case 'txtREPdouble':bux = bux.replace(/\\/g,            '\\\\');      break;
		  case 'txtREPreduce':bux = bux.replace(/\\\\/g,          '\\'  );      break;
		  case 'txtREPascii': bux = bux.replace(/([^\x20-\x7e])/g, function(c){return EnDe.dez2hex('url4',0,false,c.charCodeAt(),'','');}); break;
		  case 'txtREP2url' : bux = bux.replace(/([^\x20-\x7e])/g, function(c){return EnDe.dez2hex('url2',0,false,c.charCodeAt(),'','');}); break;
		  case 'txtREP2hex' : bux = bux.replace(/([^\x20-\x7e])/g, function(c){return EnDe.EN.hex( 'null',0,false,c,'\\x','','');});        break;
		  case 'txtREP2ucs' : bux = bux.replace(/([^\x20-\x7e])/g, function(c){return EnDe.EN.ucs( 'ucs4',0,false,c,'','','');});           break;
// ToDo: following not yet working proper
		// ToDo: fails for \xHHHH
		  case 'txtREP4hex' : bux = bux.replace(/(\\x[0-9a-f][0-9a-f])/ig, function(c){return EnDe.DE.num('hex', 0,c,'\\x','','');});       break;
		  case 'txtREP4ucs' : bux = bux.replace(/(\\u[0-9a-f]{4})/ig,      function(c){return EnDe.DE.url('null',0,c,'','','');});          break;
		  case 'txtREP4url' : bux = bux.replace(/(%[0-9a-f][0-9a-f])/ig,   function(c){return EnDe.DE.ucs('url2',0,c,'','','');});          break;
// ToDo: above
		  case 'txtREPsgml' : bux = bux.replace(/(<(\/!)?)|(\/?>)/g, ' ');      break;
		  case 'txtREPalnum': bux = bux.replace(/([^\w0-9])/g,    ' '   );      break;
		  case 'txtREP00'   : bux = bux.replace(/\x00/g,          '\\0' );      break;
		  case 'txtREPnl'   : bux = bux.replace(/\n/g,            '\\n' );      break;
		  case 'txtREPcr'   : bux = bux.replace(/\r/g,            '\\r' );      break;
		  case 'txtREPht'   : bux = bux.replace(/\t/g,            '\\t' );      break;
		  case 'txtREPvt'   : bux = bux.replace(/\v/g,            '\\v' );      break;
		  case 'txtREPstrdq': bux = bux.replace(/"\s*\+\s*"/g,    ''    );      break;
		  case 'txtREPstrsq': bux = bux.replace(/'\s*\+\s*'/g,    ''    );      break;
		  case 'txtREPdqsq' : bux = bux.replace(/"/g,             "'"   );      break;
		  case 'txtREPsqdq' : bux = bux.replace(/'/g,             '"'   );      break;
		  case 'txtREPsqbt' : bux = bux.replace(/'/g,             '`'   );      break;
		  case 'txtPAD10'   : if (bux<10) { bux = '0' + bux; };                 break;
		  case 'txtPAD100'  : bux = EnDe.Text.dispatch(bux, 'txtPAD10'); if (bux<100) { bux = '0' + bux; };   break;
		  case 'txtEntity'  : bux = bux.replace(/&/g, '&#38;').replace(/</g, '&#60;').replace(/>/g, '&#62;').replace(/"/g, '&#34;'); break;
		  case 'txtEntity0' : bux = bux.replace(/&/g, '&#38;').replace(/</g, '&#60;').replace(/>/g, '&#62;'); break;
		  case 'txtTrimR'   : bux = bux.replace(/ *$/g, '');                    break;
		  case 'txtTrimL'   : bux = bux.replace(/^ */g,  '');                   break;
		  case 'txtTrim'    : bux = EnDe.Text.dispatch(EnDe.Text.dispatch(bux,'txtTrimL'),'txtTrimR');  break;
		  case 'txtXesc'    :
			bux = bux.replace(/( *\|.*)/g, '').replace(/^ */, ' ').replace(/  /g, ' ').replace(/ /g,'\\x');
			/*        \______________________/ \_________________/ \_________________/ \_________________/
			 *         remove trailing |.*      ensure just one      squeeze all        replace remaining
			 *                                  leading space        duplicate spaces   spaces with \x
			 */
			break;
		  case 'txtREPqqqq':
			bbb = '';
			i   = 0;
			while (i<bux.length) { // slow but safe
				ccc = bux.charAt(i);
				i++;
				if (ccc == '\\') { // ignore escaped quotes
					bbb += ccc;
					bbb += bux.charAt(i);
					i++;
					continue;
				}
				switch(ccc) {
				  case '"': bbb += "'"; break;
				  case "'": bbb += '"'; break;
				  default:  bbb += ccc; break;
				 }
			}
			bux = bbb;
			break;
		  case 'txtINS4sp':
			bbb = bux.split('').reverse().join('');
			bbb = bbb.replace(/(....)/g, '$1 ');
			bux = bbb.split('').reverse().join('');
			break;
		  case 'txtINS8sp':
			bbb = bux.split('').reverse().join('');
			bbb = bbb.replace(/(........)/g, '$1 ');
			bux = bbb.split('').reverse().join('');
			break;
		  case 'dezEXP':
			// ToDo: ersetze  42-48 durch 42,43,44,45,46,47,48
			break;
		  case 'dezFOLD':
			// ToDo: ersetze  42,43,44,45,46,47,48 durch 42-48
			break;
		  default:
			if (item.match(/^txtINSUCS.*/)!==null) {
				/*
				 * data to be inserted is part of item, 'cause .dispatch() has
				 * no parameter for data to be inserted, hence we get it as part
				 * of the item, something like:   txtINSUCSdead beaf
				 */
				kkk = item.replace(/^txtINSUCS/,'').split(/ /);  // split: dead beaf
				ccc = '';
				for (bbb=0; bbb<kkk.length; bbb++) { ccc += String.fromCharCode(parseInt(kkk[bbb],16)); }
				bux = bux.slice(0,pos) + ccc + bux.slice(pos);
			}
			break;
		} // switch(item)
		bbb = null; ccc = null;
		return bux;
	}; // dispatch

	// ===================================================================== //
	// procedural interface                                                  //
	// ===================================================================== //

	//this.NULL       = function(src) { return EnDe.Text.dispatch(src, 'txtNULL'     ); };
	this.Clear      = function(src) { return EnDe.Text.dispatch(src, 'txtClear'    ); };
	this.UC         = function(src) { return EnDe.Text.dispatch(src, 'txtUC'       ); };
	this.LC         = function(src) { return EnDe.Text.dispatch(src, 'txtLC'       ); };
	this.APP00      = function(src) { return EnDe.Text.dispatch(src, 'txtAPP00'    ); };
	this.APPnl      = function(src) { return EnDe.Text.dispatch(src, 'txtAPPnl'    ); };
	this.APPcr      = function(src) { return EnDe.Text.dispatch(src, 'txtAPPcr'    ); };
	this.APPht      = function(src) { return EnDe.Text.dispatch(src, 'txtAPPht'    ); };
	this.APPvt      = function(src) { return EnDe.Text.dispatch(src, 'txtAPPvt'    ); };
	this.APPsp      = function(src) { return EnDe.Text.dispatch(src, 'txtAPPsp'    ); };
	this.DEL00      = function(src) { return EnDe.Text.dispatch(src, 'txtDEL00'    ); };
	this.DELnl      = function(src) { return EnDe.Text.dispatch(src, 'txtDELnl'    ); };
	this.DELcr      = function(src) { return EnDe.Text.dispatch(src, 'txtDELcr'    ); };
	this.DELht      = function(src) { return EnDe.Text.dispatch(src, 'txtDELht'    ); };
	this.DELvt      = function(src) { return EnDe.Text.dispatch(src, 'txtDELvt'    ); };
	this.DELsp      = function(src) { return EnDe.Text.dispatch(src, 'txtDELsp'    ); };
	this.DELnon7b   = function(src) { return EnDe.Text.dispatch(src, 'txtDELnon7b' ); };
	this.DELnon7bn  = function(src) { return EnDe.Text.dispatch(src, 'txtDELnon7bn'); };
	this.DELnon128  = function(src) { return EnDe.Text.dispatch(src, 'txtDELnon128'); };
	this.DELnon256  = function(src) { return EnDe.Text.dispatch(src, 'txtDELnon256'); };
	this.DELascii   = function(src) { return EnDe.Text.dispatch(src, 'txtDELascii' ); };
	this.DELalnum   = function(src) { return EnDe.Text.dispatch(src, 'txtDELalnum' ); };
	this.DELwhite   = function(src) { return EnDe.Text.dispatch(src, 'txtDELwhite' ); };
	this.DELsgml    = function(src) { return EnDe.Text.dispatch(src, 'txtDELsgml'  ); };
	this.DELmixed   = function(src) { return EnDe.Text.dispatch(src, 'txtDELmixed' ); };
	this.DELfffx    = function(src) { return EnDe.Text.dispatch(src, 'txtDELfffx'  ); };
	this.REPplus    = function(src) { return EnDe.Text.dispatch(src, 'txtREPplus'  ); };
	this.REPspace   = function(src) { return EnDe.Text.dispatch(src, 'txtREPspace' ); };
	this.REPdouble  = function(src) { return EnDe.Text.dispatch(src,' txtREPdouble'); };
	this.REPreduce  = function(src) { return EnDe.Text.dispatch(src,' txtREPreduce'); };
	this.REPascii   = function(src) { return EnDe.Text.dispatch(src, 'txtREPascii' ); };
	this.REPsgml    = function(src) { return EnDe.Text.dispatch(src, 'txtREPsgml'  ); };
	this.REPalnum   = function(src) { return EnDe.Text.dispatch(src, 'txtREPalnum' ); };
	this.PAD10      = function(src) { return EnDe.Text.dispatch(src, 'txtPAD10'    ); };
	this.PAD100     = function(src) { return EnDe.Text.dispatch(src, 'txtPAD100'   ); };
	this.TrimR      = function(src) { return EnDe.Text.dispatch(src, 'txtTrimR'    ); };
	this.TrimL      = function(src) { return EnDe.Text.dispatch(src, 'txtTrimL'    ); };
	this.Trim       = function(src) { return EnDe.Text.dispatch(src, 'txtTrim'     ); };
	this.TrimRL     = function(src) { return EnDe.Text.dispatch(src, 'txtTrim'     ); };
	this.TrimLR     = function(src) { return EnDe.Text.dispatch(src, 'txtTrim'     ); };
	this.Xesc       = function(src) { return EnDe.Text.dispatch(src, 'txtXesc'     ); };
	this.Entity     = function(src) { return EnDe.Text.dispatch(src, 'txtEntity'   ); };
	this.Entity0    = function(src) { return EnDe.Text.dispatch(src, 'txtEntity0'  ); };
	this.REPqqqq    = function(src) { return EnDe.Text.dispatch(src, 'txtREPqqqq'  ); };
	this.REPsqdq    = function(src) { return EnDe.Text.dispatch(src, 'txtREPsqdq'  ); };
	this.REPdqsq    = function(src) { return EnDe.Text.dispatch(src, 'txtREPdqsq'  ); };
	this.REPsqbt    = function(src) { return EnDe.Text.dispatch(src, 'txtREPsqbt'  ); };
	this.REPstrsq   = function(src) { return EnDe.Text.dispatch(src, 'txtREPstrsq' ); };
	this.REPstrdq   = function(src) { return EnDe.Text.dispatch(src, 'txtREPstrdq' ); };
	this.INS00      = function(s,p) { return EnDe.Text.dispatch(s,   'txtINS00',  p); };
	this.INSnl      = function(s,p) { return EnDe.Text.dispatch(s,   'txtINSnl',  p); };
	this.INScr      = function(s,p) { return EnDe.Text.dispatch(s,   'txtINScr',  p); };
	this.INSht      = function(s,p) { return EnDe.Text.dispatch(s,   'txtINSht',  p); };
	this.INSvt      = function(s,p) { return EnDe.Text.dispatch(s,   'txtINSvt',  p); };
	this.INS4sp     = function(s,p) { return EnDe.Text.dispatch(s,   'txtINS4sp', p); };
	this.INS8sp     = function(s,p) { return EnDe.Text.dispatch(s,   'txtINS8sp', p); };

}; // EnDe.Text

