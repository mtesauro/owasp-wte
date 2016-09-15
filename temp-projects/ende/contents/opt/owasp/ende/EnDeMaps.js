/* ========================================================================= //
// vi:  ts=4:
// vim: ts=4:
#?
#? NAME
#?      EnDeMaps.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeMaps.js"></SCRIPT>
#?
#? DESCRIPTION
#?      Functions to initialize character maps loaded using XMLHttpRequest();
#?
#?      Initializes following maps:
#?          EnDe.intMap  - array of [standard, Entity, Group, Desciption]
#?                         index is charCode
#?          EnDe.ncrMap  - array of char codes
#?                         index is entity name
#           EnDe.ucsMap  - array of characters where unicode base cannot be
#                          calculated from its integer value
#?          EnDe.dupMap  - array of duplicate entity names
#?                         unsorted, no index
#?          EnDe.xmlMap  - array of entities for XML
#?                         index is charCode
#                          this map may be extended dynamically
#?          EnDe.winMap  - for CP-1252 codings
#?          EnDe.winfMap - for CP-1252 codings
#?          EnDe.figsMap - Baudot figures
#?          EnDe.ltrsMap - Baudot letters
#?          EnDe.sosMap  - array of Morse characters
#?          EnDe.osoMap  - reverse array of Morse characters
#?          EnDe.asciiMap   - array 8-bit ASCII characters
#?          EnDe.ebcdicMap  - array 8-bit EBCDIC characters
#?          EnDe.ebcdicUTF  - array 8-bit UTF-EBCDIC characters
#?          EnDe.romanMap   - array 8-bit Mac OS Roman characters
#?          EnDe.a2eMap     - index is ASCII charCode, value index to ebcdicMap
#?          EnDe.e2aMap     - index is EBCDIC charCode, value index to asciiMap
#?
#? SEE ALSO
#?      EnDe.js
#?      EnDeMaps.txt
#?
#? VERSION
#?      @(#) EnDeMaps.js 3.15 12/06/02 20:19:19
#?
#? AUTHOR
#?      05-jun-07 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

if (typeof(EnDe)==='undefined') { EnDe = new function() {}; }

// EnDe.Maps object see behind Ende object extension below

// ===================================================================== //
// extend EnDe object  with character, Unicode, duplicate map            //
// ===================================================================== //


/* ------------- following must be defined in EnDe.js
EnDe.mapInt = 0;
EnDe.mapStd = 1;
EnDe.mapChr = 1;
EnDe.mapDsc = 2;
EnDe.mapEty = 2;
EnDe.mapSet = 3;
EnDe.mapTxt = 4;

EnDe.intMap = new Array(256*256);
EnDe.ncrMap = new Array();
EnDe.ucsMap = new Array();
EnDe.dupMap = new Array();
EnDe.xmlMap = new Array();
EnDe.winMap = new Array();
EnDe.winfMap= new Array();
EnDe.figsMap= new Array();
EnDe.ltrsMap= new Array();
EnDe.sosMap = new Array(50);
EnDe.osoMap = new Array(50);
EnDe.spaceMap   = new Array(50);
EnDe.asciiMap   = new Array(256);
EnDe.DIN66003Map= new Array(256);
EnDe.DIN66003fMap=new Array(256);
EnDe.ebcdicMap  = new Array(256);
EnDe.ebcdicUTF  = new Array(256);
EnDe.romanMap   = new Array(256);
EnDe.a2rMap     = new Array(256);
EnDe.r2aMap     = new Array(256); 
EnDe.a2eMap     = new Array(256);
EnDe.e2aMap     = new Array(256); 
EnDe.BladeMap   = Array(16);
------------- */

// ToDo following settings need to be moved to EnDeMaps.txt
/*
 * Morse characters
 */
EnDe.sosMap['0']='_____';
EnDe.sosMap['1']='.____'; EnDe.sosMap['a']='._';   EnDe.sosMap['j']='.___'; EnDe.sosMap['s']='...';
EnDe.sosMap['2']='..___'; EnDe.sosMap['b']='_...'; EnDe.sosMap['k']='_._';  EnDe.sosMap['t']='_';
EnDe.sosMap['3']='...__'; EnDe.sosMap['c']='_._.'; EnDe.sosMap['l']='._..'; EnDe.sosMap['u']='.._';
EnDe.sosMap['4']='...._'; EnDe.sosMap['d']='_..';  EnDe.sosMap['m']='__';   EnDe.sosMap['v']='..._';
EnDe.sosMap['5']='.....'; EnDe.sosMap['e']='.';    EnDe.sosMap['n']='_.';   EnDe.sosMap['w']='.__';
EnDe.sosMap['6']='_....'; EnDe.sosMap['f']='.._.'; EnDe.sosMap['o']='___';  EnDe.sosMap['x']='_.._';
EnDe.sosMap['7']='__...'; EnDe.sosMap['g']='__.';  EnDe.sosMap['p']='.__.'; EnDe.sosMap['y']='_.__';
EnDe.sosMap['8']='___..'; EnDe.sosMap['h']='....'; EnDe.sosMap['q']='__._'; EnDe.sosMap['z']='__..';
EnDe.sosMap['9']='____.'; EnDe.sosMap['i']='..';   EnDe.sosMap['r']='._.';  // EnDe.sosMap[' ']=' ';

/*
 * extended Morse characters
 */
EnDe.sosMap['.']='._._._'; EnDe.sosMap[':']='___...'; EnDe.sosMap['=']='_..._';
EnDe.sosMap['-']='_...._'; EnDe.sosMap['@']='.__._.'; EnDe.sosMap['/']='_.._.';
EnDe.sosMap[',']='__..__'; EnDe.sosMap['?']='..__..';
EnDe.sosMap['"']='._.._.'; EnDe.sosMap["'"]='.____.';
EnDe.sosMap[')']='_.__._'; EnDe.sosMap['+']='._._.';
/* not reversable, see above */
EnDe.sosMap['(']='_.__._'; // same as ')'
	/* note that '(' is defined, but not ')', we use it the other way arround
	 * so that decoding returns '(' always 
	 * seems to be a hash problem in JavaScript
	 */

/*
 * Baudot characters
 */
EnDe.figsMap['00000'] = '';
EnDe.figsMap['00001'] = '3';
EnDe.figsMap['00010'] = '\n';
EnDe.figsMap['00011'] = '-';
EnDe.figsMap['00100'] = ' ';
EnDe.figsMap['00101'] = "'";
EnDe.figsMap['00110'] = '8';
EnDe.figsMap['00111'] = '7';
EnDe.figsMap['01000'] = '\r';
EnDe.figsMap['01001'] = '$';
EnDe.figsMap['01010'] = '4';
EnDe.figsMap['01011'] = ' ';
EnDe.figsMap['01100'] = ',';
EnDe.figsMap['01101'] = '!';
EnDe.figsMap['01110'] = ':';
EnDe.figsMap['01111'] = '(';
EnDe.figsMap['10000'] = '5';
EnDe.figsMap['10001'] = '"';
EnDe.figsMap['10010'] = ')';
EnDe.figsMap['10011'] = '2';
EnDe.figsMap['10100'] = '#';
EnDe.figsMap['10101'] = '6';
EnDe.figsMap['10110'] = '0';
EnDe.figsMap['10111'] = '1';
EnDe.figsMap['11000'] = '9';
EnDe.figsMap['11001'] = '?';
EnDe.figsMap['11010'] = '&';
EnDe.figsMap['11011'] = 'FIGS';
EnDe.figsMap['11100'] = '.';
EnDe.figsMap['11101'] = '/';
EnDe.figsMap['11110'] = ';';
EnDe.figsMap['11111'] = 'LTRS';
EnDe.ltrsMap['00000'] = '';
EnDe.ltrsMap['00001'] = 'E';
EnDe.ltrsMap['00010'] = '\n';
EnDe.ltrsMap['00011'] = 'A';
EnDe.ltrsMap['00100'] = ' ';
EnDe.ltrsMap['00101'] = 'S';
EnDe.ltrsMap['00110'] = 'I';
EnDe.ltrsMap['00111'] = 'U';
EnDe.ltrsMap['01000'] = '\r';
EnDe.ltrsMap['01001'] = 'D';
EnDe.ltrsMap['01010'] = 'R';
EnDe.ltrsMap['01011'] = 'J';
EnDe.ltrsMap['01100'] = 'N';
EnDe.ltrsMap['01101'] = 'F';
EnDe.ltrsMap['01110'] = 'C';
EnDe.ltrsMap['01111'] = 'K';
EnDe.ltrsMap['10000'] = 'T';
EnDe.ltrsMap['10001'] = 'Z';
EnDe.ltrsMap['10010'] = 'L';
EnDe.ltrsMap['10011'] = 'W';
EnDe.ltrsMap['10100'] = 'H';
EnDe.ltrsMap['10101'] = 'Y';
EnDe.ltrsMap['10110'] = 'P';
EnDe.ltrsMap['10111'] = 'Q';
EnDe.ltrsMap['11000'] = 'O';
EnDe.ltrsMap['11001'] = 'B';
EnDe.ltrsMap['11010'] = 'G';
EnDe.ltrsMap['11011'] = 'FIGS';
EnDe.ltrsMap['11100'] = 'M';
EnDe.ltrsMap['11101'] = 'X';
EnDe.ltrsMap['11110'] = 'V';
EnDe.ltrsMap['11111'] = 'LTRS';

/*
 * Braille characters
 */
/*
	following Braille character: 1-3-4-5

		**
		 *
		*

	will be written as:

		'**\n *\n* '
		 14  25  36
 */
/* References
 * http://www.dotlessbraille.org/FACInfo.htm
 * http://www.brl.org/
 * http://de.wikipedia.org/wiki/Brailleschrift
 * http://en.wikipedia.org/wiki/Braille_ASCII
*/
/*
 * Standard (dotless) Braille characters
 */
EnDe.DbrMap['digit']=' *\n *\n**'; // used as prefix to digits same as '#'
EnDe.DbrMap[' ']='  \n* \n  ';
EnDe.DbrMap['1']='* \n  \n  ';
EnDe.DbrMap['2']='* \n* \n  ';
EnDe.DbrMap['3']='**\n  \n  ';
EnDe.DbrMap['4']='**\n *\n  ';
EnDe.DbrMap['5']='* \n *\n  ';
EnDe.DbrMap['6']='**\n* \n  ';
EnDe.DbrMap['7']='**\n**\n  ';
EnDe.DbrMap['8']='* \n**\n  ';
EnDe.DbrMap['9']=' *\n* \n  ';
EnDe.DbrMap['0']=' *\n**\n  ';
//
EnDe.DbrMap['a']='* \n  \n  ';
EnDe.DbrMap['b']='* \n* \n  ';
EnDe.DbrMap['c']='**\n  \n  ';
EnDe.DbrMap['d']='**\n *\n  ';
EnDe.DbrMap['e']='* \n *\n  ';
EnDe.DbrMap['f']='**\n* \n  ';
EnDe.DbrMap['g']='**\n**\n  ';
EnDe.DbrMap['h']='* \n**\n  ';
EnDe.DbrMap['i']=' *\n* \n  ';
EnDe.DbrMap['j']=' *\n**\n  ';
//
EnDe.DbrMap['k']='* \n  \n* ';
EnDe.DbrMap['l']='* \n* \n* ';
EnDe.DbrMap['m']='**\n  \n* ';
EnDe.DbrMap['n']='**\n *\n* ';
EnDe.DbrMap['o']='* \n *\n* ';
EnDe.DbrMap['p']='**\n* \n* ';
EnDe.DbrMap['q']='**\n**\n* ';
EnDe.DbrMap['r']='* \n**\n* ';
EnDe.DbrMap['s']=' *\n* \n* ';
EnDe.DbrMap['t']=' *\n**\n* ';
//
EnDe.DbrMap['u']='* \n  \n**';
EnDe.DbrMap['v']='* \n* \n**';
EnDe.DbrMap['w']=' *\n**\n *';
EnDe.DbrMap['x']='**\n  \n**';
EnDe.DbrMap['y']='**\n *\n**';
EnDe.DbrMap['z']='* \n *\n**';
EnDe.DbrMap['ß']=' *\n* \n**';
EnDe.DbrMap['st']=' *\n**\n**';
EnDe.DbrMap['au']='* \n  \n *';
EnDe.DbrMap['eu']='* \n* \n *';
//
EnDe.DbrMap[',']='  \n* \n  ';
EnDe.DbrMap[';']='  \n* \n* ';
EnDe.DbrMap[':']='  \n**\n  ';
EnDe.DbrMap['.']='  \n  \n* ';
EnDe.DbrMap['?']='  \n* \n *';
EnDe.DbrMap['!']='  \n**\n* ';
EnDe.DbrMap['(']='  \n**\n**';
EnDe.DbrMap[')']='  \n**\n**';
EnDe.DbrMap['"']='  \n* \n**';
EnDe.DbrMap['"']='  \n *\n**';
EnDe.DbrMap['-']='  \n  \n**';
/*
 * ASCII Braille characters
 */
EnDe.AbrMap     = EnDe.DbrMap;
EnDe.AbrMap[' ']='  \n  \n *';
//
EnDe.AbrMap[',']='  \n  \n *';
EnDe.AbrMap[';']='  \n *\n *';
EnDe.AbrMap[':']='* \n *\n *';
EnDe.AbrMap['.']=' *\n  \n *';
EnDe.AbrMap['?']='**\n *\n *';
EnDe.AbrMap['!']=' *\n* \n**';
EnDe.AbrMap['(']='* \n**\n**';
EnDe.AbrMap[')']=' *\n**\n**';
EnDe.AbrMap['"']='  \n *\n  ';
EnDe.AbrMap['"']='  \n  \n *';
EnDe.AbrMap['-']='  \n  \n**';
//
EnDe.AbrMap['#']=' *\n *\n**';
EnDe.AbrMap['$']='**\n* \n *';
EnDe.AbrMap['%']='**\n  \n *';
EnDe.AbrMap['&']='**\n* \n**';
EnDe.AbrMap["'"]='  \n  \n* ';
EnDe.AbrMap['*']='* \n  \n *';
EnDe.AbrMap['+']=' *\n  \n**';
EnDe.AbrMap['/']=' *\n  \n* ';
EnDe.AbrMap['<']='* \n* \n *';
EnDe.AbrMap['=']='**\n**\n**';
EnDe.AbrMap['>']=' *\n *\n* ';
EnDe.AbrMap['@']=' *\n  \n  ';
EnDe.AbrMap['[']=' *\n* \n *';
EnDe.AbrMap['\\']='* \n**\n *';
EnDe.AbrMap[']']='**\n**\n *';
EnDe.AbrMap['^']=' *\n *\n  ';
EnDe.AbrMap['_']=' *\n *\n* ';

/*
 * Dada Urka  http://www.leiber.ws/dirk/dadaurka.htm
 */
EnDe.DadMap['a']='|   \n|   \n+---';
EnDe.DadMap['b']='|   \n|*  \n+---';
EnDe.DadMap['c']='|   \n|** \n+---';
EnDe.DadMap['d']='   |\n   |\n---+';
EnDe.DadMap['e']='   |\n  *|\n---+';
EnDe.DadMap['f']='   |\n **|\n---+';
EnDe.DadMap['g']='---+\n   |\n   |';
EnDe.DadMap['h']='---+\n  *|\n   |';
EnDe.DadMap['i']='---+\n **|\n   |';
EnDe.DadMap['j']='+---\n|   \n|   ';
EnDe.DadMap['k']='+---\n|*  \n|   ';
EnDe.DadMap['l']='+---\n|**|\n|   ';
EnDe.DadMap['m']='|  |\n|  |\n+--+';
EnDe.DadMap['n']='|  |\n|* |\n+--+';
EnDe.DadMap['o']='|  |\n|**|\n+--+';
EnDe.DadMap['p']='---+\n   |\n---+';
EnDe.DadMap['q']='---+\n  *|\n---+';
EnDe.DadMap['r']='---+\n **|\n---+';
EnDe.DadMap['s']='+--+\n|  |\n|  |';
EnDe.DadMap['t']='+--+\n|* |\n|  |';
EnDe.DadMap['u']='+--+\n|**|\n|  |';
EnDe.DadMap['v']='+---\n|*  \n+---';
EnDe.DadMap['w']='+--+\n|  |\n+--+';
EnDe.DadMap['x']='+--+\n|* |\n+--+';
EnDe.DadMap['y']='+--+\n|**|\n+--+';
EnDe.DadMap['z']='+---\n|   \n+---';
EnDe.DadMap['A']='|   \n|   \n+---';
EnDe.DadMap['B']='|   \n|*  \n+---';
EnDe.DadMap['C']='|   \n|   \n+---';
EnDe.DadMap['D']='   |\n   |\n---+';
EnDe.DadMap['E']='   |\n  *|\n---+';
EnDe.DadMap['F']='   |\n **|\n---+';
EnDe.DadMap['G']='---+\n   |\n   |';
EnDe.DadMap['H']='---+\n  *|\n   |';
EnDe.DadMap['I']='---+\n **|\n   |';
EnDe.DadMap['J']='+---\n|   \n|   ';
EnDe.DadMap['K']='+---\n|*  \n|   ';
EnDe.DadMap['L']='+---\n|**|\n|   ';
EnDe.DadMap['M']='|  |\n|  |\n+--+';
EnDe.DadMap['N']='|  |\n|* |\n+--+';
EnDe.DadMap['O']='|  |\n|**|\n+--+';
EnDe.DadMap['P']='---+\n   |\n---+';
EnDe.DadMap['Q']='---+\n  *|\n---+';
EnDe.DadMap['R']='---+\n **|\n---+';
EnDe.DadMap['S']='+--+\n|  |\n|  |';
EnDe.DadMap['T']='+--+\n|* |\n|  |';
EnDe.DadMap['U']='+--+\n|**|\n|  |';
EnDe.DadMap['V']='+---\n|*  \n+---';
EnDe.DadMap['W']='+--+\n|  |\n+--+';
EnDe.DadMap['X']='+--+\n|* |\n+--+';
EnDe.DadMap['Y']='+--+\n|**|\n+--+';
EnDe.DadMap['Z']='+---\n|   \n+---';

/*
 * Blade font (simulated with ASCII charaters)
 */
EnDe.BladeMap['0']=')(';
EnDe.BladeMap['1']=')';
EnDe.BladeMap['2']='))';
EnDe.BladeMap['3']=')))';
EnDe.BladeMap['4']='(0';
EnDe.BladeMap['5']='0';
EnDe.BladeMap['6']='0)';
EnDe.BladeMap['7']='0))';
EnDe.BladeMap['8']='0)))';
EnDe.BladeMap['9']='))(';

/*
 * DNA/DNS ** NOT YET USED **
 */
EnDe.dnaMap['0'] = 'a';
EnDe.dnaMap['1'] = 't';
EnDe.dnaMap['2'] = 'c';
EnDe.dnaMap['4'] = 'g';

// ========================================================================= //
// EnDe.Maps object methods                                                  //
// ========================================================================= //

	//	+	+	#	+	#
EnDe.Maps   = new function() {
	this.SID    = '3.15';
	this.sid    = function() { return('@(#) EnDeMaps.js 3.15 12/06/02 20:19:19 EnDe.Maps'); };
	this.trace  = false;

	this.traces = [];   /* used for trace, as GUI function are not avaialable
						 * here; array must be printed in calling function
						 */

	/* Very ugly hack: all EnDe.Maps.* methods are called while loading the GUI
	 * into the browser, hence the GUI have not yet been called to check search
	 * parameters in the URL or checkboxes in the HTML.
	 * Also when EnDe.js is used as library, there is no GUI.
	 * Hence the hardcoded check for search parameters, details see EnDeGUI.js.
	 */
	if (location.search) {
		if (/traceMaps?/i.test(location.search)===true) { this.trace = true; }
	}

	// ===================================================================== //
	// internal/private functions                                            //
	// ===================================================================== //

	function __dbx(t,n) { if (EnDe.Maps.trace===true) { EnDe.Maps.traces.push(t); } };

	// ===================================================================== //
	// public functions                                                      //
	// ===================================================================== //

	this.init   = function() {
	//#? intialize EnDe maps                                                            //
	var file='EnDeMaps.txt';
	var a   = 0;
	var e   = 0;
	var cnt = 0;
	var idx = 0;
	var txt = '';
	var kkk = '';
	var map = '';
	var typ = '';
	var ccc = '';
	var bbb = new XMLHttpRequest();
	var arr = null;
	var req = null;
	var skip= true;

	__dbx('EnDe.Maps.init: reverse Morse mapping');
	for (ccc in EnDe.sosMap) {             // ------------------- reverse Morse
		EnDe.osoMap[EnDe.sosMap[ccc]] = ccc;
	}

	// maps from external file
	req = bbb.open('GET', file, false);             // load synchronous, to avoid specifying a handler
	bbb.setRequestHeader('Accept', 'text/plain');   // workaround for some picky browsers reading from file:///
	req = bbb.send(null);
	if ((bbb.status!==200) && (bbb.status!==0)) {   // contribution to GUI which may use lib/ directory
		file= 'lib/' + file;
		req = bbb.open('GET', file, false);
		bbb.setRequestHeader('Accept', 'text/plain');
		req = bbb.send(null);
		// if there was no lib/ directory, it's just a useless request
	}
	txt = bbb.responseText;
	if ((bbb.status!==200) && (bbb.status!==0)) {
		// 200 from http:// request; 0 from file:/// request
		txt = null; bbb = null;
// ToDo: alert() is a bad idea! think about a better solution
		//alert('**ERROR: reading ' + file + ' failed');
		return;
	}
	kkk = txt.split('\n');
	__dbx('EnDe.Maps.init: initialize mapping: ' + kkk.length + ' lines ...');
	while ((bbb = kkk.shift())!==undefined) {
		cnt++; if (cnt==32000)         { break;}    // avoid loops
		if (bbb.match(/^\s*#/)!==null) { continue; }// skip comments
		if (bbb.match(/^\s*$/)!==null) { continue; }// skip empty lines
		if (/^__DATA/.test(bbb)===true){ skip = false; }
		if (/^__END/.test(bbb)===true) { break; }   // end of data
		if (skip===true)               { continue; }
		bbb = bbb.replace(/\t{2,}/g, '\t');         // squeeze multiple TABs
		arr = bbb.split(/\t/);
		switch (arr[0]) {   // only have 2 keywords, anything else is data
		  case 'group': map = arr[1]; break;
		  case 'map':   typ = arr[1]; break;
		  default:          // data
			switch(typ) {
			  case 'index':     idx = parseInt(arr[0],10);      break;
			  case 'hash':      idx = arr[0].toString() + '';   break;
			  default:          /* simply ignore */             break;
			}
			switch(map) {
// ToDo: following not yet working
/*
			  case 'figsMap':   EnDe.figsMap[idx]  = arr[1];    break;
			  case 'ltrsMap':   EnDe.ltrsMap[idx]  = arr[1];    break;
			  case 'sosMap':    EnDe.sosMap[idx]   = arr[1];    break;
*/
			  case 'xmlMap':    EnDe.xmlMap[idx]   = arr[1];    break;
			  case 'rangeMap':  EnDe.rangeMap[idx] = arr[1];    break;
			  case 'ebcdicMap': EnDe.ebcdicMap[idx]= arr;
								EnDe.ebcdicUTF[idx]= arr;       break;
			  case 'ebcdicUTF': EnDe.ebcdicUTF[idx]= arr;       break;
			  case 'asciiMap':  EnDe.asciiMap[idx] = arr;       break;
			  case 'romanMap':  EnDe.romanMap[idx] = arr;       break;
			  case 'spaceMap':  EnDe.spaceMap[idx] = arr[1];    break;
			  case 'DIN66003Map':
				ccc = new Number(arr[1]);           // force cast to number!
				EnDe.DIN66003Map[idx]  = arr;
				EnDe.DIN66003fMap[ccc] = idx;
				// __dbx('idx='+ idx + ', arr1='+ccc + ': '+ EnDe.DIN66003fMap[ccc] + '# '+ typeof EnDe.DIN66003fMap[ccc]);
				break;
			  case 'intMap':
				if ((arr[EnDe.mapEty]==='-') && (arr[EnDe.mapSet]==='-')) {
					continue;                       // skip empty definitions
				}
				if (EnDe.intMap[idx]!==undefined) { // duplicate index
					EnDe.dupMap.push(new Array(EnDe.intMap[idx]));
				}
				EnDe.intMap[idx]   = arr;
				if (arr[EnDe.mapEty]!=='-') {       // entity index
					EnDe.ncrMap[arr[EnDe.mapEty]]  = idx;// just the index, save memory
				}
				break;
			  case 'winMap':    EnDe.winMap[idx]   = arr;
				if (arr[EnDe.mapEty]!=='-') {
					EnDe.winfMap[arr[EnDe.mapStd]] = arr;
				}
				break;
			  default:          /* simply ignore */             break;
			}
			break;
		}
	}

	// some specials maps
	__dbx('EnDe.Maps.init: ASCII-EBCDIC mapping (' + EnDe.asciiMap.length + ')');
	for (a=0; a<256; a++) {           // ----------- lazy ASCII-EBCDIC mapping
		if (EnDe.asciiMap[a]===undefined) { continue; }
		ccc =  EnDe.asciiMap[a][EnDe.mapChr];
		if (ccc==='')  { continue; }
		for (e=0; e<256; e++) {
			if (EnDe.ebcdicMap[e]===undefined) { continue; }
			kkk =  EnDe.ebcdicMap[e][EnDe.mapChr];
			if (kkk==='')  { continue; }
			if (kkk===ccc) {
				EnDe.a2eMap[a] = e;
				EnDe.e2aMap[e] = a;
				break;
			}
		}
		kkk = null;
	}
	__dbx('EnDe.Maps.init: ASCII-Mac OS Roman mapping (' + EnDe.asciiMap.length + ')');
	for (a=0; a<256; a++) {           // ----------- lazy ASCII-EBCDIC mapping
		if (EnDe.asciiMap[a]===undefined) { continue; }
		ccc =  EnDe.asciiMap[a][EnDe.mapChr];
		if (ccc==='')  { continue; }
		for (e=0; e<256; e++) {
			if (EnDe.romanMap[e]===undefined) { continue; }
			kkk =  EnDe.romanMap[e][EnDe.mapChr];
			if (kkk==='')  { continue; }
			if (kkk===ccc) {
				EnDe.a2rMap[a] = e;
				EnDe.r2aMap[e] = a;
				break;
			}
		}
		kkk = null;
	}

	}; // .init

}; // EnDe.Maps

EnDe.Maps.init();
