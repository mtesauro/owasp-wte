/* ========================================================================= //
# vi:  ts=4:
# vim: ts=4:

#?
#? NAME
#?      EnDeGUIx.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeFile.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeText.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeGUI.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeGUIx.js"></SCRIPT>
#?
#? DESCRIPTION
#?      This file is part of  EnDeGUI.js  and needs to be included right after
#?      EnDeGUI.js  'cause it is part of the  EnDeGUI  object defined there.
#?
#?      This file contains all functions/methods used to read files for menus.
#?      Such files can be simple (tab-seperated) text in JSON or XML format.
#?      This file also contains all functions/methods to build HTML tags from
#?      generated JSON definitions.
#?
#?      Extends  EnDeGUI  class with following objects and functions:
#?          .__files{}        - hash for files and corresponding objects
#?          .__filesSet       - set specified values in .__files{}
#?          .__filesDefault   - set default values in .__files{}
#?          .txt              - object to read files and build JSON data
#?          .txt.read         - wrapper for EnDe.File.read(), uses EnDeGUI.usr
#?          .txt.menu         - build internal data structure for menus from EnDeGUI.txt.content
#?          .txt.XMLmenu      - convert XML structure to EnDeGUI's internal data structure
#?          .Obj              - object for building tags in DOM
#?          .Obj.create       - create a object from specified data
#?          .Obj.menu         - create (SELECT) menu with label
#?          .Obj.addGrp       - add SELECT menu or OPTGROUP
#?          .Obj.hide         - set object's display=none
#?          .Obj.unhideall    - set all hidden object's display=block
#?          .Obj.redo         - create button (menu item) with text and action
#?
#?      Public input variables:
#?          .trace            - enable trace output
#?          .error            - 'exit' or 'continue' after errors
#?          .warning          - 'none' or 'alert' to show alert for warnings
#?          .strip            - true: remove comments (#) and empty lines
#?      Public output variables:
#?          .content          - content read by EnDe.File.read()
#?                              null if failed, otherwise plain text or XML object
#?          .errors           - store parse errors here
#?          .lines            - array with line numbers
#?
#?      Also adds some global functions for menus:
#?          .makemenu         - read data from file and create menu
#?          .makelist         - convert (payload) data from file to plain text
#?          .initMenus        - initialises all menus defined in files
#?
#?      Builds/fills following variables
#?          EnDeGUI.Obj.groups[]
#?          EnDeGUI.Obj.menus[].use
#?
#?      Required objects, variables from  EnDeGUI (descriptions see EnDeGUI.js):
#?          EnDeGUI.opts[]
#?          EnDeGUI.useLabel
#?          EnDeGUI.useANCHOR
#?          EnDeGUI.dir
#?          EnDeGUI.usr
#?          EnDeGUI.nousr
#?          EnDeGUI.grpID
#?
#? EXAMPLES
#?      See EnDeMenu.txt
#?
#? SEE ALSO
#?      EnDeMenu.txt
#?      EnDeGUI.js
#?
# HACKER's INFO
#
#    "internal data structure" for menus
#       The internal data structure for all menus is a tab-seperated text where
#       each line represents one entry in the menu. This is pretty close to the
#       data to be found in the corresponding .txt files, i. e.  EnDeMenu.txt.
#       All data from external files will be converted to this structure.  That
#       is why we have special functions for XML and JSON data, i. e. XMLmenu()
#       in EnDeGUI.txt.
#       Finally this internal data structure is used to build objects in DOM.
#
#    obj.selectedIndex:
#    A onClick=
#       For a detailled description see EnDeGUI.js.
#
#    __dbx() vs. _dpr()
#       Most objects herein use their own private function -named __dbx()-  for
#?      trace output. This allows to enable tracing for individual objects.
#?
#? VERSION
#?      @(#) EnDeGUIx.js 3.1 12/06/10 12:54:14
#?
#? AUTHOR
#?      10-aug-10 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

// ========================================================================= //
// private variables and functions                                           //
// ========================================================================= //

var EnDeGUIx = new function() {
	this.SID = '3.1';
}
EnDeGUI.__files = {     // hash to hold data for menu from files
	/* source file          - file where menu is defined (will be read from)
	 * target               - object where menu should be added
	 * funtion to be called - function to be called for each menu selection
	 * text for label       - text for menu's label (if any)
	 * text for menu button - text for menu's title attribute
	 */
	/* -------------+--------------------+-------------------------------+--------------------------+-------------- */
	/* source file  :   target            function to be called           text for label             text for menu button
	/* -------------+--------------------+-------------------------------+--------------------------+-------------- */
	'EnDeUser.xml'  : ['EnDeDOM.f.FF',    'EnDeGUI.dispatch(this,"FF")', '&#160;User functions: ',  'User defined function call' ]
	/* -------------+--------------------+-------------------------------+--------------------------+-------------- */
	// above static entries are those for EnDe's menus itself
	// more such lines added by this.menu() when reading .xml files
}; // .__files{}

EnDeGUI.__filesSet= function(src, target, func, label, txt) {
//#? add default entry to .__files{}
    this.__files[src] = [ target, func, label, txt ];
}; // .__filesSet

EnDeGUI.__filesDefault= function(src) {
//#? add default entry to .__files{}
    this.__files[src] = ['EnDeDOM.f.EN', 'EnDeGUI.dispatch(this,"EN")', '&#160;(not configured)', 'user data from file: '+src];
}; // .__filesDefault

// ========================================================================= //
// object to read files and build menu (JSON) data                           //
// ========================================================================= //

EnDeGUI.txt = new function() {
//#? class for reading text files and converting to internal JSON data
	this.ME     = 'EnDeGUI.txt';
	this.sid    = function() { return(EnDeGUI.sid() + '.txt'); };
	var __dbx   = function(t,n) { if (EnDeGUI.txt.trace===true) { EnDeGUI.dpr(t, n); } };

	this.trace  = false;

	this.warning= 'none';   // or alert to show an alert message for each error detected
	this.error  = 'exit';   // or continue after errors
	this.lines  = [];       // store line numbers for errors (copies EnDe.File.lines[])
	this.errors = '';       // store parse errors here
	this.content= null;     // store read content here

	this.read   = function(src) {
	//#? wrapper for EnDe.File.read(): read file and store content in EnDeGUI.txt.content
		/* if given src is a plain filename the filename is first checked for
		 * in EnDeGUI.usr  directory, if that returns empty content (file not
		 * found) then the file itself is read
		 */
// ToDo: should return data instead of setting EnDeGUI.txt.content
		/* read data and remove comment and empty lines */
		if ((EnDeGUI.txt.trace===true) || (EnDe.File.trace===true)) {
			_dpr(this.ME + '.read('+src+') {'); /* dummy } */
		}
		var bbb = false;
		while(this.lines.pop()!=null) {}; // clear lines array
		EnDe.File.reset();
		if (EnDeGUI.nousr===false) {
			if (src.match(/\//)===null) { // plain filename given
				bbb = EnDe.File.read(EnDeGUI.usr + src);
			}
		}
		if (bbb===false) {   // nothing found; try what was given
			bbb = EnDe.File.read(src);
		}
		if (bbb===false) {   // last resort: default directory
			/* EnDeGUI.dir may be empty, then above already should have matched */
			bbb = EnDe.File.read(EnDeGUI.dir + src);
		}
		if ((EnDe.File.content===null) || (bbb===false)) {
			if ((EnDeGUI.txt.trace===true) || (EnDe.File.trace===true)) {
				for (bbb=0; bbb<EnDe.File.errors.length; bbb++) { _dpr(this.ME + '.read: ' + EnDe.File.errors[bbb]); }
			}
			_dpr('**ERROR: ' + src + ' **failed**');
			if ((EnDeGUI.txt.trace===true) || (EnDe.File.trace===true)) {
				/* dummy { */ _dpr(this.ME + '.read }');
			}
			//throw (EnDe.File.errors.join()); // we don't use exceptions
			return;
		}
		this.content= EnDe.File.content;
		// arrays need to be copied in JavaScript :-(
		for (bbb=0; bbb<EnDe.File.lines.length; bbb++) { this.lines.push(EnDe.File.lines[bbb]); }
		EnDe.File.reset();
		if ((EnDeGUI.txt.trace===true) || (EnDe.File.trace===true)) {
			/* dummy { */ _dpr(this.ME + '.read: ' + this.lines.length + ' lines }');
		}
	}; // .read

	this.menu = function() {
	//#? build data structure for menus from EnDeGUI.txt.content
		/* data assumed to be TAB-seperated */
		/* for a description of the syntax and keywords, see EnDeMenu.txt */

		var bux = '';
		var bbb = '';
		var ccc = '';
		var opt = '';
		var brk = 0;
		var i   = 0;
		var idx = 0;
		var dat = '';
		var obj = null;
		var __obj= function(typ, key, lbl, txt) {  // need a clousure here!
			this.tag    = '';
			this.typ    = typ; // menu or group
			this.key    = key; // index in menus[] or groups[]
			this.label  = lbl;
			this.title  = txt;
			this.inside = '';
			this.realCHR= false;
			this.realUCS= false;
			this.showHEX= false;
			this.id     = '';
			this.clss   = '';
			this.style  = '';
			this.size   = '';
			this.disable= 0;
			this.onClick= '';
			this.onMover= '';
			this.onMout = '';
			this.items  = [];
			this.input  = [];
			this.use    = [];
		};
		var genid = 0;  // id of generated object (OPTION, A)
			/* 0: use first column from item3, item4, hide3, file
			 * 1: increment genid and generate id
			 * n: ...
			 */
		var _gen= function(txt) {
			if (genid===0) { return txt; }
			genid++;
			return (txt + genid.toString());
		};
		//dbx# __dbx('{#MENU: ' + EnDeGUI.txt.content + 'MENU#}');
		var kkk = EnDeGUI.txt.content.split('\n');
		while ((bbb = kkk.shift())!==undefined) { // store data in anonymous objects
			idx++; if (idx==9999) break;          // avoid loops
			// next 2 just in case of missing before ...
			if (bbb.match(/^\s*#/)!==null) { continue; }    // skip comments
			if (bbb.match(/^\s*$/)!==null) { continue; }    // skip empty lines
			if (bbb.match(/^options\t/)!==null) {           // these are special ..
				// for options lines tabs must not be squeezed
				ccc = bbb.split(/\t/, 11);
				if (ccc[10]===undefined) { EnDeGUI.alert('**ERROR: misformated options line: ', '"' + bbb + '"'+ccc.length); }
				// no ToDo: above check matches in IE8 'cause tabs are squeezed there
				obj.items.push([ccc[0], _gen(ccc[1]), ccc[1], ccc[9], ccc[10]]);
				EnDeGUI.opts[ccc[1]] = new Array();
				for (i=2;i<9;i++) { // ToDo: ugly hack for option values
					// anything we get is a string, check for some special keywords
					switch (ccc[i]) {
					  case 'null':  opt = null;     break;
					  case 'true':  opt = true;     break;
					  case 'false': opt = false;    break;
					  default:      opt = ccc[i];   break;
					}
					EnDeGUI.opts[ccc[1]].push(opt);
				}
				continue;
			}
			if (dat!=='') {
				// we're inside a <![CDATA 'til we find ]]> followed by a tab 
				if (bbb.match(/]]>\t/)!==null) {
					dat += bbb.replace(/]]>.*/, '');
					ccc  = bbb.replace(/^.*?]]>\t/, '').split(/\t/);
					obj.items.push(['item3', _gen(ccc[0]), '/* ' + ccc[1] + ' */\n' + dat.replace(/^\[/, ''), ccc[0], ccc[1]]);
					// NOTE need to remove initial [ (see CDATA below)
				//#dbx __dbx('## '+genid+':'+ccc[1]+'\n#'+ccc[0]);
					dat = '';
				} else {
					dat += bbb;
				}
				continue;
			}
			bbb = bbb.replace(/\t{2,}/g, '\t'); // squeeze multiple TABs
			ccc = bbb.split(/\t/);
			switch (ccc[0]) { // handle all keywords (left most word in each line)
			  case 'options': /* ignored */         break;  // see above
			  case '__DATA' : /* ignored */         break;
			  case '__END'  : brk = 1;              break;
			  case 'warn'   : this.warning= ccc[1]; break;  // no checks here, done when used
			  case 'error'  : this.error  = ccc[1]; break;  // no checks here, done when used
			  case 'head'   : /* ignored */         break;
			  case 'menu'   :
				//#dbx __dbx(' .txt.menu: '+bbb, '\n');
				if (ccc[3]===undefined) { EnDeGUI.alert('**ERROR: misformated menu line: ', '"' + bbb + '"'); }
				if (obj!==null) {
					EnDeGUI.Obj.addGrp(obj);
					delete this.obj;
					obj = null;
				}
				obj = new __obj(ccc[0], ccc[1], ccc[2], ccc[3]);
				//#dbx EnDeGUI.dprint(' __obj: ', obj);
				break;
			  case 'group'  :
				//#dbx __dbx('*** .txt.menu: group='+bbb, '\n');
				if (ccc[3]===undefined) { EnDeGUI.alert('**ERROR: misformated group line: ', '"' + bbb + '"'); }
				if (obj!==null) {
					EnDeGUI.Obj.addGrp(obj);
					delete this.obj;
					obj = null;
				}
				obj = new __obj(ccc[0], ccc[1], ccc[2], ccc[3]);
				break;
			  case 'file'  : // is a variant of item3
				if (ccc[6]===undefined) { EnDeGUI.alert('**ERROR: misformated file line: ', '"' + bbb + '"'); }
				EnDeGUI.__filesSet(ccc[1], ccc[4], ccc[5], ccc[6], ccc[2]);
				// no break;
			  case 'hide3' :
			  case 'item3' :
				dat = '';
				if (ccc[1].match(/<!.CDATA/)!==null) { //first column allows <![CDATA values
					dat = ccc[1].replace(/<!.CDATA/, '');
					// NOTE that we keep the initial [
				} else {
					if (ccc[3]===undefined) { EnDeGUI.alert('**ERROR: misformated item3 line: ', '"' + bbb + '"'); }
					if (obj.showHEX===true) {
						if (obj.realUCS===true) {
							ccc[3] = '0x' + ccc[1].replace(/ /g, '') + ': ' + ccc[3];
						} else {
							ccc[3] = '0x' + EnDe.i2h('hex0', ccc[1]) + ': ' + ccc[3];
						}
					}
					obj.items.push([ccc[0], _gen(ccc[1]), ccc[1], ccc[2], ccc[3]]);
				}
				break;
			  case 'item4'  : // is a variant of item3
				if (ccc[4]===undefined) { EnDeGUI.alert('**ERROR: misformated item4 line: ', '"' + bbb + '"'); }
				obj.input.push([ccc[0], _gen(ccc[1]), ccc[1], ccc[2], ccc[3], ccc[4]]);
				break;
			  case 'makeID' : genid = 1;              break;
			  case 'key'    : obj.key       = ccc[1]; break; // overwrites setting from __obj() call in 'menu' above
			  case 'tag'    :
			  case 'html'   : obj.tag       = ccc[1].toUpperCase(); break;
			  case 'realCHR': obj.realCHR   = true;   break;
			  case 'realUCS': obj.realUCS   = true;   break;
			  case 'showHEX': obj.showHEX   = true;   break;
			  case 'inside' :
			  case 'orientation':
			  case 'id'     :
			  case 'name'   :
			  case 'size'   :
			  case 'style'  : obj[ ccc[0] ] = ccc[1]; break;
			  case 'css'    : obj.style     = ccc[1]; break;
			  case 'class'  : obj.clss      = ccc[1]; break;
			  case 'onclick':
			  case 'onClick': obj.onClick   = ccc[1]; break;
			  case 'disable': obj.disable   = 1;      break;
			  case 'onMouseover':obj.onMover= ccc[1]; break;
			  case 'onMouseout' :obj.onMout = ccc[1]; break;
			  case 'intern' : /* ignored for now */   break;
			  case 'use'    : obj.use.push(ccc[1]);   break;  // add OPTGROUP to SELECT
			  default       :
				this.errors += EnDeGUI.txt.lines[idx] + ': unknown "' + ccc[0] + '"\t# ' + bbb + '\n';
				if (this.warning!=='none') { // very lazy check
					EnDeGUI.alert('**ERROR: unknown ', '"'+ccc[0]+'"');
				}
				if (this.error==='exit') {   // very lazy check
					brk = 1;
				}
				break;
			} // ccc[0]
			if (brk == 1) { break; }// exit while loop
		} // while
		EnDeGUI.Obj.addGrp(obj);    // handle last processed object
		delete this.obj;
		if (this.errors != '') {
			bbb = this.ME + '.menu: **ERRORs found in file:\n' + this.errors;
			_dpr( bbb );
			EnDeGUI.alert( bbb );
			this.errors = '';
		}
// #dbx print groups# var t=''; for (var idx in EnDeGUI.Obj.groups) { t+=idx+'\n';} alert(t);
	}; // .menu

	this.XMLmenu  = function(fil, src) {
	//#? convert XML structure to EnDeGUI's internal tab-based tabular data
		/* NOTE that all data will be copied here, but this avoids rewriting the
		 * functionalty of  EnDeGUI.txt.menu()  and  EnDeGUI.Obj.create()  here.
		 */
		/* **** general XML data looks like:
			  <xss><attack>
				<name /><code /><label /><desc /><browser />
				<target /><func /><prefix /><opts />
			  </attack></xss>
		 */
		/* **** Core-Rule-Set
		 * The core-rules*.xml generated by  CoreRule2HTML.jar  has its own tags
		 * which are not comparable to those used in other files.
		 * It also has scopes with missing data which needs to be completed.
		 * And finally it is not sorted, so that rules with the same  <selector>
		 * value may appear anywhere in the file, not following each other.
		 * NOTE that this parser works for  core-rule*.xml  as all used keywords
		 * there are totally different to all others files processed here.
		 *
		 <core-rules>
			<rule>
				<operator />    // used for: code
				<comment />     // used for: desc
				<selector />    // used for: label
				<action> <msg /><tag /></action>  // ignored for now
			</rule>
		 </core-rules>
	     */
		/* **** PHPIDS
		 * The default_filter.xml has its own tags which can simply be used.
		 *
		 <filters>
			<filter>
				<id>1</id>      // used for: name
				<rule />        // used for: code
				<description /> // used for: desc
				<tags>          // used for: label (all <tag>s are concatenated)
					<tag>xss</tag>
					<tag>csrf</tag>
				</tags>
				<impact>4</impact>  // ignored for now
			</filter>
		 </filters>
	     */

		var bbb = fil.replace(/.*\/([^\/]*)$/,function(c,d){return(d)}); // index is filename, not a path
		var tag = 'attack';
		if (bbb==='default_filter.xml') { tag = 'filter'; }
		var bux = src.getElementsByTagName(tag);
		//#dbx __dbx(this.ME + '.XMLmenu: src=#{\n' + src + '#}');
		if (bux.length===0) {
			__dbx(this.ME + '.XMLmenu: no <' + tag + '> scopes found');
			bux = src.getElementsByTagName('rule');  // core-rules.xml
			if (bux.length===0) {
				__dbx(this.ME + '.XMLmenu: no <rule> scopes found');
				__dbx(this.ME + '.XMLmenu:{\n' + src + '\n}');
				return '';
			}
		}
		if (EnDeGUI.__files[bbb]===undefined) {// file not specified in  EnDe.File.xml
			// simply add it on the fly ..
			EnDeGUI.__filesDefault(bbb);
			EnDeGUI.__files[bbb][0] = $('EnDeDOM.GUI.obj').value;
			EnDeGUI.__files[bbb][2] = 'User File ' + bbb + ': ';
	//source file  :   target       function to be called    text label         text button
	
		}
		var groups=[];
		var c     = 0, i = 0, n = 0;
		var label = '-undef-';
		var grp   = EnDeGUI.grpID;  // start numbering here
		var txt   = '';
		var item  = '';
		var nam = '';
		var cod = 'undef';
		var des = '';
		var msg = '';
		var ctx   = 'warn\tnone';
		    ctx += '\nmakeID\t'  + 'auto';  // this must be before any item* line
		for (c=0;c<bux.length;c++) {    // walk XML tree
			try {
			if (bux[c].childNodes.length == 0) { continue; } // skip empty nodes
			} catch(e){ __dbx(this.ME + '.XMLmenu: 0 bux['+c+'].childNodes.length failed: '+e); };
			if (bux[c].nodeType          != 1) { continue; } // skip empty or text nodes
			nam = '';
			cod = '';
			des = '';
			//#dbx if(you_want==huge_output) __dbx(':' + c + '=' + bux[c].nodeName);
			for (n=0;n<bux[c].childNodes.length;n++) {
				if (bux[c].childNodes[n].nodeType  !==1) { continue; }  // skip empty nodes
				//#dbx if(you_want==huge_output) if(xxx===1) __dbx(' [' + n +']<' + bux[c].childNodes[n].nodeName + '>\t' + bux[c].childNodes[n].firstChild.nodeValue);
				if (bux[c].childNodes[n].firstChild!==null) {           // avoid error
					txt = bux[c].childNodes[n].firstChild.nodeValue;
				} else {
					txt = '';
				}
				switch (bux[c].childNodes[n].nodeName) {
				  case 'id':            // default_filter.xml
				  case 'name':  nam = txt; break;
				  case 'description':   // default_filter.xml
				  case 'desc':  des = txt.replace(/\n/g, ' '); break;
				  case 'rule':
						if (bbb!=='default_filter.xml') { /* skip */  break; }
						// else rule is same as code in other files
				  case 'code':  cod = txt;
					if (cod.match(/[\n\t]/)!==null) {
						cod = '<![CDATA[' + txt + ']]>';
					}
					break;
				  case 'label':
				  case 'selector':  // core-rules*.xml
					label= txt;
					if (label.length > 58) { label = label.substr(0, 58) + '\u2026'; }
					if (groups[label]===undefined) {
						groups[label] = new Array();
					}
					break;
				  case 'impact':    msg = txt;           break    // default_filter.xml
				  case 'comment':   des = txt.replace(/\n/g, ' '); break;   // core-rules*.xml
				  case 'operator':  cod = txt; nam = txt;break;   // core-rules*.xml
				  case 'actions':                       // core-rules*.xml
					for (var a=0;a<bux[c].childNodes[n].childNodes.length;a++) {
						switch (bux[c].childNodes[n].childNodes[a].nodeName) {
						  case 'msg' : msg = bux[c].childNodes[n].childNodes[a].firstChild.nodeValue; break;
						//default: silently ignore for now
						}
					}
					break;
				  case 'tags':                          // default_filter.xml
					label =  '';
					for (var a=0;a<bux[c].childNodes[n].childNodes.length;a++) {
						switch (bux[c].childNodes[n].childNodes[a].nodeName) {
						  case 'tag':
							if (label!=='') { label +=  ','; }
							label +=  bux[c].childNodes[n].childNodes[a].firstChild.nodeValue;
							break;
						}
					}
					break;
				  case 'target': item += '\ntarget\t' + txt; break;
				  case 'func':   item += '\nfunc\t'   + txt; break;
				  case 'prefix': item += '\nprefix\t' + txt; break;
				  case 'browser': /* NOT YET SUPPORTED */    break;
	/* this is dangerous, so we don't allow eval for arbitrary data, see 'opts' instead
	 *			  case 'eval':
	 *				try {     eval(txt); }
	 *				catch(e){ EnDeGUI.alert('this.menu: ['+c+'] eval('+txt+') failed', e); };
	 *				break;
	 */
				  default: /* silently ignored */
				  	item += '\n#unknown\t' + bux[c].childNodes[n].nodeName; break;
					break;
				}
			}
			if ( des==='' ) { des = msg; } // try msg if comment was missing
			if ((cod!=='') && (nam!=='')) { item += '\nitem3\t' + cod + '\t' + ((nam.length>58)?nam.substr(0, 58)+' \u2026':nam) + '\t' + des; }
			if (groups[label]===undefined) {
				// if there are no labeld groups
				groups[label] = new Array();
			}
			groups[label].push(item);
			item = '';
		} // walk XML tree
	
		delete bux; bux = null;
		// generate groups
		c = 0;
		for (n in groups) { if (n!=='indexOf') { c++; } }
		if (c>1) {  // have groups
			for (n in groups) {
				if (n==='indexOf') { continue; }
				if (n==='')        { continue; }
				ctx += '\ngroup\t' + 'group' + grp + '\t' + n + '\t' + n;
				grp++;
				for (i=0; i<groups[n].length; i++) {
					ctx += '\n' + groups[n][i];
					//ctx += '\n'+i;
				}
			}
		}
		// generate menu
		ctx += '\n\nmenu\t'  + bbb + '\t' + EnDeGUI.__files[bbb][2] + '\t' + EnDeGUI.__files[bbb][3]; 
		ctx += '\ninside\t'  + EnDeGUI.__files[bbb][0];
		ctx += '\nid\t'      + EnDeGUI.__files[bbb][0] + '.menu';
		ctx += '\nonClick\t' + EnDeGUI.__files[bbb][1];
		ctx += '\nhtml\t'    + 'SELECT';
		ctx += '\nsize\t'    + '1';
		if (c>1) {  // have groups
			grp = EnDeGUI.grpID;
			for (n in groups) {
				if (n==='indexOf') { continue; }
				ctx += '\nuse\t' + 'group' + grp;
				grp++;
			}
			EnDeGUI.grpID = grp;// ToDo: ugly side effect
		} else {    // no groups, plain menu
			for (n in groups) { // may be one group, but we don't know the name
				if (n==='indexOf') { continue; }
				for (i=0; i<groups[n].length; i++) {
					ctx += groups[n][i];
				}
			}
		}
		// finally
		for (n in groups) {
			if (n==='indexOf') { continue; }
			while (groups[n].pop()) {}
			delete groups[n];
		}
		//#dbx if(you_want==huge_output) __dbx('{#CTX:\n' + ctx + '\nCTX#}');
		return ctx;
	}; // XMLmenu

}; // .txt

// ========================================================================= //
// EnDeGUI object methods for building menus                                 //
// ========================================================================= //

EnDeGUI.Obj = new function() {
//#? class for functions building menus in DOM
	this.ME     = 'EnDeGUI.txt';
	this.sid    = function() { return(EnDeGUI.sid() + '.Obj'); };

	var __dbx = function(t,n) { if (EnDeGUI.Obj.trace===true) { EnDeGUI.dpr(t, n); } };

	this.trace  = false;

	// ===================================================================== //
	// public EnDeGUI.Obj variables                                          //
	// ===================================================================== //

	this.menus  = new Array();  // store (SELECT) menu objects
	this.groups = new Array();  // store OPTGROUP menu objects

	// ===================================================================== //
	// (private) global EnDeGUI.Obj variables                                //
	// ===================================================================== //

	this.action = '';           // global variable for onClick or onChange attribute // ToDo: dirty hack

	this.hidden = 0;            // counter for dynamically generated tag id= attributes
	this.menuCHR= false;        // true: add real character to OPTION's label text
	this.menuUCS= false;        // true: add real Unicode character to OPTION's label text
	this.menuHEX= false;        // true: prefix description with hex value of character
	/* menuCHR, menuUCS, menuHEX are necessary 'cause we need this information
     * when processing the (array of) items of a group. The flag is stored
	 * in the same object as the items, but when processing items we don't
	 * have access to its parent object. Hence we need a more global flag.
	 * This is in particular important if the corresponding flags are set in
	 * the main menu (menu keyword) and not the used submenus (group keyword).
	 */

	// ===================================================================== //
	// misc. methods                                                         //
	// ===================================================================== //

	// ===================================================================== //
	// HTML tag creation functions                                           //
	// ===================================================================== //


	this.unhideall  = function() {
	//#? toggle visibility of dynamically generated hidden objects (those named "hidden_NN")
		/* see 'hide3', 'hide4' in EnDeMenu.txt also */
		var bbb = null;
		var ccc = null;
		var i   = 0;
		for (i=0; i<= EnDeGUI.Obj.hidden; i++) {
			bbb = 'hidden_' + i;
			ccc = $(bbb);
			// if condition used to trigger try{}, where catch ignores the error which is ok
			try { if (ccc.style.display    != '' ) { EnDeGUI.display(ccc); } } catch(e) {}
			try { if (ccc.style.visibility)        { EnDeGUI.visible(ccc); } } catch(e) {}
	// ToDo: this.visible(ccc) not yet working with SELECT OPTGROUP
			//this.visible(ccc);
		}
		bbb = null;
		ccc = null;
		return false;
	}; // unhideall

	this.hide   = function(src, style) {
	//#? sets object id to 'hidden_NN'; increments global EnDeGUI.Obj.hidden
		EnDeGUI.Obj.hidden++;
		src.setAttribute('id', 'hidden_'+EnDeGUI.Obj.hidden);
		if ((style!=null) && (style!='')) {
			src.setAttribute('style', style);
		}
	}; // .hide

	this.redo   = function(txt, act) {
	//#? create button with text and action
		var bux = document.createElement('A');
		bux.setAttribute('onClick', act);
		bux.setAttribute('class',  'button');
// ToDo: style in EnDe.css
		bux.setAttribute('style',  'text-decoration:none;border:2px outset black;');
		bux.value     = 'repeat';
		bux.innerHTML = txt;
		bux.href = '#';
	//alert('a: '+act);
		return bux;
	}; // .redo

	this.create = function(pid, src, parenttyp, typ, hidden) {
	//#? create objects and elements
		/* pid:       parent's id
		 * parenttyp: ANCHOR, BUTTON, SELECT (will be passed to sub-sequent calls)
		 * typ:       menu, group, OPTGROUP, OPTION etc. (generates DOM object)
		 * hidden:    true if created element should be display:none
		 * NOTE: label 'repeat' is handled special
		 */
		__dbx('.Obj.create('+pid+', '+parenttyp+', '+typ+', '+hidden+')');
		var bux = null;
		var bbb = null;
		var ccc = null;
		var obj = null;
		var kkk = null;
		if (src===null) {
			// #dbx alert('**ERROR: null object');
			__dbx('  src=[null]');
			return bux;
		}
		//#dbx var t=''; for (var xxx in src) { t+=xxx+':'+src[xxx]+'\n';} __dbx('.Obj.create: '+t);
		/* WARNING: above debug produces huge output, may result in performance problems */
		switch (typ) {
		  // menu types
		  case 'menu':
			this.action = src.onClick;
			if (src.tag.match(/SELECT/i)!==null) {
				if (EnDeGUI.useANCHOR===true) { // overwrite menu file settings
					bbb      = 'ANCHOR';        // just a flag ..
					src.tag  = 'ANCHOR';
					src.clss = 'select popup';  // ToDo: ugly hack, not yet perfect
				}
			}
			// create container tag
			bux = EnDeGUI.Obj.create(src.id, src, src.tag, src.tag, hidden);
//var t=''; for (var xxx in src){t+=xxx+':'+src[xxx]+'\n';} alert('.Obj.create: '+t); return;
			// create sub menus
			for (ccc in src.use) {
				if (ccc==='indexOf') { continue; }
				if (src.use[ccc].match(/function/)  !==null) { continue; } // contribution to old Mozilla
				if (EnDeGUI.Obj.groups[src.use[ccc]]===null) { // defensive programming
					EnDeGUI.alert('**ERROR: undefined use ', '"'+src.use[ccc]+'"');
					continue;
				}
				EnDeGUI.Obj.menuCHR = src.realCHR;
				EnDeGUI.Obj.menuUCS = src.realUCS;
				EnDeGUI.Obj.menuHEX = src.showHEX;
				obj = EnDeGUI.Obj.create(src.id, EnDeGUI.Obj.groups[src.use[ccc]], src.tag, 'group', hidden);
				bux.appendChild(obj);
				delete this.obj;
			} // use
			// create items, if any
			if (src.items.length>0) {
				kkk = '';
				switch (src.tag) {
					// src.tag should always be capital letters, but we allow lazy developers ...
				  case 'select':
				  case 'SELECT': kkk = 'OPTION'; break;
				  case 'anchor':
				  case 'ANCHOR': kkk = 'A';      break;
				  // all following should never occure as they don't have items
				  case 'BUTTON':
				  case 'TABLE':
				  default:
					EnDeGUI.alert( '**ERROR: EnDeGUI.Obj.create', 'object "' + src.typ + '" with items; ignored' );
					break;
				}
				if (kkk!=='') {
					for (ccc=0; ccc<src.items.length; ccc++) {
						obj = EnDeGUI.Obj.create( pid, src.items[ccc], parenttyp, kkk, src.onClick );
						bux.appendChild(obj);
						delete this.obj;
					}
				}
				kkk = null;
			} // items
			// create input fields, if any
			if (src.input.length>0) {   // very special for typ=TABLE
				obj = document.createElement('INPUT');
				obj.type  = 'hidden';
				obj.title = 'old: character to be replaced';
				obj.value = '';
				obj.id    = 'EnDeDOM.MP.selected';
				bux.appendChild(obj);
				delete this.obj;
			}
			for (ccc in src.input) {
				if (ccc==='indexOf') { continue; }
				if (src.input[ccc] == null) {       // defensive programming
					EnDeGUI.alert('**ERROR: undefined input ', '"'+src.use[ccc]+'"');
					continue;
				}
				obj = EnDeGUI.Obj.create(src.id, src.input[ccc], 'TABLE', 'group', hidden);
				bux.appendChild(obj);
				delete this.obj;
			} // input
			// ugly browser hacks, if needed
			if (src.tag==='SELECT') { // onClick hack
				bux.selectedIndex = -1;
			}
			if (bbb==='ANCHOR') { // flat menu hack
				obj = document.createElement('SPAN');
				obj.setAttribute('class', 'select popup');  // ToDo: ugly hack, not yet perfect
				obj.className = 'select popup';
				obj.appendChild(bux);
				bux = obj;
			}
			// no return as we set other attributes also
			break;
		  case 'group':
			switch (parenttyp) {
			  case 'ANCHOR':
				bux = document.createElement('LI');
				bux.innerHTML = src.label;
				bbb = document.createElement('UL');
				if ((src.style!=null) && (src.style!='')) {
					this.hide(bbb, src.style);
				}
// ToDO:				EnDeGUI.Obj.menuUCS = src.realUCS;
				for (ccc in src.items) {
					//src.items[ccc].onClick = src.onClick; // pass onClick attribute to .Obj.create()
					if (ccc==='indexOf') { continue; }
					obj = EnDeGUI.Obj.create(pid, src.items[ccc], parenttyp, 'A', src.onClick);
					bbb.appendChild(obj);
					delete this.obj;
				}
// ToDO:				EnDeGUI.Obj.menuUCS = false;
				bux.appendChild(bbb);
				delete this.bbb;
				break;
			  case 'BUTTON':
				bux = document.createElement('FIELDSET');
				obj = document.createElement('LEGEND');
				obj.innerHTML = src.title;
				bux.appendChild(obj);
				for (ccc in src.items) {
					if (ccc==='indexOf') { continue; }
					obj = EnDeGUI.Obj.create(pid, src.items[ccc], parenttyp, 'INPUT', hidden);
					bux.appendChild(obj);
					delete this.obj;
				}
				delete this.obj;
				break;
			  case 'SELECT':
				bux = EnDeGUI.Obj.create(pid, src, parenttyp, 'OPTGROUP', hidden);
// ToDo:				EnDeGUI.Obj.menuUCS = src.realUCS;
				for (ccc in src.items) {
					if (ccc==='indexOf') { continue; }
					obj = EnDeGUI.Obj.create(pid, src.items[ccc], parenttyp, 'OPTION', hidden);
					// on*-events need to be set after object createion as src.items[] does not contain this information
					if (src.onMover!=='') { obj.setAttribute('onMouseover', src.onMover); }
					if (src.onMout !=='') { obj.setAttribute('onMouseout',  src.onMout);  }
					bux.appendChild(obj);
					delete this.obj;
				}
// ToDo:				EnDeGUI.Obj.menuUCS = false;
				break;
			  case 'TABLE':
				/* note that typ=TABLE is very special because:
				 *  1. it is not usable for generic tables because
				 *     it is fixed with 4 colums per row
				 *  2. each column has its special width
				 *  3. special settings depending on name of field
				 *     for example char1, char2, -99-, etc.)
				 *  4. uses fixed object IDs (EnDeDOM.MP.*)
				 */
				bux = document.createElement('DIV');    // a row
				for (ccc=1; ccc<5; ccc++) {             // the columns
					obj = document.createElement('SPAN');
					obj.setAttribute('class', 'd'+ccc);
					//obj.setAttribute('style', 'float:left;width:3em');
					bbb = document.createElement('INPUT');
					switch (ccc) {
					  case 1:
						bbb.type  = 'checkbox';
						bbb.title = 'check to use this replacement';
						bbb.id    = 'EnDeDOM.MP.use' + src[1];
						if (src[1].match(/char/)===null) {
							bbb.setAttribute('checked', 1);
						}
						break;
					  case 2:
						delete this.bbb;
						bbb = document.createElement('LABEL');
						//obj.setAttribute('style', 'float:left;width:5em;text-align:right;');
						bbb.innerHTML = src[1] + ' : ';
						break;
					  case 3:
						bbb.type  = 'text';
						bbb.title = 'character to be replaced';
						bbb.value = src[2];
						bbb.id    = 'EnDeDOM.MP.old' + src[1];
						if (src[1].match(/^char/)===null) {
							bbb.setAttribute('disabled', 1);
						}
						bbb.setAttribute('onClick', 'EnDeGUI.MP.select(this.id);');
						break;
					  case 4:
						bbb.type  = 'text';
						bbb.title = 'new: replacement character';
						bbb.value = src[3];
						bbb.id    = 'EnDeDOM.MP.new' + src[1];
						obj.setAttribute('style', 'float:none;width:2em');
						bbb.setAttribute('onClick', 'EnDeGUI.MP.select(this.id);');
						break;
					}
					obj.appendChild(bbb);
					bux.appendChild(obj);
					delete this.obj;
					delete this.bbb;
				}
				//bux.appendChild(document.createElement('BR'));
				break;
			}
			delete this.obj;
			delete this.bbb;
			bbb = null;
			return bux;
			break;
		  // main object types
		  case 'SELECT':
			bux = document.createElement('SELECT');
			if (EnDeGUI.onClick===true) {
				bux.setAttribute('onClick',  src.onClick);
			} else { // Konqueror
				bux.setAttribute('onChange', src.onClick);
			}
			bux.selectedIndex = -1; // useless here in some browsers, unfortunatelly
			break;
		  case 'ANCHOR': return document.createElement('UL');  break;
		  case 'BUTTON': return document.createElement('DIV'); break;
		  case 'TABLE':  return document.createElement('DIV'); break;
		  // secondary object types
		  case 'OPTGROUP':
			bux = document.createElement('OPTGROUP');
/*
			if (hidden===true) {
				this.hide(bux, src.style);
			}
*/
			//return bux;
			break;
		  case 'INPUT':
			bbb = this.action;
			bbb = bbb.replace(/this.value/, "'" + src[2] + "'");
			bux = document.createElement('SPAN');
			obj = document.createElement('INPUT');
			obj.type  = 'button';
			obj.id    = pid + '.' + src[1];
			obj.value = src[3];
			obj.title = src[4];
			obj.setAttribute('onClick', bbb);
			obj.setAttribute('class', 'button');
			bux.appendChild(obj);
			delete this.obj;
			bbb = null;
			break;
		  case 'A':
			bbb = this.action;
			bbb = bbb.replace(/this.value/, "'" + src[2] + "'");
			bux = document.createElement('LI');
			obj = document.createElement('A');
			obj.id        = pid + '.' + src[1];
			obj.innerHTML = EnDe.Text.Entity(src[3]);
			obj.title     = src[4];
			if (EnDeGUI.a_Click===true) {
				obj.setAttribute('onClick', bbb);
				obj.href = '#';
			} else {
				obj.href = 'javascript:'+bbb;
			}
			if (src[0]!=null) { // contribution to old Mozilla 1.x
				if (src[0].match(/^hidd?e/)!==null) {   // matches hidden, hide3, hide4, ...
					this.hide(obj, 'display:none');
				}
			}
			bux.appendChild(obj);
			delete this.obj;
			bbb = null;
			return bux;
			break;
		  case 'OPTION':
			// don't know why, but src comes as Object and not Array
			bux = document.createElement('OPTION');
			if (src[0]!=null) { // contribution to old Mozilla 1.x
				if (src[0].match(/^hidd?e/)!==null) {   // matches hidden, hide3, hide4, ...
					this.hide(bux, 'display:none');
				}
			}
			bux.id    = pid + '.' + src[1];
			bux.value = src[2];
			bux.text  = src[3];
			bux.title = '';
			if (EnDeGUI.Obj.menuUCS===true) {   // Unicode/UTF-8 mismatch characters; i.e.: dead beef
				for (bbb=src[3].length; bbb<3; bbb++) { bux.text += String.fromCharCode(160); } // beautify text
				bux.text  += ' : ' + String.fromCharCode(160);
				kkk = src[2].split(/ /);  // expect: dead beaf
				for (bbb=0; bbb<kkk.length; bbb++) { bux.text += String.fromCharCode(parseInt(kkk[bbb], 16)); }
				//dbx# __dbx('EnDeGUI.Obj.create: menuUCS['+src[2]+']: '+bux.text);
			}
			if (EnDeGUI.Obj.menuCHR===true) {   // Unicode/ISO mismatch; i.e. 0722, 0727
				bux.text  = '';
				for (bbb=src[3].length; bbb<3; bbb++) { bux.text += String.fromCharCode(160); } // beautify text
				if (src[2].length<3) { bux.text += String.fromCharCode(160); } // one more beautify (dirty hack)
				bux.text  += src[3] + ' : ' + String.fromCharCode(160) + String.fromCharCode(src[2]);
				//dbx# __dbx('EnDeGUI.Obj.create: menuCHR['+src[2]+']: '+bux.text);
			}
			if (EnDeGUI.Obj.menuHEX===true) { bux.title = '0x' + EnDe.i2h('hex0', src[2]) + ': '; }
			bux.title += src[4];
			return bux;
			break;
		} // switch
		kkk = [ 'name', 'id', 'size', 'style', 'title', 'label', 'inside' ];
		for (ccc=0; ccc<kkk.length; ccc++) {
			if (src[kkk[ccc]]===undefined) { continue; }
			if (src[kkk[ccc]]==='')        { continue; }
			bux.setAttribute(kkk[ccc], src[kkk[ccc]]);
		}
		// some browsers are picky and only set known DOM object attributes
		if (bux.label  ===undefined) { bux.label   = src.label;  }
		if (bux.inside ===undefined) { bux.inside  = src.inside; }
		if (src['clss']!==undefined) { bux.setAttribute('class', src['clss']); }
		bbb = null;
		ccc = null;
		return bux;
	}; // .create

	this.menu   = function(txt, src) {
	//#? create (SELECT) menu with label
		/* txt: if set, prefix menu with label text */
		var key = '**undef**';
		try { key = src.key; }
		catch(e) { /* fails in some browsers  */ }
		__dbx('EnDeGUI.Obj.menu(txt=' + txt + ', src=' + key + ')');
		var ccc = null;
		var obj = null;
		try { obj = EnDeGUI.Obj.create('-undef-', src, '-undef-', 'menu', false); }
		catch(e) { alert('.Obj.create: '+e); }
		if (txt!=='') {
			ccc = document.createElement('SPAN');
			ccc.innerHTML = obj.label;
			$(obj.inside).appendChild(ccc);
		}
		// #dbx#
/* avoid huge output
		if (EnDeGUI.Mnu.trace===true) {
			var xxx='', z=0;for(z in src){xxx+='\n  '+z+'\t:'+src[z];}
			_dpr('\n### EnDeGUI.Obj.menu: {'+xxx+'\n###}');
		}
*/
		try     { $(obj.inside).appendChild(obj); }
		catch(e){ EnDeGUI.alert('EnDeGUI.Obj.menu: ' + key, e); }
		obj = null; ccc = null;
	}; // .menu

	this.addGrp = function(src) {
	//#? store menu or group in EnDeGUI.Obj.menus[] or EnDeGUI.Obj.groups[]
		/* src.typ: menu:  store in EnDeGUI.Obj.menus[]
		 * src.typ: group: store in EnDeGUI.Obj.groups[]
		 */
		if (src===null) {
			return void(0);
		}
		if ((src.typ!==undefined) && (src.typ!=''))  { // store finished menu
			__dbx('EnDeGUI.Obj.addGrp(typ=' + src.typ + ', key=' + src.key + ')');
			if (EnDeGUI.Obj.trace===true) {
				var kkk='', z=0;for(z in src){kkk+='\n'+z+'\t:'+src[z];}
				__dbx('EnDeGUI.Obj.addGrp: {'+src.typ+': '+kkk+'\n}');
			}
			// #dbx alert('.Obj.addGrp: '+src.typ+'\t'+src.key);
			switch (src.typ) { // store finished object
			  case 'menu':  EnDeGUI.Obj.menus[ src.key] = src; break;
			  case 'group': EnDeGUI.Obj.groups[src.key] = src; break;
			  default:
				EnDeGUI.alert('**ERROR: EnDeGUI.Obj.addGrp', 'unknow object type "'+src.typ+'"');
				break;
			}
		} else {
			EnDeGUI.alert('**ERROR: EnDeGUI.Obj.addGrp', 'empty object type');
		}
		return void(0);
	}; // .addGrp
}; // .Obj

// ========================================================================= //
// object for building menus from .xml and .txt files                        //
// ========================================================================= //

EnDeGUI.Mnu = { trace: false }; // workaround for following "menu" functions

EnDeGUI.__read  = function(src) {
// read XML or JSON data from file and convert to EnDeGUI data format
	/* this is a private function used by .makemenu() and .makelist() only */
	var __dbx = function(t, n) { if (EnDeGUI.Mnu.trace===true) { EnDeGUI.dpr(t, n); } };
	__dbx('EnDeGUI.__read(' + src + ')', '');
	var bux = false;
	var bbb = 0;
	EnDe.File.reset();  // note: needs to be changed if we read async
	if (src.match(/\.xml$/i)!==null) {
		bux = EnDe.File.readXML(src);
	} else {
		bux = EnDe.File.readTXT(src);
	}
	if (bux===true) {
		__dbx(' ok');
		switch (src) {  // if we need a special parser for some files
		  case 'core-rules.xml' :
		  case 'core-rules-2.0.xml':
		  case 'default_filter.xml':
		  default:
			/* alert(src); */
			if (src.match(/\.xml$/i)!==null) {
				return EnDeGUI.txt.XMLmenu(src, EnDe.File.content);
			} else {
				return EnDe.File.content;   // no more convertions for text necessary
			}
			break;
		}
	} else {
		__dbx(' **failed**');
		if ((EnDeGUI.Mnu.trace===true) || (EnDe.File.trace===true)) {
			__dbx('EnDeGUI.__read  **ERRORs found');
			for (bbb=0; bbb<EnDe.File.errors.length; bbb++) { _dpr(EnDe.File.errors[bbb]); }
		}
	}
	EnDe.File.reset();
	return '';
}; // .__read

EnDeGUI.__menu  = function(src) {
//#? read file with XML, JSON or TEXT data and create internal object
	var __dbx = function(t,n) { if (EnDeGUI.Mnu.trace===true) { EnDeGUI.dpr(t, n); } };
	__dbx('EnDeGUI.__menu('+src+') {');
	var bux = null;

	if (EnDeGUI.nousr===false) {
		if (src.match(/\//)===null) {    // plain filename given
			bux = this.__read(EnDeGUI.usr + src);
		}
	}
	if ((bux===null) || (bux==='')) {
		bux = this.__read(EnDeGUI.dir + src);
	}
	if (bux===null) {
		_dpr('EnDeGUI.__menu: __read: **failed**' + src);
	}
	//#dbx __dbx('## .__menu ' + '{\n' + bux + '\n#}');
	__dbx('EnDeGUI.__menu }');
	return bux;
}; // .__menu

EnDeGUI.makemenu= function(src) {
//#? read file with XML or JSON data and create menu from its content
	var __dbx = function(t,n) { if (EnDeGUI.Mnu.trace===true) { EnDeGUI.dpr(t, n); } };
	__dbx('EnDeGUI.makemenu(' + src + ') {');

	this.txt.content = this.__menu(src);
	if (this.txt.content===null) {
		_dpr('EnDeGUI.makemenu: __read: **failed**');
		_dpr(' **failed**');
	} else {
		var kkk = src.replace(/.*\/([^\/]*)$/,function(c,d){return(d)});
		/* src can be a full path or URI, needs to be reduced to a filename
		 * 'cause index in .Obj.menus[] is a filename
		 */
		this.txt.menu();
		// need try-catch to avoid page reload for erroneous user files
		try { this.Obj.menu('with label', this.Obj.menus[kkk]); }
		catch(e) { EnDeGUI.alert('EnDeGUI.makemenu: EnDeGUI.Obj.menu('+kkk+'): ' + e + ' **IGNORED;'); }
	}
	__dbx('EnDeGUI.makemenu }');
	return false;
}; // .makemenu

EnDeGUI.makelist= function(src) {
//#? read file with XML or JSON data and create list of payloads from its content
	var __dbx = function(t,n) { if (EnDeGUI.Mnu.trace===true) { EnDeGUI.dpr(t, n); } };
	__dbx('EnDeGUI.makelist('+src+') {');

	this.txt.content = this.__menu(src);
	if (this.txt.content===null) {
		_dpr('EnDeGUI.makelist: __read: **failed**');
	} else {
		var kkk = this.txt.content.split('\n');
		var bux = '';
		var bbb = '';
		var idx = '';
		while ((bbb = kkk.shift())!==undefined) {   // store data in anonymous objects
			idx++; if (idx===9999) { break; }           // avoid loops
			// next 2 just in case of missing before ...
			if (bbb.match(/^\s*#/)!==null) { continue; }// skip comments
			if (bbb.match(/^\s*$/)!==null) { continue; }// skip empty lines
			if (bbb.match(/^item/)===null) { continue; }
			bux += bbb.split(/\t/)[1] + '\n';
		}
		if (bux==='') { bux = this.txt.content; }       // pesimistic fallback
		this.info('Payloads: ' + src, '<pre>' + EnDe.Text.Entity(bux) + '</pre>');
	}
	__dbx('EnDeGUI.makelist }');
	return false;
}; // .makelist

EnDeGUI.initMenus= function() {
//#? initialise GUI menus (tool actions and text manipulation menus)
	var __dbx = function(t,n) { if (EnDeGUI.Mnu.trace===true) { EnDeGUI.dpr(t, n); } };

	function _guessMenu(item, src) {
	//#  generate submenu with for EN/DE.guess, assign to "guess" menu
		/*
		 * One menu entry is created for groups from EnDeGUI.Obj.groups where
		 * only groups matching 'item' (see kkk[] array below) are used.
		 * Each entry calls the dispatcher function with the value containing
		 * the items of the group seperated by @. The value will be prepended
		 * by 'guess:' (see  *dispatch() function) and the title of the group
		 * should look like:
		 *     guess:@menu description@item1@item2@...@itemN
		 */
		/* a call of EnDeGUI.guess() in .EN.dispatch() looks like:
			EnDeGUI.EN.dispatch(obj, item) {
				EnDeGUI.guess('EN@'+item, mode, uppercase, src, prefix, suffix, delimiter);
			}
			//# --------- type "guess: lbl description                item item ...")
			EnDeGUI.guess(EN	guess:@BIN@various binary conversions@oct8@oct7@oct6)
		*/
		var bbb = '';
		var ccc = '';
		var kkk = [];
		var idx = '';
		var val = 'guess:@ALL@use all encodings';
		var typ = '';
		switch (item) {
		  case 'Encoding': typ = 'EN'; break;
		  case 'Decoding': typ = 'DE'; break;
		}
		// get menu groups
		for (bbb=0; bbb<EnDeGUI.Obj.menus[typ+'.guess'].use.length; bbb++) {
			kkk.push(new RegExp(EnDeGUI.Obj.menus[typ+'.guess'].use[bbb]));
		}
		// get complete menu
		for (bbb=0; bbb<EnDeGUI.Obj.menus[item].use.length; bbb++) {
			ccc = EnDeGUI.Obj.menus[item].use[bbb];
			if (ccc.match(/^TXT/)!==null) { continue; }// skip text manipulation actions
			for (idx in EnDeGUI.Obj.groups[ccc].items) {
				if (idx==='indexOf') { continue; }
				val += '@' + EnDeGUI.Obj.groups[ccc].items[idx][1];
			}
		}
		var type= 'EnDeDOM.' + typ;     // we only need the prefix of the DOM id
		bbb = ''; ccc = '';

		// generate menu as in EnDeMenu.txt: */
		EnDeGUI.txt.content = ''
			+ 'makeID\tauto\n'
			+ 'group\t' + typ + '.genGuess\tguess all coding\tguess various codings\n'
			+ 'item3\t' + val + '\tguess\tuse all en-/decodings\n'
			+ '\n'
			;
	
		while ((ccc=kkk.shift())!==undefined) {  // IE crashes here
			// generate an item3 line for each group
			// separator in line is @
			for (bbb in EnDeGUI.Obj.groups) {
				if (bbb.match(ccc)===null) { continue; }
				// generate value for item3 line
				// for val see (EN|DE).dispatch() type='guess*'
				val   = 'guess:@' + EnDeGUI.Obj.groups[bbb].label + '@' + EnDeGUI.Obj.groups[bbb].title;
				for (idx in EnDeGUI.Obj.groups[bbb].items) {
					if (idx==='indexOf') { continue; }
					val += '@' + EnDeGUI.Obj.groups[bbb].items[idx][1];
				}
				// add above value to a normal item3 line as value
				EnDeGUI.txt.content += 'item3\t' + val + '\t' + EnDeGUI.Obj.groups[bbb].label + '\t' + EnDeGUI.Obj.groups[bbb].title + '\n';
			}
		}

		if (EnDeGUI.txt.trace===true) {
			// generating the menu is a Txt rather than a Mnu trace
			_dpr('\n***{\n'+EnDeGUI.txt.content+'\n***}');
		}
		ccc = null; kkk = null;
	}; // _guessMenu

	_spr('EnDeGUI.initMenus()');
	__dbx('EnDeGUI.initMenus() {'); /* dummy } */
	var bbb     = 0;
	var ccc     = null;
	var menu    = null;
	var target  = [
		/* GUI Options       */ 'OnlyMenu', 'BrowserMenu',  'API.Options',  'Files',
		/* Tools             */ 'Encoding', 'Decoding',     'IP', 'TS', 'Functions',
		/* special menus     */ 'CH.Unicode', 'MP.Unicode', 'MP.Characters',
		/* text manipulation */ 'EN.Text',  'DE.Text',      'IP.Text',  'FF.Text',
		/* guess             */ 'EN.Guess', 'DE.Guess'
		];

	// load menu data from file and generate objects
	try {     this.txt.read('EnDeMenu.txt'); this.txt.menu(); bbb++; }
	catch(e){ this.alert('EnDeGUI.initMenus: EnDeMenu.txt', e); }
	try {     this.txt.read('EnDeOpts.txt'); this.txt.menu(); bbb++; }
	catch(e){ this.alert('EnDeGUI.initMenus: EnDeOpts.txt', e); }
	try {     this.txt.read('EnDeFile.txt'); this.txt.menu(); bbb++; }
	catch(e){ this.alert('EnDeGUI.initMenus: EnDe.File.txt', e); }
	if (bbb<3) {
		if (/NETWORK_ERR.*XMLHttpRequest/.test(EnDe.File.errors.join())===true) {
			this.alert('**ERROR: reading files failed',
					'\n\nfor Chromium or Google Chrome browser try with commandline option'
					+ '\n\n--allow-file-access-from-files');
		}
		/* dummy { */ __dbx('EnDeGUI.initMenus }');
		return; // stop here to avoid continous errors
	}
	// generate menu data and generate objects
	_guessMenu('Encoding'); this.txt.menu();
	_guessMenu('Decoding'); this.txt.menu();
	//#dbx var t = ''; for (var a in EnDeGUI.__files) { t +='\n'+a;} alert(t);
	//#dbx var t = ''; for (var a in EnDeGUI.Obj.menus) { t +='\n'+a;} alert(t);

	/*
	 * Now we generate all menus with actions and functions. See EnDeMenu.txt .
	 * The type of menu (SELECT, BUTTON, etc.) is defined in the menu's html keyword.
	 * The destination (HTML tag in DOM) is defined in the menu's inside keyword.
	 * This allows to use a generic loop just using/knowing the menu definition.
	 */
	while ((ccc=target.shift())!==undefined) {
		if (ccc==='unknown') { //#dbx WARNING: produces huge output
			_dprint('EnDeGUI.initMenus: Menu: '+ccc+'\n', this.Obj.menus[ccc]);
		}
		if (ccc==='indexOf') { continue; }
		__dbx('EnDeGUI.initMenus: ' + ccc, '');
		try {
			this.Obj.menu('', this.Obj.menus[ccc]);
			__dbx('');
		}
		catch(e){
			__dbx(' **failed**');
			_dpr('**{ EnDeGUI.initMenus: EnDeGUI.Obj.menu(' + ccc + '):\n' + e + '\n**}');
		}
		// ToDo: following garbage collection most likely does not work; browser problem :-(
		//for (bbb=0; bbb<EnDeGUI.Obj.menus[ccc].use.length; bbb++) {
		//	delete this.Obj.menus[ this.Obj.menus[ccc].use[bbb] ];
		//}
		delete this.Obj.menus[ccc];
	}

	this.makemenu('EnDeFunc.txt');
	this.makemenu('EnDeUser.xml');

	delete menu; menu = null; ccc = null; target = null;

	/* dummy { */ __dbx('EnDeGUI.initMenus: done. }');

}; // initMenus
