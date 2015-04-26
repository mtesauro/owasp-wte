/* ========================================================================= //
# vi:  set ts=4:
# vim: set ts=4:
#? NAME
#?      EnDeREGUI.js - functions for parsing regular expressions
#?
#? SYNOPSIS
#?
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeRE.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeGUI.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeREGUI.js"></SCRIPT>
#?
#?      Note that EnDeRE.js must be included before so that the EnDeRE object
#?      is initialized and ready to use here.
#?
#? DESCRIPTION
#?      Functions for EnDeRE.
#?
#?          EnDeRE.init()       - initilaize menus for RegEx
#?          EnDeRE.dispatch()   - dipatcher for all regex functions 
#?          EnDeRE.parseTXT()   - parse RegEx string and print beautified
#?          EnDeRE.help()       - show settings for selected RegEx flavour
#?          EnDeRE.initHLP()    - initialize help window
#?       Internal functions:
#?          EnDeRE.h_table()    - build table with all supported features
#?          EnDeRE.h_general()  - build table with general supported features
#?          EnDeRE.h_context()  - build table with special features
#?          EnDeRE.mail()       - collect data from help window and send as mail
#?
#? SEE ALSO
#?      EnDeGUI.js, EnDeFile.js, EnDeMenu.txt
#?
#? VERSION
#?      @(#) EnDeREGUI.js 3.9 12/04/09 19:24:20
#?
#? AUTHOR
#?      08-mar-08 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

if (typeof(EnDe)==='undefined')    { EnDe   = new function() {}; } // will have problems if missing ...
if (typeof(EnDeRE)==='undefined')  { EnDeRE = new function() {}; }

var EnDeREGUI = new function() { this.SID = '3.9'; }

  // ======================================================================= //
  // GUI functions                                                           //
  // ======================================================================= //

EnDeRE.$        = function(id)  { return document.getElementById(id); };
EnDeRE.init     = function() {
//#? initilaize menus for RegEx
	var bux = null;

	/* initialize DOM for menus */
	try {
		bux = EnDeGUI.Obj.create('EnDeDOM.RE.Actions',EnDeGUI.Obj.menus['RegEx'], '-undef-','menu',false);
		this.$(bux.inside).appendChild(bux);
		//delete EnDeGUI.Obj.menus['RegEx']; // don't delete, needed in iniHLP()
	} catch(e){ EnDeGUI.alert('**ERROR: EnDeRE.init: RegEx',e); }
	delete bux; bux = null;
	try {
		bux = EnDeGUI.Obj.create('EnDeDOM.RE.Menu',EnDeGUI.Obj.menus['RE.Text'],'-undef-','menu',false);
		this.$(bux.inside).appendChild(bux);
		delete EnDeGUI.Obj.menus['RE.Text'];
	} catch(e){ EnDeGUI.alert('**ERROR: EnDeRE.init: RE.Text',e); }
	delete bux; bux = null;
}; // init

EnDeRE.flag     = 0;    //
EnDeRE.initHLP  = function() {
//#? initialize help window
	if (this.flag > 0) { return; } // initialize the very first time only
	this.flag++;
	var bux = null;
	/* need to load menu definition again, 'cause probably in a new window */
	try {     EnDeGUI.txt.read('EnDeMenu.txt'); EnDeGUI.txt.menu(); }
	catch(e){ EnDeGUI.alert('**ERROR: EnDeRE.initHLP: EnDeMenu.txt',e); }
	try {
		bux = EnDeGUI.Obj.menus['RegEx'];
		bux.onClick = 'return EnDeRE.help(this.value);'; // have different handler in help window
		bux.tag     = 'SELECT';
		bux.size    = '120';
		bux = EnDeGUI.Obj.create('EnDeDOM.RE.mHelp',  EnDeGUI.Obj.menus['RegEx'],'-undef-','menu',false);
		this.$('Blubb').appendChild(bux);
		this.$('Gemmal').innerHTML = '<h2>Overview</h2>' + EnDeRE.h_table();
	} catch(e){ EnDeGUI.alert('**ERROR: EnDeRE.initHLP: Blubb',e); }
	// don't need definitions anymore
	for (bux in EnDeGUI.Obj.menus) { delete EnDeGUI.Obj.menus[bux]; }
}; // initHLP

EnDeRE.h_table  = function() {
//#? build table with all supported features for all language
  var x = EnDeTMP.x;
  var a = EnDeTMP.a;
  var y = EnDeTMP.y;
  var i = EnDeTMP.i;
  var d = EnDeTMP.d;
  var e = EnDeTMP.e;
  var h = EnDeTMP.h;
  var O = EnDeTMP.O;
  var r = EnDeTMP.r;
  var o = EnDeTMP.o;
  var K = EnDeTMP.K;

  function _idx(chr) {
	/* map esoteric keys to more human readable chars :-) */
		switch (chr) {
		  case x: return('?'); break;
		  case a: return('+'); break;
		  case y: return('y'); break;
		  case i: return('i'); break;
		  case d: return('d'); break;
		  case e: return('+'); break;
		  case h: return('h'); break;
		  case O: return('-'); break;
		  case r: return('r'); break;
		  case o: return('o'); break;
		  case K: return('+'); break;
		}
		return(chr); // fallback, never reached but keeps lint quiet
  }; // _idx

  function _head40(arr,src,txt) {
		return('<tr><th class="left" colspan="40">' + arr + '.' + src + ' - ' + txt + '</th><tr>');
  }; // _head40

  function _head() {
		// write table header
		var bux = '<tr><th>&#160;</th>';
		var l = '';
		for (l in bbb) {
			if (l == 'desc')   { continue; }
			if (l == 'fuchur') { continue; }
			bux += '<th style="text-align:center" title="' + ref[l] + '">' + l.substr(1) + '</th>';
		}
		bux += '</tr>';
		return(bux);
  }; // _head

  function _line(txt,meta,i,arr) {
		if (arr == null) { return('x-x'); }
		var ccc = 'onClick="return EnDeGUI.highlight(this.parentNode);"';
		var bux = '<tr title="' + txt + '"><th title="' + meta + ' - ' + txt + '" ' + ccc + '>' + meta + '</th>';
		var l = '';
		for (l in bbb) {
			if (l == 'desc')   { continue; }
			if (l == 'fuchur') { continue; }
			if (arr[l] == null)   { bux += '<td ' + ccc + '>O</td>'; continue; }
			if (arr[l].length==0) { bux += '<td ' + ccc + '>O</td>'; continue; }
			bux += '<td ' + ccc + '>' + _idx(arr[l][i]) + '</td>';
		}
		bux += '</tr>';
		return(bux);
  }; // _line

	var bux = '';
	var ccc = null;
	var kkk = null;
	var bbb = EnDeTMP._chrs.prototype['ctrl']; // just any of the lists
	var ref = EnDeTMP._desc.prototype['refs'];
	var c, k;

	// build legend
	bux += '<div class="legend">';
//with EnDeTMP {
	kkk = [x,a,y,i,d,e, h,O,r,o,K];
	while ((ccc=kkk.shift())!==undefined) {
		bux += '<b>';
		if (ccc===e) { bux += 'e</b><br>'; continue; } // got a + already
		if (ccc===K) { bux += 'k</b><br>'; continue; } // got a + already
		if (ccc===a) {
			bux += '+</b>&#160;&#160;-&#160;&#160;available';
		} else {
			bux += _idx(ccc) + '</b>&#160;&#160;-&#160;&#160;' + EnDeTMP._desc.prototype.idx[ccc];
		}
		bux += '<br>';
	}
//}
	kkk = null;
// ToDo: ugly hack, see usage of literal  O  below
		bux += '<b>' + 'O' + '</b>&#160;&#160;-&#160;&#160;' + '**EnDeRE: not yet configured' + '<br>';
	bux += '</div>';
	bux += '<table class="overview"><caption>Overview of Features</caption>';
	ccc = null;

	// class, meta, modifier, etc.
	for (c in EnDeTMP._chrs.prototype) {
		if (EnDeTMP._chrs.prototype[c]['desc'] == undefined) {
			ccc = '** NOT YET DESCRIBED**'; // ToDo: add description in _chrs.
		} else {
			ccc = EnDeTMP._chrs.prototype[c]['desc'];
		}
		bux += _head40('character', c, ccc);
		if (EnDeTMP._chrs.prototype[c]['fuchur'] == null) { continue; }
		bux += _head(); // write table header
		// write row for each feature
		if (c == 'quantifier') { // is an array
			kkk = EnDeTMP._chrs.prototype[c]['fuchur'];
		} else { // is string
			kkk = EnDeTMP._chrs.prototype[c]['fuchur'].toString().replace(/\s/g, '');
		}
		for (k=0; k<kkk.length; k++) { // loop over feature
			ccc  = '';
			switch (c) {
			  case 'ctrl':
			  case 'modifier':
					if (EnDeTMP._desc.prototype[c] != null) { ccc  = EnDeTMP._desc.prototype[c][kkk[k]]; }; break;
					break;
			  case 'prop':  ccc  = EnDeTMP._chrs.prototype['prop'][kkk[k]]; break;
			  case 'escp':  ccc  = EnDeTMP._chrs.prototype['escp'][kkk[k]]; break;
			  default:
					if (EnDeTMP._desc.prototype[c] != null) { ccc  = EnDeTMP._desc.prototype['meta'][kkk[k]]; };
					break;
			}
			if (ccc == null) { ccc = ''; }
			bux += _line(ccc, kkk[k], k, EnDeTMP._chrs.prototype[c]);
		}
	}
	// context
	for (c in EnDeTMP._context.prototype) {
		bux += _head40('context', c, EnDeTMP._context.prototype[c]['desc']);
		if (EnDeTMP._context.prototype[c]['fuchur'] == null) { continue; }
		bux += _head(); // write table header
		// write row for each feature
		if ((c == 'quantifier') || (c == 'verb')) { // is an array
			kkk = EnDeTMP._context.prototype[c]['fuchur'];
		} else { // is string
			kkk = EnDeTMP._context.prototype[c]['fuchur'].toString().replace(/\s/g, '');
		}
		for (k=0; k<kkk.length; k++) { // loop over feature
			ccc  = '';
			switch (c) {
			  case 'verb': // quick&dirty inline 'cause _line() fails with EnDeTMP._context.verb :-((
					if (EnDeTMP._desc.prototype[c] != null) { ccc  = EnDeTMP._desc.prototype['meta'][kkk[k]]; };
					bux += '<tr><th title="' + ccc + '">' + kkk[k] + '</th>';
					for (var l in bbb) {
						if (l == 'desc')   { continue; }
						if (l == 'fuchur') { continue; }
						if (EnDeTMP._context.prototype[c][l] == null)   { bux += '<td>O</td>'; continue; }
						if (EnDeTMP._context.prototype[c][l].length==0) { bux += '<td>@</td>'; continue; }
						bux += '<td>' + _idx(EnDeTMP._context.prototype[c][l][k]) + '</td>';
					}
					bux += '</tr>';
					continue;
					break;
			  case 'ctrl':
			  case 'clss':
			  case 'meta':
			  case 'look':
			  case 'type':
			  case 'modifier':
					ccc  = EnDeTMP._context.prototype[c][kkk[k]];
					break;
			  default:
					if (EnDeTMP._desc.prototype[c] != null) { ccc  = EnDeTMP._desc.prototype['meta'][kkk[k]]; };
					break;
			}
			if (ccc == null) { ccc = ''; }
			bux += _line(ccc, kkk[k], k, EnDeTMP._context.prototype[c]);
		}
	}
	bux += '</table>';
	kkk = null;
	bbb = null;
	return(bux);
}; // h_table

EnDeRE.h_general= function(lng) {
//#? build table with general supported features for language
	var bux  = '<table class="lang"><caption>General Features</caption>';
	    bux += '<tr><th class="top">charcter</th><th class="top" style="text-align:right">description</th><th class="top">status</th><tr>';
	var bbb = '';
	var ccc = null;
	var kkk = null;
	var j, k;
	for (j in EnDeTMP._chrs.prototype) {
		bbb  = '';
		bux += '<tr><th colspan="3" style="text-align:left" title="' + EnDeTMP._chrs.prototype[j]['desc'] + '">' + j + '</th><tr>';
		switch (j) { // only following tables are implemented
			/* we could either use EnDeTMP._chrs.prototype[j] or EnDeRE.chrs.*
			 * we use the variable instance instead of the prototype 'cause
			 * for EnDeRE.desc.* some parts are empty in prototype
			 */
		  case 'ctrl': kkk = EnDeRE.arr2hash(lng, EnDeRE.chrs.ctrl); ccc = EnDeRE.desc.ctrl; bbb = '\\'; break;
		  case 'clss': kkk = EnDeRE.arr2hash(lng, EnDeRE.chrs.clss); ccc = EnDeRE.desc.clss; bbb = '\\'; break;
		  case 'meta': kkk = EnDeRE.arr2hash(lng, EnDeRE.chrs.meta); ccc = EnDeRE.desc.meta;             break;
		  case 'escp': kkk = EnDeRE.arr2hash(lng, EnDeRE.chrs.escp); ccc = EnDeRE.desc.escp;             break;
		  case 'init': kkk = EnDeRE.arr2hash(lng, EnDeRE.chrs.init);
				// special at it is always the same description
				for (k in kkk) {
					bbb = '';
					if (k == '_') { bbb = 'no '; }
					bux += '<tr><th>' + k + '</th><th>' + bbb + 'enclosing character</th>'
					    +  '<td title="' + kkk[k] + '">' + EnDeRE.desc.idx[kkk[k]] + '</td>'
					    +  '<tr>';
					}
				continue;
				break;
		  case 'subs':
				bux += '<tr><th colspan="2">strings and functions</th><td>';
				for (k in EnDeRE.chrs.subs[lng]) {
					bux += EnDeRE.chrs.subs[lng][k] + ',<br>';
				}
				bux += '</td></tr>';
				continue;
				break;
		  case 'anchor':   if(EnDeRE.chrs.anchor[lng]==undefined){continue};
						   kkk = EnDeRE.arr2hash(lng, EnDeRE.chrs.anchor);   ccc = EnDeRE.desc.clss;     break;
		  case 'modifier': kkk = EnDeRE.arr2hash(lng, EnDeRE.chrs.modifier); ccc = EnDeRE.desc.modifier; break;
		  case 'literals':
/*
 * // ToDo: not yet ready
			for (k in EnDeRE.chrs.literals.clss) {
			}
 */
			continue;
			break;
		  default: continue; break;
		}
		var aaa = '';
		for (k in kkk) {
			aaa = ccc[k];
			if (aaa == undefined) { aaa = '** undefined **'; } // ToDo: need better description in EnDeMaps.js
			bux += '<tr><th>' + bbb + k + '</th><th>' + aaa + '</th>'
			    +  '<td title="' + kkk[k] + '">' + EnDeRE.desc.idx[kkk[k]] + '</td>'
			    +  '<tr>';
		}
	}
	bux += '</table>';
	aaa = null;
	bbb = null;
	ccc = null;
	kkk = null;
	return(bux);
}; // h_general

EnDeRE.h_context= function(lng) {
//#? build table with special features for language
	var bux  = '<table class="lang"><caption>Context of Features</caption>';
	    bux += '<tr><th class="top" style="text-align:right">feature description</th><th class="top">status</th><tr>';
	var ccc = null;
	var kkk = null;
	var j, k;
	for (j in EnDeTMP._context.prototype) {
		bux += '<tr><th colspan="2" style="text-align:left" title="' + EnDeTMP._context.prototype[j]['desc'] + '">' + j + '</th><tr>';
		switch (j) { // only following tables are implemented
		  case 'ctrl': kkk = EnDeRE.arr2hash(lng, EnDeRE.context.ctrl); ccc = EnDeRE.context.ctrl; break;
		  case 'clss': kkk = EnDeRE.arr2hash(lng, EnDeRE.context.clss); ccc = EnDeRE.context.clss; break;
		  case 'meta': kkk = EnDeRE.arr2hash(lng, EnDeRE.context.meta); ccc = EnDeRE.context.meta; break;
		  case 'look': kkk = EnDeRE.arr2hash(lng, EnDeRE.context.look); ccc = EnDeRE.context.look; break;
		  case 'type': kkk = EnDeRE.arr2hash(lng, EnDeRE.context.type); ccc = EnDeRE.context.type; break;
		  case 'modifier': kkk = EnDeRE.arr2hash(lng, EnDeRE.context.modifier); ccc = EnDeRE.context.modifier; break;
		  case 'verb':
// ToDo: just the header for no ...
				for (k in EnDeRE.context.verb['fuchur']) {
					bux += '<tr><th>' + EnDeRE.context.verb['fuchur'][k] + '</th><td>' + '</td></tr>';
				}
				continue;
				break;
		  default: continue; break;
		}
		for (k in kkk) {
			bux += '<tr><th title=" ' + ccc[k] + ' - ' + k + ' ">' + ccc[k] + '</th>'
			    +  '<td title="' + kkk[k] + '">' + EnDeRE.desc.idx[kkk[k]] + '</td>'
			    +  '<tr>';
		}
	}
	bux += '</table>';
	ccc = null;
	kkk = null;
	return(bux);
}; // h_context

EnDeRE.mail     = function(lng) {
//#? collect data from help window and send as mail
	var to   = 'me';
	var subj = 'EnDeRE: ' + lng;
    var body = ' txt ';
	var href = 'mailto:' + to + '?subject=' + encodeURI(subj) + '&body=' + encodeURI(body);
	window.open( href, "_self" );
}; // mail

EnDeRE.help     = function(lng) {
//#? build table with description of supported featurs for specified language
	var lang = EnDeRE.lang(lng); // map original language to RegEx engine type
	var kkk  = '';
	if (lang != lng) { kkk = ' (' + lang.substr(1) + ')'; }
	this.$('Tsahir').innerHTML = '';
	this.$('Tsahir').innerHTML = ''
			+ '<h3 title="Reference: ' + EnDeRE.desc.refs[lng] + '">' + lng.substr(1) 
		//	+ '<span> <button onclick="mailto:EnDeRE.mail(' + "'" + lang + "'" + ');">mailto</button></span>'
			+ kkk
			+ '</h3>'
			;
	switch (lang) { // esoteric switch :-)
	  case ':Brainfuck' : this.$('Tsahir').innerHTML += '<pre>' + EnDeRE.cow.replace(/\W/g,'.').replace(/[\w_]/g,'\n') + '</pre>'; break;
	  case ':Befunge'   : this.$('Tsahir').innerHTML += '';                               break;
	  case ':Cow'       : this.$('Tsahir').innerHTML += '<pre>' + EnDeRE.cow + '</pre>';  break;
	  case ':HQ9+'      : this.$('Tsahir').innerHTML += 'Q';                              break;
	  case ':INTERCAL'  : this.$('Tsahir').innerHTML += '* PLEASE IGNORE';                break;
	  case ':LOLCODE'   : this.$('Tsahir').innerHTML += 'LOL ROFLOL';                     break;
	  case ':LOLSQL'    : this.$('Tsahir').innerHTML += 'LOL ROFLOL';                     break;
	  case ':Malboge'   : this.$('Tsahir').innerHTML += '';                               break;
	  case ':Ook'       : this.$('Tsahir').innerHTML += 'Ook? Ook! Ook.';                 break;
	  case ':Piet'      : this.$('Tsahir').innerHTML += '';                               break;
	  case ':Rebol'     : this.$('Tsahir').innerHTML += 'comment: {}';                    break;
	  case ':Speed'     : this.$('Tsahir').innerHTML += '';                               break;
	  case ':SPL'       : this.$('Tsahir').innerHTML += '';                               break;
	  case ':Taxi'      : this.$('Tsahir').innerHTML += '42 is waiting at The Underground \n'
			+ '<br><a href="http://www.bigzaphod.org/taxi/map-small.png">road map image</a>';
			break;
	  case ':3code'     : this.$('Tsahir').innerHTML += 'write[]';                        break;
	  case ':Unlambda'  : this.$('Tsahir').innerHTML += '``';                             break;
	  case ':Whirl'     : this.$('Tsahir').innerHTML += '0001000';                        break;
	  case ':whitespace': this.$('Tsahir').innerHTML += '<pre>' + EnDeRE.cow.replace(/./g,' ')  + '</pre>'; break;
	// and now the usual one ..
	  default           : this.$('Tsahir').innerHTML += this.h_general(lang) + '<hr>' + this.h_context(lang) + '<hr>'; break;
	} // esoteric
	return false;
}; // help

EnDeRE.dispatch = function(obj,item) {
//#? dipatcher for all regex functions 
	if (obj!=null) {
	if (obj.tagName.toUpperCase() == 'SELECT') { 
		if (obj.selectedIndex < 0) { return false; }
	}
	obj.selectedIndex = -1; // onClick hack
	}
	var bux = '';
	var bbb = '';
	var rex = this.$('EnDeDOM.RE.text');
	var src = this.$('EnDeDOM.RE.str');
	var add = this.$('EnDeDOM.GUI.append').checked;
	var ccc = this.$('EnDeDOM.GUI.select').checked;
	var cmt = this.$('EnDeDOM.RE.desc').checked;
	var raw = this.$('EnDeDOM.RE.raw').checked;
	var pre = this.$('EnDeDOM.RE.prefix').value;
	var kkk = null;
	var x = EnDeGUI.winX;
	var y = EnDeGUI.winY;
	var i = '';
	if (ccc==true) {
		// use selection if there is one
		kkk = EnDeGUI.selectionGet( rex );
		if ((kkk!=null) && (kkk!='')) { rex.value = kkk; }
		kkk = null;
	}
	//_dpr('++: '+rex.value);
	switch (item) { // some functions have different parameters
	  case 'code'   : return EnDeGUI.cont(rex.value + '<br><br>' + src.value); break;
	  case 'scratch': return EnDeGUI.scratch('RE', rex.value + '<br><br>' + src.value); break;
	  case 'clear'  : rex.value  = ''; src.value = '';              break;
	  case 'addnl'  : rex.value  = rex.value.replace(/\(/g, '\n('); break;
	  case 'delnl'  : rex.value  = rex.value.replace(/\n/g, '');    break;
	  case 'sample' : rex.value  = EnDeRE.sample;                   break;
	  case '_dump_' : rex.value  = EnDeRE.parse('x',item,pre,cmt,raw); break;
		// other txt* functions see default: below
	  // esoteric languages
	  case ':Brainfuck':
	  case ':Befunge':
	  case ':Malboge':
	  case ':Piet'  :
	  case ':Speed' :
	  case ':SPL'   :
			EnDeGUI.alert('**EnDeRE.dispatch: "' + item + '"not yet implemented');
			return false;
			break;
	  case ':Cow'   :
	  case ':HQ9+'  :
	  case ':Rebol' :
	  case ':Whirl' :
	  case ':INTERCAL':
	  case ':LOLCODE':
	  case ':LOLSQL':
	  case ':Ook'   :
	  case ':Taxi'  :
	  case ':3code' :
	  case ':Unlambda':
	  case ':whitespace':
			bux = '';
			switch(item) {
			  case ':Ook'    : bux = 'Ook. Ook! Ook?'; break;
			  case ':Rebol'  : bux = 'REBOL [\n    comment: {\n\t' + rex.value.replace(/[\n\r]/g,'\n\t') + '\n' + '\n    }\n]\n'; break;
			  case ':INTERCAL':bux = ' * PLEASE IGNORE\n*\t'  + rex.value.replace(/[\n\r]/g,'\n\t') + '\nPLEASE REMEMBER\n';    break;
			  case ':LOLCODE': bux = 'HAI\n' + '    BTW ' + rex.value.replace(/[\n\r]/g,'')     + '\nKTHXBYE\n';            break;
			  case ':LOLSQL' : bux = 'HAI!\n' + '    PLZ MAKES `column` LIEKS `' + rex.value.replace(/[\n\r]/g,'') + '`\n    KTHXBYE\n'; break;
			  case ':HQ9+'   : if (rex.value.match(/q/i) != null) { kkk = rex.value; bux = rex.value.replace(/q/ig,kkk); }; break;
			  case ':Unlambda':bux = '``i.x\n\t' + rex.value; break;
			// just use a reliable flavour
			  case ':whitespace': bux = EnDeRE.parse(rex.value,':Perl',pre,cmt,raw); bux = bux.replace(/./g,' ');           break;
			  case ':Cow'    : bux = EnDeRE.cow; break;
			  case ':3code'  :
				for (i=0; i<rex.value.length; i++) {
					if (rex.value[i].match(/\d/) != null) {
						bux += 'print[' + rex.value.charAt(i) + ']';
						continue;
					}
					if (rex.value[i] == '\n' || rex.value[i] == '\r') {
						bux += 'nl';
					} else {
						bux += 'write[' + rex.value.charCodeAt(i) + ']';
					}
				}
				break;
			  case ':Taxi':
				bux  = '[ this is a regualr expression written in Taxi programming language ]\n';
				bux += '[ ' + rex.value.replace(/\n/g,' ]\n[ ') + ' ]\n';
				break;
			  case ':Whirl':
				bux = rex.value;
				bux = bux.replace(/[a-zA-Z0-9]/g,'0');
				bux = bux.replace(/[^0]/g,       '1');
				bux = bux.replace(/(.{42})/g,    '$1\n');
				break;
			  default: bux = rex.value; break;
			}
			x = EnDeGUI.winX;
			y = EnDeGUI.winY;
			EnDeGUI.winX = '600';
			EnDeGUI.winY = '800';
			EnDeGUI.cont(
				item + '<hr>' + rex.value.replace(/</g,'&lt;') + '<hr>'
				+ '<pre>' +  bux + '</pre>' + '<hr>'
			);
			EnDeGUI.winX = x;
			EnDeGUI.winY = y;
			kkk = null;
			return false;
			break;
	  // default
	  case 'EnDe_user' : 
			EnDe.File.reset();
			EnDe.File.readXML('REuser.xml'); // ToDo:filename hardcoded
			EnDeRE.XML.file = EnDe.File.content;
			EnDeRE.dispatch( null, ':user-regex' );
			EnDe.File.reset();
			break;
	  default       :
			if (item.match(/^txt/) != null) {
				ccc = EnDeGUI.positionGet( rex );
				rex.value = EnDe.Text.dispatch( rex.value, item, ccc );
				return false;
			}

			kkk = item.substr(0,1);
			if (kkk==':') {
				// got a convertion request
				if (rex.value.match(/^\s*$/)!=null) { return false; }
				if (rex.value.match(/^\s*$/)==null) {
					if (src.value.match(/^\s*$/)==null) {   // no text, avoid error message
						bux = ':match using JavaScript RegEx:<br>\n'
							+ EnDeRE.match( rex.value, src.value, item );
					} // else { already empty }
				}
				x = EnDeGUI.winX;
				y = EnDeGUI.winY;
				EnDeGUI.winX = '600';
				EnDeGUI.winY = '800';
// ToDo: .replace() is a lazy quick&dirty hack, should be done for &, " and ' also
				var lang = EnDeRE.lang(item);
				if (lang != item) { kkk = ' (' + lang.substr(1) + ')'; }
/* turn text into XML
var x = EnDeRE.parse(rex.value,item,pre,cmt,raw);
x = x.replace(/\t+#([^\n]*\n)/g,'<desc>$1</desc>');
x = x.replace(/\t+([\(\[][?=.<]?)/g,'<group>$1');
x = x.replace(/\t?[=.>]?([\)\]])/g,'$1</group>');
x = '<?xml version="1.0"?><rex>' +x + '</rex>';
*/
				EnDeGUI.cont(
					item + kkk + '<hr>'
					+ rex.value.replace(/</g,'&lt;') + '<hr>'
					+ '<pre>'
					+  EnDeRE.parse(rex.value,item,pre,cmt,raw)
					+ '</pre>'
					+ '<hr>' + bux
				);
					// '<hr>' + bux.replace(/</g,'&lt;')
				EnDeGUI.winX = x;
				EnDeGUI.winY = y;
			} else {
				EnDeGUI.alert('EnDeRE.dispatch','**unknown mode: ' + item);
			}
			kkk = null;
			return false;
			break;
	}
	return false;
}; // dispatch()

EnDeRE.parseTXT = function(src) {
//#? parse regEx string and print beautified
	var bux = '';
	var ccc = '';
	var tab = '';
	var esc = false;
	var i   = 0;
	for (i=0; i<src.length; i++) {
		ccc = src.charAt(i);
		//if (esc == true) { esc = false; }
		switch(ccc) {
		  case '\\':esc = !esc; bux += ccc; continue; break;
		  case '(':
		  //case '[': if (esc==false) { bux += '\n' + tab + ccc; tab += '\t'; ccc = '\n' + tab;  }; break;
		  case '[': if (esc==false) { tab += '\t';  bux += '\n' + tab + ccc; ccc = ''; }; break;
		  case ')':
		  //case ']': if (esc==false) { tab  = tab.substr(0,(tab.length-1)); bux += ccc + '\n'; ccc = tab; }; break;
		  case ']': if (esc==false) { bux += ccc + '\n'; ccc = tab; tab  = tab.substr(0,(tab.length-1)); }; break;
		}
		bux += ccc;
		esc = false;
	}
	ccc = null;
	tab = null;
	return(bux);
}; // parseTXT()

EnDeRE.cow = ''
+ "\n                                      /;    ;\\            "
+ "\n                                  __  \\\\____//            "
+ "\n                                 /{_\\_/   `'\\____         "
+ "\n                                 \___  (o)  (o  }         "
+ "\n       ____________________________/         :--'         "
+ "\n   ,-,'`@@@@@@@@       @@@@@@         \\_     `__\\         "
+ "\n  ;:(  @@@@@@@@@        @@@              \\___(o'o)        "
+ "\n  :: )  @@@@          @@@@@@        ,'@@(  `===='    MoO! "
+ "\n  :: : @@@@@:          @@@@         `@@@:                 "
+ "\n  :: \\  @@@@@:       @@@@@@@)    (  '@@@'                 "
+ "\n  ;; /\\      /`,   @@@@@@@@@\\    :@@@@@)                  "
+ "\n  ::/  )    {_---------------:  :~`,~~;                   "
+ "\n ;;'`; :   )                  :  / `; ;                   "
+ "\n;;;; : :   ;                  :  ;  ; :                   "
+ "\n`'`' / :  :                   :  :  : :                   "
+ "\n    )_ \\__;      \";\"          :_ ;  \\_\\        `,','      "
+ "\n    :__\\  \\    * `,'*         \\  \\  :  \\   *   8`;'*  *   "
+ "\n ` ` `  `^' ` ` \\ :/ ` ` ` ` ` `^'  `-^-' ` \\v/ `:  \\/    "
+ '\n';

