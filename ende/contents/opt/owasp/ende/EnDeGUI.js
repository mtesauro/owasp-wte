/* ========================================================================= //
# vi:  ts=4:
# vim: ts=4:
#?
#? NAME
#?      EnDeGUI.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeFile.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeText.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeGUI.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeGUIx.js"></SCRIPT>
#?
#?      Note  that it should be used with    language="JavaScript1.5"   because
#?      try{..}catch(){..}  is used herein.
#?
#? DESCRIPTION
#?      This file contains all functions/methods used to build  HTML tags  from
#?      JSON definitions.
#?      Some parts are defined in EnDeGUIx.js for better maintenance,  but they
#?      are part of the  EnDeGUI object defined herein.
#?
#?      It defines the EnDeGUI class with following functions (incomplete list):
#?          .init             - genesis rules
#?          .alert            - general function for alerts
#?          .setTitle         - set window title
#?          .selectionGet     - return selection and preserve selection
#?          .positionGet      - return position of cursor from browser
#?          .MP.*             - various functions for replace character map
#?          .*.dispatch       - dispatcher for various GUI functions
#?          .win              - create new browser window
#?          .help             - show help window
#?          .scratch          - show scratchpad window
#?          .stat             - show alert box with statistic about text
#?          .cont             - show code (text, whatever) window
#?          .info             - show code (text, whatever) window with title
#?          .code             - return text with line numbers, take care for HTM Entities
#?          .guess            - create new browser window with given results of en-/decodings as content
#?          .data             - VIEW dispatcher for various data conversions (Text <--> Hex <--> parsed)
#?          .checked          - toggle checked value of given object
#?          .display          - toggle style.display from/to block to/from none
#?          .visible          - toggle style.visibility from/to visible to/from hidden
#?          .dashed           - toggle style.borderStyle from inset to dashed and vice versa
#?          .show             - dispatcher to toggle visibility of some fieldsets
#?          .setPriv          - set browser privileges
#?          .tour             - dispatcher for demo tour through EnDe
#?          .showMap          - show window with various trace/debug information
#?          .showSID          - show defined SIDs of various files
#?          .showIds          - check for duplicate tag id attributes
#?          .showFiles        - show list of loaded files
#?          .pathhack         - try to get full path from input field of type=file
#?          .readlocal        - try to read local file
#?          .readfile         - read file from origin or local file system
#?          .quirks           - set new URL with specified browser search string
#?          .clear            - clear GUI fields
#?          .preset           - preset some options
#?          .settrace         - set trace variable according given object
#?          .spr              - write text to status tag; calls trace output if enabled
#?          .dpr              - write data to textarea (for trace/debug output)
#?          .dprint           - write data to textarea (for trace/debug output)
#?          .dprobject        - write object data to textarea (trace/debug)
#?
#? EXAMPLES
#?      See EnDeMenu.txt
#?
#? SEE ALSO
#?      EnDeGUIx.txt
#?      EnDeMenu.txt
#?
# HACKER's INFO
#       Cannot use 'class' as name in JSON because Safari complains with errors
#       in JavaScript, hence we use 'css'.
#
#    *dispatch() functions:
#       These functions have 2 parameters  obj and src due to historic reasons.
#       // ToDo: second parameter is obsolete, but needs to be adapted here.
#
#    obj.selectedIndex:
#       HTML SELECT menus behave very special when used with size=1 (means that
#       only one menuline is visible). In this configuration the last selection
#       remains and cannot be selected again. This strange behaviour depends on
#       the browser and if the menu is configured with the  onClick or onChange
#       event. Some browsers trigger the configured event (onClick or onChange)
#       even if no selection is made or the the menu is released with the mouse
#       pointer outside the menu.
#       To avoid special browser hacks and/or using the  onMouse* and onButton*
#       events to get the expected result, a simple workaround is used instead:
#       all SELECT menus set the Element.selectedIndex attribute as follows
#         1. initialization with -1, which forces an empty line
#         2. each selection resets Element.selectedIndex to -1 again
#       This seems to  inhibit triggering the event  when no selection was done
#       after selecting the menu itself. It also enables the menu to select the
#       same item multiple time.
#
#    A onClick=
#       A tags inside LI for select menus use the onClick event for calling the
#       desired fucnction. That's the default because some browsers behave very
#       strange when using 'href="javascript:.."'.
#
#    if (foo=='indexOf') { continue; }
#       This check inside  'for (key in array)'  loops is a contribution to old
#       Mozilla 1.x which has this property.
#?
#? VERSION
#?      @(#) EnDeGUI.js 3.82 12/06/09 18:22:39
#?
#? AUTHOR
#?      07-apr-07 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

// ========================================================================= //
// EnDeGUI object methods                                                    //
// ========================================================================= //

var EnDeGUI = new function() {
this.SID        = '3.82';
this.sid        = function() {  return('@(#) EnDeGUI.js 3.82 12/06/09 18:22:39 EnDeGUI'); };

function $(id) { return document.getElementById(id); };

	// ===================================================================== //
	// global EnDeGUI variables                                              //
	// ===================================================================== //

this.isOpera    = false;
this.isSafari   = false;
this.isCamino   = false;
this.isiCab     = false;
this.isWebKit   = false;
this.isMoz17    = false;
this.isFirefox  = false;
this.isKonqueror= false;
this.isChrome   = false;
this.isIE       = false;
this.trace      = false;
this.sample     = 'http://beef.tld/path;sid=(abc);SSS?foo=bar&b+64=quot"apos\'btick`bspace\\gt>space nl\n\u0010tab\tex!percent%auml\u00e4ouml\u00f6uuml\u00fcszet\u00dfeuro\u20acat@hash#EnDe';
this.colour     = true; // colourize formatted code
//this.regex      = EnDeRE.sample;
this.onClick    = true; // true: use onClick for SELECT tags, false: use onChange
this.a_Click    = true; // true: use onClick for LI A  tags, false: use href=javascript:
this.onload     = true; // ** not yet used **
this.useLabel   = false;// true: use label= attribute for OPTION tags
this.useANCHOR  = false;// true: use UL>LI>A instead of SELECT>OPTION
this.experimental='hidden'; // 'visible': show experimental features/functions in GUI
this.joke       = 'hidden'; // show "non technical" menu entries
this.sbar       = 'none';   // show "Status Bar"
this.pimped     = false;// true if pimped GUI
this.localpath  = '';   // path in local file system used for "load file" functions
this.titles     = {dumm:0}; // hash to store all title attributes
		/* dummy key dumm to keep stupid browsers happy with this definition */
this.dir        ='';    // default directory to search for files
this.usr        ='usr/';// directory to search for user files
this.nousr      = false;// true: use files from ./usr/ directory
this.grpID      = 1;    // counter for dynamically generated SELECT OPTGROUP IDs

this.winX       = '800';//  width of new window
this.winY       = '400';// height of new window

this.SIDs       = {};   // hash to store all SID vor checkupdate() function

/* empty definition, see EnDeGUIx.js
this.Obj        = new function() {}
*/

	// ===================================================================== //
	// misc. methods                                                         //
	// ===================================================================== //

this.saveeval   = eval;
	// save built-in eval()

this.eval       = function(src) {
//#? wrapper for eval() function; returns given JavaScript source as text
	return src;
};

this.alert      = function(func,src) {
	// this is the internal function used for delivering messages to the user
	// ** needs to be adapted to the environment where EnDeGUI object is used **
	//return;
	alert('**' + func + ': ' + src);
};

	// ===================================================================== //
	// debug methods                                                         //
	// ===================================================================== //

this.settrace   = function(obj) {
//#? set trace variable according given object
	// obj is a DOM object if called from event handler
	// obj might be a atring if called from .init()
	var ccc = obj;
	if (((typeof(obj)).match(/object/i))!==null) {
		ccc = obj.id.replace(/^EnDeDOM.DBX./, '');
	}
	_spr('EnDeGUI.settrace(' + ccc + ')');
	switch (ccc) {
	  case 'EnDe':  EnDe.trace        = !EnDe.trace;        break;
	  case 'Trace': EnDeGUI.trace     = !EnDeGUI.trace;     break;
	  case 'Obj':   EnDeGUI.Obj.trace = !EnDeGUI.Obj.trace; break;
	  case 'Txt':   EnDeGUI.txt.trace = !EnDeGUI.txt.trace; break;
	  case 'txt':   EnDeGUI.txt.trace = !EnDeGUI.txt.trace; break;
	  case 'Menu':  EnDeGUI.Mnu.trace = !EnDeGUI.Mnu.trace; break;
	  case 'Maps':  EnDe.Maps.trace   = !EnDe.Maps.trace;   break;
	  case 'File':  EnDe.File.trace   = !EnDe.File.trace;   break;
	  case 'Form':  EnDe.Form.trace   = !EnDe.Form.trace;   break;
	  case 'Text':  EnDe.Text.trace   = !EnDe.Text.trace;   break;
	  case 'User':  EnDe.User.trace   = !EnDe.User.trace;   break;
	  case 'B64':   EnDe.B64.trace    = !EnDe.B64.trace;    break;
	  case 'UCS':   EnDe.UCS.trace    = !EnDe.UCS.trace;    break;
	  case 'IP':    EnDe.IP.trace     = !EnDe.IP.trace;     break;
	  case 'TS':    EnDe.TS.trace     = !EnDe.TS.trace;     break;
	}
	return true;
}; // settrace

this.dbxtrace   = function() {
//#? set checkbox in trace section
	$('EnDeDOM.DBX.EnDe').checked  = EnDe.trace;
	$('EnDeDOM.DBX.Trace').checked = EnDeGUI.trace;
	$('EnDeDOM.DBX.Obj').checked   = EnDeGUI.Obj.trace;
	$('EnDeDOM.DBX.txt').checked   = EnDeGUI.txt.trace;
	$('EnDeDOM.DBX.Menu').checked  = EnDeGUI.Mnu.trace;
	// following objects use a naming standard :)
	var ccc = null;
	var kkk = new Array( 'Maps', 'B64', 'IP', 'TS', 'UCS', 'FIle', 'Form', 'Text', 'User');
	while ((ccc=kkk.shift())!==undefined) {
		// ($('EnDeDOM.DBX.XXXXX' )) $('EnDeDOM.DBX.XXXXX' ).checked = EnDe.XXXX.trace;
		if ($('EnDeDOM.DBX.' + ccc)) $('EnDeDOM.DBX.' + ccc).checked = EnDe[ccc].trace;
	}
}; // dbxtrace

this.dpr        = function(src,nl) {
//#? write simple text to trace output; output terminated with \n if nl is undefined
	if (EnDeGUI.trace===false) { return false; }
	if (nl===undefined) { var nl = '\n'; }  // this var confuses lint, but keeps some browsers happy
	try { $('EnDeDOM.DBX.text').value += src + nl; } catch(e) {}; // catch not important
	return false;
}; // dpr

this.dprint     = function(txt,src) {
//#? write verbose text to trace output; given src checked with typeof
	function __obj(level,src) {
		if ((level<0) || (level>3)) { return '(**level>3 out of range**)'; }
		var _c = '';
		var _t = '';
		var _r = '';
		var _x = null;
		for (_c=0; _c<=level; _c++) { _t += '\t'; }
		//if (src===null) { return 'Null'; }
		_r += '(' + typeof src + ')';
		switch (typeof src) {   // ToDo: some browsers return mixed case :-(
		  //case 'function':  _r += '\t' + ((src.match(/\[\s*native code\s*\]/)===null) ? src : src.replace(/\n/g,'')); break;
		  case 'function':  _r += '\t' + src.toString().replace(/\n/g,''); break;
		  case 'boolean':   _r += '\t' + src; break;
		  case 'number':    _r += '\t' + src; break;
		  case 'string':    _r += '\t' + src; if (src==='') { _r += '(**empty**)'; }; break;
		  case 'object':
			if (src.length!==undefined) {
				_r += ' Array (length:' + src.length + ') {';
			} else {
				_r += ' Object {';
			}
			for(_c in src) {
				_r += '\n' + _t + _c + ':\t';
				switch (_c) {
				  case 'indexOf':   _r += '/* Mozilla 1.7? */'; continue; break;
				  case 'null':      _r += '(**null**)';   continue; break;
				  case 'offsetParent':  // avoid huge output (Firefox 3.x special?)
				  case 'style':         // avoid huge output
				  case 'currentStyle':  // avoid huge output (Safari)
				  case 'labels':        // avoid huge output (Safari)
				  case 'innerHTML':     // avoid huge output
				  case 'outerHTML':     // avoid huge output (OmniWeb special)
				  case 'textContent':   // avoid huge output
				  case 'form':          // avoid huge output
									_r += '(**skip huge data**)';   continue; break;
				  case 'all':
				  case 'childNodes':
				  case 'ownerElement':
				  case 'firstElementChild':
				  case 'lastElementChild':
				  case 'lastElementSibling': // (Safari only?)
				  case 'previousElementSibling': // (Opera only?)
				  case 'parent':
				  case 'parentElement':
				  case 'parentNode':
				  case 'parentWindow':
				  case 'previousSibling':
				  case 'nextSibling':
				  case 'firstChild':
				  case 'lastChild':
				  case 'document':
				  case 'ownerDocument':
				  case 'window':    _r += src[_c] + '(**skipped**)';    break;
				  default:
					try { _x = src[_c]; _r += __obj(level+1,src[_c]); }
					catch(e) { _r += '(**no data**)'; } // DOM objects may have "no data" (seen in Firefox 3.x)
					break;
				}
			}
			_r += '\n' + _t + '}';
			break;
		  default:
			_r += '**unknwon**' + src[_c];
			break;
		}
		return _r;
	}
	var ccc = '';
	try { ccc = arguments.caller; } catch(e) { ccc = '"arguments.caller undefined"'; }
	if (EnDeGUI.trace===false) { return false; }
	var bux = $('EnDeDOM.DBX.text');
	bux.value += '#{ ' + txt; // + '\ncaller: ' + ccc;
	bux.value += __obj(0,src);
	bux.value += '\n#----------------------------------------------------------------------#}\n';
	bux = null;
	return false;
}; // dprint

this.objproperties = function(obj) {
//#? return object properties
	var bux = '';
	for (var i in obj) { bux += i + ':[' + typeof i + ']:' + obj[i] + '\n'; }
	return bux;
}; // objproperties

this.dprobject  = function(obj) {
//#? write object to trace output
	if (EnDeGUI.trace===false) { return false; }
	return this.dprint('object', (typeof obj + '\n' + this.objproperties(obj)));
}; // dprobject

this.spr        = function(src) {
//#? write text to status tag; calls trace output if enabled
	try { $('EnDeDOM.SB.status').innerHTML = src; } catch(e) {}; // catch not important
	if (EnDeGUI.trace===true) { EnDeGUI.dpr(src); }
	return false;
}; // dpr

this.log        = function(src) {
/*
function __log(src) {
 //#? write string to console
    var failed = 0;
    try {
    if (Application.console) { // Firefox 3
        Application.console.open();
        Application.console.log(src);
        } else {
          alert('Application.console missing');
        }
alert(3);
    } catch(e) { failed=1; }
    if (failed==0) { return; }
alert(2);
    try {
        Console.log(src);
    } catch(e) { failed=1; }
    if (failed==0) { return; }
    try {
        netscape.security.PrivilegeManager.enablePrivilege('UniversalPreferencesRead');
        var ccc=Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService); ccc.logStringMessage(src);
        //Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(src);
        //Components.utils.reportInfo(src);
    } catch(e) { alert(e); failed=1; }
    if (failed==0) { return; }
}; // __log
*/
//#? write string to console
	if (Application.console) { // Firefox 3
		Application.console.open();
		Application.console.log(src);
	} else {
		//var ccc = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService); ccc.logStringMessage(src);
		Components.utils.reportInfo(src);
	}
}; // log

	// ===================================================================== //
	// callback functions in "Replace Map" window                            //
	// ===================================================================== //

  this.MP       = new function() {
  //#? class for functions used in "Replace Map" window
	this.sid    = function() { return(this.sid() + '.txt'); };
	this.charID = 0;    // counter for dynamically generated rows
	this.newrow = function() {
	//#? create a new row with input fields for character replacement
		this.charID++;
		$('EnDeDOM.MP.Characters.s').appendChild(EnDeGUI.Obj.create('EnDeDOM.MP.c'+this.charID,['item4','\char'+this.charID,'','','new: replacement character'],'TABLE','group',false));
		return false;
	}; // .newrow

	this.select = function(src) {
	//#? toggle border colour for selected input field
		var obj = $('EnDeDOM.MP.selected');    // where object ID is stored
		if (obj.value != '') {
			$(obj.value).style.borderColor = $(src).style.borderColor; // save original colour
		}
		$(src).style.borderColor = '#ff0000';
		obj.value = src;
	}; // .select

	this.setChar = function(self,src) {
	//#? write given character (src) in specified format (typ) to selected input field
		if (isNaN(src)===true)    { alert('**invalid format NaN: '+src); return false; }
		if (self.selectedIndex!=undefined) { if (self.selectedIndex<0) { return false; } }
		var obj = $('EnDeDOM.MP.selected');    // where object ID is stored
		if (obj.value==='') { alert('**please select destination field first'); return false; }
		$(obj.value).value = this.getFormat($('EnDeDOM.MP.see').value,src);
		return false;
	}; // .MPsetChar

	this.getUnicode = function(typ,src) {
	//#? returns given value as Unicode
// ToDo: buggy if value does not match given format (in typ)
		var bux = src;
		switch (typ) {
		  case 'oct': bux = parseInt(bux.substr(1),8);  break;
		  case 'hex': bux = parseInt(bux.substr(2),16); break;
		  case 'url': bux = parseInt(bux.substr(1),16); break;
		  case 'uni': bux = parseInt(bux.substr(2),16); break;
		  case 'NCE': bux = parseInt(bux.substr(3),16); break;
		  case 'int': bux = parseInt(bux.substr(2),10); break;
		  case 'chr': bux = src.charCodeAt(0);          break;
		}
		return bux.toString(10);
		return bux;
	}; // .getUnicode

	this.getFormat  = function(typ,src) {
	//#? returns given Unicode in specified (typ) format
		switch (typ) {
		  case 'oct': return '\\'  + parseInt(src,10).toString(8);        break;
		  case 'hex': return '\\x' + parseInt(src,10).toString(16);       break;
		  case 'url': return '%'   + parseInt(src,10).toString(16);       break;
		  case 'NCE': return '&#x' + parseInt(src,10).toString(16) + ';'; break;
		  case 'int': return '&#'  + parseInt(src,10).toString(10) + ';'; break;
		  case 'chr': return         String.fromCharCode(src);            break;
		  case 'uni':
			var bux = parseInt(src,10).toString(16);
			while(bux.length<4) { bux = '0' + bux; }
			return '\\u' + bux;
			break;
		}
		return src;
	}; // .getFormat

	this.setFormat  = function(self,src) {
	//#? change all EnDeDOM.MP.new* values to given format
		_spr('.MP.setFormat: '+ src);
		var bux = this.replace(src, null);
		$('EnDeDOM.MP.see').value = src;
		return bux;
	}; // .setFormat

	this.replace= function(typ,src) {
	//#? replace old with new character
	//#typ? swap:  swap new and old characters in "Replace Characters Map"; returns false
	//#typ? user:  replace old with new characters in given src; returns substituted src
		_spr('.MP.replace: '+ typ);
		var bux = src;
		var id  = '';
		var ccc = '';
		var rep = '';
		var old = '';
		var arr = document.getElementsByTagName('INPUT');
		for (ccc=0; ccc<arr.length; ccc++) {
			if (arr[ccc]    == undefined) { continue; }
			if (arr[ccc].id == undefined) { continue; }
			if (arr[ccc].id.match(/^EnDeDOM\.MP\.new/)===null) { continue; }
			id  = arr[ccc].id;
			rep = $(id).value;
			//if (rep == '') { continue; }
			id  = id.replace('new','old'); // get other ID
			//#dbx alert(id);
			old = $(id).value;
			switch (typ) {
			  case 'swap':
				bux = false;
				$(id).value = rep;
				$(arr[ccc].id).value = old;
				break;
			  case 'user':
				old = EnDe.rex(old);
				bux = bux.replace(new RegExp('('+old+')','g'),rep);
				break;
			  default:
				id  = arr[ccc].id;
				bux = this.getUnicode($('EnDeDOM.MP.see').value,rep);
				if (isNaN(bux)) { continue; }
				$(id).value = this.getFormat(typ,bux);
				bux = false;
			}
		}
		return bux;
	}; // .replace

	this.swap   = function() { return this.replace('swap','EnDeDOM.MP.e','EnDeDOM.MP.d') };

  }; // MP

	// ===================================================================== //
	// window functions                                                      //
	// ===================================================================== //

this.setTitle   = function() { document.title += ' (' + EnDe.VERSION + ')'; };

this.selectionGet= function(obj) {
//#? get selection from browser
	if (window.getSelection) {
		if (obj!=null) { // if we got an object, try to select from there
			if (obj.selectionStart < obj.selectionEnd) {
				var kkk = obj.value.substring(obj.selectionStart,obj.selectionEnd);
				obj.setSelectionRange(obj.selectionStart,obj.selectionEnd);
				obj.focus();
				return kkk;
			}
		}
	}
	if (window.getSelection) {
		return window.getSelection();
	} else if (document.getSelection) {
		return document.getSelection();
/*  IE users change here, or switch to reliable browsers ;-)
	} else if (document.selection) {
		var txt = document.selection.craeteRange().text;
		var kkk = obj.textbox.createTextRange();
		kkk.moveStart("character", iStart);
		kkk.moveEnd("character", iLength - obj.textbox.value.length);
		kkk.select();
		obj.focus();
		return txt;
*/
	} else { // don't support crappy browsers
		return '';
	}
	return '';
}; // selectionGet

this.positionGet= function(obj) {
//#? get position of cursor from browser
	if (window.getSelection) {
		if (obj!=null) { // if we got an object, try to select from there
			return obj.selectionStart
		// } else { // no object, then it's 0 anyway
		}
	// } else { // don't support crappy browsers
	}
	return 0;
}; // positionGet

this.win        = new function() {
  var winscratch = null;
  var wincnt = 1;

  this.help     = function(srcfile,wintitle,wincontent) {
  //#? create new browser window using specified URL as content
	var win = null;
	_dpr('EnDeGUI.win.help(' + srcfile + ', ' + wintitle + ')');
	//if (srcfile == '') { srcfile = 'EnDeDumm.html'; }
	try {
		win = window.open(srcfile, 'help',
							 'resizable=yes,scrollbars=yes,dependent=yes'
							+',status=no,menubar=no,toolbar=no,location=no'
							+',innerHeight='   + EnDeGUI.winY
							+',innerWidth='    + EnDeGUI.winX
							+',width='         + EnDeGUI.winX
							+',height='        + EnDeGUI.winY
						 );
		// ToDo: exception in Camino
		/* following throws exception in Camino even with above Privilege settings */
		// no ToDo: following throws error in IE8
		win.document.title =  wintitle;
		if (wincontent!='') { win.document.body.innerHTML = wincontent; }
// ToDo: use DOM to assign CSS as follows:
/*
 * .. but most browsers are too stupid to do that if there is no .html file given as source
		var ccc  = win.document.createElement('LINK');
		ccc.rel = 'stylesheet'
		ccc.type = 'text/css';
		ccc.href = 'EnDe.css';;
		win.document.getElementsByTagName('head')[0].appendChild(ccc);
*/
	} catch (e) { EnDeGUI.alert('EnDeGUI.win.help',e); }
	return win;
  }; // win.help

  this.scratch  = function() {
  //#? create browser window for scratchpad
	var win = null;
	try {
		win = window.open('', 'scratch',
							 'resizable=yes,scrollbars=yes,dependent=yes'
							+',status=no,menubar=no,toolbar=no,location=no'
							+',innerHeight=400,innerWidth=800,width=800,height=400'
						 );
	} catch (e) { EnDeGUI.alert('EnDeGUI.win.scratch: window: ',e); }
	try {
		if (EnDeGUI.isKonqueror===true) {
			// some browsers behave strange ..
			win.document.body.innerHTML = '<textarea rows="28" cols="99" id="scratch"></textarea>';
		} else {
			var area  = document.createElement('TEXTAREA');
			area.setAttribute('rows',28);
			area.setAttribute('cols',99);
			area.id = 'scratch';
			win.document.body.appendChild(area);
		}
	} catch (e) { EnDeGUI.alert('EnDeGUI.win.scratch',e); }
	return win;
  }; // win.scratch
}; // win

this.scratch    = function(item,txt) {
//#? add text to scratchpad window
	var win = null;
	if (!this.winscratch) { // create new window first time
		win = this.win.scratch();
		if (win != null) {
			this.winscratch = win;
		} else {
			EnDeGUI.alert('EnDeGUI.scratch','creating scratchpad failed');
			return false;
		}
	}
	if (!this.winscratch.document) { // window does no longer exist
		win = this.win.scratch();
		if (win != null) {
			this.winscratch = win;
		} else {
			EnDeGUI.alert('EnDeGUI.scratch','adding to scratchpad failed');
			return false;
		}
	}
	var area = this.winscratch.document.getElementById('scratch');
	if (area) {
		area.value += '#{ ------------------------------------------------------------------------------ ' + item + '\n' + txt + '\n#}\n';
		area.focus();
		this.winscratch.focus();
	}
	return false;
}; // scratch

this.stat       = function(txt) {
//#? show alert box with statistic about text
	var bux = '';
	var kkk = null;
	bux  = '\ncharacters: ' + txt.length;
	bux += '\nwords: ';  kkk = txt.match(/[ \t]+/g);  bux += (kkk===null) ? '1' : kkk.length + 1;
	bux += '\nlines: ';  kkk = txt.match(/[\n\r]+/g); bux += (kkk===null) ?'(1)': kkk.length + 1;
	bux += '\nspaces: '; kkk = txt.match(/ /g);       bux += (kkk===null) ? '0' : kkk.length;
	bux += '\nnewline: ';kkk = txt.match(/\n/g);      bux += (kkk===null) ? '0' : kkk.length;
	bux += '\nnone-print: '; kkk = txt.match(/[^\x20-\x7e]/g); bux += (kkk===null) ? '0' : kkk.length;
	alert(bux);
	if (kkk!==null) { while(kkk.pop()){} }
	bux = '';
	return false;
}; // stat

this.cont       = function(txt) {
//#? create new browser window with given text as content
	var win = this.win.help('', 'Plain Text', txt);
	win.focus();
	return false;
}; // cont

this.info       = function(title,txt) {
//#? create new browser window with given title and text as content
	_dpr('EnDeGUI.info(' + title + ')');
	var win = this.win.help('', title, txt);
	win.focus();
	return false;
}; // cont

this.help       = function(type) {
//#? Create new browser window with help text, uses given type as anchor
	_spr('EnDeGUI.help: '+type);
	var win = null;
	/* Note: following does not work with default view as it is "text only".
	 * Hence EnDe.Man.init() uses location.search.hash to jump to the anchor
	 * when view is toggled from "text" to "HTML" (with JavaScript).
	 * As this.help() could be called with a filename as parameter, foo.html
	 * for example, the passed type parameter used as anchor (like ED below)
	 * should not contain the string "txt" because EnDe.Man.init()  does not
	 * jump to an anchor if the passed URL fragment matches "txt" (which
	 * would result in an infinite loop). File names like EnDeRE.man.txt and
	 * EnDe.TS.html are none existing anchors,  both load their own file and
	 * hence should not jump.
	 */
	var bux = { // map type to anchor (dirty hack, see EnDe.man.html)
		'ABOUT' : 'VERSION',
		'CH'    : 'DETAILS_Character',
		'ED'    : 'DETAILS_En__Decoding',
		'IP'    : 'DETAILS_IP_Converter',
		'TS'    : 'DETAILS_Timestamp_Converter',
		'RE'    : 'DETAILS_RegEx',
		'DBX'   : 'DETAILS_Trace',
		'TST'   : 'DETAILS_Test',
		'GUI'   : 'GUI_OPTIONS',
		'QPT'   : 'QUICK_GUI_BAR',
		'API'   : 'API_OPTIONS',
		'MODE'  : 'MODE',
		'MAP'   : 'REPLACE_MAP',
		'QQ'    : 'BROWSER_QUIRKS'
	};
	var x = EnDeGUI.winX;
	var y = EnDeGUI.winY;
	switch (type) {
	  case 'EnDeRE.man.txt':
		EnDeGUI.winX = '1050';
		EnDeGUI.winY = '800';
		win = this.win.help('EnDe.man.html?EnDeRE.man.txt', 'Help: Regular Expressions', '');
		EnDeGUI.winX = x;
		EnDeGUI.winY = y;
		break;
	  case 'EnDe.TS.html':
// ToDo: EnDe.TS should be moved to EnDe.man
		win = this.win.help('EnDe.TS.html',    'Help: Timestamp Conversions', '');
		break;
	  case 'EnDe.man.txt':
	  default   :
		EnDeGUI.winX = '666';
		EnDeGUI.winY = '800';
		win = this.win.help('EnDe.man.html#'+bux[type], 'Help: '+bux[type], '');
		EnDeGUI.winX = x;
		EnDeGUI.winY = y;
		break;
	}
	bux = null;
	return false;
}; // help

this.code       = function(src) {
//#? return text with line numbers, take care for HTM Entities
	// generate line numbers
	var bux = src;
	var ccc = '';
	var kkk = bux.match(/\n/g);
	if (kkk===null) {  // defensive programming, otherwise we may get "no properties"
		kkk = 1;
	} else {
		kkk = kkk.length;
	}
	for (var i=1; i<=kkk; i++) { ccc += i + '\n'; }
	// colourize
	if (EnDeGUI.colour===false) { // ToDo: should be a parameter
		kkk = EnDe.Text.Entity(bux);
	} else {
		if (bux[bux.length-1] != '\n') { bux += '\n'; }// add missing newline
		kkk = new JsColorizer();
		kkk.s = EnDe.Text.Entity0(bux);
		bux = kkk.colorize();
		bux = bux.replace(/<font\s+/gi, '<font@@@@@'); // escape colourized data
		bux = bux.replace(/( |\t)/g, '&#160;');
		bux = bux.replace(/<font@@@@@/gi, '<font ');   // de-escape colourized data
		kkk = bux.replace(/\n/g,'<br>');               // add line break so we can C&P in the generated window (required for Firefox)
	}
	// build HTML content
// ToDo: following works only if we get our .css file in the new window
/*
	bux = ''
		+ '<table class="code">'
		+ '<tr>'
		+ '    <td>' + ccc + '</td>'
		+ '    <td>' + kkk + '</td>'
		+ '</tr></table>';
*/
	bux = ''
		+ '<table cellspacing="0" cellpadding="0" style="font-family:monospace; font-size:12px;width:99%;">'
		+ '<tr>'
		+ '    <td style="padding-right:.5em;width:3em;text-align:right;vertical-align:top;white-space:pre;">' + ccc + '</td>'
		+ '    <td style="padding-left:0.3em;border-left:1px solid #000000;background:#e0e0e0;white-space:pre;">' + kkk + '</td>'
		+ '</tr></table>';
	ccc = null; kkk = null;
	EnDeGUI.cont(bux);
	bux = null;
	return false;
}; // code

this.guess      = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
//#? create new browser window with given results of en-/decodings as content
// type is 'EN\tguess:\ta description' followed by tab seperated list of items
//#type? EN:  call encoding functions given in item
//#type? DE:  call decoding functions given in item
	_dpr('EnDeGUI.guess(' + type + ')');
	var bux ='';
	var bbb ='';
	var kkk = type.split('@');
	var ccc = kkk.shift();  // 1'st one is type
	          kkk.shift();  // 2'nd one is 'guess:', remove it
	var lbl = kkk.shift();  // 3'rd one is button label
	var dsc = kkk.shift();  // 4'th one is description
			  // all others are types to be called
	// ToDo: use inline style 'cause generated window dos not include EnDe.css
	//_spr('EnDeGUI.guess: '+lbl);
    /*
	 * ToDo: the "show payloads only" buttion is a quick&dirty implementation
	 * Reasons: it's not simple to write a script function inside the generated
	 * HTML; it's also difficult to use strings inside the code, hence we use
	 * String.fromCharCode() to generate strings.
	 * We also cannot access EnDeGUI.info() as it is not included, hence there
	 * is a simple alert() only.
     */
	// ToDo: rewrite complete code, use DOM objects insted of HTML
	bux = '<style type="text/css">'
		+ '.labeled         { font-family:monospace; font-size:10pt; border-collapse:collapse; }'
		+ '.labeled caption { min-width:50em; font-weight:bold; text-align:left; background:#c0c0c0; }'
		+ '.labeled tr      { background:#ffffff; }'
		+ '.labeled tr:hover{ background:#7b8abd; }'
		+ '.labeled th      { min-width:5em;  font-weight:bold; text-align:right; }'
		+ '.labeled td      { min-width:50em; }'
		+ '.labeled td.src  { background:#ffffcf; }'
		+ '</style>'
		+ '<button id="EnDeDOM.guess.gen.do" onclick="tds=document.getElementsByTagName(String.fromCharCode(116,100));b=String.fromCharCode(32);for(k=0;k<tds.length;k++){b+=tds[k].innerHTML+String.fromCharCode(10);};alert(b);">show payloads only</button>'
		+ '<table class="labeled" id="EnDeDOM.guess.gen">'
		+ '<caption title="' +dsc+ '">#----------  '  + EnDe.EN.ncr('dez','strict',true,lbl,'',';','') + '  ----------#</caption>'
		+ '<tr><th>&#160;</th><td class="src">'       + EnDe.EN.ncr('dez','strict',true,src,'',';','') + '</td></tr>'
		+ '<tr><th>&#160;</th><td><hr></td></tr>'
		;
	while ((bbb = kkk.shift())!==undefined) {   // loop over given items
		if (bbb.match(/(md|sha).*raw$/)!==null) { continue; } // ToDo: ignore raw data for now
		if (bbb.match(/(_serial|JChar|ASCIIBr|dotBr|DadaUrka)$/)!==null) { continue; } // ToDo: produces alert (7/2009)
		bux += '<tr><th>' + EnDe.EN.ncr('dez','strict',true,bbb,'',';','') + ':</th><td>';
		// ToDo: we only get the internal items (from kkk), no human readable label or description
		try {
		switch (ccc) {
		  case 'EN': bux += EnDe.EN.ncr('dez','strict',true,
								EnDe.EN.dispatch(bbb,mode,uppercase,src,prefix,suffix,delimiter),
								'',';',''); break;
		  case 'DE': bux += EnDe.EN.ncr('dez','strict',true,
								EnDe.DE.dispatch(bbb,mode,uppercase,src,prefix,suffix,delimiter),
								'',';',''); break;
		}
		} catch(e) { EnDeGUI.alert('EnDeGUI.guess('+bbb+'):\n',e); }
		bux += '</td></tr>';
	}
	if ((type.split('@')[2]==='ALL') || (type.match(/base64/)!==null)) {  // following ugly code but result looks nice ;-)
		// base64 guesses // ToDo: implement other Base64 decodings
		if (type.split('@')[0]==='DE') {
			ccc = 0;
			for (ccc=0; ccc<=8; ccc++) {
				if (ccc>src.length) { break; }
				bux += '<tr><th title="starting at position ' + ccc + '">base64[' + ccc + '..]:</th><td>'
					+      EnDe.B64.DE.b64(src.substring(ccc))
					+  '</td></tr>';
			}
		} // DEcoding only
		// UCS BOM checks
		var box = '';
		bux += '<tr><th>check BOM:</th><td><table border="1">';
		kkk = new Array( 'UTF32BE', 'UTF32LE', 'UTF16BE', 'UTF16LE', 'UTF8');
		while ((ccc=kkk.shift())!==undefined) {
			//if (ccc==='indexOf') { continue; }
			bbb = EnDe.UCS.isBOM(ccc,src.substring(0,8));
			box =  '<tr><th>' + ccc + '</th><td>[' + (bbb===true ? 'x]' : ' ]');
			switch (ccc) {
			  case 'UTF32BE'  : bux += box + ' UTF-32 big-endian';    break;
			  case 'UTF32LE'  : bux += box + ' UTF-32 little-endian'; break;
			  case 'UTF16BE'  : bux += box + ' UTF-16 big-endian';    break;
			  case 'UTF16LE'  : bux += box + ' UTF-16 little-endian'; break;
			  case 'UTF8'     : bux += box + ' UTF-8';                break;
			  default         : EnDe.alert('EnDeGUI.DE.guess',"unknown '"+ccc+"'"); break;
			}
			bux += '</td></tr>';
			box = null;
		}
		bux += '</table>';
		// type checks
		bux += '<tr><th>check type:</th><td><table border="1">'
			+  '<tr><th>isBin:</th><td> [' + (EnDe.isBin(src)===true ? 'x]' : ' ]') + '</td></tr>'
			+  '<tr><th>isOct:</th><td> [' + (EnDe.isOct(src)===true ? 'x]' : ' ]') + '</td></tr>'
			+  '<tr><th>isInt:</th><td> [' + (EnDe.isInt(src)===true ? 'x]' : ' ]') + '</td></tr>'
			+  '<tr><th>isHex:</th><td> [' + (EnDe.isHex(src)===true ? 'x]' : ' ]') + '</td></tr>'
			+  '<tr><th>isB64:</th><td> [' + (EnDe.isB64(src)===true ? 'x]' : ' ]') + '</td></tr>'
			+  '<tr><th>isU64:</th><td> [' + (EnDe.isU64(src)===true ? 'x]' : ' ]') + '</td></tr>'
			+  '</table>'
			+  '</td></tr>';
		bux += '<tr><th>Checksums:</th><td>' + EnDe.User.Check.guess(src) + '</td></tr>';
	} // ALL only
	bux += '</table>';
	EnDeGUI.info( 'guess: ' + lbl, bux );
	bux = null; bbb = null; ccc = null; kkk = null;
	return false;
}; // guess

	// ===================================================================== //
	// object manipulation methods                                           //
	// ===================================================================== //

this.copyValue  = function(from, to) {
//#? copy value from from.value to to.value; from and to are tag ids
	$(to).value = $(from).value;
};

this.copy       = function(txt) {
//#? Create new browser window for copying data between input fields.
	/* txt unused .. */
// ToDo: replace hardcode HTML by DOM objects
	// NOTE: cannot use $() as we are in another window, probably ...
	_spr('EnDeGUI.copy: '+txt);
	var win = window.open('', 'Shuffle','resizable=yes,scrollbars=yes,innerHeight=830,innerWidth=430,width=430,height=830,status=no,menubar=no,toolbar=no,location=no,dependent=yes');
	    win.EnDeGUI = EnDeGUI; // handover functions and object to new window
	    win.title   = 'Shuffle ..'; // ToDo: does not work :-(
	// prepare function to get value from created SELECT menu in new window
	var bbb = "document.getElementById('EnDeDOM.CP.from').value"; // no $() here!
	var ccc = "document.getElementById('EnDeDOM.CP.to').value";   // no $() here!
	var k = 0;
	var bux  = document.createElement('H4');
	bux.textContent  = 'Copy text .. ** experimental **';
	win.document.body.appendChild(bux);
	bux  = document.createElement('DIV');
	bux.textContent  = 'Celect an object in left and right menu, then use one of the buttons to copy text from one object toanother<br>';
	win.document.body.appendChild(bux);
	// create buttons in new window which use above value and pass them to EnDeGUI.copyValue()
	// Note that EnDeGUI.copyValue() is a function in the calling window !
	bux  = document.createElement('BUTTON');
	bux.style.width = '13em';
	bux.setAttribute('onClick', 'EnDeGUI.copyValue(' + ccc + ',' + bbb + ');');
	bux.textContent = 'copy to here <';
	win.document.body.appendChild(bux);
	bux  = document.createElement('BUTTON');
	bux.style.width = '13em';
	bux.setAttribute('onClick', 'EnDeGUI.copyValue(' + bbb + ',' + ccc + ');');
	bux.textContent = 'copy to here >';
	win.document.body.appendChild(bux);
	bbb = null;
	ccc = [];
	// collect all input and textarea fileds
	var kkk = document.getElementsByTagName('input');
	for (k=0; k<kkk.length; k++) {
		bbb = kkk[k].getAttribute('id');
		if ((bbb != null) && (kkk[k].getAttribute('type') == 'text')) {
			ccc.push(kkk[k].getAttribute('id').toString());
		}
	}
	kkk = document.getElementsByTagName('textarea');
	for (k=0; k<kkk.length; k++) {
		bbb = kkk[k].getAttribute('id');
		if (bbb != null) {
			ccc.push(kkk[k].getAttribute('id').toString());
		}
	}
	ccc = ccc.sort();
//#dbx	for (k=0; k<ccc.length; k++) { bux += ccc[k] + '<br>'; }

	// create 2 SELECT menus
	var select = null;
	var group  = null;
	var option = null;
	var last   = '--';
	select = document.createElement('SELECT');
	select.setAttribute('caption', 'from');
	select.setAttribute('id', 'EnDeDOM.CP.from');
	if (EnDeGUI.onClick===true) {
		select.setAttribute('onClick',  'EnDeGUI.dashed(this.value)');
	} else { // Konqueror
		select.setAttribute('onChange', 'EnDeGUI.dashed(this.value)');
	}

// ToDo: add windows
/* ====================
		group = document.createElement('OPTGROUP');
		group.setAttribute('label', 'Windows');
		select.appendChild(group);

		option = document.createElement('OPTION');
		option.value = 'guess';
		option.text  = 'guess';
		group.appendChild(option);
// ====================
*/

	select.setAttribute('size','45');
	for (k=0; k<ccc.length; k++) {
		if (ccc[k].match(/EnDeDOM\.MP/) !==null) { continue; } // don't need that
		if (ccc[k].match(/EnDeDOM\.DBX/)!==null) { continue; } // don't need that
		var id = '';
		if (ccc[k].lastIndexOf('.') <= 0) {
			id = ccc[k];
		} else {
			id = ccc[k].substring(0, ccc[k].lastIndexOf('.'));
		}
		if (last != id) {
			group = document.createElement('OPTGROUP');
			group.setAttribute('label', id);
			select.appendChild(group);
		}
		option = document.createElement('OPTION');
		option.value = ccc[k];
		option.text  = ccc[k];
		//option.setAttribute('onmouseover',  'EnDeGUI.dashed(this.value)');
		//option.setAttribute('onmouseout',   'EnDeGUI.dashed(this.value)');
		//option.title = '-- title --';
		group.appendChild(option);
		last = id;
	}
	while ((id=ccc.pop())!=null) {} // ToDo: replace above for with this while
	last = null; id = null;

	// add HTML and to new window
	//win.document.body.innerHTML = bux;
	win.document.body.appendChild(select);
	select = select.cloneNode(true);
	select.setAttribute('id', 'EnDeDOM.CP.to');
	win.document.body.appendChild(select);
	win.focus();
	select = null; group = null; option = null;
	k   = null;
	ccc = null;
	kkk = null;
	bbb = null;
	bux = null;
	return false;
}; // copy

this.data       = function(btn,obj) {
//#? VIEW dispatcher for various data conversions (Text <--> Hex <--> parsed)
	_spr('EnDeGUI.data(' + btn.id + ', ' + obj + ')');
	/*
	 * Uses the given button object to identify source and target of conversion.
	 */
	var hbg = $(obj + '.isHex').style.backgroundColor;
	var tbg = $(obj + '.isTxt').style.backgroundColor;
	var ubg = $(obj + '.isURI').style.backgroundColor;
	var hst = $(obj + '.isHex').getAttribute('class');
	var tst = $(obj + '.isTxt').getAttribute('class');
	var ust = $(obj + '.isURI').getAttribute('class');
// ToDo: some browsers have problems background if the class attribute is changed
//       so we change style.backgroundColor here also (see *bg variables)
// ToDo: some browsers have problems setting style.backgroundColor for hidden elements
//       so we hardcode the colour if missing
	if (tbg==='') { tbg = '#ffffcf'; }
	if (hbg==='') { hbg = '#e0e0e0'; }
	if (ubg==='') { ubg = '#e0e0e0'; }
	if (tst==='') { tst = 'tab'; }
	if (hst==='') { hst = 'bat'; }
	if (ust==='') { ust = 'bat'; }
	var h_c = $(obj + '.isHex').checked;
	var t_c = $(obj + '.isTxt').checked;
	var u_c = $(obj + '.isURI').checked;
	var cur = $(obj + '.isMem').value;      // contains current active mode
	var src = $(obj + '.text').value;
	switch (btn.id.split('.').pop()) { // convert to ...
	case 'isTxt':
		switch (cur) {  // convert from ...
		case 'isTxt':
			return false;
			break;
		case 'isURI':
			if ((obj==='EnDeDOM.FF') || (obj==='EnDeDOM.RE')) {
				// remove leading whitspaces and \n
				if (obj==='EnDeDOM.FF') {
					//src = src.replace(/(?<!\*\/)\n\s*/g,'');
					/* as most JavaScript implementations have no negative lookbehind
					 * we need to use a 3-pass method to beautify JavaScript comments
					 */
					src = src.replace(/\*\/\n/g,'@@was-end-of-comment@@');
					src = src.replace(/\n\s*/g,'');
					src = src.replace(/@@was-end-of-comment@@/g, '*/\n');
				} else { // RegEx are simpler
					src = src.replace(/\n\s*/g,'');
				}
				$(obj + '.text').value = src;
				//$(obj + '.text').value = src.replace(/\n/g,'');
			} else {
				// else we assume that we have something like a beautified URI
				src = EnDe.join('key',0,false,src,'','','');
				$(obj + '.text').value = EnDe.join('arg',0,false,src,'','','');
			}
			t_c = u_c;
			u_c = h_c;
			tbg = ubg;
			ubg = hbg;
			tst = ust;
			ust = hst;
			break;
		case 'isHex':
			$(obj + '.text').value = EnDe.DE.dmp('hex','strict',false,$(obj + '.text').value,'','',' ');
			t_c = h_c;
			h_c = u_c;
			tbg = hbg;
			hbg = ubg;
			tst = hst;
			hst = ust;
			break;
		default:
			EnDeGUI.alert('EnDeGUI.data','unknown source '+cur);
			return false;
			break;
		}
		break;
	case 'isHex':
		switch (cur) {  // convert from ...
		case 'isHex':
			return false;
			break;
		case 'isTxt':
			$(obj + '.text').value = EnDe.EN.dmp('hex','strict',false,$(obj + '.text').value,'','',' ');
			h_c = t_c;
			t_c = u_c;
			hbg = tbg;
			tbg = ubg;
			hst = tst;
			tst = ust;
			break;
		case 'isURI':
			// cannot convert "parsed" to "Hex" directly
			EnDeGUI.data($(obj + '.isTxt'), obj);
			EnDeGUI.data(btn, obj);
			return false;
			break;
		default:
			EnDeGUI.alert('EnDeGUI.data','unknown source '+cur);
			return false;
			break;
		}
		break;
	case 'isURI':
		switch (cur) {  // convert from ...
		case 'isURI':
			return false;
			break;
		case 'isTxt':
			if (obj==='EnDeDOM.FF') {
				// Functions have a special parser
				$(obj + '.text').value = EnDeGUI.FF.parse($(obj + '.text').value);
			} else {
				if (obj==='EnDeDOM.RE') {
					// RegEx have a special parser too
					$(obj + '.text').value = EnDeGUI.RE.parse($(obj + '.text').value);
				} else {
					// else we assume something like an URI
					src = EnDe.split('arg',0,false,src,'','','');
/*
					if (EnDeGUI.isOpera===true) { // Opera use \r\n, don't know why ...
						src = src.replace(/\r\n/g, '\n'); // .. but does not work as expected
					}
*/
					$(obj + '.text').value = EnDe.split('key',0,false,src,'','','');
				}
			}
			u_c = t_c;
			t_c = h_c;
			ubg = tbg;
			tbg = hbg;
			ust = tst;
			tst = hst;
			break;
		case 'isHex':
			// cannot convert "Hex" to "parsed" directly
			EnDeGUI.data($(obj + '.isTxt'), obj);
			EnDeGUI.data(btn, obj);
			return false;
			break;
		default:
			EnDeGUI.alert('EnDeGUI.data','unknown source '+cur);
			return false;
			break;
		}
		break;
	}
	$(obj + '.isMem').value = btn.id.split('.').pop();
	$(obj + '.isHex').setAttribute('class', hst);
	$(obj + '.isTxt').setAttribute('class', tst);
	$(obj + '.isURI').setAttribute('class', ust);
	$(obj + '.isHex').style.backgroundColor = hbg;
	$(obj + '.isTxt').style.backgroundColor = tbg;
	$(obj + '.isURI').style.backgroundColor = ubg;
	$(obj + '.isHex').checked = h_c;
	$(obj + '.isTxt').checked = t_c;
	$(obj + '.isURI').checked = u_c;
	return false;
}; // data

this.display    = function(id) {
//#? toggle style.display from block to none and vice versa
	_dpr('EnDeGUI.display: id="' + id + '"');
	var obj = null;
	if (typeof(id) == 'object') {
		obj = id;
	} else { // lazy, assume a string
		obj = $(id);
	}
	if (obj.style.display=='') { obj.style.display = 'block'; } // ToDo: ugly workaround :-(
	obj.style.display = (obj.style.display=='block') ? 'none' : 'block';
	obj = null;
}; // display

this.visible    = function(id) {
//#? toggle style.visibility from visible to hidden and vice versa
	var obj = null;
	if (typeof(id) == 'object') {
		obj = id;
	} else { // lazy, assume a string
		obj = $(id);
	}
	switch (obj.style.visibility) {
	  case 'hidden' : obj.style.visibility = 'visible'; break;
	  case 'visible': obj.style.visibility = 'hidden';  break;
	}
	if (obj.style.visibility == '') { obj.style.visibility = 'visible'; }
	obj = null;
}; // visible

this.highlight  = function(id) {
//#? toggle highlight of specified object
	var obj = null;
	if (typeof(id) == 'object') {
		obj = id;
	} else { // lazy, assume a string
		obj = $(id);
	}
	if ($('EnDeDOM.body').style.display!=='block') {
		$('EnDeDOM.body').style.display = 'block';
		//$('EnDeDOM.body').setAttribute('background-image', 'url(img/overlay.png)');
		obj.style.zIndex = '98';
	} else {
		obj.style.zIndex = '1';
		$('EnDeDOM.body').style.display = 'none';
	}
	obj = null;
	return; // ToDo: NOT YET IMPLEMENTED
}; // highlight

this.dashed     = function(id) {
//#? toggle style.borderStyle from inset to dashed and vice versa
	_dpr('EnDeGUI.dashed: id="' + id + '"');
	var obj = null;
	if (typeof(id) == 'object') {
		obj = id;
	} else { // lazy, assume a string
		obj = $(id);
	}
	// borderStyle may return something like 'inset inset inset inset', hence the match()
	if (obj.style.borderStyle.toString().match(/(inset|dashed)/)===null) { // ToDo: ugly workaround :-(
		obj.style.borderStyle = 'inset';
	}
	obj.style.borderStyle = (obj.style.borderStyle.toString().match(/inset/)===null) ? 'inset' : 'dashed';
	obj = null;
}; // dashed

this.checked    = function(id) {
//#? toggle checked value
	_dpr('EnDeGUI.checked: id="' + id + '"');
	var obj = null;
	if (typeof(id) == 'object') {
		obj = id;
	} else { // lazy, assume a string
		obj = $(id);
	}
	obj.checked =! obj.checked;
	obj = null;
	return false;
}; // checked


this.stackmode  = false;
this.show       = function(src) {
//#? dispatcher to toggle visibility of tools
	// src must be a DOM object where the parent object will be toggled
	_spr('EnDeGUI.show(' + src.id + ')');
	var obj = null;
	var ccc = '';
	switch(src.id) {
		/*
		 * inset windows are special, as they are called with their own button
		 */
	  case 'EnDeDOM.QQ.bq': // close button in window
	  case 'EnDeDOM.GUI.QQ':// Browser Quirks button
		this.display('EnDeDOM.f.QQ');
		return false; // no more changes
		break;
	  case 'EnDeDOM.MP.bq': // close button in window
	  case 'EnDeDOM.GUI.MP':// Replace Map button
		this.display('EnDeDOM.f.MP');
		return false; // no more changes
		break;
	  case 'EnDeDOM.FF.bq': // close button in window
	  case 'EnDeDOM.GUI.FF':// Function button
		this.display('EnDeDOM.f.FF');
		obj = $('EnDeDOM.f.FF');
		if (obj.style.display==='block') {
			this.stackmode    = true;
			$('EnDeDOM.f.EDO').style.display= 'block';
			$('EnDeDOM.f.EN').style.display = 'block';
			$('EnDeDOM.f.DE').style.display = 'block';
		} else {
			this.stackmode    = false;
		}
		return false; // no more changes
		break;
	  case 'EnDeDOM.GUI.qq':
	  case 'EnDeDOM.GUI.QB':
		obj = $('EnDeDOM.GUI.QB'); // /(quick|head){2}/ below does not work in some JavaScript RegEx :-((
		ccc = (obj.getAttribute('class').match(/(quick\s*head|head\s*quick)/)!==null) ? 'head' : 'quick head';
		obj.className = ccc;
		obj.setAttribute('class', ccc);
		obj = $('EnDeDOM.GUI.qq');
		obj = null;
		break;
		/*
		 * Status Bar is special, has no close button
		 */
	  case 'EnDeDOM.GUI.SB':
		this.display($('EnDeDOM.SB'));
		return false; // no more changes
		break;
	  case 'EnDeDOM.SB.bp':
		// toggle staus bar position: top or bottom
		src = $('EnDeDOM.SB'); // ToDo: quick&dirty use of hardcoded id
		if (src.style.top != '') {
			src.style.top    = '';
			src.style.bottom = '0px';
		} else {
			src.style.top    = '0px';
			src.style.bottom = '';
		}
		src = $('EnDeDOM.SB.bp');   // this button needs a new label
		break;
	  case 'EnDeDOM.ED.bq':
		/* we have 2 form tags here, each surrounded by a fieldset
		 * we want to hide both fieldsets completely, not just forms
		 */
		this.display('EnDeDOM.f.EDO');
		this.display('EnDeDOM.f.EN');
		this.display('EnDeDOM.f.DE');
		break;
	  default   :
		if (src===null) { // lazy try
			_dpr('EnDeGUI.show: lazy: '+src);
			src = 'EnDeDOM.' + src;
		}
		this.display(src.id.replace(/\.[a-zA-Z0-9-]*$/,'')); // remove button id, then we should have correct object
		break;
	}
	/*
	 * now toggle button text
	 */
	if ($(src)===null) {
		switch ($(src.id).innerHTML) {
		  case '-':   $(src.id).innerHTML = '+';    break;
		  case '+':   $(src.id).innerHTML = '-';    break;
		  case '^':   $(src.id).innerHTML = 'v';    break;
		  case 'v':   $(src.id).innerHTML = '^';    break;
		  case 'x':   $(src.id).innerHTML = 'fix';  break;
		  case 'fix': $(src.id).innerHTML = 'x';    break;
		}
	}
	return false;
}; // show

	// ===================================================================== //
	// online/onlite demo functions **experimental**                         //
	// ===================================================================== //

this.demo       = new function() {
  this.sid      = function() { return(EnDeGUI.sid() + '.demo'); };

  this.getX     = function (obj) {
	var bux = 0;
	while (typeof(obj)==='object') {
		bux += obj.offsetLeft;
		obj  = obj.offsetParent;
		if (obj===null ) { break; }
		if (obj.tagName.match(/^BODY$/i)!==null ) { break; } // lazy check
	}
	return bux;
  }; // getX

  this.getY     = function (obj) {
	var bux = 0;
	while (typeof(obj)==='object') {
		bux += obj.offsetTop;
		obj  = obj.offsetParent;
		if (obj===null ) { break; }
		if (obj.tagName.match(/^BODY$/i)!==null ) { break; } // lazy check
	}
	return bux;
  }; // getY

  this.click    = function(obj) {
  //#? click specified object
	var bux = obj.ownerDocument.createEvent('MouseEvents');
	bux.initMouseEvent('click', false, true, obj.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	obj.dispatchEvent(bux);
	EnDeGUI.dashed($(obj.id.replace(/\.[a.zA-Z0-9_-]+\.[a.zA-Z0-9_-]+$/,'')));
//alert('click: '+obj.id);
	bux = null;
  }; // click

  this.value    = function(obj,src,img) {
  //#? set value for specified object
	obj.focus();
	EnDeGUI.dashed(obj);
	if (src!==null) { obj.value = src; }
	img.style.left = this.getX(obj) - img.width + 'px';
	img.style.top  = this.getY(obj) - (img.height/2) + 'px';
alert(' continue');
	EnDeGUI.dashed(obj);
	return false;
  }; // value

  this.tool     = function(src) { EnDeGUI.tool('_all_'); };
  //#? wrapper for EnDeGUI.tool()

  this.display  = function(src,arr) {
  //#? set display=block|none for given IDs
	var ccc = 0;
	for (ccc=0; ccc<arr.length; ccc++) { $(arr[ccc]).style.display = src; }
  }; // block

  this.run      = function(src) {
	var left = document.createElement('IMG');
	var up   = document.createElement('IMG');
	left.src = 'img/red-left.png';
	left.id  = 'EnDeDOM.IMG.left';
	left.style.left = '-555px';
	left.style.top  = '-444px';
	left.style.position = 'absolute';
	up.src   = 'img/red-up.png';
	up.id    = 'EnDeDOM.IMG.up';
	up.style.left   = '-555px';
	up.style.top    = '-444px';
	$('EnDeDOM.hide').appendChild(left);
	$('EnDeDOM.hide').appendChild(up);
	var obj = null;
// ToDo: need a more straight forward and automatic solution for following switch()
	switch (src) {
	  case '_all_': // default view
		this.tool('_all_'); // ToDo: does not work, reason unknown, hence following ...
		this.display('block', ['EnDeDOM.EN', 'EnDeDOM.DE', 'EnDeDOM.IP', 'EnDeDOM.TS', 'EnDeDOM.RE']);
		break;
	  case 'TOOLS':
		// completely hide
		this.display( 'none', ['EnDeDOM.f.DBX', 'EnDeDOM.f.TST', 'EnDeDOM.f.GUI', 'EnDeDOM.f.API']);
		// hide content, but show header
		this.display( 'none', ['EnDeDOM.EN', 'EnDeDOM.DE', 'EnDeDOM.IP', 'EnDeDOM.TS', 'EnDeDOM.RE', 'EnDeDOM.CH']);
		break;
	  case 'FUNCTIONS':
		this.display( 'none', ['EnDeDOM.f.DBX', 'EnDeDOM.f.TST', 'EnDeDOM.f.GUI', 'EnDeDOM.f.API']);
		EnDeGUI.show($('EnDeDOM.FF.bq'));
		break;
	  case 'API_OPTIONS':
		// completely hide
		this.display( 'none', ['EnDeDOM.f.DBX', 'EnDeDOM.f.TST', 'EnDeDOM.f.API', 'EnDeDOM.f.GUI']);
		// hide content
		this.display( 'none', ['EnDeDOM.f.EDO', 'EnDeDOM.f.EN', 'EnDeDOM.f.DE', 'EnDeDOM.f.IP', 'EnDeDOM.f.TS', 'EnDeDOM.f.RE', 'EnDeDOM.f.CH']);
		EnDeGUI.show($('EnDeDOM.API.bq'));
		break;
	  case 'GUI_OPTIONS':
		// completely hide
		this.display( 'none', ['EnDeDOM.f.DBX', 'EnDeDOM.f.TST', 'EnDeDOM.f.API', 'EnDeDOM.f.GUI']);
		// hide content
		this.display( 'none', ['EnDeDOM.f.EDO', 'EnDeDOM.f.EN', 'EnDeDOM.f.DE', 'EnDeDOM.f.IP', 'EnDeDOM.f.TS', 'EnDeDOM.f.RE', 'EnDeDOM.f.CH']);
		EnDeGUI.show($('EnDeDOM.CH.bq'));
		break;
	  case 'REPLACE_MAP':
		this.display( 'none', ['EnDeDOM.f.DBX', 'EnDeDOM.f.TST', 'EnDeDOM.f.GUI', 'EnDeDOM.f.API']);
		EnDeGUI.show($('EnDeDOM.MP.bq'));
		break;
	  case 0:   // reset fields
		$('EnDeDOM.EN.text')= '';
		$('EnDeDOM.DE.text')= '';
		break;
	  case 2:
		this.value($('EnDeDOM.API.prefix'), '%u00', left);
		// no break;
	  case 1:
		this.value($('EnDeDOM.API.delimiter'), ',', left);
		this.value($('EnDeDOM.EN.text'), 'ein sch\xf6ner Text', left);
		//setTimeout("(function(a){EnDeGUI.demo.value($('EnDeDOM.API.delimiter'), ',');})()",2000);
		//setTimeout("(function(a){EnDeGUI.demo.value($('EnDeDOM.EN.text'), 'ein schöner Text');})()",4000);
		obj = $('EnDeDOM.EN.Actions.s.urlHEX');
		obj.focus();    // does not work as UL>LI>A is triggerd by MouseOver
		this.click(obj);// click on Anchor
		this.value($('EnDeDOM.DE.text'), null, left);
		break;
	}
	left.style.left = '-555px';
	left.style.top  = '-555px';
	up.style.left   = '-555px';
	up.style.top    = '-555px';
  }; // run
}; // demo

	// ===================================================================== //
	// special objects for menus from .xml and .txt files                    //
	// ===================================================================== //

this.opts   = new Array(); // used by EnDeGUI.preset()
	// this array will be generated while reading .xml file by EnDe.User.file
	/* the generated array looks as follows:
	 * ---------------+-------+-------+-------+-------+-------+-------+----
	 *   option        size    upper   ishex   prefix  suffix delimiter key
	 * ---------------+-------+-------+-------+-------+-------+-------+---- */
this.opts['MxSQL_1'] = [ '1',  false,  false,  'CHAR(',')',    '+',    null ];
	/* ---------------+-------+-------+-------+-------+-------+-------+---- */
this.optLen =            0;
this.optCas =                    1;
this.optHex =                            2;
this.optPre =                                    3;
this.optSuf =                                            4;
this.optDel =                                                    5;
this.optKey =                                                            6;

	// ===================================================================== //
	// Mozilla privilege Manager                                             //
	// ===================================================================== //

this.setPriv    = function(src) {
//#? set browser privileges
	/* for details see:
	 * http://www.mozilla.org/projects/security/components/signed-script-example.html
	 */
	/* following is a user-friendly verbose message only, catched later anyway
	if (document.location.protocol.match(/file:/)===null) {
		EnDeGUI.alert('EnDeGUI.setPriv', "privileges can be set when used with 'file://' only; file read failed");
		return false;
	}
	*/
	if (!netscape.security.PrivilegeManager.enablePrivilege) {    return false; }
	try {netscape.security.PrivilegeManager.enablePrivilege(src); return true;  }
	catch(e) { EnDeGUI.alert('EnDeGUI.setPriv', e); return false; }
	return false;
}; // setPriv

	// ===================================================================== //
	// Callback functions to modify input fields                             //
	// ===================================================================== //

this.tour       = function(src) {
//#? dispatcher for demo tour through EnDe
	this.demo.run( 2 );
	return false;
}; // tour

this.showFiles  = function() {
//#? show list of loaded files
	var i = 0;
	_dpr(EnDe.File.list[0].join(''));
	_dpr(EnDe.File.list[1].join(''));
	for (i=2; i<EnDe.File.list.length; i++) { _dpr(EnDe.File.list[i].join('\t')); }
	_dpr(EnDe.File.list[1].join(''));
	return false;
}; // showFiles

this.showIds    = function() {
//#? check for duplicate tag id attributes
	var bbb = null;
	var ccc = document.getElementsByTagName("*");   // get all tags
	var kkk = [];
	for (bbb=0; bbb<ccc.length; bbb++) {
		if (ccc[bbb].hasAttribute('id')===true) {
			kkk.push(ccc[bbb].id);
		}
	}
	ccc = [];
	kkk.sort();
	for (bbb=1; bbb<kkk.length; bbb++) {
		if (kkk[bbb]==='') { continue; }
		if (kkk[bbb]===kkk[bbb-1]) { ccc.push(kkk[bbb]); continue; }
	}
	_dpr('##{ EnDeGUI.showIds: duplicate tag IDs:');
	_dpr(ccc.join(', '));
	_dpr('##}');
	if (ccc.length>0) { alert(ccc.length + ' duplicate IDs found, see trace for details'); }
	while(kkk.pop()){};
	while(ccc.pop()){};
	bbb = null;
	return false;
}; // showIds

this.getSIDs    = function() {
//#? get defined SIDs
	var bbb = null;
	var ccc = [];
	var bux = '';
	var kkk = [
		'EnDe',
		'EnDe.Blowfish',
		'EnDe.Check',
		'EnDe.B64',
		'EnDe.CRC',
		'EnDe.AES',
		'EnDe.MD4',
		'EnDe.MD5',
		'EnDe.RMD',
		'EnDe.SHA',
		'EnDe.SHA5',
		'EnDe.UCS',
		'EnDe.IP',
		'EnDe.TS',
		'EnDe.File',
		'EnDe.Form',
//		'EnDe.HTTP',   // may force **ERROR: wrong (internal) variable because EnDeHTTP.js is not included
//		'EnDe.Man',    // may force **ERROR: wrong (internal) variable because EnDe.man.html is not included
		'EnDe.Maps',
		'EnDe.Test',
		'EnDe.Text',
		'EnDe.User',
		'EnDeGUI',
		'EnDeGUIx',
		'EnDeRE',
		'EnDeREGUI',
		'EnDeREMap'
		];
	var kkk_in_text_files = [
		'EnDeFunc'
		];
	var sids= [];
	for (bbb in kkk) {
		/* Using eval like
		 *	_dpr( kkk[bbb] + '\t' + eval(kkk[bbb]) );
		 * would be the simplest solution, but we don't like evil eval which
		 * would rely on the strings (JavaScript code) given in files.  Even
		 * the likelyhood that the code is malicious is low  (as you need to
		 * hack yourself), we use a more cumbersome way with top[] .
		 */
		try { // need try..catch as top[] may fail due to wrong variable in kkk[]
			ccc = kkk[bbb].split('.');
			switch (ccc.length) {
			  case 1:   bux = top[ kkk[bbb] ][ 'SID' ];                    break;
			  case 2:   bux = top[ ccc[0] ][ ccc[1] ][ 'SID' ];            break;
			  case 3:   bux = top[ ccc[0] ][ ccc[1] ][ ccc[2] ][ 'SID' ];  break;
			  default:  bux = '**ERROR: unknown SID length ' + ccc.length; break;
			}
		} catch(e) {
			bux = '**ERROR: wrong (internal) variable: ' + e;
		}
		sids.push( kkk[bbb] + '=' + bux );
	}
	bbb = null;
	/* all loaded .txt or .xml files are in EnDe.File.list; use values from there
	 * ignore files not loaded (but in list)
	 */
	for (bbb=2; bbb<EnDe.File.list.length; bbb++) {
		if (EnDe.File.list[bbb][1]===true) { // list loaded files only
			sids.push( EnDe.File.list[bbb][EnDe.File.listSRC] + '=' + EnDe.File.list[bbb][EnDe.File.listSID] );
		}
	}
	return sids;
}; // getSIDs

this.showSID    = function() {
//#? show defined SIDs
	var bux = this.getSIDs();
	var ccc = [];
	//ccc = '\t';
	//if (kkk[bbb].length<=8) { ccc += '\t'; }
	_dpr( '# file' + '\t\t' + 'SID' );
	_dpr( '#--------------+----------------' );
	while (bbb = bux.pop()) {
		_dpr( bbb.replace(/=/, ' \t' ) );
	}
	_dpr( '#--------------+----------------' );
	return false;
}; // showSID

this.checkupdate= function() {
//#? check versions for update
	var bux = this.getSIDs();   // returns array with object=SID values
	var bbb = '';
	var ccc = [];
	var sid = '';
	var fil = '';
	var obj = document.createElement('script');
// ToDo: nned to be adapted for use with https://github.com/EnDe/EnDe
	obj.src = 'http://ende.my-stp.net/EnDeSIDs.js';
	obj.id  = 'EnDeDOM.SIDs';
	document.getElementsByTagName('head')[0].appendChild(obj);
/* funktioniert auch
	var xhr = XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if ( xhr.readyState == 4 ) {
			obj.text = xhr.responseText;
			document.getElementsByTagName('head')[0].appendChild(obj);
		}
	};
	xhr.open('GET', 'http://ende.my-stp.net/EnDeSIDs.js', true);
	xhr.send('');
*/
	alert ('continue' );    // need this to give browser time to initialize loaded JavaScript
	if (EnDeGUI.SIDs[ 'SID' ]===undefined) {
		_dpr( '**ERROR: checking update "' + obj.src + '" failed' );
		return false;
	}
	bbb = 'http://' + location.host;
	var ccc = 22 - bbb.length - 1;
	while (ccc > 0) { bbb = ' ' + bbb; ccc--; }
	_dpr( '# ' + bbb + ' | ' + obj.src );
	_dpr( '# object        SID     | newest file' );
	_dpr( '#--------------+--------+-------+---------------' );
	while (bbb = bux.pop()) {
		var sep = '|';
		var tab = '\t';
		/*
		 * request returned hash list with filename:SID in EnDeGUI.SIDs
		 * not all filenames are identical to the JavaScript object they define
		 * (see this.getSIDs() above) hence we first check for the the name as
		 * defined in this.getSIDs(), then we replace dots and append .txt and
		 * finally replace .txt by .js
		 */
		ccc = bbb.split('=');
		fil = ccc[0];
		sid = EnDeGUI.SIDs[ fil ];
		if (sid===undefined) {  // some object have special filenames
			fil = fil.replace(/^EnDe\.(Blowfish|CRC|AES|MD4|MD5|RMD|SHA|SHA5)$/, function(c,d){return(d.toLowerCase())}) + '.js';
			fil = fil.replace(/sha5/, 'sha512');
			sid = EnDeGUI.SIDs[ fil ];
		}
		if (sid===undefined) {
			fil = fil.replace(/\.js$/, '');
			fil = fil.replace(/\./, '') + '.txt';
			sid = EnDeGUI.SIDs[ fil ];
		}
		if (sid===undefined) {
			fil = fil.replace(/txt$/, 'js');
			sid = EnDeGUI.SIDs[ fil ];
		}
		if (ccc[0].length < 8) { tab = '\t\t'; }
		if (ccc[1] !== sid) { sep = '<'; }
		_dpr( ccc[0] + tab + ccc[1] + '\t' + sep + ' ' + sid  + '\t ' + fil );
	}
	_dpr( '#--------------+--------+-------+---------------' );
	_dpr( '\nHint: newer files can be dowloaded from https://github.com/EnDe/EnDe' );
	return false;
}; // .checkupdate

this.showArr    = function() {
	var bux = '';
	var bbb = null;
	var ccc = null;
	for (bbb in EnDe) {
		if (((typeof EnDe[bbb]).match(/object/i))===null) { continue; }
		//if (EnDe[bbb].toString().match(/map/i)===null) { continue; }
		_dpr('# ' + typeof EnDe[bbb] + '\tEnDe.' + bbb + ': ' + EnDe[bbb].length + ' #');
try {
		for (ccc=0; ccc<EnDe[bbb].length; ccc++) {
			if (EnDe[bbb][ccc]!==undefined) {
			bux += '[' + ccc + ']\t' + EnDe[bbb][ccc].join(',\t') +'\n';
			}
		}
		_dpr(bux);
		bux = '';
} catch(e){ _dpr('**ERROR '+ e); }
	}
	return false;
}; // showArr

this.showMap    = function() {
//#? show window with various trace/debug information
// ToDo: very ugly code, needs to be more generic
	_spr('EnDeGUI.showMap');
	var win = this.win.help('','trace', '');
	var txt = '';
	var div = document.createElement('SCRIPT');
	var i   = 0;
	win.EnDe= EnDe; // handover functions and object to new window
	div.type= 'text/javascript';
// ToDo: fails for WebKit (<=47905) with: can't find variable _show
	div.innerHTML = 'function _show(id) {var obj=document.getElementById(id);if(obj.style.display==""){obj.style.display="none";}obj.style.display=(obj.style.display=="block")?"none":"block";return false;}';
	win.document.body.appendChild(div);
	//div = document.createElement('STYLE');
	//div.innerText  = 'input { width:60em;}';
	//div.innerHTML  = 'input { width:40em;}';
	win.document.body.appendChild(div);
	div = document.createElement('DIV');
	div.innerHTML  = EnDe.sid()     + '<br />';
	div.innerHTML += '--DEBUG--';
	div.innerHTML += '<br><sup>Note that some values may contain non-printable characters!</sup>';
	win.document.body.appendChild(div);
	div = document.createElement('DIV');
	div.id         = 'dbxmap';
	div.style.border = '1px solid black';

	var bbb = null;
	// quick&dirty as styles are not supported in all browsers
	var ccc = '<style>input {width:37em;}</style>';
	// quick&dirty as tables in the DOM are a nightmare ...
	ccc += '<table ; border="1" cellpadding="0" cellspacing="0" style="display:none" ';

	/*
	 * EnDe constants
	 */
	kkk  = 'EnDe.';
	txt += '<button onClick="return _show(\'_table_EnDe\');">EnDe.</button><br>';	
	txt += ccc + 'id="_table_EnDe"><caption>EnDe.[]</caption>';
	txt += '<tr><th>   name   </th><th> value </th><tr>';
	for (bbb in EnDe) {
		_dpr('# ' + typeof EnDe[bbb] + '\tEnDe.' + bbb + ' #');
		if (bbb == 'pairs')             { continue; }
		if (bbb == 'prototype')         { continue; }
		if (bbb == 'sid')               { continue; }
		if (bbb == 'SID')               { continue; }
		if (bbb.match(/^VER/)!==null)   { continue; }
		if (bbb.match(/Map/) !==null)   { continue; }
		if (EnDe[bbb].toString().match(/function/)!==null) { continue; }
		if (EnDe[bbb].toString().match(/object/)  !==null) { continue; }
try {
} catch(e) {}
		txt += '<tr><td><button id="c_' + bbb + '" onClick="EnDe.'+bbb+'=this.value;" title="set value">' + kkk + bbb + '</button></td>';
		txt += '<td><input name="' + bbb +'" value="' + EnDe[bbb] + '" '
			+ ((bbb.match(/^map/)===null) ? '' : 'disabled')
			+ '></td></tr>';
	}
	kkk  = 'EnDe.pairs[ ';
	for (bbb in EnDe.pairs) {
		if (bbb==='indexOf') { continue; }
		txt += '<tr><td><button id="c_' + bbb + '" onClick="EnDe.pairs['+bbb+']=this.value;" title="set value">' + kkk + bbb + ' ]</button></td>';
		txt += '<td><input name="' + bbb +'" value="' + EnDe.pairs[bbb] + '"></td></tr>';
	}
	txt += '</table><br>';

	/*
	 * some constants (character classes, integer, ...)
	 */
	txt += '<button onClick="return _show(\'_table_CST\');">EnDe.CONST</button><br>';	
 	txt += '<table cellpadding="2" cellspacing="0" style="display:none; border:0" id="_table_CST" ><caption>EnDe.CONST</caption>';
	txt += '<tr><th>   name   </th><th> value </th><tr>';
	kkk  = 'EnDe.CONST.CHR.';
	for (bbb in EnDe.CONST.CHR) {
	// ToDo: bug: parent.EnDe.CONST.CHR[bbb]=this.value not working, inspect DOM
		if (bbb==='prototype') { continue; }
		if (bbb==='sid')       { continue; }
		if (bbb==='SID')       { continue; }
		if (bbb==='meta')      { continue; } // ToDo: bug: fails to display proper without HTML entities, need to substitute first
		txt += '<tr><td><button id="C_' + bbb + '" onClick="EnDe.CONST.CHR['+bbb+']=this.value;" title="set value">' + kkk + bbb + '</button></td>';
		txt +=     '<td><input name="'  + bbb + '" value="' + EnDe.CONST.CHR[bbb] + '"></td></tr>';
	}
	kkk  = 'EnDe.CONST.INT.';
	for (bbb in EnDe.CONST.INT) {
		if (bbb==='prototype') { continue; }
		if (bbb==='sid')       { continue; }
		if (bbb==='SID')       { continue; }
		txt += '<tr><td><button id="I_' + bbb + '" onClick="EnDe.CONST.INT['+bbb+']=this.value;" title="set value">' + kkk + bbb + '</button></td>';
		txt += '<td><input name="' + bbb +'" value="' + EnDe.CONST.INT[bbb] + '"></td></tr>';
	}
	kkk  = 'EnDe.CONST.CST.';
	for (bbb in EnDe.CONST.CST) {
		if (bbb==='prototype') { continue; }
		if (bbb==='sid')       { continue; }
		if (bbb==='SID')       { continue; }
		txt += '<tr><td><button id="c_' + bbb + '" onClick="EnDe.CONST.CST['+bbb+']=this.value;" title="set value">' + kkk + bbb + '</button></td>';
		txt += '<td><input name="' + bbb +'" value="' + EnDe.CONST.CST[bbb] + '"></td></tr>';
	}
	/*
	 * EnDe.B64
	 */
	var _b64 = ['line', 'crnl', 'pad' ];
	for (bbb in _b64) {
		txt += '<tr><td><button id="I_' + _b64[bbb] + '" onClick="EnDe.B64['+_b64[bbb]+']=this.value;" title="set value">EnDe.B64.' + _b64[bbb] + '</button></td>';
		txt += '<td><input name="' + _b64[bbb] +'" value="' + EnDe.B64[_b64[bbb]] + '"></td></tr>';
	}
	kkk  = 'EnDe.B64.map.';
	for (bbb in EnDe.B64.map) {
		if (bbb==='prototype') { continue; }
		if (bbb==='dumm')      { continue; }
		txt += '<tr><td><button id="I_' + bbb + '" onClick="EnDe.B64.map['+bbb+']=this.value;" title="set value">' + kkk + bbb + '</button></td>';
		txt += '<td><input name="' + bbb +'" value="' + EnDe.B64.map[bbb] + '"></td></tr>';
	}
	txt += '</table><br>';


	/*
	 * EnDe.b64Char
	 */
	txt += '<button onClick="return _show(\'_table_b64\');">EnDe.b64</button><br>';	
	txt += ccc + 'id="_table_b64"><caption>EnDe.b64Char[]</caption>';
	txt += '<tr><th>   index   </th><th> b64Char[i] </th><th>&#160;</th><th> b64Code[i] </th><tr>';
	for (i=0; i<EnDe.b64Char.length; i++) {
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.b64Char[i] + '</td><td>&#160;</td><td>' + EnDe.b64Code[EnDe.b64Char[i]] + '</td><tr>';
	}
	txt += '</table>';

	/*
	 * EnDe.xmlMap
	 */
	txt += '<button onClick="return _show(\'_table_xml\');">EnDe.xmlMap</button><br>';	
	txt += ccc + 'id="_table_xml"><caption>EnDe.xmlMap[]</caption>';
	txt += '<tr><th>   index   </th><th> xmlMap[i] </th><tr>';
	for (i in EnDe.xmlMap) {
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.xmlMap[i] + '</td><tr>';
	}
	txt += '</table>';

	/*
	 * EnDe.spaceMap
	 */
	txt += '<button onClick="return _show(\'_table_space\');" title="Unicode Spaces">EnDe.spaceMap</button><br>';	
	txt += ccc + 'id="_table_space"><caption>EnDe.spaceMap[]</caption>';
	txt += '<tr><th>Code<br><sup>not part of map</sup></th><th>   index   </th><th> spaceMap[i] </th><tr>';
	for (i in EnDe.spaceMap) {
		h    = EnDe.i2h('hex4',i);
		txt += '<tr><td>U+' + h + '</td><td>[' + i + ']</td><td>' + EnDe.spaceMap[i] + '</td><tr>';
	}
	txt += '</table>';

	/*
	 * EnDe.asciiMap
	 */
	txt += '<button onClick="return _show(\'_table_asc\');">EnDe.asciiMap</button><br>';
	txt += '<table id="_table_asc" border="1" cellpadding="0" cellspacing="0" style="display:none" ><caption>EnDe.asciiMap[]</caption>';
	txt += '<tr><th>   index   </th><th> asciiMap[mapChr] </th><th> asciiMap[mapDsc] </th><tr>';
	for (i in EnDe.asciiMap) {
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.asciiMap[i][EnDe.mapChr] + '</td><td>' + EnDe.asciiMap[i][EnDe.mapDsc] + '</td><tr>';
	}
	txt += '</table>';

	/*
	 * EnDe.DIN66003Map
	 */
	txt += '<button onClick="return _show(\'_table_din\');">EnDe.DIN66003Map</button><br>';
	txt += '<table id="_table_din" border="1" cellpadding="0" cellspacing="0" style="display:none" ><caption>EnDe.DIN66003Map[]</caption>';
	txt += '<tr><th>   index   </th><th> DIN66003Map[mapChr] </th><th> DIN66003Map[mapDsc] </th><tr>';
	for (i in EnDe.DIN66003Map) {
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.DIN66003Map[i][EnDe.mapChr] + '</td><td>' + EnDe.DIN66003Map[i][EnDe.mapDsc] + '</td><tr>';
	}
	txt += '</table>';

	/*
	 * EnDe.DIN66003fMap
	 */
	txt += '<button onClick="return _show(\'_table_dinf\');">EnDe.DIN66003fMap</button><br>';
	txt += '<table id="_table_dinf" border="1" cellpadding="0" cellspacing="0" style="display:none" ><caption>EnDe.DIN66003fMap[]</caption>';
	txt += '<tr><th>   index   </th><th> &#160; </th><th> DIN66003fMap[mapChr] </th><tr>';
	for (i in EnDe.DIN66003fMap) {
		txt += '<tr><td>[' + i + ']</td><td>&#160;</td><td>' + EnDe.DIN66003fMap[i] + '</td><tr>';
	}
	txt += '</table>';

	/*
	 * EnDe.ebcdicMap
	 */
	txt += '<button onClick="return _show(\'_table_ebs\');">EnDe.ebcdicMap</button><br>';
	txt += '<table id="_table_ebs" border="1" cellpadding="0" cellspacing="0" style="display:none" ><caption>EnDe.ebcdicMap[]</caption>';
	txt += '<tr><th>   index   </th><th> ebcdicMap[mapChr] </th><th> ebcdicMap[mapDsc] </th><tr>';
	for (i in EnDe.ebcdicMap) {
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.ebcdicMap[i][EnDe.mapChr] + '</td><td>' + EnDe.ebcdicMap[i][EnDe.mapDsc] + '</td><tr>';
	}
	txt += '</table>';

	/*
	 * EnDe.romanMap
	 */
	txt += '<button onClick="return _show(\'_table_rom\');">EnDe.romanMap</button><br>';
	txt += '<table id="_table_rom" border="1" cellpadding="0" cellspacing="0" style="display:none" ><caption>EnDe.romanMap[]</caption>';
	txt += '<tr><th>   index   </th><th> romanMap[mapChr] </th><th> romanMap[mapDsc] </th><tr>';
	for (i in EnDe.romanMap) {
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.romanMap[i][EnDe.mapChr] + '</td><td>' + EnDe.romanMap[i][EnDe.mapDsc] + '</td><tr>';
	}
	txt += '</table>';

	/*
	 * EnDe.ebcdicUTF
	 */
	txt += '<button onClick="return _show(\'_table_eut\');">EnDe.ebcdicUTF</button><br>';
	txt += '<table id="_table_eut" border="1" cellpadding="0" cellspacing="0" style="display:none" ><caption>EnDe.ebcdicUTF[]</caption>';
	txt += '<tr><th>   index   </th><th> ebcdicUTF[mapChr] </th><th> ebcdicUTF[mapDsc] </th><tr>';
	for (i in EnDe.ebcdicUTF) {
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.ebcdicUTF[i][EnDe.mapChr] + '</td><td>' + EnDe.ebcdicUTF[i][EnDe.mapDsc] + '</td><tr>';
	}
	txt += '</table>';

	/*
	 * EnDe.dupMap and EnDe.ncrMap ar not displayed as HTML table 'cause of
	 * huge memory consumption and rendering overhead -> performance penulty
	 * instead they are written as tab-seperated text inside a div tag with
	 * white-space:pre (looks like a table, but no borders)
	 */
	/*
	 * EnDe.dupMap
	 */
	txt += '<button onClick="return _show(\'_table_dup\');" title="duplicate entries">EnDe.dupMap</button><br>';
	txt += '<div id="_table_dup" style="display:none" border="1"><center>EnDe.dupMap</center>';
	txt += '<div style="font-family:courier new;font-size:12px;white-space:pre">';
	txt += '<hr>index' + ':' + '\t| no' + '\t|stand.' + '\t|entity' + '\t| class' + '\t| description' + '\n<hr>';
	for (i in EnDe.dupMap) {
		txt += i + ':' + '\t' + EnDe.dupMap[i].toString().replace(/,/g, '\t') + '\n';
	}
	txt += '</div></div>';
	/* EnDe.dupMap   ** not yet shown, too big
	txt += '<table id="_table_dup" border="1" cellpadding="0" cellspacing="0" style="display:none" ><caption>EnDe.dupMap[]</caption>';
	txt += '<tr><th>   index   </th><th> dupMap[mapChr] </th><th> dupMap[mapDsc] </th><tr>';
	for (i in EnDe.dupMap) {
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.dupMap[i][EnDe.mapChr] + '</td><td>' + EnDe.dupMap[i][EnDe.mapDsc] + '</td><tr>';
	}
	txt += '</table>';
	 */

	/*
	 * EnDe.ncrMap
	 */
	txt += '<button onClick="return _show(\'_table_ncr\');" title="named charactere references">EnDe.ncrMap</button><br>';
	txt += '<div id="_table_ncr" style="display:none" border="1"><center>EnDe.ncrMap</center>';
	txt += '<div style="font-family:courier new;font-size:12px;white-space:pre">';
	txt += '<hr> no' + '\t| entity (is index in table)' + '\n<hr>';
	for (i in EnDe.ncrMap) {
		txt += EnDe.ncrMap[i].toString() + '\t' + i + '\n';
	}
	txt += '</div></div>';
	/* EnDe.ncrMap   ** not yet shown, too big
	txt += '<button onClick="return _show(\'_table_ncr\');">EnDe.ncrMap</button><br>';
	txt += '<table id="_table_ncr" border="1" cellpadding="0" cellspacing="0" style="display:none" ><caption>EnDe.ncrMap[]</caption>';
	txt += '<tr><th>   index   </th><th> ncrMap[mapChr] </th><th> ncrMap[mapDsc] </th><tr>';
	for (i in EnDe.ncrMap) {
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.ncrMap[i][EnDe.mapChr] + '</td><td>' + EnDe.ncrMap[i][EnDe.mapDsc] + '</td><tr>';
	}
	txt += '</table>';
	 */

	/*
	 * EnDe.winMap
	 */
	txt += '<button onClick="return _show(\'_table_win\');">EnDe.winMap</button><br>';
	txt += '<table id="_table_win" border="1" cellpadding="0" cellspacing="0" style="display:none" ><caption>EnDe.winMap[]</caption>';
	txt += '<tr><th>   index   </th><th> winMap[mapChr] </th><th> winMap[mapDsc] </th><tr>';
	for (i in EnDe.winMap) {
		if (EnDe.winMap[i][EnDe.mapChr] == undefined) { continue; } // defensive programming
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.winMap[i][EnDe.mapChr] + '</td><td>' + EnDe.winMap[i][EnDe.mapDsc] + '</td><tr>';
	}
	txt += '</table>';

	/*
	 * EnDe.rangeMap
	 */
	txt += '<button onClick="return _show(\'_table_range\');" title="Unicode Code Ranges">EnDe.rangeMap</button><br>';	
	txt += ccc + 'id="_table_range"><caption>EnDe.rangeMap[]</caption>';
	txt += '<tr><th>   index   </th><th> rangeMap[i] </th><tr>';
	for (i in EnDe.rangeMap) {
		txt += '<tr><td>[' + i + ']</td><td>' + EnDe.rangeMap[i] + '</td><tr>';
	}
	txt += '</table>';

	div.innerHTML += txt;
	win.document.body.appendChild(div);
	win.focus();
	return false;
}; // showMap

this.privilege  = function(src) {
//#? set browser privileges (for Browser Quirks)
	_spr('EnDeGUI.privilege(' + src + ')');
	var bux = this.setPriv(src);
	return false; // for button tags
}; // privilege

	// ===================================================================== //
	// some special GUI settings ...                                         //
	// ===================================================================== //

this.preset     = function(obj,src) {
//#? set options according definitions in EnDeGUI.opts[]
	_spr('EnDeGUI.preset(obj.id="' + obj.id + '", src=' + src + ')');
	if (src == '') { _dpr('EnDeGUI.preset src empty'); return false; } // avoid alert() for empty src
	if (this.opts[src]!==null) {
		var p = this.opts[src][this.optPre];
		var h = this.opts[src][this.optHex];
		var a = this.opts[src][this.optDel];
		var n = this.opts[src][this.optLen];
		var t = this.opts[src][this.optCas];
		//r a = this.opts[src][this.optDel];
		var s = this.opts[src][this.optSuf];
		var i = null; // not yet used
		var e = this.opts[src][this.optKey];
		//r n = this.opts[src][this.optLen];
		if (p !==null) { $('EnDeDOM.API.prefix').value     = p; }; p = null;
		if (h !==null) { $('EnDeDOM.API.ishex').checked    = h; }; h = null;
		if (a !==null) { $('EnDeDOM.API.delimiter').value  = a; }; a = null;
		if (n !==null) { $('EnDeDOM.API.size').value       = n; }; n = null;
		if (t !==null) { $('EnDeDOM.API.uppercase').checked= t; }; t = null;
		if (a !==null) { $('EnDeDOM.API.delimiter').value  = a; }; a = null;
		if (s !==null) { $('EnDeDOM.API.suffix').value     = s; }; s = null;
		if (i !==null) { $('EnDeDOM.API.wrapbreak').value  = i; }; i = null;
		if (e !==null) { $('EnDeDOM.API.cipher').value     = e; }; e = null;
		if (n !==null) { $('EnDeDOM.API.size').value       = n; }; n = null;
	} else {
		EnDeGUI.alert('EnDeGUI.preset','unknown list "'+src+'"');
	}
	p=null; h=null; a=null; n=null; t=null; a=null; s=null; i=null; e=null;
	return false;
}; // preset

this.get_radio    = function(src) {
//#? return selected radio box from GUI
//#src? add   : get selection for "Incomplete dotted IP" in IP tool
//#src? mode  : get selection for "mode" in API Options
//#src? value : get selection for "variable/value" in Functions window
	//_spr('EnDeGUI.preset(obj.id="' + obj.id + '", src=' + src + ')');
	var bux   = '';
	var radio = null;
	var modes = null;
	switch (src) {
	  case 'mode':  modes = ['EnDeDOM.API.mode0', 'EnDeDOM.API.mode1', 'EnDeDOM.API.mode2']; break;
	  case 'value': modes = ['EnDeDOM.FF.varval0', 'EnDeDOM.FF.varval1']; break;
	  case 'add':   modes = ['EnDeDOM.IP.add0', 'EnDeDOM.IP.add1', 'EnDeDOM.IP.add2', 'EnDeDOM.IP.add3', 'EnDeDOM.IP.add4']; break;
	  default:      return bux; break;
	}
	while ((radio=modes.pop())!=null) {
		if ($(radio).checked) {
			bux = $(radio).value;
			break;
		}
	}
	return bux;
}; // get_radio

this.CH         = new function() {
  this.sid      = function() { return(EnDeGUI.sid() + '.CH'); };

  this.lastkey  = null;
  this.key      = function(e) {
  //#? catch keypress in character section
	var bbb = e.charCode || e.keyCode;
	var kkk = this.id.replace(/.*?\.([a-zA-Z0-9]+)$/, '$1'); // extract object id
	EnDeGUI.CH.lastkey = bbb;
	switch (e.keyCode) { // catch some specials; works for all except IE
		case 10 :
		case 13 :
		case 8  : // backspase
		case 37 : // left arrow
		case 39 : // right arrow
		case 46 : // DELETE
			return e.keyCode; break;
	}
	switch (kkk) {
	  case 'chr': return true; break; // any key; should never happen
	  case 'hex': bbb = EnDe.isHex(String.fromCharCode(bbb)); break; // ToDo: buggy i.e. 2329
	  case 'dec': bbb = EnDe.isInt(String.fromCharCode(bbb)); break;
	  case 'oct': bbb = EnDe.isOct(String.fromCharCode(bbb)); break;
	  case 'bin': bbb = EnDe.isBin(String.fromCharCode(bbb)); break;
	  case 'ucs': bbb = EnDe.isHex(String.fromCharCode(bbb)); break;
	  case 'utf': bbb = EnDe.isHex(String.fromCharCode(bbb)); break;
	}
	return bbb;
  }; // key

  this.set      = function(src) {
  //#? set fields to converted values
	_dpr('.CH.set: src='+src);
	$('EnDeDOM.CH.chr').value = src;
	$('EnDeDOM.CH.hex').value = EnDe.EN.hex(    1 ,'',false,src,'','','');
	$('EnDeDOM.CH.dec').value = EnDe.EN.dez(    '','',false,src,'','','');
	$('EnDeDOM.CH.oct').value = EnDe.EN.oct(    3 ,'',false,src,'','','');
	$('EnDeDOM.CH.bin').value = EnDe.EN.bin(   16 ,'',false,src,'','','');
	$('EnDeDOM.CH.ucs').value = EnDe.EN.ucs('null','',false,src,'','','');
	$('EnDeDOM.CH.utf').value = EnDe.EN.hex('null','',false,EnDe.EN.utf8('null','',false,src,'','',''),'','','');
	var bux = parseInt($('EnDeDOM.CH.utf').value,16).toString(2);
	var bbb = ($('EnDeDOM.CH.utf').value.length * 8) - bux.length;
	while (bbb>0) { bbb--; bux = '0' + bux; }
	$('EnDeDOM.CH.lng').value = bux;
	return false;
  }; // set

  this.dispatch = function(obj,uni) {
  //#? dispatcher for single character conversion
	/* uni parameter used only when called from Unicode menu */
	/* ugly quick&dirty code 'cause we don't want to implement several event handlers */
	var bux = '';
	var src = $(obj.id).value;
	var bbb = null;
	var ccc = 1;
	var kkk = obj.id.toString().replace(/.*?\.([a-zA-Z0-9]+)$/, '$1'); // compute current field
	_spr('EnDeGUI.CH.dispatch(obj.id="' + obj.id + '", uni=' + uni + ')');
	switch (kkk) {
	  case 'chr': ccc = 1;  break;
	  case 'hex': ccc = 4;  break;
	  case 'dec': ccc = 5;  break;
	  case 'oct': ccc = 6;  break;
	  case 'bin': ccc = 16; break;
	  case 'lng': ccc = 24; break;
	  case 'ucs': ccc = 4;  break;
	  case 'utf': ccc = 6;  break;
	  case 's':   ccc = 5; src = uni; break;// call from Unicode menu
	}
	if (kkk==='chr') {      // got a single character
			return true;
	} else {
		if (kkk!=='s') {   // already have a value, set it
			// except for input in Charater field we need a return
			if ((EnDeGUI.CH.lastkey != 10) && (EnDeGUI.CH.lastkey != 13)) {
				return true;
			//else // Unicode menu already gives a value, set it
			}
		}
	}
	if (src.length===0) { return false; }   // Unicode menu without a selection
	if (src.length <= ccc) {
		switch (kkk) {
		  case 'chr': bux = src; /* nothing to do, is already a string*/ break;
		  case 'bin': bux = String.fromCharCode(parseInt(src,2));  break;
		  case 'oct': bux = String.fromCharCode(parseInt(src,8));  break;
		  case 'int':
		  case 'dec': bux = String.fromCharCode(parseInt(src,10)); break;
		  case 'hex': bux = String.fromCharCode(parseInt(src,16)); break;
		  case 'ucs': bux = String.fromCharCode(parseInt(src,16)); break;
		  case 'lng':
			/* lng must have 24 digits which are 3 bytes, convert to hex string */
			switch (src.length) { // JavaScript is too stupid for ([01]{8}){1-} or ([01]{8}){3}
			  case 24: bbb = src.match(/([01]{8})([01]{8})([01]{8})/); break;
			  case 16: bbb = src.match(/([01]{8})([01]{8})/);          break;
			  default: bbb = src.match(/([01]*)/);                   break;
			}
			if(bbb===null) { return false; }
			src = '';
			for (ccc=1; ccc<=bbb.length; ccc++) { src += EnDe.b2h(bbb[ccc]); }
			// no break; // as lng now same as utf
		  case 'utf': bux = EnDe.DE.utf8('','',EnDe.DE.num('hex','',src,'','','',2),'','',''); break;
			/* utf is a bit tricky: we get a 6 character string, which are hex characters
			 * EnDe.DE.utf8() expects this as a byte stream, means that each 2 characters
			 * must be converted to its corresponding byte, thats what EnDe.DE.num('hex')
			 * does; the result then can be passed to EnDe.DE.utf8() which returns the
			 * corresponding charater as Unicode (UCS-2) byte stream
			 */
		  case 's':   bux = String.fromCharCode(parseInt(src,10)); break;
		}
	} else {
		// no more characters possible
		EnDeGUI.alert('EnDeGUI.CH.dispatch','input data to long (>'+ccc+')');
		return false;   // don't change anything
	}
	this.set(bux);
	bux = '';
	return false;
  }; // dispatch
}; // CH

this.EN         = new function() {
  this.sid      = function() { return(EnDeGUI.sid() + '.EN'); };

  this.repeat   = '';   // conatins last action (item)

  this.dispatch = function(obj,item) {
  //#? dipatcher for all encoding functions
	_spr('EnDeGUI.EN.dispatch(obj.id="' + obj.id + '", item=' + item + ')');
	if (item==='') { return false; }
	var bux         = '';
	var src         = $('EnDeDOM.EN.text').value;
	var add         = $('EnDeDOM.GUI.append').checked;
	var ccc         = $('EnDeDOM.GUI.select').checked;
	if (ccc===true) {
		// use selection if there is one
		var kkk = EnDeGUI.selectionGet( $('EnDeDOM.EN.text') );
		if ((kkk!=null) && (kkk!='')) { src = kkk; }
		kkk = null;
	}
	if ($('EnDeDOM.ED.00').checked===true) { src += String.fromCharCode(0);  }
	if ($('EnDeDOM.ED.0a').checked===true) { src += String.fromCharCode(10); }
	if ($('EnDeDOM.ED.0d').checked===true) { src += String.fromCharCode(13); }
	if ($('EnDeDOM.ED.da').checked===true) { src += String.fromCharCode(13) + String.fromCharCode(10); }
	if ($('EnDeDOM.ED.aa').checked===true) { src += String.fromCharCode(26); }
	if (item==='statistic') {   // no need for further data or checks, do it right away
		return EnDeGUI.stat(src);
	}
	var isMem       = $('EnDeDOM.EN.isMem').value;
	var ishex       = $('EnDeDOM.API.ishex').checked;
	var isLen       = $('EnDeDOM.API.size').value;
	var uppercase   = $('EnDeDOM.API.uppercase').checked;
	var wrapbreak   = $('EnDeDOM.API.wrapbreak').value;
	var delimiter   = $('EnDeDOM.API.delimiter').value;
	var iteration   = $('EnDeDOM.API.iteration').value;
	var suffix      = $('EnDeDOM.API.suffix').value;
	var prefix      = $('EnDeDOM.API.prefix').value;
	var cipher      = $('EnDeDOM.API.cipher').value; // ToDo: using cipher in dispatch() ..
	var outform     = $('EnDeDOM.API.typ').value;
	var mode        = EnDeGUI.get_radio('mode');
	if (isMem==='isHex') {
		EnDeGUI.alert(this.sid(),' cannot encode from "Hex"');
		return false;
	}
	if (ishex===true) {
		delimiter = EnDe.DE.hex('null','lazy',delimiter,'','','');
		prefix    = EnDe.DE.hex('null','lazy',prefix,'','','');
		suffix    = EnDe.DE.hex('null','lazy',suffix,'','','');
	}
	if ((item==='repeat') && (this.repeat!=='')) {
		return this.dispatch(obj, this.repeat);
	}
	this.repeat = item;
	switch (item) { // some functions have different parameters
	  case 'repeat'     : return false;    break;   // we reach here if there was no action before; simply ignore
	  case 'crc_user'   : delimiter = cipher; break;
	  case 'md4hmachex' : suffix = cipher; break;
	  case 'md4hmacb64' : suffix = cipher; break;
	  case 'md4hmacstr' : suffix = cipher; break;
	  case 'md5hmachex' : suffix = cipher; break;
	  case 'md5hmacb64' : suffix = cipher; break;
	  case 'md5hmacstr' : suffix = cipher; break;
	  case 'sha1hmachex': suffix = cipher; break;
	  case 'sha1hmacb64': suffix = cipher; break;
	  case 'sha1hmacstr': suffix = cipher; break;
	  case 'aes128'     : suffix = cipher; break;
	  case 'aes128r'    : suffix = cipher; break;
	  case 'aes192'     : suffix = cipher; break;
	  case 'aes192r'    : suffix = cipher; break;
	  case 'aes256'     : suffix = cipher; break;
	  case 'aes256r'    : suffix = cipher; break;
	  case 'blowfish'   : suffix = cipher; break;
	  case 'tearaw'     : suffix = cipher; break;
	  case 'teacor'     : suffix = cipher; break;
	  case 'teaesc'     : suffix = cipher; break;
	  case 'xor'        : suffix = cipher; break;
	  case 'oct'        :
	  case 'dez'        :
	  case 'hex'        : item += isLen;   break; // ugly hack, 'cause we don't want to change number of parameters in the API
	  case 'ripemdhex'  :
	  case 'ripemdword' : suffix = cipher; delimiter = iteration; break;
	  case 'rotN'       :
		if ((cipher==undefined) || (cipher==='')) {
			EnDeGUI.alert('EnDeGUI.EN.dispatch','Key must be specified');
			return false;
		}
		ccc = cipher[0].charCodeAt();       // first character in cipher defines the shift position
		if (isNaN(parseInt(cipher,10))) {   // ensure a-zA-Z
			if ((ccc>64) && (ccc<91))   { suffix = ccc-64; }
			if ((ccc>96) && (ccc<123))  { suffix = ccc-96; }
		} else {
			suffix = parseInt(cipher,10);
		}
		if ((suffix<1) || (suffix>26)) {
			EnDeGUI.alert('EnDeGUI.EN.dispatch','Key must be integer [1..26] or character [b-z]');
			return false;
		}
		break;
	  case 'JSeval':
		// same code as in .DE.dispatch()
		kkk = null;
		kkk = src.match(/(window|document|eval)/);
		if (kkk!==null) {
			if (confirm('** WARNING **\nsource probably contains malicious function "'+ kkk[1] + '"\n\n\tabort?')) {
				alert('* good descision *');
				return false;
			}
				alert('* you have been warned *');
		}
		try { bux = eval(src); } catch(e) { bux = src; EnDeGUI.alert('EnDeGUI.EN.dispatch',' JSeval failed:\n'+e); }
		$('EnDeDOM.DE.text').value  = bux;
		return false;
		break;
	  case 'image'      :
		return EnDeGUI.cont( EnDe.Form.dispatch(item,'lazy',src,true,0) );
		break;
	  case 'JSFormat'   :
		// EnDeGUI.colour = true;
		return EnDeGUI.code( EnDe.Form.dispatch(item,'lazy',src,true,5) );
		return false;   // fallback
		break;
	  case 'JSDecode'   :
		// EnDeGUI.colour = true;
		return EnDeGUI.code( EnDe.Form.dispatch(item,'lazy',src,true,5) );
		return false;   // fallback
		break;
	  case 'JSReg'      :
		add = [];       // pass checks to JSReg
		add.push($('EnDeDOM.API.JSRcode' ).checked);
		add.push($('EnDeDOM.API.JSRfunc' ).checked);
		add.push($('EnDeDOM.API.JSRmain' ).checked);
		add.push($('EnDeDOM.API.JSRcheck').checked);
		return EnDeGUI.code( EnDe.Form.dispatch(item,'lazy',src,add,0) );
		return false;   // fallback
		break;
	  case 'toSource'   :
		return EnDeGUI.code( EnDe.Form.dispatch(item,'lazy',src,true,5) );
		return false;   // fallback
		break;
	  case 'test'       :
		EnDeGUI.alert('EnDeGUI.EN.dispatch: ','just a TEST');
		return false;
		break;
//	  case 'crc32b64'   : if (wrapbreak > 0) { delimiter= wrapbreak; } else { delimiter = 0; } break;
	  case 'url64'      : if (wrapbreak > 0) { delimiter= wrapbreak; } else { delimiter = 0; } break;
	  case 'guess'      :
	  default           :
		if (item.match(/^guess:/)!==null) {
			return EnDeGUI.guess('EN@'+item,mode,uppercase,src,prefix,suffix,delimiter);
		}
		if (item.match(/^(base|guess:@Base)/)!==null){
// ToDo: not true for all Base-N encodings, see EnDeB64.js for details
// ToDo: does not match guess:* cause there we don't want linebreaks in the list of results
			if (wrapbreak > 0) { delimiter= wrapbreak; } else { delimiter = 0; }
		}
		break;
	} // switch item
	// all other items ..
	if (EnDeGUI.stackmode===true) {
		$('EnDeDOM.FF.text').value  = EnDeGUI.FF.update(item,mode,uppercase,src,prefix,suffix,delimiter,'EnDe.EN.dispatch');
	} else {
		try {   // this try-catch is just to handle some missing browser functionality
			_spr('EnDeGUI.EN.dispatch: EnDe.EN.dispatch(item="' + item + '", mode=' + mode + ', case="' + uppercase + '", prefix="' + prefix + '", suffix="' + suffix + '", delimiter=' + delimiter + '")');
			bux = EnDe.EN.dispatch(item,mode,uppercase,src,prefix,suffix,delimiter);
		} catch (e) {
			bux = '**ERROR: ' + this.sid() + '.dispatch(*) failed with:\n' + e;
			//EnDeGUI.alert('EnDeGUI.EN.dispatch','* '+e);
		}
		if (add===true) {
			$('EnDeDOM.DE.text').value += bux;
		} else {
			$('EnDeDOM.DE.text').value  = bux;
		}
	}
	return false;
  }; // dispatch
}; // EN

this.DE         = new function() {
  this.sid      = function() { return(EnDeGUI.sid() + '.DE'); };

  this.repeat   = '';   // conatins last action (item)

  this.dispatch = function(obj,item) {
  //#? dipatcher for all decoding functions
	_spr('EnDeGUI.DE.dispatch(obj.id="' + obj.id + '", item=' + item + ')');
	if (item==='') { return false; }
	var bux         = '';
	var src         = $('EnDeDOM.DE.text').value;
	var add         = $('EnDeDOM.GUI.append').checked;
	var ccc         = $('EnDeDOM.GUI.select').checked;
	if (ccc===true) {
		// use selection if there is one
		var kkk = EnDeGUI.selectionGet( $('EnDeDOM.DE.text') );
		if ((kkk!=null) && (kkk!='')) { src = kkk; }
		kkk = null;
	}
	if ($('EnDeDOM.ED.00').checked===true) { src += String.fromCharCode(0);  }
	if ($('EnDeDOM.ED.0a').checked===true) { src += String.fromCharCode(10); }
	if ($('EnDeDOM.ED.0d').checked===true) { src += String.fromCharCode(13); }
	if ($('EnDeDOM.ED.da').checked===true) { src += String.fromCharCode(13) + String.fromCharCode(10); }
	if ($('EnDeDOM.ED.aa').checked===true) { src += String.fromCharCode(26); }
	if (item==='statistic') {   // no need for further data or checks, do it right away
		return EnDeGUI.stat(src);
	}
	var isMem       = $('EnDeDOM.DE.isMem').value;
	var ishex       = $('EnDeDOM.API.ishex').checked;
	var isLen       = $('EnDeDOM.API.size').value;
	var uppercase   = $('EnDeDOM.API.uppercase').checked;
	var wrapbreak   = $('EnDeDOM.API.wrapbreak').value;
	var delimiter   = $('EnDeDOM.API.delimiter').value;
	//  iteration   = $('EnDeDOM.API.iteration').value;
	var suffix      = $('EnDeDOM.API.suffix').value;
	var prefix      = $('EnDeDOM.API.prefix').value;
	var cipher      = $('EnDeDOM.API.cipher').value;
	var outform     = $('EnDeDOM.API.typ').value;
	var mode        = EnDeGUI.get_radio('mode');
	if (isMem==='isHex') {
		EnDeGUI.alert(this.sid(),' cannot decode from "Hex"');
		return false;
	}
	if (ishex===true) {
		delimiter = EnDe.DE.hex('null','lazy',delimiter,'','','');
		prefix    = EnDe.DE.hex('null','lazy',prefix,'','','');
		suffix    = EnDe.DE.hex('null','lazy',suffix,'','','');
	}
	if ((item==='repeat') && (this.repeat!=='')) {
		return this.dispatch(obj, this.repeat);
	}
	this.repeat = item;
	switch (item) { // some functions have different parameters
	  case 'repeat'     : return false;    break;   // we reach here if there was no action before; simply ignore
	  case 'aes128'     : suffix = cipher; break;
	  case 'aes128r'    : suffix = cipher; break;
	  case 'aes192'     : suffix = cipher; break;
	  case 'aes192r'    : suffix = cipher; break;
	  case 'aes256'     : suffix = cipher; break;
	  case 'aes256r'    : suffix = cipher; break;
	  case 'blowfish'   : suffix = cipher; break;
	  case 'tearaw'     : suffix = cipher; break;
	  case 'teacor'     : suffix = cipher; break;
	  case 'teaesc'     : suffix = cipher; break;
	  case 'xor'        : suffix = cipher; break;
	  case 'oct'        :
	  case 'dez'        :
	  case 'hex'        : item += isLen;   break; // ugly hack, see above
	  case 'rotN'       :
		if ((cipher==undefined) || (cipher=='')) {
			EnDeGUI.alert('EnDeGUI.DE.dispatch','Key must be specified');
			return false;
		}
		ccc = cipher[0].charCodeAt();       // first character in cipher defines the shift position
		if (isNaN(parseInt(cipher,10))) {   // ensure a-zA-Z
			if ((ccc>64) && (ccc<91))   { suffix = ccc-64; }
			if ((ccc>96) && (ccc<123))  { suffix = ccc-96; }
		} else { // got int, use as is
			suffix = parseInt(cipher,10);
		}
		if ((suffix<0) || (suffix>26)) {      // 0 and 26 itself do not rotate ;-)
			EnDeGUI.alert('EnDeGUI.DE.dispatch','Key must be integer [0..26] or character [b-z]');
			return false;
		}
		break;
	  case 'JSeval':
		// same code as in .EN.dispatch()
		kkk = null;
		kkk = src.match(/(window|document|eval)/);
		if (kkk!==null) {
			if (confirm('** WARNING **\nsource probably contains malicious function "'+ kkk[1] + '"\n\n\tabort?')) {
				alert('* good descision *');
				return false;
			}
				alert('* you have been warned *');
		}
		try { bux = eval(src); } catch(e) { bux = src; EnDeGUI.alert('EnDeGUI.DE.dispatch',' JSeval failed:\n'+e); }
		$('EnDeDOM.EN.text').value  = bux;
		return false;
		break;
	  case 'image'      :
		return EnDeGUI.cont( EnDe.Form.dispatch(item,'lazy',src,true,0) );
		break;
	  case 'JSFormat'   :
		// EnDeGUI.colour = true;
		return EnDeGUI.code( EnDe.Form.dispatch(item,'lazy',src,true,5) );
		return false;   // fallback
		break;
	  case 'JSDecode'   :
		// EnDeGUI.colour = true;
		return EnDeGUI.code( EnDe.Form.dispatch(item,'lazy',src,true,5) );
		return false;   // fallback
		break;
	  case 'JSReg'      :
		add = [];       // pass checks to JSReg
		add.push($('EnDeDOM.API.JSRcode' ).checked);
		add.push($('EnDeDOM.API.JSRfunc' ).checked);
		add.push($('EnDeDOM.API.JSRmain' ).checked);
		add.push($('EnDeDOM.API.JSRcheck').checked);
		return EnDeGUI.code( EnDe.Form.dispatch(item,'lazy',src,add,0) );
		return false;   // fallback
		break;
	  case 'toSource'   :
		return EnDeGUI.code( EnDe.Form.dispatch(item,'lazy',src,true,5) );
		return false;   // fallback
		break;
	  case 'guess'      :
	  default           :
		if (item.match(/^guess:/)!==null) {
			return EnDeGUI.guess('DE@'+item,mode,uppercase,src,prefix,suffix,delimiter);
		}
		break;
	}
	if (EnDeGUI.stackmode===true) {
		$('EnDeDOM.FF.text').value  = EnDeGUI.FF.update(item,mode,uppercase,src,prefix,suffix,delimiter,'EnDe.DE.dispatch');
	} else {
		try {   // this try-catch is just to handle some missing browser functionality
			_spr('EnDeGUI.DE.dispatch: EnDe.DE.dispatch(item="' + item + '", mode=' + mode + ', prefix="' + prefix + '", suffix="' + suffix + '", delimiter=' + delimiter + '")');
			bux = EnDe.DE.dispatch(item,mode,uppercase,src,prefix,suffix,delimiter);
		} catch (e) {
			bux = '**ERROR: ' + this.sid() + '.dispatch(*) failed with:\n' + e;
			//EnDeGUI.alert('EnDeGUI.DE.dispatch','* '+e);
		}
		if (add===true) {
			$('EnDeDOM.EN.text').value += bux;
		} else {
			$('EnDeDOM.EN.text').value  = bux;
		}
	}
	bux = null;
	return false;
  }; // dispatch
}; // DE

this.RE         = new function() {
  this.sid      = function() { return(EnDeGUI.sid() + '.RE'); };

  this.repeat   = '';   // conatins last action (item)
	// not implemented here, but in its own file, just wrappers to them ..
  this.dispatch = function(obj,item){ return(EnDeRE.dispatch(obj,item));};
  this.parse    = function(src)     { return(EnDeRE.parseTXT(src));     };
}; // RE

this.IP         = new function() {
  this.sid      = function()        { return(EnDeGUI.sid() + '.IP');    };

  this.repeat   = '';   // conatins last action (item)

  this.dashed   = function(src)     { return(EnDeGUI.dashed(src));      };

  this.reset    = function() {
  //#? reset all input fields in IP tool
	$('EnDeDOM.IP.dot').checked  = "1";
	$('EnDeDOM.IP.ip').value  = '';
	$('EnDeDOM.IP.ip6').value = '';
	$('EnDeDOM.IP.rip').value = '';
	$('EnDeDOM.IP.num').value = '';
	$('EnDeDOM.IP.big').value = '';
	$('EnDeDOM.IP.oct').value = '';
	$('EnDeDOM.IP.bin').value = '';
	$('EnDeDOM.IP.bit').value = '';
	$('EnDeDOM.IP.hex').value = '';
	$('EnDeDOM.IP.xeh').value = '';
	$('EnDeDOM.IP.url').value = '';
	return false;
  };

  this.delim    = function(delimiter) {
  //#? escapes RegEx meta characters in IP input fields
	var regexReg = /[\$\&\#\%\.\^\?\*\+\[\]\\]/gi;
// ToDo: probably need a global regExpEscape
	if (delimiter.match(regexReg)) {
	    delimiter = '\\' + delimiter;
	}
	var rex = new RegExp(delimiter,'g');
	var bbb = null;
	bbb = $('EnDeDOM.IP.ip');  bbb.value = bbb.value.replace(rex,'');
	bbb = $('EnDeDOM.IP.ip6'); bbb.value = bbb.value.replace(rex,'');
	bbb = $('EnDeDOM.IP.rip'); bbb.value = bbb.value.replace(rex,'');
	bbb = $('EnDeDOM.IP.num'); bbb.value = bbb.value.replace(rex,'');
	bbb = $('EnDeDOM.IP.big'); bbb.value = bbb.value.replace(rex,'');
	bbb = $('EnDeDOM.IP.oct'); bbb.value = bbb.value.replace(rex,'');
	bbb = $('EnDeDOM.IP.hex'); bbb.value = bbb.value.replace(rex,'');
	bbb = $('EnDeDOM.IP.xeh'); bbb.value = bbb.value.replace(rex,'');
	bbb = $('EnDeDOM.IP.url'); bbb.value = bbb.value.replace(rex,'');
	bbb = null;
	rex = null;
	return false;
  };

  this.dispatch = function(obj,item) {
  //#? dipatcher for all IP conversion functions
	// special mode if item value is prefixed with in: or out:
	_spr('EnDeGUI.IP.dispatch(obj.id="' + obj.id + '", item=' + item + ')');
	if (item==='') { return false; }
	if (obj.parentNode.id != '') {
		/* SELECT on left side with OPTGROUP do not match
		 * only the SELECT with size=1 on right side match
		 * SELECT with OPTGROUP always has a selectedIndex=-1
		 * hence needs to be avoided here
		 */
		if (obj.tagName.toUpperCase() == 'SELECT') {
			if (obj.selectedIndex < 0) { return false; }
		}
	}
	obj.selectedIndex = -1; // onClick hack
	this.repeat = item;
	var bbb = '';
	var kkk = $('EnDeDOM.IP.ip');
	var src = {
		'ip'    : $('EnDeDOM.IP.ip'),
		'ip6'   : $('EnDeDOM.IP.ip6'),
		'rip'   : $('EnDeDOM.IP.rip'),
		'nip'   : $('EnDeDOM.IP.nip'),
		'big'   : $('EnDeDOM.IP.big'),
		'num'   : $('EnDeDOM.IP.num'),
		'oct'   : $('EnDeDOM.IP.oct'),
		'bin'   : $('EnDeDOM.IP.bin'),
		'bit'   : $('EnDeDOM.IP.bit'),
		'hex'   : $('EnDeDOM.IP.hex'),
		'xeh'   : $('EnDeDOM.IP.xeh'),
		'url'   : $('EnDeDOM.IP.url'),
		'swap'  : $('EnDeDOM.IP.rip'),
		'normal': $('EnDeDOM.IP.rip'),
		'minus' : $('EnDeDOM.IP.num'),
		'reverse':$('EnDeDOM.IP.ip'),
		// dummies ..
		'show'  : '--dumm--',
		'delim' : '--dumm--',
		'rmdot' : '--dumm--',
		'rmcol' : '--dumm--',
		'rmdash': '--dumm--',
		'rmperc': '--dumm--',
		'clear' : '--dumm--',
		'sample': '--dumm--',
		'scratch':'--dumm--'
	}; // src : the object to be used
	kkk = item.match(/(in:|out:)(.*)/);
	if (kkk!==null) {
		// special mode: just highlight the corresponding input field
		item = kkk[2];
		switch (kkk[1]) {
		  case 'in:'    : this.dashed(src[item]); break;
		  case 'out:'   : this.dashed(src[item]); break;
		}
		src  = null;
		return false;
	}
	if (src[item]==='--dumm--') {
		kkk = ' ';
	} else {
		kkk = src[item].value.replace(/ /g,''); // no spaces necessary
	}
	if (kkk==='') { return false; } // nothing given
	src  = null;
	src  = kkk; // this value to be converted
	var ishex       = $('EnDeDOM.API.ishex').checked;
	var uppercase   = $('EnDeDOM.API.uppercase').checked;
	var prefix      = $('EnDeDOM.API.prefix').value;
	var suffix      = $('EnDeDOM.API.suffix').value;
	var delimiter   = $('EnDeDOM.API.delimiter').value;
	var smallbig    = $('EnDeDOM.IP.low').checked;
	var usedot      = $('EnDeDOM.IP.dot').checked;
	var ip          = $('EnDeDOM.IP.ip').value;
	var i           = 0;
	var mode        = EnDeGUI.get_radio('mode');
	if (usedot) {
		delimiter   = '.';
	}
	// special handling for incomplete dotted IPs and URL-encoded values
	var complete    = EnDeGUI.get_radio('add');
	var ccc = '';
	switch (item) {
	  case 'ip':    ccc = '0'; src = ip; break;
	  case 'ip6':   ccc = '0000';        break; // optional
	  case 'url':   ccc = '%00';         break; // mandatory
	  case 'hex':   ccc = '00';          break; // optional
	  case 'oct':   ccc = '000';         break; // optional
	  case 'bin':   ccc = '00000000';    break; // mandatory
	  // default:   // nothing to do
	}
	switch (item) {
	  case 'ip':
	  case 'ip6':
	  case 'url':
	  case 'hex':
	  case 'oct':
	  case 'bin':
		bbb = src.split(delimiter);
		if (bbb[0]==='') { return false; }  // defensive programming ..
		switch (complete) {
		  case 'trail': for (i=bbb.length+1; i<5; i++) { src =    src + delimiter + ccc; }; break;
		  case 'lead':  for (i=4; i>bbb.length;   i--) { src =    ccc + delimiter + src; }; break;
		  case 'prefix':for (i=4; i>bbb.length;   i--) { src = prefix + delimiter + src; }; break;
		  case 'suffix':for (i=4; i>bbb.length;   i--) { src = src + delimiter + suffix; }; break;
		  case 'none':
		  default:      break;
		} // complete
		while ((bbb.pop())!=null) { }
		bbb = null;
	  // default    : // nothing to do
	} // item to be completed
	// some special actions
	switch (item) {
	  case 'sample':ip = '127.0.0.42';              break;
	  case 'clear': return this.reset();            break;
	  case 'rmdot': return this.delim('.');         break;
	  case 'rmcol': return this.delim(':');         break;
	  case 'rmdash':return this.delim('-');         break;
	  case 'rmperc':return this.delim  ('%');       break;
	  case 'delim': return this.delim(delimiter);   break;
	  case 'repeat':return false; break;// we reach here if there was no action before; simply ignore
	}
	// main
	if ((item==='repeat') && (this.repeat!=='')) {
		return this.dispatch(obj, this.repeat);
	}
	switch (item) {
	  case 'ip':    ip = src; break;
	  case 'ip6':   ip = EnDe.IP.dispatch('ip62ip',  mode,uppercase,src,'','',delimiter); break;
	  case 'xeh':   ip = EnDe.IP.dispatch('xeh2ip',  mode,uppercase,src,'','',delimiter); break;
	  case 'bin':   ip = EnDe.IP.dispatch('bin2ip',  mode,uppercase,src,'','',delimiter); break;
	  case 'bit':   ip = EnDe.IP.dispatch('bit2ip',  mode,uppercase,src,'','',delimiter); break;
	  case 'hex':   ip = EnDe.IP.dispatch('hex2ip',  mode,uppercase,src,'','',delimiter); break;
	  case 'url':   ip = EnDe.IP.dispatch('hex2ip',  mode,uppercase,src,'','',delimiter); break;
	  case 'oct':   ip = EnDe.IP.dispatch('oct2ip',  mode,uppercase,src,'','',delimiter); break;
	  case 'big':
		if (src==='') { return false; }
		if (src>= EnDe.CONST.INT.exp53) { // beat JavaScript dragons
			EnDeGUI.alert('EnDeGUI.IP.dispatch: number too large: ',src+' > '+EnDe.CONST.INT.exp53);
			return false;
		}
		if (smallbig===true) {  // treat small values like 32-bit int
			ip = EnDe.IP.dispatch('low2ip',  mode,uppercase,src,'','',delimiter);
		} else {
			ip = EnDe.IP.dispatch('big2ip',  mode,uppercase,src,'','',delimiter);
		}
		break;
	  case 'num':
		if (src==='') { return false; }
		if (src>= EnDe.CONST.INT.exp32) {
			EnDeGUI.alert('EnDeGUI.IP.dispatch: number too large: ',src+' > '+EnDe.CONST.INT.exp32);
			return false;
		}
		ip = EnDe.IP.dispatch('num2ip',  mode,uppercase,src,'','',delimiter);
		break;
	  case 'minus':
		src = $('EnDeDOM.IP.num').value;
		if (src.match(/\d+/)) {
			if (src.match(/^ *-\d+/)) {
				$('EnDeDOM.IP.num').value = EnDe.z2n(src);
			} else {
				$('EnDeDOM.IP.num').value = EnDe.n2z(src);
			}
		}
		src = $('EnDeDOM.IP.big').value;
		if (src.match(/\d+/)) {
			if (src.match(/^ *-\d+/)) {
				$('EnDeDOM.IP.big').value = EnDe.z2n64(src);
			} else {
				$('EnDeDOM.IP.big').value = EnDe.n2z64(src);
			}
		}
		src = null;
		return false;
		break;
// ToDo: make %2e configurable (. or %2e)
	  case 'reverse':
		if (src==='') { return false; }
		ip = EnDe.IP.dispatch('reverse', mode,uppercase,src,'','',delimiter);
		$('EnDeDOM.IP.rip').value = ip;
		return false; // no other settings here
		break;
	  case 'normal':
		if (src==='') { return false; }
		ip = EnDe.IP.dispatch('reverse', mode,uppercase,src,'','',delimiter);
		$('EnDeDOM.IP.ip').value  = ip;
		return false; // no other settings here
		break;
	  case 'swap':
		$('EnDeDOM.IP.ip').value  = src;
		$('EnDeDOM.IP.rip').value = ip;
		return false; // no other settings here
		break;
	  case 'show':
		EnDeGUI.cont(
			'<pre>' +
			$('EnDeDOM.IP.ip').value  + '\n' +
			$('EnDeDOM.IP.rip').value + '\n' +
			$('EnDeDOM.IP.ip6').value + '\n' +
			$('EnDeDOM.IP.hex').value + '\n' +
			$('EnDeDOM.IP.url').value + '\n' +
			$('EnDeDOM.IP.xeh').value + '\n' +
			$('EnDeDOM.IP.oct').value + '\n' +
			$('EnDeDOM.IP.bin').value + '\n' +
			$('EnDeDOM.IP.bit').value + '\n' +
			$('EnDeDOM.IP.big').value + '\n' +
			$('EnDeDOM.IP.num').value + '\n' +
			'</pre>'
		);
		return false; // no other settings here
		break;
	  case 'scratch':
		EnDeGUI.scratch( 'IP',
			$('EnDeDOM.IP.ip').value  + '\n' +
			$('EnDeDOM.IP.rip').value + '\n' +
			$('EnDeDOM.IP.ip6').value + '\n' +
			$('EnDeDOM.IP.hex').value + '\n' +
			$('EnDeDOM.IP.url').value + '\n' +
			$('EnDeDOM.IP.xeh').value + '\n' +
			$('EnDeDOM.IP.oct').value + '\n' +
			$('EnDeDOM.IP.bin').value + '\n' +
			$('EnDeDOM.IP.bit').value + '\n' +
			$('EnDeDOM.IP.big').value + '\n' +
			$('EnDeDOM.IP.num').value + '\n'
		);
		return false; // no other settings here
		break;
	}
	$('EnDeDOM.IP.ip').value  = ip;
	$('EnDeDOM.IP.ip6').value = EnDe.IP.dispatch('ip2ip6', mode,uppercase,ip,'','',delimiter);
	$('EnDeDOM.IP.big').value = EnDe.IP.dispatch('ip2big', mode,uppercase,ip,'','',delimiter);
	$('EnDeDOM.IP.num').value = EnDe.IP.dispatch('ip2num', mode,uppercase,ip,'','',delimiter);
	$('EnDeDOM.IP.oct').value = EnDe.IP.dispatch('ip2oct', mode,uppercase,ip,'','',delimiter);
	$('EnDeDOM.IP.bin').value = EnDe.IP.dispatch('ip2bin', mode,uppercase,ip,'','',delimiter);
	$('EnDeDOM.IP.bit').value = EnDe.IP.dispatch('ip2bit', mode,uppercase,ip,'','',delimiter);
	$('EnDeDOM.IP.hex').value = EnDe.IP.dispatch('ip2hex', mode,uppercase,ip,'','',delimiter);
	$('EnDeDOM.IP.xeh').value = EnDe.IP.dispatch('ip2xeh', mode,uppercase,ip,'','',delimiter);
	$('EnDeDOM.IP.url').value = EnDe.IP.dispatch('ip2url', mode,uppercase,ip,'','',delimiter);
	return false;
  }; // dispatch
}; // IP

this.TS         = new function() {
  this.sid      = function() { return(EnDeGUI.sid() + '.TS'); };

  this.TZOffset = function(use_gmt,dumdt) {
	var dt = new Date();
	return dt.getTimezoneOffset();
  };

  this.getTime  = function(dt) {
	if ($('EnDeDOM.TS.ms').checked) {
		return(dt.getTime());
	} else {
		return(Math.floor(dt.getTime() / 1000));
	}
  };

  this.getGMT   = function(use_gmt,dt) {
	var time    = dt.getTime();
	var offset  = this.TZOffset() * 60 * 1000;
	if (use_gmt) {
		time    = time + offset;
	}
	dt.setTime(time);
	return(dt);
  };

  this.msTime   = function(val) {
	if ($('EnDeDOM.TS.ms').checked) {
		return(val);
	} else {
		return(val * 1000);
	}
  };

  this.scratch  = function() {
	EnDeGUI.scratch( 'Timestamp',
		$('EnDeDOM.TS.year').value  + ' ' + $('EnDeDOM.TS.mon').value   + ' ' + $('EnDeDOM.TS.day').value   + '\n' +
		$('EnDeDOM.TS.year').value  + '.' + $('EnDeDOM.TS.mon').value   + '.' + $('EnDeDOM.TS.day').value   + '\n' +
		$('EnDeDOM.TS.hour').value  + ' ' + $('EnDeDOM.TS.min').value   + ' ' + $('EnDeDOM.TS.sec').value   + '\n' +
		$('EnDeDOM.TS.hour').value  + ':' + $('EnDeDOM.TS.min').value   + ':' + $('EnDeDOM.TS.sec').value   + '\n' +
		$('EnDeDOM.TS.human').value + '\n'+
		$('EnDeDOM.TS.timestamp').value + '\n' +
		$('EnDeDOM.TS.offset').value+ '\n'
	);
  };

  this.reset    = function() {
  //#? reset all input fields in Timestamp tool
	$('EnDeDOM.TS.year').value      = '';
	$('EnDeDOM.TS.mon').value       = '';
	$('EnDeDOM.TS.day').value       = '';
	$('EnDeDOM.TS.hour').value      = '';
	$('EnDeDOM.TS.min').value       = '';
	$('EnDeDOM.TS.sec').value       = '';
	$('EnDeDOM.TS.human').value     = '';
	//$('EnDeDOM.TS.reftime').value  = '';
	$('EnDeDOM.TS.timestamp').value = '';
	$('EnDeDOM.TS.offset').value    = '';
	$('EnDeDOM.TS.yY').checked      = false;
	$('EnDeDOM.TS.mM').checked      = false;
	$('EnDeDOM.TS.hm').checked      = false;
	$('EnDeDOM.TS.ms').checked      = false;
	$('EnDeDOM.TS.TZ').checked      = false;
	$('EnDeDOM.TS.GMT').checked     = false;
	$('EnDeDOM.TS.neg').checked     = false;
	$('EnDeDOM.TS.isFmt').value     = '2unix';
  };

  this.setFields= function(dt) {
	var year = dt.getYear();
	year = (year < 1000) ? (year + 1900) : year; // some browsers return full year since 2010
	$('EnDeDOM.TS.year').value      = year;
	$('EnDeDOM.TS.mon').value       = dt.getMonth() + 1;
	$('EnDeDOM.TS.day').value       = dt.getDate();
	$('EnDeDOM.TS.hour').value      = dt.getHours();
	$('EnDeDOM.TS.min').value       = dt.getMinutes();
	$('EnDeDOM.TS.sec').value       = dt.getSeconds();
	$('EnDeDOM.TS.timestamp').value = this.getTime(dt);
	$('EnDeDOM.TS.human').value     = dt;
  };

  this.setDate  = function(dt) {
	if ((isNaN(dt.getHours())) || (isNaN(dt.getMinutes())) || (isNaN(dt.getSeconds())) || (isNaN(dt.getMonth())) || (isNaN(dt.getDate())) || (isNaN(dt.getYear()))) {
		return;
	}
	var use_gmt = $('EnDeDOM.TS.GMT').checked;
	var use_tz  = $('EnDeDOM.TS.TZ').checked;
	var year = dt.getYear();
	year = (year < 1000) ? (year + 1900) : year; // some browsers return full year since 2010
	var elem = $('EnDeDOM.TS.human_readable');
	if (elem != null) { // ToDo: EnDe.TS.human_readable not yet available in .html
		var str = $('EnDeDOM.TS.bundle_tsc').getString('tsc-human');
		var val = EnDe.Text.PAD10(dt.getHours());
		str = str.replace('[HR]', val);
		val = EnDe.Text.PAD10(dt.getMinutes());
		str = str.replace('[MIN]', val);
		val = EnDe.Text.PAD10(dt.getSeconds());
		str = str.replace('[SEC]', val);
		str = str.replace('[M]', $('EnDeDOM.TS.bundle_tsc').getString('tsc-month_long_' + dt.getMonth()));
		str = str.replace('[D]', dt.getDate());
		str = str.replace('[Y]', year);
		if (use_gmt) {
			str += ' GMT';
		} else if (!use_gmt && use_tz) {
			var tz = (this.TZOffset()/60)*(-1);
			if (tz >= 0) { tz = '+' + tz; }
			str += ' (GMT' + tz + ')';
		}
		elem.value = str;
	}
  };

  this.isDate   = function(txt) {
	if (txt == '') {
		return(undefined);
	} else {
		var dt = EnDe.TS.matchDateTime( 'all', 0,$('EnDeDOM.TS.yY').checked, $('EnDeDOM.TS.strict').checked, $('EnDeDOM.TS.hm').checked, txt );
		return(dt != undefined);
	}
  };

  this.setFormat= function(fmt) {
  /* set timestamp format (SELECT option and hidden field) */
	$('EnDeDOM.TS.isFmt').value  = fmt;
	$('EnDeDOM.TS.format').value = fmt;
  };

  this.dispatch = function(obj,item) {
  //#? dipatcher for all timestamp conversion functions
	_spr('EnDeGUI.TS.dispatch(obj.id="' + obj.id + '", item=' + item + ')');
	if (item==='') { return false; }
	var isFormat= $('EnDeDOM.TS.isFmt').value;
	var kkk = null;
	var ccc = null;
	// conversion between date/time formats is special
	switch (item) {
	  case '2asp'   :
	  case '2dos'   :
	  case '2ole'   :
	  case '2unix'  :
	  case '2win'   :
		/*
		 * ASP.NET has the most precise format, currently ..
		 * hence we use it as intermediate format and convert anything to it
		 * (as it may be that one already), then we convert to the destination
		 * format (which looses precision then, obviously)
		 */
		if (item == isFormat) { break; }
		kkk = $('EnDeDOM.TS.timestamp').value;
		ccc = $('EnDeDOM.TS.reftime').value;
		if (isFormat == '2unix') {
			/* timestamp format may be with or without milli seconds */
			kkk  = this.msTime(kkk);
			ccc  = this.msTime(ccc);
		}
		switch (isFormat) { // normalize ..
		  case '2asp'   : break; // nothing to do
		  case '2unix'  : kkk = EnDe.TS.u2a(kkk); ccc = EnDe.TS.u2a(ccc); break;
		  case '2win'   : kkk = EnDe.TS.w2a(kkk); ccc = EnDe.TS.w2a(ccc); break;
		  case '2dos'   : kkk = EnDe.TS.d2a(kkk); ccc = EnDe.TS.d2a(ccc); break;
		  case '2ole'   : kkk = EnDe.TS.o2a(kkk); ccc = EnDe.TS.o2a(ccc); break;
		}
		switch (item) { // convert ..
		  case '2asp'   : break; // nothing to do
		  case '2unix'  : kkk = EnDe.TS.a2u(kkk); ccc = EnDe.TS.a2u(ccc); break;
		  case '2win'   : kkk = EnDe.TS.a2w(kkk); ccc = EnDe.TS.a2w(ccc); break;
		  case '2dos'   : kkk = EnDe.TS.a2d(kkk); ccc = EnDe.TS.a2d(ccc); break;
		  case '2ole'   : kkk = EnDe.TS.a2o(kkk); ccc = EnDe.TS.a2o(ccc); break;
		}
		if ((item == '2unix') && ($('EnDeDOM.TS.ms').checked===false)) {
			kkk  = kkk / 1000;
			ccc  = kkk / 1000;
		}
		if ($('EnDeDOM.TS.timestamp').value!=='') { $('EnDeDOM.TS.timestamp').value = kkk; }
		if ($('EnDeDOM.TS.reftime').value  !=='') { $('EnDeDOM.TS.reftime').value   = ccc; }
		$('EnDeDOM.TS.isFmt').value     = item;
		return false; // we're ready here
		break;
	}
	// anything else uses UNIX format as input and output
	var mode= EnDeGUI.get_radio('mode');
	var dt  = null;
	var ms  = null;
	var ts  = null;
	var now = null;
	var newts   = null;
	var offset  = null;
	var reftime = null;
	var use_gmt = null;
	var bux = '<pre>';
	switch (item) {
	case 'compute':
		use_gmt = $('EnDeDOM.TS.GMT').checked;
		dt  = EnDe.TS.matchDateTime( 'all', mode,$('EnDeDOM.TS.yY').checked, $('EnDeDOM.TS.strict').checked, $('EnDeDOM.TS.hm').checked, $('EnDeDOM.TS.human').value );
		if (dt) {
			dt  = this.getGMT(use_gmt,dt);
			this.setFields(dt);
		}
		break;
	case 'date2ts':
		var year    = $('EnDeDOM.TS.year').value;
		var month   = $('EnDeDOM.TS.mon').value - 1;
		var day     = $('EnDeDOM.TS.day').value;
		var hour    = $('EnDeDOM.TS.hour').value;
		var minutes = $('EnDeDOM.TS.min').value;
		var seconds = $('EnDeDOM.TS.sec').value;
		if ((isNaN(year)) || (isNaN(month)) || (isNaN(day)) || (isNaN(hour)) || (isNaN(minutes)) || (isNaN(seconds))) {
		        return false;
		}
// ToDo: EnDe.TS.now  check: if set then replace empty fields by current time
		dt = new Date(year, month, day, hour, minutes, seconds);
		this.setFields(dt);
		this.setDate(dt);
		$('EnDeDOM.TS.timestamp').value = this.getTime(dt);
		this.setFormat('2unix'); // format is UNIX now, update display
		dt = null;
		break;
	case 'ts2date':
		// conversion functions rely on UNIX format, hence normalize
		kkk = $('EnDeDOM.TS.timestamp').value;
		switch (isFormat) { // normalize ..
		  case '2unix': ts = this.msTime(kkk); break; // nothing to do
		  case '2asp':  ts = EnDe.TS.a2u(kkk);              break;
		  case '2win':  ts = EnDe.TS.a2u(EnDe.TS.w2a(kkk)); break;
		  case '2dos':  ts = EnDe.TS.a2u(EnDe.TS.d2a(kkk)); break;
		  case '2ole':  ts = EnDe.TS.a2u(EnDe.TS.o2a(kkk)); break;
		}
		this.setFormat('2unix'); // format is UNIX now, update display
		// compute ..
		dt = new Date();
		dt.setTime(ts);
		this.setFields(dt);
		this.setDate(dt);
		dt = null;
		break;
	case 'date2offset':
		offset  = EnDe.TS.matchOffset( 'all', mode, $('EnDeDOM.TS.yY').checked, $('EnDeDOM.TS.strict').checked, $('EnDeDOM.TS.hm').checked, $('EnDeDOM.TS.human').value );
		$('EnDeDOM.TS.offset').value   = Math.floor(offset);
		break;
	case 'offset2date':
// ToDo: not yet ready; just hours!
		use_gmt = $('EnDeDOM.TS.GMT').checked;
		offset  = Math.floor($('EnDeDOM.TS.offset').value);
		now     = new Date();
		now     = this.getGMT(use_gmt,now);
		now.setTime((now.getTime()+offset));
		$('EnDeDOM.TS.human').value = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
		EnDeGUI.alert('EnDeGUI.TS.dispatch'," ** not yet ready ** ");
		now     = null;
		break;
	case 'addOffset':
		offset  = this.msTime( $('EnDeDOM.TS.offset').value );
		now     = new Date();
		now.setTime((now.getTime()+offset));
		$('EnDeDOM.TS.timestamp').value = this.getTime(now);
		now     = null;
		break;
	case 'isOffset':
		reftime = this.msTime( $('EnDeDOM.TS.reftime').value );
		ts      = this.msTime( $('EnDeDOM.TS.timestamp').value );
		offset  = new Date();
		offset.setTime(reftime-ts);
		$('EnDeDOM.TS.offset').value   = this.getTime(offset);
		offset  = null;
		break;
	case 'isTS':
		reftime = this.msTime( $('EnDeDOM.TS.reftime').value );
		offset  = this.msTime( $('EnDeDOM.TS.offset').value );
		newts   = new Date();
		newts.setTime(reftime+offset);
		$('EnDeDOM.TS.timestamp').value = this.getTime(newts);
		newts   = null;
		break;
	case 'now':
		use_gmt = $('EnDeDOM.TS.GMT').checked;
		dt = new Date();
		dt = this.getGMT(use_gmt,dt);
		ms = Math.floor(dt.getTime());
		this.setFields(dt);
		this.setFormat('2unix'); // format is UNIX now, update display
		dt = null;
		break;
	case 'guess':
		var asint = 0;
		var src   = EnDe.Text.Trim( $('EnDeDOM.TS.human').value );
		var arr   = src.split(/[\/:\ \|\.\,\;\!\$\+\-]/);
		bux += '===================================================\n';
		bux += '[ ]: ' + src + '\n' + EnDe.TS.guess(src) + '\n';
		for (var x in arr) {
			if (x==='indexOf') { continue; }
			bux += '===================================================\n';
			bux += '[' + x + ']: ' + arr[x] + '\n' + EnDe.TS.guess(arr[x]) + '\n';
		}
		bux += '</pre>';
		EnDeGUI.cont(bux); // ToDo: should be this.parent.cont(bux);
		break;
	case 'scratch':
		this.scratch();
		break;
	}
	return false;
  };
}; // TS

this.FF         = new function() {
  this.sid      = function() { return(EnDeGUI.sid() + '.FF'); };

  this.motion   = false;// set true while mouse button down
  this.mousex   = 0;    // X-position
  this.mousey   = 0;    // Y-position
  this.mouseobj = null; // obj
// ToDo: .movable not yet working
// ToDo: .mousobj needs to be a hash with key src (from .movable)
  this.movable  = function(srcparent,src) {
  //#? handler for move with button down
	var x = 0, y = 0;
	EnDeGUI.FF.mouseobj = $(srcparent);
	$(src).onmousedown = function(e) {
		EnDeGUI.FF.mousex = EnDeGUI.FF.mouseobj.offsetLeft - e.pageX;
		EnDeGUI.FF.mousey = EnDeGUI.FF.mouseobj.offsetTop  - e.pageY;

		document.onmousemove = function(e) {
			EnDeGUI.FF.mouseobj.style.left = (e.pageX + EnDeGUI.FF.mousex);
			EnDeGUI.FF.mouseobj.style.top  = (e.pageY + EnDeGUI.FF.mousey);
			//EnDeGUI.FF.mouseobj.setAttribute('left', (e.pageX + EnDeGUI.FF.mousex));
			//EnDeGUI.FF.mouseobj.setAttribute('top',  (e.pageY + EnDeGUI.FF.mousey));
		};

		document.onmouseup = function() {
			document.onmousemove = null;
			document.onmouseup   = null;
		};

   		return false;
  	}
  }; // movable

  this.update   = function(item,mode,uppercase,src,prefix,suffix,delimiter,func) {
  //#? update content of Functions window; returns new content
	/* uses selections and settings from EnDe.API.* and EnDe.GUI.*  */
	/* func is the full qualified function path, like EnDe.EN.esc */
	function __add(_o,_n) { // add a comma and parameter
		var _ret = '';
		if (_n!==null) {
			if (_o!=='') { _ret += ','; }
			_ret += _n;
		}
		return _ret;
	}
	var bux     = '';
	var old     = $('EnDeDOM.FF.text').value;
	var add     = $('EnDeDOM.GUI.append').checked;
	if (item!==null) {
		item    = '"' + EnDe.EN.esc('escQuote','',false,item,'','','')      + '"';
	}
	if (mode!==null) {
		mode    = '"' + EnDe.EN.esc('escQuote','',false,mode,'','','')      + '"';
	}
	if (src!==null) {
		src     = '"' + EnDe.EN.esc('escQuote','',false,src,'','','')       + '"';
	}
	if (prefix!==null) {
		prefix  = '"' + EnDe.EN.esc('escQuote','',false,prefix,'','','')    + '"';
	}
	if (suffix!==null) {
		suffix  = '"' + EnDe.EN.esc('escQuote','',false,suffix,'','','')    + '"';
	}
	if (delimiter!==null) {
		delimiter= '"'+ EnDe.EN.esc('escQuote','',false,delimiter,'','','') + '"';
	}
	if (uppercase!==null) {
		uppercase= uppercase;
	}
	var varval  = EnDeGUI.get_radio('value');
	if (varval!=='value') {
		prefix      = "$('EnDeDOM.API.prefix').value";
		suffix      = "$('EnDeDOM.API.suffix').value";
		delimiter   = "$('EnDeDOM.API.delimiter').value";
		uppercase   = "$('EnDeDOM.API.uppercase').checked";
		if (/\.DE\./.test(func)===true) {
			src     = "$('EnDeDOM.DE.text').value";
		} else { // 'EN' and anything else
			src     = "$('EnDeDOM.EN.text').value";
		}
	}
	if (add===true) { // add function call
		if (old!=='') {
			bux = old + '+\n';
			old = '';
		}
	} else { // insert function call
		if (old!=='') {
			old = '+' + old;
			src = '""'; // don't use existing text if there is already something on the stack
		}
	}
	var bbb = '';
	bbb += __add( bbb, item );
	bbb += __add( bbb, mode );
	bbb += __add( bbb, uppercase );
	bbb += __add( bbb, src + old );
	bbb += __add( bbb, prefix );
	bbb += __add( bbb, suffix );
	bbb += __add( bbb, delimiter );
	bux += func + '(' + bbb + ')';
	return bux;
  }; // update

  this.dispatch = function(obj,item) {
  //#? dispatcher for functions in nested mode (Function window)
	/* function may be called directly or by EnDeGUI.dispatch() */
	_spr('EnDeGUI.FF.dispatch(obj.id="' + obj.id + '", item=' + item + ')');
	function __cmt(_p) { // get new value for parameter
		var _c = $('EnDeDOM.GUI.cmt').checked;
		switch (_p) {
		  case 'prefix':    return ((_c===true)? '/*Prefix*/' : '') + '"' + $('EnDeDOM.API.prefix').value.replace(rex,function(c){return('\\'+c)}) + '"';    break;
		  case 'suffix':    return ((_c===true)? '/*Suffix*/' : '') + '"' + $('EnDeDOM.API.suffix').value.replace(rex,function(c){return('\\'+c)}) +'"';     break;
		  case 'delimiter': return ((_c===true)? '/*Delim.*/' : '') + '"' + $('EnDeDOM.API.delimiter').value.replace(rex,function(c){return('\\'+c)}) + '"'; break;
		}
		return '';
	};
	if (obj.tagName.toUpperCase() == 'SELECT') {
			if (obj.selectedIndex < 0) { return false; }
	}
	obj.selectedIndex = -1; // onClick hack
	var src = $('EnDeDOM.FF.text').value;
	if ($('EnDeDOM.GUI.select').checked===true) {
		// use selection if there is one
		var kkk = EnDeGUI.selectionGet( $('EnDeDOM.FF.text') );
		if ((kkk!=null) && (kkk!='')) { src = kkk; }
		kkk = null;
	}
	_dpr('EnDeGUI.FF.dispatch: src='+src);
	try {
		var bux = '';
		var rex = /[\"\\]/g;
		switch (item) { // avoid eval() error for some actions ..
		  case 'param'  : break;
		  case 'enc'    :  // .. only these require eval() ..
		  case 'dec'    :
		  case 'pad'    :
		  case 'win'    :
		  case 'alert'  :
		  case 'eval'   : bux = eval(src);  break;
		}
		_dpr('EnDeGUI.FF.dispatch: evaled='+bux);
		switch (item) {
		  case 'enc'    : $('EnDeDOM.EN.text').value = bux;        break;
		  case 'dec'    : $('EnDeDOM.DE.text').value = bux;        break;
		  case 'pad'    : EnDeGUI.scratch('Function', bux);        break;
		  case 'win'    : EnDeGUI.cont('<pre>' + bux + '</pre>');  break;
		  case 'alert'  : alert(bux);                              break;
		  case 'eval'   : /* nothing to do;already done above */;  break;
		  case 'clear'  : $('EnDeDOM.FF.text').value='';           break;
		  case 'JSlc'   : $('EnDeDOM.FF.text').value = src.replace(/\$\('EnDeDOM\.API\.uppercase'\)\.checked/g, '/* case*/false'); break;
		  case 'JSuc'   : $('EnDeDOM.FF.text').value = src.replace(/\$\('EnDeDOM\.API\.uppercase'\)\.checked/g, '/* case*/true');  break;
		  // following need to take care about \ and " which need to be escaped
		  case 'prefix' : $('EnDeDOM.FF.text').value = src.replace(/\$\('EnDeDOM\.API\.prefix'\)\.value/g,    __cmt(item) ); break;
		  case 'suffix' : $('EnDeDOM.FF.text').value = src.replace(/\$\('EnDeDOM\.API\.suffix'\)\.value/g,    __cmt(item) ); break;
		  case 'delimiter':$('EnDeDOM.FF.text').value= src.replace(/\$\('EnDeDOM\.API\.delimiter'\)\.value/g, __cmt(item) ); break;

		  // following description hardcoded
		  case 'param'  :
		 	$('EnDeDOM.FF.text').value = '/* description of parameters and access to DOM values:\n'
			+ ' * name        DOM variable                         other possible values\n'
			+ ' * -----------+------------------------------------+---------------------\n'
			+ ' *       type                                       -depends on function-\n'
			+ ' *       mode                                       "strict", "lazy", "verbose"\n'
			+ ' *  uppercase  $("EnDeDOM.API.uppercase").checked   true, false\n'
			+ ' *        src  $("EnDeDOM.EN.text").value           "-any string-"\n'
			+ ' *        src  $("EnDeDOM.DE.text").value           "-any string-"\n'
			+ ' *     prefix  $("EnDeDOM.API.prefix").value        "-any string-"\n'
			+ ' *     suffix  $("EnDeDOM.API.suffix").value        "-any string-"\n'
			+ ' *  delimiter  $("EnDeDOM.API.delimiter").value     "-any string-"\n'
			+ ' *        len                                       -any integer-\n'
			+ ' *     padChr                                       "-any character-"\n'
			+ ' *         ip  $("EnDeDOM.IP.ip").value             ip.ip.ip.ip\n'
			+ ' * _n1_ .. _n7_                                     -unused-\n'
			+ ' * -----------+------------------------------------+---------------------\n'
			+ ' */\n'
			+ $('EnDeDOM.FF.text').value;
			break;
		}
	} catch (e) { EnDeGUI.alert('EnDeGUI.FF.dispatch','eval '+e); }
	return false;
  }; // dispatch

  this.parse    = function(src) {
  //#? parse function string and print beautyfied
	var tab = '';
	var ccc = '';
	var iscmt = false;
	var isstr = false;
	var isfnc = false;
	var bux = '';
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charAt(i);
		if (iscmt===true) { // simple /* .. */ comments
			if (ccc==='*') {
				if (src.charAt(i+1)==='/') {
					iscmt = false;
					bux += ccc;
					bux += src.charAt(i+1);
					i++;
					continue;
				}
			}
			bux += ccc;
			continue;
		}
		if (isfnc===true) { // our internal $(..) function
			if (ccc===')') { isfnc = false; }
			bux += ccc;
			continue;
		}
		if (isstr===true) { // NOTE that only strings enclosed in " are supported
			if (ccc==='\\'){// simply toggle off
				if (src.charAt(i+1)==='"') { isstr = false; }
			}
			if (ccc==='"') { isstr = false; }
			bux += ccc;
			continue;
		}
		switch(ccc) {
		  case '/'  : if (src.charAt(i+1)==='*') { iscmt = true; } bux += ccc;      break;
		  case '$'  : if (src.charAt(i+1)==='(') { isfnc = true; } bux += ccc;      break;
		  case '"'  : isstr = true; bux += ccc;              break;
		  case '('  : tab += '\t';  bux += ccc + '\n' + tab; break;
		  case ')'  : tab  = tab.substr(0,(tab.length-1)); bux += '\n' + tab + ccc; break;
		  case ','  :               bux += ccc + '\n' + tab; break;
		  case ';'  :               bux += ccc + '\n' + tab; break;
		  default   :               bux += ccc;              break;
		}
	}
	ccc = null;
	tab = null;
	return bux;
  }; // parse
}; // FF

this.NN         = new function() {
  this.sid      = function() { return(EnDeGUI.sid() + '.NN'); };

  this.dispatch = function(obj,item) {
  //#? dispatcher for text manipulation functions
	_spr('EnDeGUI.NN.dispatch(obj.id="' + obj.id + '", item=' + item + ')');
	if (obj.tagName.toUpperCase() == 'SELECT') {
			if (obj.selectedIndex < 0) { return false; }
	}
	obj.selectedIndex = -1; // onClick hack
	var bux = '';
	switch (obj.id) {
	  case 'EnDeDOM.FF.load'  : bux = $('EnDeDOM.FF.text'); break;
	  case 'EnDeDOM.GUI.toEN' :
	  case 'EnDeDOM.EN.Menu.s': bux = $('EnDeDOM.EN.text'); break;
	  case 'EnDeDOM.GUI.toDE' :
	  case 'EnDeDOM.DE.Menu.s': bux = $('EnDeDOM.DE.text'); break;
	  case 'EnDeDOM.GUI.toRE' :
	  case 'EnDeREtext'       : bux = $('EnDeDOM.RE.text'); break;
	}
	var ccc = EnDeGUI.positionGet( bux );
	switch (item) {
	  case 'clear'      : bux.value = '';               break;
	  case 'sample'     : bux.value = EnDeGUI.sample;   break;
	  case 'txtREPuser' : bux.value = EnDeGUI.MP.replace('user', bux.value); break;
	  default:
		if (item.match(/^txt/)!==null) { bux.value = EnDe.Text.dispatch( bux.value, item, ccc ); }
		if (item.match(/[0-9a-f ]+/)!==null) {  // Unicode/UTF-8 mismatch; dead beef
			/*
			 * data to be inserted is item, but EnDe.Text.dispatch() has
			 * no parameter for data to be inserted, hence we pass it as
			 * part of the item
			 */
			bux.value = EnDe.Text.dispatch(bux.value,'txtINSUCS' + item,ccc);
		}
		// otherwise ignore
		break;
	}
	return false;
  };
}; // NN

this.PW         = new function() {
  this.sid      = function() { return(EnDeGUI.sid() + '.PW'); };

  this.dispatch = function(obj,item) {
  //#? check password strength
	_spr('EnDeGUI.PW.dispatch(obj.id="' + obj.id + '", item=' + item + ')');
	var bux = '';
	var src = $('EnDeDOM.PW.text').value;
	bux = '';
  alert('**NOT YET IMPLEMENTED: check password strength\n'+src);
	return false;
  }; // dispatch
}; // PW

this.test       = function(mode) {
//#? simple test function for all tests defined in EnDe.Test.test()
	_spr('EnDeGUI.test('+$('EnDeDOM.GUI.file').value+')');

	function __td(tag,src,exp,enc,dec,err) {
	//#? create and return TD object
		var _in = '';
		var _td = null;
		if (tag==='TH') {
			_td = document.createElement('TH');
		} else {
			_td = document.createElement('TD');
		}
		switch (tag) {
		  case 'T2':
			_td.colSpan   = 2;
		  case 'TD':
		  case 'TH': _td.innerHTML = src; break;
		  case 'data':
			_td.colSpan   = 3;
			_td.innerHTML = EnDe.Text.Entity(src);;
			_td.setAttribute( 'class', 'data');
			break;
		  case 'error':
			_td.colSpan   = 3;
			_td.innerHTML = EnDe.Text.Entity(src);;
			_td.setAttribute( 'class', 'error');
			break;
		  case 'check':
			_in = '<input type="checkbox" style="background-color:';
			if (enc===null) {  // succeded
				_in += '#00ff00;" checked />';
			} else {
				_in += '#ff0000;" disabled />';
			}
			if (dec==='-undef-') {
				_in += ' -';
			} else {
				_in += '<input type="checkbox" style="background-color:';
				if (dec===null) {  // succeded
					_in += '#00ff00;" checked />';
				} else {
					_in += '#ff0000;" disabled />';
				}
			}
			_td.innerHTML = _in;
			break;
		  case 'show':
			_in = '';
			if (enc===null) {  // succeded
				_in += '&#160;';
			} else {
				_in += '<span><pre>' + EnDe.Text.Entity(expt) + '</pre></span><br>';
				_in += '<span><pre>' + EnDe.Text.Entity(enc) + '</pre></span>';
			}
			if (dec===null) {  // succeded
				_in += '&#160;';
			} else {
				if (dec==='-undef-') {
					_in += '';
				} else {
					_in += '<span><pre>' + EnDe.Text.Entity(src) + '</pre></span><br>';
					_in += '<span><pre>' + EnDe.Text.Entity(dec) + '</pre></span>';
				}
			}
			if (err!==null) {
					_in += '<span></span>'; // green :-)
					_in += 'Exception: <span><pre>' + err + '</pre></span>';
// ToDo:			_in += 'Exception: <span><pre>' + EnDe.Text.Entity(err) + '</pre></span>';
			}
			_td.innerHTML = _in;
			break;
		  default:
			break;
		}
		return _td;
	}; //__td

	var bux = $('EnDeDOM.TST.tst');
	var str = $('EnDeDOM.TST.str');
	var src = $('EnDeDOM.GUI.file').value;
	if (src.match(/^\s*$/)!==null) { src = 'EnDeTest.txt'; }
	var tst = '';
	var kkk = null;
	var txt = '';
	var tr  = null;
	switch (mode) {
	  case 'E':                       tst = EnDe.Test.test($('EnDeDOM.EN.text').value); break;
	  default: EnDeGUI.txt.read(src); tst = EnDe.Test.test(EnDeGUI.txt.content);        break;
	}
	// display version and table
	var div = document.createElement('DIV');
	div.innerHTML  = EnDe.sid()      + '<br />';
	div.innerHTML += EnDe.Test.sid() + '<hr />';
	bux.appendChild(div);
	div = document.createElement('TABLE');
	tr  = document.createElement('CAPTION');
	tr.setAttribute( 'style', 'border:1px solid black');
	div.setAttribute('style', 'border:1px solid black');
	tr.innerHTML = 'legend';
	div.appendChild(tr);
	tr  = document.createElement('TR');
	tr.appendChild( __td('data','string used for en-/decoding',null,null,null,null));
	div.appendChild(tr);
	tr  = document.createElement('TR');
	tr.appendChild( __td('TH','mode',null,null,null,null));
	tr.appendChild( __td('T2','title for this group of tests',null,null,null,null));
	div.appendChild(tr);
	tr  = document.createElement('TR');
	tr.appendChild( __td('TD','function',null,null,null,null));
	tr.appendChild( __td('check',null,null,null,null,null));
	tr.appendChild( __td('TD','encoding returned expected text,<br>decoding returned inital string',null,null,null,null));
	div.appendChild(tr);
	tr  = document.createElement('TR');
	tr.appendChild( __td('TD','function',null,null,null,null));
	tr.appendChild( __td('check','test string','expected result',null,'-undef-',null));
	tr.appendChild( __td('TD','encoding returned expected text,<br>decoding not available',null,null,null,null));
// ToDo: liefert Fehler tr.appendChild( __td('show','test string','expected result','encoded result','-undef-'));
	div.appendChild(tr);
	tr  = document.createElement('TR');
	tr.appendChild( __td('TD','function',null,null,null,null));
	tr.appendChild( __td('check','test string',null,null,'expected result','-undef-'));
	tr.appendChild( __td('TD','encoding returned expected text,<br>decoding failed',null,null,null,null));
	div.appendChild(tr)
	tr  = document.createElement('TR');
	tr.appendChild( __td('TD','function',null,null,null,null));
	tr.appendChild( __td('check','test string',null,'expected result','-undef-',null));
	tr.appendChild( __td('TD','encoding failed, decoding not called',null,null,null,null));
	div.appendChild(tr);
	tr  = document.createElement('TR');
	tr.appendChild( __td('error','error, if any, occoured while reading data from file',null,null,null));
	div.appendChild(tr);
	// display results
	while ((kkk=tst.shift())!==undefined) {
		tr  = document.createElement('TR');
		//tr.id = 'T' + func;
		/*   #                      if failed        if failed
		 *          #[ type,     expected, encoded,   decoded,   exception ]
		 *           ['urlCHR',  'quick!', 'murks!',  'falsch',  'NaN'     ],
		 *               v           |       |          |         |       */
		var func = kkk.shift(); //   |       |          |         |
		var expt = kkk.shift(); // <-/       |          |         |
		var strE = kkk.shift(); // <---------/          |         |
		var strD = kkk.shift(); // <--------------------/         |
		var err  = kkk.shift(); // <------------------------------/
		//var txt  = EnDe.Test.text(succ);
		switch (func) {
		  case '_error':// show errors found in .txt file with testcases
			// _error',error text,null,null,null
			tr.appendChild( __td('error',expt,null,null,null,err));
			break;
		  case '_data': // new test pattern
			// _data',title,mode,txt,null
			txt = strD;
			tr.appendChild( __td('data',txt,null,null,null,err));
			div.appendChild(tr);
			tr  = document.createElement('TR');
			tr.appendChild( __td('TH',strE,null,null,null,err));
			tr.appendChild( __td('T2',expt,null,null,null,err));
			str.value = txt; // store test pattern in GUI
			break;
		  default: // result data for test
			tr.appendChild( __td('TD',func,null,null,null,err));
			tr.appendChild( __td('check',txt,expt,strE,strD,err));
			tr.appendChild( __td('show',txt,expt,strE,strD,err));
			break;
		}
		div.appendChild(tr);
	}
	bux.appendChild(div);
	return false;
}; // test

this.testClear  = function() {
//#? remove objects from DOM created by this.test()
	var div = $('EnDeDOM.TST.tst');
	var obj = null;
	var len = div.childNodes.length;
	var i   = 0;
	while (div.firstChild != null) {
		i++;
		if (i>999) break;
		obj = div.firstChild;
		try       { div.removeChild(obj); }
		catch (e) { /* EnDeGUI.alert('EnDeGUI.testClear',e); */ } // ToDo: fails on some nodes
	}
	return false;
}; // testClear

this.reset      = function(obj) {
//#? reset value of given DOM object
	try       { obj.value = ''; }
	catch (e) { EnDeGUI.alert('EnDeGUI.reset',e); }
	return false;
}; // reset

this.clear      = function() {
//#? clear encoding and decoding input fields
	// ToDo:  same as form's type=reset
        this.reset($('EnDeDOM.EN.text'));
        this.reset($('EnDeDOM.DE.text'));
	return false;
}; // clear

this.hidden     = function(src) {
//#? toggle visibility of hidden objects (those marked experimental with hide= attribute)
	/* if src is null or empty, toggle from hidden to visible or vice versa
	 * otherwise set to given value
	 */
	var bbb = null;
	var ccc = document.getElementsByTagName("*");   // quick&dirty and slow, but works in all browsers
	var kkk = src;
	if ((src == null) || (src == '')) {
		kkk = (EnDeGUI.experimental == 'hidden') ? 'visible' : 'hidden';
		EnDeGUI.experimental = kkk; // toggle
	}
	for (bbb=0;bbb<ccc.length;bbb++) {  // IE crashes here
/* #dbx */if (ccc[bbb]===undefined) { alert(bbb); }
		if (ccc[bbb].hasAttribute('hide')===true) {
			ccc[bbb].style.visibility = kkk;
		}
	}
	bbb = null;
	ccc = null;
	return false;
}; // hidden

this.jokes      = function() { EnDeGUI.Obj.unhideall(); return false; };
//#? wrapper for EnDeGUI.Obj.unhideall()

this.pimp       = function() {
//#? set some sexy styles
	_spr('EnDeGUI.pimp(): '+this.pimped);

	function _toggleButtonImg (obj,src,cls,img) {
	/* toggle backgroundImage for button tags */
		if (EnDeGUI.pimped===false) {
			if (obj.getAttribute('value').match(new RegExp('^\\s*'+src+'\\s*$'))!==null) {
				obj.oldval                 = obj.value;
				obj.oldcls                 = obj.getAttribute('class');
				obj.old_bg                 = obj.style.background;
				obj.value                  = '';
				obj.setAttribute('class', cls);
	// ToDo: following is ugly hack for some buttons inside tables
				if (img!=='') {
					obj.style.background       = '#555fff'; // must match EnDe.css !
					obj.style.backgroundImage  = 'url("' + img + '")';
					obj.style.maxWidth         = '22px';    // must match picture
				}
			}
		} else {
			if (obj.oldval!==null) {
				obj.style.backgroundImage  = '';
				obj.style.background       = obj.old_bg;
				obj.style.color            = '#000000';
				obj.value                  = obj.oldval;
				obj.setAttribute('class', obj.oldcls);
			}
		}
	}; // _toggleButtonImg

	function _toggleInputImg (obj,attr,src,cls) {
	/* toggle backgroundImage for input tags */
		if (EnDeGUI.pimped===false) {
			if (obj.getAttribute(attr)===null) { return; }
			if (obj.getAttribute(attr).match(new RegExp(src))!==null) {
				obj.oldval    = obj.innerHTML;
				try { // beat browser dragons ...
					obj.oldcls = obj.className;  // ToDo: fails in some modern browsers (i.e Firefox > 3.x)
					// obj.setAttribute('oldcls', cls); // ToDo: fails also
					obj.className = cls;
				} catch(e) {
					obj.oldcls = obj.getAttribute('class');
					if (obj.oldcls !== null) {
						obj.setAttribute('class', cls);
					} else {
						obj.oldcls = obj.getAttribute('className');
						obj.setAttribute('className', cls);
					}
				}
				obj.innerHTML = '';
				EnDeGUI.dpr('  _toggle CSS old: ' + obj.oldcls);
				//EnDeGUI.dpr('  CSS Old: ' + obj.className);
			}
		} else {
			if (obj.oldval != null) {
				obj.innerHTML = obj.oldval;
				obj.setAttribute('class', obj.oldcls);
				EnDeGUI.dpr('  CSS new: ' + obj.oldcls);
			}
		}
	}; // _toggleInputImg

	/*
	 * document.styleSheets[0] has following attributes:
	 *  type, disabled, ownerNode, parenStyleSheet, href, title, media,
	 *  ownerRule, cssRules, insertRule, deleteRule
	 */
	// find .head CSS class
	var bbb = document.styleSheets[0];
	if (bbb.cssRules == null) { return false; } // browser does not support it
// ToDo: need to identify correct style according bbb.href or bbb.title instead of using [0]
	var ccc = null;
	for (ccc in bbb.cssRules) {
		if (bbb.cssRules[ccc].cssText == null) { continue; }
		if (bbb.cssRules[ccc].cssText.match(/^\.head\s*\{/)!==null) {
			this.dpr('  CSS rule: ' + bbb.cssRules[ccc].cssText);
			if (this.pimped===false) {
				bbb.cssRules[ccc].style.backgroundImage = 'url("img/h_bg.gif")';
				bbb.cssRules[ccc].style.margin = '0px 2px 0px 2px';
			} else {
				bbb.cssRules[ccc].style.backgroundImage = '';
			}
		}
		
	}
//	if (EnDeGUI.isOpera===true) {
//		// Opera has no cssText
//		document.styleSheets[0].cssRules[11].style.backgroundImage='url("img/h_bg.gif")';
//	}
	bbb = document.getElementsByTagName('button');
	for (ccc=0; ccc<bbb.length; ccc++) {
		if (bbb[ccc].getAttribute('onclick')===null) { continue; }
		if (bbb[ccc].id.match(/\.b[hqsw]$/) ===null) { continue; }
		this.dpr('  button: ' + bbb[ccc].id);
		_toggleInputImg(bbb[ccc], 'onclick', 'EnDeGUI.help' ,'help');
		_toggleInputImg(bbb[ccc], 'onclick', 'EnDeGUI.show' ,'fold');
		_toggleInputImg(bbb[ccc], 'name',    'window' , 'code'   );
		_toggleInputImg(bbb[ccc], 'name',    'scratch', 'scratch');
		_toggleInputImg(bbb[ccc], 'name',    'guess',   'guess'  );
	}
	bbb = null;
	bbb = document.getElementsByTagName('input');
	for (ccc=0; ccc<bbb.length; ccc++) {
		if (bbb[ccc].getAttribute('class')  ===null ) { continue; }
		if (bbb[ccc].getAttribute('type')   ===null ) { continue; }
		if (bbb[ccc].getAttribute('type')!=='button') { continue; }
		this.dpr('  input: ' + bbb[ccc].id);
// ToDo: Konquereor 3.5.5 fails with next check
// ToDo: ugly hack for buttons inside table: need img path
		_toggleButtonImg (bbb[ccc], ' < ',  'larr', 'img/22x22/larr.png');
		_toggleButtonImg (bbb[ccc], ' > ',  'rarr', 'img/22x22/rarr.png');
		_toggleButtonImg (bbb[ccc], ' <> ', 'swap', 'img/22x22/swap.png');
		_toggleButtonImg (bbb[ccc], 'now',  'time', '');
	}
	this.pimped = !this.pimped;
	bbb = null;
	ccc = null;
	return false;
}; // pimp

this.tool       = function(src) {
//#? toggle display of tools
	_spr('EnDeGUI.tool('+src+')');
	if (src == '') { return true; }
	var ccc = null;
	var kkk = [];   // objects to be displayed
	var target = null;
	switch (src) {
	  case '_all_'  :
		for (ccc in this.toolObjects) { if(this.toolObjects[ccc]==='block') { kkk.push(ccc); } }
		break;
	  case 'EnDeDOM.f.DBX':
		EnDeGUI.trace = !EnDeGUI.trace; // if called via [trace] button
		// no break;
	  case 'EnDeDOM.f.TST':
		target = $(src);
		target.style.display = 'block';
		return false;
		break;
	  case 'EnDeDOM.f.ED' : // En-/Decoding is special
		kkk.push('EnDeDOM.f.ED');
		kkk.push('EnDeDOM.f.EDO');
		kkk.push('EnDeDOM.f.EN');
		kkk.push('EnDeDOM.f.DE');
		kkk.push('EnDeDOM.f.GUI');
		kkk.push('EnDeDOM.f.API');
		break;
	  case 'EnDeDOM.f.CH' : // Character may be closed
		$('EnDeDOM.CH').style.display = 'block';
		//no break;
	  default  :
		kkk.push('EnDeDOM.f.GUI');
		kkk.push(src);
		break;
	}
	if (kkk.length > 0 ) {
		// first set all to none ..
		for (ccc in this.toolObjects) {
			target = $(ccc);
			target.style.display = 'none';
		}
		// .. now set selected to block
		while ((ccc=kkk.pop())!=null) {
			target = $(ccc);
			target.style.display = 'block';
		}
	}
	target = null;
	return false;
}; // tool

this.pathhack   = function(obj,src) {
//#? try to get full path from field (obj) of type=file
	// NOTE that browser privileges should already be set
	/* src is fallback filename, obj is object of input tag */
	/*
	 * this is what we try to fix here (for obj.value):
	 *
	 * Linux X browsers:
	 *
	 * Mac OS X browsers:
	 *  Firefox 3:    file.txt
	 *  Opera 9.5:    C:\fake_path\file.txt
	 *  Safari 4 (Developer Preview): /Users/EnDe/file.txt
	 *  OmniWeb 5:    file.txt  ; ToDo: crashes when reading from file:///
	 *
	 * Windows browsers:
	 *  Mozilla 1.7:  X:\My Documents\file.txt
	 *  Firefox 2:    X:\My Documents\file.txt
	 *  Firefox 3:    file.txt
	 *  Opera 9.5:    C:\fake_path\file.txt
	 *  Opera 10.5:   C:\fake_path\file.txt
	 *  Chrome 3.0:   file.txt
	 *  Chrome 4.0:   file.txt
	 *  Safari 3.1.1: X:\My Documents\file.txt
	 *  IE 7 mode:    file.txt
	 *  IE 8:         file.txt
	 */
	function _clean(_src) {
	// clean up path (replce \ with /; space with %20 and remove quotes
		_src = _src.replace(/\\/g, '/');
		_src = _src.replace(/ /g, '%20'); // replace spaces
		/* assuming that filenames with meta characters are quoted
		 * then quotes must be the very first and the very last character
		 * any other such quote is considered as part of the filename
		 */
		if (_src.match(/^".*"$/)!==null) { _src = _src.substr(1,_src.length-2); return _src; }
		if (_src.match(/^'.*'$/)!==null) { _src = _src.substr(1,_src.length-2); }
		return _src;
		// ToDo: use proper URL encding for the path
	}; // _clean
	_dpr('EnDeGUI.pathhack(' + src + ')');
	if (obj===null) { return src; }
	var bux = null;
	try { // as in Chrome 4
		bux = obj.files.item(0).fileName;
		bux = bux.replace(/\\/g, '/');
		EnDeGUI.dprint('EnDeGUI.pathhack: ', obj.files.item(0));
		if ((bux.match(/[\/\\]/)!==null) && (bux.match(/fake.?path/i)===null)) { return _clean(bux); }
	}
	catch(e) { _dpr('EnDeGUI.pathhack: ' + e + ' **IGNORED;'); }
	// now the Opera way ..
	bux = obj.cloneNode(true);
	bux.type = "text"; // clone is still an upload field with protected value
	if ((bux.value!=='') && (bux.value!==src)) { return _clean(bux.value); }
	// all failed, use preset user path
	_dpr('EnDeGUI.pathhack: user path: ' + $('EnDeDOM.QQ.lp').value);
	bux = $('EnDeDOM.QQ.lp').value;
	if (src.match(/fake_?path/i)!==null) {
		// ToDo: Opera's regex does not match .?
		bux += src.replace(/^.:[\/\\][\/\\]*fake.?path[\/\\]/,'');
	} else {
		if (src.match(/[\/\\][^\/\\]/)!==null) { bux = 'file://'; } // add schema
		bux += src;
	}
	return _clean(bux);
}; // pathhack

this.readlocal  = function(src,obj) {
//#? try to read local file as specified in given object of type=file
	/* returns file content or null */
	if (obj===null) { return null; }
	try {       // Jan. 2010: Firefox 3.x only
		_dpr('EnDeGUI.readlocal: files[0]=' + obj.files[0].fileName);
		return obj.files[0].getAsBinary(); // .getAsText('utf-8'); .getAsDataURL();
	}
	catch(e) {  // all other browsers most likely throw an error here
		_dpr('EnDeGUI.readlocal: ' + e);
		return null;
	}
	return null;// failsafe
}; // readlocal

this.readfile   = function(obj,item) {
//#? read file from origin or local file system
	/*
	 * this handler may be called from a button and hence has no value for
	 * the filename; filename and destination of its content must be set
	 * according given obj.id (see switch statement below)
	 */
	_spr('EnDeGUI.readfile(obj.id="' + obj.id + '", item=' + item + ')');
	var bux = null;
	var kkk = null;
	switch (obj.id) {
	  case 'EnDeDOM.FF.load'  : bux = $('EnDeDOM.FF.text'); kkk = $('EnDeDOM.FF.file');  break;
	  case 'EnDeDOM.GUI.toEN' :
	  case 'EnDeDOM.EN.Menu.s': bux = $('EnDeDOM.EN.text'); kkk = $('EnDeDOM.GUI.file'); break;
	  case 'EnDeDOM.GUI.toDE' :
	  case 'EnDeDOM.DE.Menu.s': bux = $('EnDeDOM.DE.text'); kkk = $('EnDeDOM.GUI.file'); break;
	  case 'EnDeDOM.GUI.toRE' :
	  case 'EnDeREtext'       : bux = $('EnDeDOM.RE.text'); kkk = $('EnDeDOM.GUI.file'); break;
	}
	EnDeGUI.txt.content = null;
	try {
		EnDeGUI.txt.content = EnDeGUI.readlocal(item, kkk);
		if (EnDeGUI.txt.content!==null) {   // got content (Firefox3)
			if (EnDe.File.trace===true) {
				_dpr('EnDeGUI.readfile: `'+ item + "' `use  internal data (FF3?)'");
			}
		} else {
			if (EnDe.File.trace===true) {
				_dpr('EnDeGUI.readfile: `'+ item + "' `read external file'");
			}
			EnDeGUI.txt.read(item);
		}
	}
	catch(e){ EnDeGUI.alert('EnDeGUI.readfile('+item+')',e); }
	if (EnDeGUI.txt.content!==null) {
		bux.value = EnDeGUI.txt.content;
		EnDeGUI.txt.content = null;
	} else {
		/* reading file failed; don't change anything, just log */
		_dpr('EnDeGUI.readfile: `'+ item + "' `**read failed**'");
	}
	return false;
}; // readfile

this.quirks     = function(src) {
//#? set new URL with specified browser search string
	/* if src is given, then use that in URL, otherwise compute from settings */
	_spr('EnDeGUI.quirks('+src+')');
	var bux = '&' + src;
	var kkk = document.location.href.replace(/[?&].*$/,'');
	if (src==='') {
		if ($('EnDeDOM.QQ.ul').checked===true)  { bux += '&useLabel';  }
		if ($('EnDeDOM.QQ.fl').checked===true)  { bux += '&useANCHOR'; }
		if ($('EnDeDOM.QQ.ac').checked===false) { bux += '&aClick';    }
		if ($('EnDeDOM.QQ.ac').checked===false) { bux += '&noaClick';  }
//		if ($('EnDeDOM.QQ.ba').value==='on')    { bux += '&onClick';   }    // default, no need to set
		if ($('EnDeDOM.QQ.bb').value==='on')    { bux += '&onChange';  }
	}
	document.location.href = kkk + bux.replace(/^&&?/, '?');
	return false;
}; // quirks

this.setfile    = function(obj,dst) {
//#? read filename from INPUT type=file tag and show in private tag
	_spr( 'EnDeGUI.setfile(' + obj.id + ')' );
	$(dst).value = this.pathhack(obj,obj.value);
	//$('EnDeDOM.GUI.local').checked = true;
	return true;
}; // .setfile

this.setVal     = function(obj,src,cmt) {
//#? write given value to specified textarea, prepend with comment if any
	var ccc = '';
	_spr('EnDeGUI.setVal( obj=' + obj + ', src=' + src + ', cmt=' + cmt + ')' );
	switch(obj) {
	  case 'EN':   obj = 'EnDeDOM.EN.text'; break;
	  case 'DE':   obj = 'EnDeDOM.DE.text'; break;
	  case 'FF':   obj = 'EnDeDOM.FF.text'; break; // ToDo: probably obsolete; see this.dispatch
	  case 'RE':   obj = 'EnDeDOM.RE.text'; break;
	  case 'FT':   this.setFT(src); return; break;
	  default:     return false;            break;
	}
	if ($('EnDeDOM.GUI.cmt').checked===true) {
		if (cmt!==undefined) { ccc = '/* ' + cmt + ' */\n'; }
	}
	if ($('EnDeDOM.GUI.append').checked===true) {
		$(obj).value += ccc + src;
	} else {
		$(obj).value  = ccc + src;
	}
	ccc = null;
}; // .setVal


this.setObj     = function(obj,src,cmt) {
//#? write selected value to specified textarea; **for internal use only**
	/* not a real callback handler, but used in following .setXX functions */
	_spr( 'EnDeGUI.setObj(' + obj.id + ', >' + src + '<, ' + cmt + ')' );
	var txt = [];
	var bbb = 0;
	/*  first fill required variables with values from GUI */
	var mode        = EnDeGUI.get_radio('mode');
	var func        = src.replace(/^([^(]*)\(.*/, function(c,d){return(d)});
	var item        = '--item--';   // a dummy default
	var uppercase   = $('EnDeDOM.API.uppercase').checked;
	var bux         = '';
	var prefix      = $('EnDeDOM.API.prefix').value;
	var suffix      = $('EnDeDOM.API.suffix').value;
	var delimiter   = $('EnDeDOM.API.delimiter').value;
	/* add comment, if some */
	if (cmt!==undefined) { cmt = '/* ' + cmt + ' */\n'; }
	/* src may contain a comment too, if so it should be the first line.
	 * Such a comment may contain braces like (), so we remove the line
	 * and add it immediately to the given comment cmt.
	 */
	var ccc = src.match(/^\s*\/\*/);
	if (ccc===null) {
		txt = src;
	} else {
		// JavaScript's regex are too stupid to match such comments
		// ccc = src.replace(/^(.*?\*\/).*/, function(c,d){return(d)});
		ccc = 0;
		for (bbb=0; bbb<src.length; bbb++) {
			if (ccc<4) {
				// loop to fetch comment from /* to */
				switch (src[bbb]) {
				  case '/':  cmt += src[bbb]; if (src[bbb+1]=='*') { ccc++; }; break;
				  case '*':  cmt += src[bbb]; if (src[bbb+1]=='/') { ccc++; }; break;
				  default:   cmt += src[bbb]; break;
				}
			} else {
				// strip comment
				txt[ccc-4] = src[bbb];
				ccc++;
			}
		}
		txt  = txt.join('');
	}
	func = txt.replace(/^([^(]*)\(.*/, function(c,d){return(d)});
	if (/\.DE\./.test(func)===true) {
		bux         = $('EnDeDOM.DE.text').value;
	} else { // anything else 'EN'
		bux         = $('EnDeDOM.EN.text').value;
	}
	/* now set all variables not used in required function (that one given
	 * src parameter) to null, so that .FF.update() will ignore it
	 * examples how src might look like:
	 *  EnDe.crc(src)
	 *  EnDe.join(type,mode,_n3_,src,prefix,suffix,delimiter)
	 *  EnDe.join('del',mode,_n3_,src,prefix,suffix,delimiter)
	 *  EnDe.DE.utf7(_n1_,_n2_,src,_n5_,_n6_,_n7_)
	 */
	/* // ToDo: dirty hack:
	 * some functions use the suffix parameter to pass a key value
	 * hence we allow suffix or key as parameter name
	 */
	if (/type[,\)]/.test(txt)===false)      { item      = null; }
	if (/mode[,\)]/.test(txt)===false)      { mode      = null; }
	if (/uppercase[,\)]/.test(txt)===false) { uppercase = null; }
	if (/prefix[,\)]/.test(txt)===false)    { prefix    = null; }
	if (/(suffix|key)[,\)]/.test(txt)===false) { suffix = null; }
	if (/delimiter[,\)]/.test(txt)===false) { delimiter = null; }
	/* some of the parameters may be there, but not used
	 * NOTE that they are marked with a pattern:  _nX_
	 */
	if (/_n1_/.test(txt)===true)    { item      = '_n1_'; }
	if (/_n2_/.test(txt)===true)    { mode      = '_n2_'; }
	if (/_n3_/.test(txt)===true)    { uppercase = '_n3_'; }
	if (/_n4_/.test(txt)===true)    { bux       = '_n4_'; }
	if (/_n5_/.test(txt)===true)    { prefix    = '_n5_'; }
	if (/_n6_/.test(txt)===true)    { suffix    = '_n6_'; }
	if (/_n7_/.test(txt)===true)    { delimiter = '_n7_'; }
	/* first parameter may be a string, but only if it is the type parameter
	 * in this case it is the very first parameter; extract it and pass as string
	 */
	ccc = txt.match(/\('([^']*)/);
	if (ccc!==null) {
		item = ccc[1];
	} else {
		ccc = txt.match(/\("([^"]*)/);
		if (ccc!==null) { item = ccc[1]; }
	}
	ccc = null;
	/* now we can call EnDeGUI.FF.update() */
	txt = EnDeGUI.FF.update(item,mode,uppercase,bux,prefix,suffix,delimiter,func);
	obj.value  = cmt + txt;
	ccc = null;
}; // .setObj


this.setFT      = function(src) {
//#? write selected value to file input field
	_spr('EnDeGUI.setFT('+src+')');
	if (/^\s*$/.test(src)===true) { return false; } // avoid setting empty values
	if (src.match(/^https?:\/\//)!==null) {
		$('EnDeDOM.GUI.file').value = src;
	} else {
		$('EnDeDOM.GUI.file').value = $('EnDeDOM.QQ.lp').value + src;
	}
};

	// ===================================================================== //
	// general GUI dispatcher                                                //
	// ===================================================================== //

this.dispatch = function(obj,src) {
//#? dispatcher for various GUI functions (mainly SELECT menus)

	// ToDo: this.setVal, this.setObj und this.dispatch sind nicht sauber implementiert:
	/* Hintergrund: eigentlich sollte fuer alle SELECT Menus this.dispatch()
	 * aufgerufen werden, damit der .selectedIndex Hack aktiv ist
	 * leider ist die API aber (obj,item) wobei item meist ein Text ist
	 * fuer this.setObj() wird ein weiter Parameter gebraucht: cmt .
	 * Ausserdem enden die meisten obj.id fuer die SELECT Menus mit .menu
	 * nicht jedoch das fuer die EnDe Functions im "Functions window"
	 * welches aus EnDeFunc.txt erzeugt wird. EnDeFunc.txt wird von
	 * EnDe2js.pl generiert und erzeigt eine obj.id "EnDeDOM.f.FF.func"
	 *
	 * Alle Funktionen haben z. Zt. obj als ersten Parameter, der wird
	 * aber manchmal als Objekt-Referenz und manchmal als String erwartet.
	 *
	 * Generell besteht hier die Problematik der Trennung zwischen Daten
	 * (z.B. aus den *.txt Files) und Objekten, die daraus erzeugt werden.
	 * Sollen z.B. die obj.id nur in den *.txt Files stehen? Wenn ja,
	 * dann muessen die APIs der Funktionen entsprechend parametrisiert
	 * sein. Wenn nein, dann muessen die Funktionen die obj.id hardcoded
	 * haben. Z.Zt. haben wir eine Mischung aus beidem.
	 * Siehe:  if (ccc==='FF') {
	 * ---
	 * Ueberlegung: sollen alle SELECT-Handler EnDeGUI.dispatch() sein?
	 */
	var bux = $(obj.id).value;
	var ccc = obj.id.toString().replace(/.*?\.([a-zA-Z0-9]+)\.(?:menu|func)$/, '$1'); // compute current menu/field: EN, DE, FF, ...
		/* EnDeDOM.f.FF.func has a special name */
	_spr('EnDeGUI.dispatch( obj.id="' + obj.id + '", src=' + src + ')' );
	if (obj.tagName.toUpperCase()==='SELECT') {
		if (obj.selectedIndex < 0) { return false; }
	}
	_spr('EnDeGUI.dispatch: [' + obj.selectedIndex + '] ccc=' + ccc + ', obj.title=' + obj.title );
	obj.selectedIndex = -1; // onClick hack
	//#dbx _dpr('--- ccc='+ccc+', src='+src);
	if (ccc==='FF') {
		// ToDo: ugly hack; see description at top of file
		if (/func$/.test(obj.id.toString())===true) {
			this.setObj( $('EnDeDOM.FF.text'), bux, obj.title );
		} else {
			this.setVal( ccc, bux, obj.title );
		}
		return false;
	}
	if ((src!==undefined) && (src!=='')) { ccc = src; }
	switch (ccc) {
	  case 'Check': EnDe.Check.dispatch( bux );          break;
	  default:      this.setVal( ccc, bux, obj.title ); break;
	}
	return false;
}; // dispatch

	// ===================================================================== //
	// page initialization                                                   //
	// ===================================================================== //

this.toolObjects= {     // keep JavaScript happy for style.display property
		'EnDeDOM.f.MP':  'none',
		'EnDeDOM.f.FF':  'none',
		'EnDeDOM.f.TST': 'none',
		'EnDeDOM.f.DBX': 'none',
		'EnDeDOM.GUI.QB':'none',
		'EnDeDOM.f.GUI': 'block',
		'EnDeDOM.f.API': 'block',
		'EnDeDOM.f.CH':  'block',
		'EnDeDOM.f.EDO': 'block',
		'EnDeDOM.f.ED':  'block',
		'EnDeDOM.f.EN':  'block',
		'EnDeDOM.f.DE':  'block',
		'EnDeDOM.f.IP':  'block',
		'EnDeDOM.f.TS':  'block',
		'EnDeDOM.f.RX':  'block',
		'EnDeDOM.f.PW':  'block'
}; // fsetObjects

this.showQS     = function(src) {
//#? write query string values at bottom of page
	var bbb = null;
	var ccc = $('opts');
	if (ccc===null) {
		bbb = document.getElementsByTagName('body')[0];
		ccc = document.createElement('DIV');
		ccc.id  = 'opts';
		try { button.setAttribute('class', 'blind'); } catch(e) { /* try-catch for stupid Camino and Shiira only */ }
		ccc.innerHTML  = ' ?'  + src;
		bbb.appendChild(ccc);
	} else {
		ccc.innerHTML += ' - ' + src;
	}
	bbb = null;
	ccc = null;
}; // showQS

this.initTitle  = function() {
//#? set all title= attributes
	/* titles are stored in EnDeGUI.titles{} which is set in EnDe.html */
	_spr('EnDeGUI.initTitle');
	var ccc = 0;
	var kkk = null;
	// set all tags with id attribute
	for (ccc in this.titles) {
		if (ccc==='dumm') { continue; }
		kkk = $(ccc);
		if (kkk===null)	{ continue; }
		kkk.title = this.titles[ccc];
	}
	// set all help and fold button titles
	kkk = document.getElementsByTagName('BUTTON');
	for (ccc=0;ccc<kkk.length;ccc++) {
		if (/\.bh$/.test(kkk[ccc].id)===true) { kkk[ccc].title = 'show help for this tools'; }
		if (/\.bq$/.test(kkk[ccc].id)===true) { kkk[ccc].title = 'expand/fold'; }

		kkk[ccc] = null; // no ToDo: IE8 throws error here
	}
	// set all label tags (as they don't have an id attribute);
	kkk = document.getElementsByTagName('LABEL');
	for (ccc=0;ccc<kkk.length;ccc++) {
		if (kkk[ccc].hasAttribute('for')===true) {
			kkk[ccc].title = this.titles[ kkk[ccc].getAttribute('for') ];
			// ToDo: need to check if title exists first
		}
		kkk[ccc] = null; // no ToDo: IE8 throws error here
	}
	kkk = null;
	ccc = null;
}; // initTitle

this.init       = function() {
//#? initialize GUI: parse query string options, build menus, etc.
	var bbb     = null;
	var ccc     = null;
	var kkk     = null;

	// must be very early
	if (/(trace|debug)/i.test(location.search)===true) {
		EnDeGUI.trace = true;
		if (/traceEnDe/i.test( location.search)===true) { this.settrace('EnDe'); }
		if (/traceObj/i.test(  location.search)===true) { this.settrace('Obj');  }
		if (/traceTxt/i.test(  location.search)===true) { this.settrace('Txt');  }
		if (/traceMaps?/i.test(location.search)===true) { this.settrace('Maps'); } // does not work due to include sequence
		if (/traceMenu/i.test( location.search)===true) { this.settrace('Menu'); }
		if (/traceFile/i.test( location.search)===true) { this.settrace('File'); }
		if (/traceForm/i.test( location.search)===true) { this.settrace('Form'); }
		if (/traceText/i.test( location.search)===true) { this.settrace('Text'); }
		if (/traceUser/i.test( location.search)===true) { this.settrace('User'); }
		if (/traceB64/i.test(  location.search)===true) { this.settrace('B64');  }
		if (/traceUCS/i.test(  location.search)===true) { this.settrace('UCS');  }
		if (/traceIP/i.test(   location.search)===true) { this.settrace('IP');   }
		if (/traceTS/i.test(   location.search)===true) { this.settrace('TS');   }
		if (/debuguser/i.test( location.search)===true) { this.settrace('User'); } // for backward compatibility
		if (/traceBase64/i.test(location.search)===true){ this.settrace('B64');  } // for backward compatibility
	}
	_spr('EnDeGUI.init: User-Agent: ' + navigator.userAgent);

	try      { $('UA').innerHTML = navigator.userAgent; }
	catch(e) { /* alert(e); */ /* WebKit fails here */ }
	if (navigator.userAgent.match(/Firefox.2.0.0.[0-9]/)!==null){ EnDeGUI.isFirefox= true; }
	//if (navigator.userAgent.match(/iCab.3.0.3/)        !==null) { EnDeGUI.isiCab   = true; }
	//if (navigator.userAgent.match(/Camino.1.5/)        !==null) { EnDeGUI.isCamino = true; }
	if (navigator.userAgent.match(/Opera.[9|10]./i)    !==null) { EnDeGUI.isOpera  = true; }
	if (navigator.userAgent.match(/Shiira.Safari.125/) !==null) { EnDeGUI.isShiira = true; }
	if (navigator.userAgent.match(/AppleWebKit.52[6-9]/i)!==null){EnDeGUI.isWebKit = true; } // ToDo: fails to detect Safari
	if (navigator.userAgent.match(/AppleWebKit.53[0-5]/i)!==null){EnDeGUI.isWebKit = true; } // ToDo: fails to detect Safari
	if (navigator.userAgent.match(/KHTML.*Chrome/)     !==null) {
		EnDeGUI.isChrome = true;
		EnDeGUI.onClick  = false;   // ugly hack
	}
	if (navigator.userAgent.match(/AppleWebKit.525/i)  !==null) {
		if (navigator.userAgent.match(/KHTML.*Chrome/) !==null) {
			EnDeGUI.isChrome = true;// Chrome 0.2.x
		} else {
			EnDeGUI.isSafari = true;// Safari 3.x.x
		}
	}

	// URL options/parameters
	// check browser quirks
	if (location.search.match(/Opera/i)  !==null) { EnDeGUI.isOpera  = true;  }
	if (location.search.match(/iCab/i)   !==null) { EnDeGUI.isiCab   = true;  }
	if (location.search.match(/Mozilla/i)!==null) { EnDeGUI.isMoz17  = true;  }
	if (location.search.match(/Safari/i) !==null) { EnDeGUI.isSafari = true;  }
	if (location.search.match(/WebKit/i) !==null) { EnDeGUI.isWebKit = true;  }
	if (location.search.match(/Chrome/i) !==null) { EnDeGUI.isChrome = true;  }
	if (location.search.match(/Camino/i) !==null) { EnDeGUI.isCamino = true;  }
	if (location.search.match(/Konqueror/i)!=null){ EnDeGUI.isKonqueror=true; }
	if (location.search.match(/IE/i)     !==null) { EnDeGUI.isIE     = true;  } // if you really like it :-]]
	/* above are no longer supported, just for historical reason only */

	if (location.search.match(/aClick/i) !==null) { EnDeGUI.a_Click  = true;  } //
	if (location.search.match(/ahref/i)  !==null) { EnDeGUI.a_Click  = false; } //
	if (location.search.match(/noaClick/i)!==null){ EnDeGUI.a_Click  = false; } //
	if (location.search.match(/click/i)  !==null) { EnDeGUI.onClick  = true;  } // for pre 0.1.60 backward compatibility
	if (location.search.match(/onClick/i)!==null) { EnDeGUI.onClick  = true;  } // so we can force this beaviour ..
	if (location.search.match(/noClick/i)!==null) { EnDeGUI.onClick  = false; } // ..
	if (location.search.match(/onChange/i)!==null){ EnDeGUI.onClick  = false; } // ..
	if (location.search.match(/useLabel/i)!==null){ EnDeGUI.useLabel = true;  } // so we can force this beaviour ..
	if (location.search.match(/useANCHOR/i)!==null){EnDeGUI.useANCHOR= true;  } //
	if (location.search.match(/Status/i) !==null) { EnDeGUI.sbar     = 'block'; }
	if (location.search.match(/Quick/i)  !==null) { EnDeGUI.show($('EnDeDOM.GUI.qq')); }
	if (location.search.match(/joke/i)   !==null) { EnDeGUI.joke     = 'visible'; }
	if (location.search.match(/nojoke/i) !==null) { EnDeGUI.joke     = 'hidden';  }
	if (location.search.match(/experim/i)!==null) { EnDeGUI.experimental = 'visible'; }
	if (location.search.match(/nousr/i)  !==null) { EnDeGUI.nousr    = true;  }

	// display/hide some objects
	kkk = location.search.match(/only(CH|ED|EN|DE|IP|TS|RE|RX|PW)/);
	if (kkk!==null) {
		if (kkk[1]==='EN') { kkk[1] = 'ED'; }   // for ..
		if (kkk[1]==='DE') { kkk[1] = 'ED'; }   // .. lazy ..
		if (kkk[1]==='RE') { kkk[1] = 'RX'; }   // .. users
		this.tool('EnDeDOM.f.' + kkk[1]);
		this.showQS('only' + kkk[1]);
		kkk.length = 0;
		if (/onlyED/.test(location.search)===true) {
			EnDeGUI.show($('EnDeDOM.GUI.FF')); // ToDo: does not work yet
		}
	}
	$('EnDeDOM.f.FF').style.display = 'none';
	$('EnDeDOM.f.MP').style.display = 'none';
	$('EnDeDOM.f.QQ').style.display = 'none';
	$('EnDeDOM.SB').style.display   = this.sbar;
//alert($('EnDeDOM.f.FF').style.display);
	// prepare test settings
	kkk = location.search.match(/(test)/i);
	if (kkk!==null) { this.tool('EnDeDOM.f.TST'); this.showQS('TST'); kkk.length = 0; }

	void this.hidden(EnDeGUI.experimental); // set explicit to this value

	// explizitely fold so that button gets correct label
	this.show($('EnDeDOM.GUI.bq'));
	this.show($('EnDeDOM.CH.bq'));
	this.show($('EnDeDOM.PW.bq'));
	$('EnDeDOM.PW').style.display   = 'none';   // ToDo: still experimental, and under development

	// prepare trace/debug settings
	if (EnDeGUI.trace===true) {
		$('EnDeDOM.f.DBX').style.display  = 'block';
		this.showQS('trace');
	}

	// set some style=background
	/* this is necessary so that JavaScript can access this attribute
	 * otherwise we need to use style="background-color:#0f0" in the HTML tag
	 * if this attribute is set in the tag, following check will not match,
	 * that's ok anyway
	 */
// ToDo: this still seems to be buggy (see this.data below )
	kkk = document.getElementsByTagName('input');
	for (var k=0; k<kkk.length; k++) {
		bbb = kkk[k].getAttribute('id');
		if ((bbb != null) && (kkk[k].getAttribute('type') == 'button')) {
			if (kkk[k].style.backgroundColor == '') {
				// match returns either null or array of length 2,
				// hence we need a temp. array
				ccc = bbb.toString().match(/(txt|hex|URI)/i);
				if (ccc===null)      { continue; }
				if (ccc.length <= 0) { continue; }
				kkk[k].style.backgroundColor = '#f00'; // #dbx#
				switch (ccc[1]) {
				  //case 'Txt'   : kkk[k].style.setAttribute('backgroundColor', '#ffffcf'); break;
				  case 'Txt'   : kkk[k].style.backgroundColor = '#ffffcf'; break;
				  case 'Hex'   :
				  case 'URI'   : kkk[k].style.backgroundColor = '#e0e0e0'; break;
				}
			}
		}
	}
	bbb = null; ccc = null; kkk = null;

	/* styles for fixed position objects need to be set dynamically
	 * otherwise changing bottom and top attribute with JavaScript
	 * does not work proper in all browsers
	 */
	ccc = $('EnDeDOM.SB');
	ccc.style.top   = '0px';
	ccc.style.left  = '0px';
	ccc.style.bottom= '';
	ccc = $('EnDeDOM.GUI.bf');
	//ccc.style.marginTop = '-12px'; // ToDo: Mozilla and Firfox only
	ccc = null;

	// print stored trace messages from EnDeMaps.js
	for (bbb=0; bbb<EnDe.Maps.traces.length; bbb++) { _dpr(EnDe.Maps.traces[bbb]); }

	// ToDo: Mozilla 1.7 requires \-escaped / in character class
	$('EnDeDOM.QQ.lp').value = location.href.replace(/[?&].*$/,'').replace(/\/[^\/]*$/,'/');

	this.initMenus();   // create menus
	EnDeRE.init();      // EnDeRE has its own initialization
	this.initTitle();   // set title= attributes
	this.MP.newrow();   // add additional character entry in Replace Map

	// some object are not visible, just with "experimental" button
	if (this.joke==='visible') { // set object visible as they are hidden by default
		this.jokes();
	}

	if (location.search.match(/pimp/i)!==null) { this.pimp(); }

	EnDeGUI.opts.length = 0;

//	EnDeGUI.FF.movable('EnDeDOM.hide', 'EnDeDOM.f.FF');

	// Character tool need special keys
//	$('EnDeDOM.CH.chr').onkeydown = EnDeGUI.CH.key; // don't do it here, see EnDe.html
	$('EnDeDOM.CH.hex').onkeydown = EnDeGUI.CH.key;
	$('EnDeDOM.CH.dec').onkeydown = EnDeGUI.CH.key;
	$('EnDeDOM.CH.oct').onkeydown = EnDeGUI.CH.key;
	$('EnDeDOM.CH.bin').onkeydown = EnDeGUI.CH.key;
	$('EnDeDOM.CH.lng').onkeydown = EnDeGUI.CH.key;
	$('EnDeDOM.CH.ucs').onkeydown = EnDeGUI.CH.key;
	$('EnDeDOM.CH.utf').onkeydown = EnDeGUI.CH.key;
	$('EnDeDOM.CH').style.display = 'none';

	// quirks settings (if given by URI)
	$('EnDeDOM.QQ.ul').checked = this.useLabel;
	$('EnDeDOM.QQ.fl').checked = this.useANCHOR;
	$('EnDeDOM.QQ.ac').checked = this.a_Click;
	$('EnDeDOM.QQ.ba').checked = this.onClick;
	$('EnDeDOM.QQ.bb').checked = !this.onClick;

	/* handy settings while testing the GUI, enable as needed
	EnDeGUI.show($('EnDeDOM.GUI.qq')); // to hide quick GUI bar
	EnDeGUI.hidden(null);
	$('EnDeDOM.GUI').style.display= 'block';
	$('EnDeDOM.GUI.file').value   = 'default_filter.xml';
	$('EnDeDOM.API').style.display= 'none';
	$('EnDeDOM.CH').style.display = 'none';
	$('EnDeDOM.EN').style.display = 'none';
	$('EnDeDOM.DE').style.display = 'none';
	$('EnDeDOM.IP').style.display = 'none';
	$('EnDeDOM.TS').style.display = 'none';
	$('EnDeDOM.RE').style.display = 'none';
	*/

/* test .demo.run()
	this.demo.run('TOOLS');
alert(11);
	this.demo.run('API_OPTIONS');
alert(12);
	this.demo.run('FUNCTIONS');
alert(13);
	EnDeGUI.show($('EnDeDOM.FF.bq')); // off
	this.demo.run('REPLACE MAP');
alert(14);
	EnDeGUI.show($('EnDeDOM.MP.bq')); // off
	this.demo.run('_all_');
*/

	this.dbxtrace();

//EnDeGUI.highlight('EnDeDOM.f.ED');
//setTimeout("EnDeGUI.highlight('EnDeDOM.f.ED')",3000);

// hier weiter: Testausgabe zur Bestimmung der Textgroessen
// FF3: h1:30, txt:14; Galeon: h1:28, txt:14;
/*
bux='';
for (ccc in $('EnDeDOM.ED.0a')) { bux+='\t'+ccc; }; alert ('GUI.attr:\n'+bux);
alert('EnDeDOM.GUI.bf.height: '+$('EnDeDOM.GUI.bf').clientHeight);
alert('EnDeDOM.ED.0a.height: '+$('EnDeDOM.ED.0a').clientHeight+','+$('EnDeDOM.ED.0a').clientRects);
*/
//alert('EnDeDOM.f.EDO.height: '+$('EnDeDOM.f.EDO').clientHeight+','+$('EnDeDOM.f.EDO').clientHeight);
//alert('EnDeDOM.GUI.xXx.height: '+$('xXx').clientHeight+','+$('xXx').height);

}; // init

}; // EnDeGUI

// EnDeGUI.init(); // cannot be called here 'cause no DOM exists

/* some browser need a var for the function definition, confusing .. */
var _spr        = EnDeGUI.spr;

// ========================================================================= // #dbx
// EnDeGUI shortcut for debug functions                                      // #dbx
// ========================================================================= // #dbx
var _dpr        = EnDeGUI.dpr;      // #dbx
var _dprint     = EnDeGUI.dprint;   // #dbx
var _dprobject  = EnDeGUI.dprobject;// #dbx
