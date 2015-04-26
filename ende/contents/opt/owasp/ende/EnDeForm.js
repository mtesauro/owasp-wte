/* ========================================================================= //
# vi:  set ts=4:
# vim: set ts=4:
#?
#? NAME
#?      EnDeForm.js - formating JavaScript code and JSON data
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" charset="utf-8" src="JsColorizer.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" charset="utf-8" src="JsDecoder.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" charset="utf-8" src="JSReq.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" charset="utf-8" src="EnDeForm.js"></SCRIPT>
#?
#? DESCRIPTION
#?      The function herein tries to pretty print given data.
#?
#?      This file contains functions/methods used to format a string in JSON.
#?      syntax. It defines the  EnDe.Form  class with following variables and
#?      functions:
#?          white    - true:  keep all whitespace
#?                   - false: remove whitespace and add as needed
#?          linked   - number of elements allowed in one line
#?          ident    - ident string; default 4 spaces
#?          trace    - in case somthing goes wrong ..
#?
#?          dispatch()- dispatcher function
#?          format() - formatting function
#?
# HACKER's INFO
#       For debugging __dbx() function is used. Unfortunately this function
#       call may become a perfromance bottleneck.
#?
#? VERSION
#?      @(#) EnDeForm.js 3.13 12/01/22 16:14:18
#?
#? AUTHOR
#?      15-nov-08 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

/*
x=[[{abc:"1\23",xyz:8},/*leer * /leer:"",noch:'"x'  ,x:var]];
y=[[{anArray:[2,3,4,["strin\"g1","string2",{aa:[]}],{"type":"simpleObject"},null],anotherProperty:"",anObject:{justANumber:2,func:function(){if(1>0)return false; else return true;}}}],true];
*/

if (typeof(EnDe)==='undefined') { EnDe = new function() {}; }

// ========================================================================= //
// EnDeform object methods                                                   //
// ========================================================================= //

EnDe.Form   = new function() {
	this.SID    = '3.13';
	this.sid    = function()    { return('@(#) EnDeForm.js 3.13 12/01/22 16:14:18 EnDe.Form'); };

	// ===================================================================== //
	// global EnDe.Form variables                                            //
	// ===================================================================== //

	this.white  = false;
	this.linked = 5; // this.linked = parseInt(document.getElementById('j.linked').value, 10);
	this.ident  = '    ';
	this.trace  = false;    // WARNING: enabling may produce huge data

	// ===================================================================== //
	// internal/private functions                                            //
	// ===================================================================== //

	function __dbx(t,n) { if(EnDe.Form.trace===true) { EnDeGUI.dpr(t,n); } };
	function __err(src) { return '// **ERROR** ' + EnDe.Text.Entity(src); };
	function __wrn(src) { return '// *WARNING* ' + EnDe.Text.Entity(src); };
	function __src(src,idx) {
		var s = src.substr( (idx-8), 16 );
		return  '\n// ** \u2025\u2025' + EnDe.Text.Entity(s) + 
			'\n// ** \u2025\u2025\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014^\u2025\u2025\u2025\u2025\u2025\u2025\u2025\n';
	}; // __src

	function _lookup(src,idx,chr) {
	//#? lookup string starting at position idx 'til next occurance of chr
		/* supported chr: ' " ( [ { <   */
		/* return matched string or empty string */
		__dbx('_lookup(' + idx + ', ' + chr + ')');
		var bux = '';
		var end = chr;  // symetric like " and '
		switch (chr) {
		  case '('  : end = '\\)'; break; // some JavaScript's regex are so stupid
		  case '['  : end = '\\]'; break;
//		  case '['  : end = '\\]';   chr = '\\['; break;
//		  case '{'  : end = '\\}';   chr = '\\{'; break;
		  case '{'  : end = '}';   break;
		  case '<'  : end = '>';   break;
		}
		var kkk = src.substring(idx);
		var rex = new RegExp('([^' + end + ']*' + end + ')');
		var ccc = kkk.match(rex);
		__dbx('_lookup.string:`' + kkk + "'"); // WARNING: can be huge data
		__dbx('_lookup.regex: /' + rex + '/');
		if (ccc!==null) {
			//__dbx('_lookup.match:' + ccc[0]);
			bux = ccc[0];
			while (ccc.pop()!=null) {}
		}
		ccc = null;
		kkk = null;
		rex = null;
		return bux;
	}; // _lookup

	function _lookup_cmt(src,idx,chr,tab) {
	//#? lookup comment starting at position idx 'til next occurance of chr
		// chr: * to match /* .. */
		// chr: ( to match //
		/* return matched comment or empty string */
		var bux = '';
		var kkk = src.substring(idx);
		var rex = null;
		__dbx('_lookup_cmt.start:' + (idx));
		if ((chr==='*') || (chr==='*/')) {
			// try to match /*comment*/
			rex = new RegExp('((:?.*?)\\*/)');
		} else {
			// try to match //comment
			rex = new RegExp('(.*?)\\n');
		}
		var ccc = kkk.match(rex);
		if (ccc!==null) {
			bux = ccc[0];
			//__dbx('_lookup_cmt.match:' + (bux));
			while (ccc.pop()!=null) {}
		} else {
			bux  = src.substr(idx, src.length);
			bux += '\n' + __wrn('unterminated comment starting at postion ' + (idx));
			bux += __src(src, idx);
			bux += '\n' + _ident( tab );
		}
		ccc = null;
		kkk = null;
		rex = null;
		__dbx('_lookup_cmt.end  :' + (idx + bux.length-1));
		return bux;
	}; // _lookup_cmt

	function _lookup_str(src,idx,chr,tab) {
	//#? lookup "string" starting at position idx 'til next occurance of chr
		/* return matched string or empty string */
		var bux = '';
		var kkk = '';
		var bbb = 999; // infinite counter
		__dbx('_lookup_str(' + idx + ', ' + chr + ', ' + tab + ')');
		__dbx('_lookup_str.start[' + (idx-1) + ']: ' + src[idx-1]);
		while(true) {
			__dbx('_lookup_str.while: bbb=' + bbb + ', [' + idx + ']=' + src[idx]);
			bbb--;
			if (bbb <= 0) {
				bux += '\n' + __wrn('too much escaped characters (999) ' + (idx-1));
				break;
			}
			kkk = _lookup(src, idx, chr);
			if (kkk.length <= 0) {
				bux += src.substr(idx, src.length);
				idx += bux.length;
				bux += '\n' + __wrn('unterminated string starting at postion ' + (idx-1));
				bux += __src(src, idx);
				bux += '\n' + _ident( tab );
				break;
			}
			__dbx('_lookup_str.match:' + kkk); // WARNING: can be huge data
			bux += kkk;
			idx += kkk.length + 1;
			if (src[idx-3]!=='\\') {break; }
			__dbx('_lookup_str.escape[' + (idx-3) + ']: ' + src[idx-3]);
			idx--;
			// if last matched character was escaped continue lookup
		}
		kkk = null;
		__dbx('_lookup_str.end   [' + (idx-1) + ']: ' + src[idx-1]);
		__dbx('_lookup_str.return `' + bux + "'" );
		return bux;
	}; // _lookup_str

	function _ident(tab) {
		var bux = '';
		for (var j=1; j<tab; j++) { bux += EnDe.Form.ident; }
		// ToDo; return '<br>' + bux; // if white-space:pre not supported
		return bux;
	}; // _ident

	// ===================================================================== //
	// public formatting method                                              //
	// ===================================================================== //

	this.format = function(src) {
	//#? try to format given string, assuming JSON data
		var bux = '';
		var ccc = '';
		var tab = 1;
		var esc = false;  // true if for \ character
		var tmp = new Array(); tmp.length = src.length;
		var i   = 0;
		var _c  = 0;    // for debugging only
		var _l  = 0;    // for debugging only
		var _s  = 0;    // for debugging only

		/*
		 * mark all special characters in tmp[] array
		 */
		for (i=0; i<src.length; i++) {
			ccc = src.charAt(i);
			if (ccc==='\\') {
				if (esc===true) {
					tmp[i] = null;
				} else {
					tmp[i] = ccc;
				}
				esc = !esc;
				continue;
			}
			if (esc===true) {
				tmp[i] = null;
			} else {
				tmp[i] = null; // fallback
				if (ccc.match(/[':",;=(){}]/)===null) {
					// no match, check some others manually to avoid escaped characters in RegExp
					switch (ccc) {
					  case '['  : tmp[i] = ccc; break;
					  case ']'  : tmp[i] = ccc; break;
					  case '/'  : tmp[i] = ccc; break;
					  case '\\' : tmp[i] = ccc; break;
					}
				} else {
					tmp[i] = ccc;
				}
			}
			esc = false;
		} // src
		if (this.trace > 0) { //#dbx
			var dbx = '.Form marked tmp[] array:';
			for (i=0; i<=src.length; i++) { dbx += '\n  ['+i+']: '+src[i]+'\t'+tmp[i]; }
			__dbx('#[' + dbx + '\n#]');
			dbx = '';
		} //#dbx

		/*
		 * process string
		 */
		var kkk = '';
		i   = -1;
		while (i <= src.length) {
			i++;
			ccc = src.charAt(i);
			chr = src.charAt(i-1);

			//__dbx('.>>   : '+ccc);
			if (tmp[i]===null) {
				if (ccc.match(/[ \f\t\n\r]/)===null) {
					// no whitespace, print
					bux += ccc;
					__dbx('.char['+i+']:' + ccc);
				} else {
					// got a whitespace, check how to handle ..
				  	if (this.white===true) {
						bux += ccc;
					} else {
						__dbx('.else : '+i);
						if (chr.match(/[ \f\t\n\r]/)===null) {
							// keep space if necessary
							bux += ccc;
							//if (tmp[i-1] !==null) { bux += ccc; }
						} else {
							// ignore space
							__dbx('.space: '+i);
						}
					}
				}
				continue; // while (src)
			}
			__dbx('.next['+i+']:' + ccc);
			switch (ccc) {
				  case "'"  :
				  case '"'  :
						bux += ccc;
						kkk  = _lookup_str(src, (i+1), ccc, tab);
						bux += kkk;
						i   += kkk.length;
						_s++;
						break;
				  case '/'  :
						if ((src[i+1]==='/') || (src[i+1]==='*')) { // try to match end of a comment
							kkk  = _lookup_cmt(src, i, src[i+1], tab);
							bux += kkk;
							i   += kkk.length - 1;
							if (kkk.length > 0) {
								bux += '\n' + _ident( tab );
							}
						} else {
								bux += ccc;
						}
						_c++;
						break;
				  case ':'  : if (this.white===true) { bux += ccc; } else { bux += '\t' + ': '; }; break;
				  case '='  : bux += '=';                       break;
				  case ';'  :
				  case ','  : bux += ccc + '\n' + _ident( tab );break;
				  case '{'  :
				  case '['  : bux += ccc + '\n' + _ident(++tab);break;
	// ToDo: above { and [ do not match proper in _lookup()
				  case '('  :
						bux += ccc;
						kkk  = _lookup(src, (i+1), ccc);
						if (kkk.length <= this.linked) {
							bux += kkk;
							i   += kkk.length;
						} else {
							bux += '\n' + _ident(++tab);
						}
						_l++;
						break;
				  case ')'  :
				  case ']'  :
				  case '}'  : bux += '\n' + _ident(--tab) + ccc;break;
				  case '\\' : bux += ccc; break;
				  default   : bux += ccc; break; // fallback
			} // switch(ccc)
			kkk = null;
		} // while src
		__dbx('.format: lookup_str: '+_s+'; lookup_cmd: '+_c+'; lookup: '+_l);
		return bux;
	}; //format

	this.dispatch= function(type,mode,src,white,linked) {
	//#? dispatcher for various formattings; returns formated text
		/* for type=JSReg white parameter has special meaning, see below */
		// ToDo: quick&dirty use of white parameter
		var bux = '';
		var kkk = '';
		this.white  = white;
		this.linked = linked;
		__dbx('EnDe.Form.dispatch( ' + type + ', <src>, .. )');
		switch (type) {
		  case 'JSDecode'   :
			bux = new JsDecoder();
			bux.s = src;
			// ToDo: return bux.decode(); // use this if garbage collector works
			kkk = bux.decode();
			bux.s = ''; bux = null;
			return kkk;
			break;
		  case 'JSFormat'   : return this.format(src); break;
		  case 'toSource'   :
			kkk = src;
			bux = 'EnDeJSwrapper=function(){' + src + ';}';
			try {      eval(bux); }
			catch(e) { EnDeGUI.alert('EnDe.Form.dispatch: ',' syntax error in code: ' + e); }
			delete this.bux;
			bux = null;
// ToDo: should return here if there was a catch
			/* from the new generated function code we remove the first and last line
			 * the second line and the the line before the last line are empty and
			 * hard to detect as such empty lines may be in the code also, so we leave
			 * them as is
			 */
			//return EnDeGUI.code( (EnDeJSwrapper).toSource(0).replace(/(^[^\n]*\n)/,'').replace(/(^\}\s*$)/,'') );
			// replace last line does not work :-(
			kkk = src;
			try {      kkk = (EnDeJSwrapper).toSource(0); }
			catch(e) { EnDeGUI.alert('EnDe.Form.dispatch: ',' browser does not support "().toSource"'); }
			delete EnDeJSwrapper;
			return kkk;
			break;
		  case 'JSReg'      :
			/* sequence in "white" should be: doNotEval,doNotFunctionEval,doNotMainEval,runCheck */
			var err = '';
			var bbb = '';
			var ccc = '';
			var ggg = '';
			var rrr = '';
			var eee = '';
			var ttt = '';
			bux = window.JSReg.create();
			bux.setDebugObjects({
				functionCode: function(r){ccc=r;/*alert('f:'+r);*/},
				evalCode:     function(r){bbb=r;/*alert('c:'+r);*/},
				converted:    function(r){kkk=r;/*alert('c:'+r);*/},
				result:       function(r){rrr=r;/*alert('r:'+r);*/},
				globalsCheck: function(r){ggg=r;/*alert('g:'+r);*/},
				errorLog:     function(r){eee=r;/*alert('e:'+r);*/},
				parseTree:    function(r){ttt=r;/*alert('t:'+r);*/},
				errorHandler: function(r){eee=r;},
/*
				clearTree:    function(r){},
				onComplete:   function( ){},
				onStart:      function( ){},
*/
				doNotEval:          white.shift(),
				doNotFunctionEval:  white.shift(),
				doNotMainEval:      white.shift()
				});
			if (white.shift()==true) {
			try { bux.runCheck(); } catch(e) { err  = "'**Error JSReg.runCheck():'\n// " + e + '\n\n'; }
			}
			try { bux.eval(src);  } catch(e) { err += "'**Error JSReg.eval():'\n// " + e.lineNumber + '\n\n'; }
			return err
				+     "'given Code:'\n"            + src
				+ "\n\n'JSReq Code:'\n"            + kkk
				+ "\n\n'globals.eval Code:'\n"     + bbb
				+ "\n\n'globals.Function Code:'\n" + ccc
				+ "\n\n'Result:'\n"                + rrr
			//	+ "\n\n'globalsChecks:'\n"         + ggg
				+ "\n\n'Errors:'\n"                + eee
				+ "\n\n'Pase Tree:'\n"             + ttt
				;
			// don't show globalsCheck 'cause it contains EnDe's internal variables too
			break;
		  case 'data'       :
			kkk = EnDe.User.DAT.guess(src);
			return 'data format (' + kkk + '): ' + EnDe.User.DAT.type(kkk) + '<br>';
			break;
		  case 'image'      :
			bux = 'data:image/'; // data:image/gif;base64, + src
			if (src.match(/^\s*data:image\//i)===true) {// lazy check should be ok
				// already data:image/*
				__dbx('EnDe.Form.dispatch: image: preformated');
				return 'image: <img src="' + src + '" ><br><pre>' + src + '</pre>';
			} else {
				// src may be image data
				__dbx('EnDe.Form.dispatch: image: check');
				bbb = src.replace(/[\r\n]*/g,'').replace(/%2F/ig,'/').replace(/%3D/ig,'=').replace(/%2B/ig,'+'); // might be URL-encoded
					// we could use image/x-icon but we try to give the browser some hints
				if (EnDe.B64.isB64(bbb)===true) {
					kkk = EnDe.B64.DE.dispatch('base64','','',bbb,'','',0);
					__dbx('EnDe.Form.dispatch: image: base64, ');
				} else {
					bbb = EnDe.B64.EN.dispatch('base64','','',src,'','',0);
					kkk = src
					__dbx('EnDe.Form.dispatch: image: not base64, ');
				}
				kkk = EnDe.User.IMG.guess(kkk);
			}
			bux = EnDe.User.IMG.getMIME64(kkk);
			__dbx('EnDe.Form.dispatch: image: ' + kkk + ' # ' + bux);
			// data source must be URL-encoded
			bux += bbb.replace(/[\r\n]*/g,'').replace(/\//g,'%2F').replace(/=/g,'%3D').replace(/\+/g,'%2B');
			bbb = null; kkk = null;
			return 'image: <img src="' + bux + '" ><br><pre>' + bux + '</pre>';
			break;
		}
		return '**ERROR EnDe.Form.dispatch**'; // fallback
	}; // dispatch

}; // EnDe.Form
