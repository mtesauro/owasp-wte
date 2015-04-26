/* ========================================================================= //
// vi:  set ts=4: //
// vim: set ts=4: //
#?
#? NAME
#?      EnDeREMap.js - defintions of regular expression flavours
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeREMap.js"></SCRIPT>
#?
#? DESCRIPTION
#?      Internal data structure for RegEx used in  EnDeRE.parse().
#?      It defines the  EnDeTMP  object  used in  EnDeRE.js.
#?
#? SEE ALSO
#?      EnDeRE.js
#?
# HACKER's INFO
#       Because we want to have this data structure in it's own file, it's not
#       possible to use a sub object like  EnDeRE.Map. Instead we use EnDeTMP.
#       Sub objects in their own file would only be possible if the file would
#       be included by that one defineing the  EnDeRE  object itself.
#
#? VERSION
#?      @(#) EnDeREMap.js 3.9 12/06/03 14:38:33
#?
#? AUTHOR
#?      18-mar-08 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

var EnDeREMap = new function() { this.SID = '3.9'; } // dummy definition for EnDe.SIDs

var EnDeTMP     = new function() {
	this.SID    = '3.9';

	// Xayide - Magierin von Horok
	var x = -9, _x = '**EnDeRE: undefined or unknown/untested feature **';
	var a =  1, _a = 'start grouping/identation';
	var y =  2, _y = 'special escaping'; // see below
	var i =  3, _i = 'supported within character class [..] only';
	var d =  8, _d = 'behaviour depends on version';
	var e = -1, _e = ' end  grouping/identation';

	var h =  4, _h = 'different behaviour';
	var O =  0, _O = 'not available';
	var r =  5, _r = 'unsure if supported';
	var o = -8, _o = '---functionality known, but disabled---';
	var K =  9, _K = 'available';
	
	this.x = x; this._x = _x;
	this.a = a; this._a = _a;
	this.y = y; this._y = _y;
	this.i = i; this._i = _i;
	this.d = d; this._d = _d;
	this.e = e; this._e = _e;
	
	this.h = h; this._h = _h;
	this.O = O; this._O = _O;
	this.r = r; this._r = _r;
	this.o = o; this._o = _o;
	this.K = K; this._K = _K;
	
	/* Above variables are used in the tables below, see this._chrs.prototype{}
	 * and this._literal.prototype{}.
	 * ************************************************************************
	 * ** Note that the variabl  O  is the capital letter  o  and not the    **
	 * ** digit  0.  The tables below must only contain the cpital letter  O **
	 * ************************************************************************
	 */

  // ======================================================================= //
  // public definition of all features and behaviours                        //
  // ======================================================================= //

  // == Step0 ==
  /*
	---- Description of the internal data structure used to parse RegEx ----
	Most (all?) information about behaviours, features, dragons etc. will be
	defined in tables.  Then there is a small object used as global variable
	while parsing the RegEx. Parsing is mainly driven by these tables.
	For the tables 2 objects (hashes) are used:
		_chrs{}     - contains tables for different features
		_desc{}     - contains the descriptions of the features
		_literal{}  - contains tables for literal meta strings
		_context{}  - describes some special features
	All these object have mainly the same hash keys. These keys are:
		'ctrl'      - table for control characters
		'clss'      - table of shortcuts for characters classes
		'meta'      - table of general meta characters
		'escp'      - table of characters becoming meta if escaped
		'init'      - table of characters which may enclose the RegEx
		'raw'       - array of string literals used to identify raw strings
		'quantifier'- table of allowed quantifiers
		'anchor'    - table of characters allowed as anchors (word boundary)
		'modifier'  - table of characters used as for modifiers
		'backreferences'- table of ..
	All these tables are organized the same way:  one header line -'fuchur'-
	which describes the sequence of all other arrays in the hash and one key
	for each supported language -for example ':POSIX:'-  where it's value is
	an array describing the availability of the feature.
	The array consist of the values:  x, a, y, i, d, e,  h, O, r, o, K
	where mainly  O K  are used if available or not available, and  x if not
	yet tested or unknown. In an ideal world, no  x  are used ;-)
	These values are defined as global variables -better: constants- as they
	may be needed in other functions too.
	Note: the variable's name is the uppercase letter O, not the digit 0 but
	it's value is 0 anyway.

	Sometimes a meta character has different behaviour and meaning depending
	on the language. These  are cases,  most  meta characters  have the same
	meaning in  all languages. The exceptions take effect in the description
	_desc.ctrl{}  and  _desc.meta{}  only.
	For the exception a different key is used. The key is the meta character
	(as for the standard case) appended by the language should be valid for.
	Example:   _desc.ctrl['d']  is for  'DEL character'
	but also:  _desc.meta['d']  is for  'digits'
	while for Emacs it needs to be the first case, we define it like:
	           _desc.ctrl['d:Emacs']  is for  'DEL character'

    The tables in  _chrs{}  and  _desc{}  can  simply be accessed  using the
    character in the header line (fuchur), which comes from the parsed RegEx
	string. The other object tables like in  _literal{}  and  _context{} can
	not be accessed  using extracted string  from the parsed RegEx,  special
	actions need to be done there.

	EnDeRE.arr2hash()  is used to convert an array to a hash  for a specific
	flavour. Then the parsed character is the hash key (as described above).
	This is done for  _chrs{}  and  _context{}.

	_literal{}  is build automatically from   _desc{},  see Step1.

	The global variable  goab  is used while parsing a RegEx. A new instance
	will be initialized for each requested parse.

	Following flavours are treated as equal:
		expect and Tcl
		ed and sed
   */

  /* Values in the tables below have above values, y is special as follows:
	*
	*   y  Escaped character is not supported by the  RegEx engine, but done
	*      by the string processing before, then feeds the  converted string
	*      to the RegEx engine.
	*      This means that an escaped charater like  \b has to be written as
	*      \\b  to become a literal  \b  in the RegEx,  conseqently funny is
	*      that  \\\\  is required for a literal  \  in the RegEx.  Examples
	*      are python and Java.
	*      JavaScript is special:  \b is literal  \b  for the RegEx if it is
	*      enclosed in  /.../,  but needs to be written as  \\b  if enclosed
	*      in  "..."  or  '...' .
*** ToDo: above description obsolete with _chrs.raw[]  11-apr-08
   */
   /*
	* Grouping -classes, parantheses, brackets, braces- use value  a  and  e
	* which are  1  and  -1 , this way we can simply "add" that value to the
	* current goab variable which then counts the nested level too.
	* All values should be grater than  O  so we can check:  if (val > O) ..
	* (exception to this is  e  but that's handled different anyway).
   */

// ToDo: Note: currently (march 2008) only O and K are supported in .parse()
// ToDo:       anything else (except a and e) is treated as K
// ToDo:       x  is added additionally to the description

	// some multiple used texts
var _xx = 'extended syntax (free spacing mode)';
var _ci = 'case insensitive';
var _gm = 'global matches';
var	_da = 'dot matches all';
var	_ml = 'multiline mode';
var _lo = 'use locale definition for \\w, \\W,\\b and \\B';
var _un = 'use Unicode definition for \\w, \\W,\\b and \\B';

var _mp = 'mainly UNIX man pages';
var _jf = "Mastering Regular Expressions, Jeffrey Friedl, O'Reilly";
var _vi = "Learning the vi, Linda Lamb & Arnold Robbins, O'Reilly";

this._goab = function() {};// container for all states while parsing
this._goab.prototype = {
	hold    : '',   // contains not yet printed characters (mainly after a \ )
	skip    : 0,    // count of characters to be skipped (mainly for meta string literals)
	backr   : 0,    // count backreferences
	isesc   : false,// true if last character was escape character (\ usually)
	isgroup : 0,    // count group levels ()
	isclass : false,// true if inside character class []
	isrange : false,// true if inside quantifier {}
	isspan  : false,// true if inside RegEx literal
	ismod   : false,// true if in modifier state
	escchr  : '',   // contains character used for escaping (\ usually)
	start   : '',   // contains character after that RegEx starts (/ or " usually)
	stop    : '',   // contains character before RegEx ends (/ or " usually)
	quote   : '',   // contains character used as string delimiter
	asis    : true, // false: RegEx is evaluated as string first
	                // true:  RegEx literal string (see quote above also) 
	regex   : 0,    // 0: before RegEx,
		            // 1: first character in RegEx,
	                // 2: after first character, inside RegEx,
	                // 3,4: behind RegEx (modifier)
	                // (awk, sed, perl, JavaScript etc. with / or " )
	ic      : 'i',  // some matches are done case-insensitive
	tab     : '\t', // contains string used for identation
	ident   : '',   // contains current identation string
	orig    : '',   // set to the RegEx language/flavour passed in from GUI
	lang    : '',   // set to the current RegEx language/flavour to parse
	print   : false,// true:  description for meta character required
	                // false: just identaion on parantheses, brackets, braces
	desc    : null, // hash with all description texts
	ctrl    : null, // hash of control characters for current language
	clss    : null, // hash of characters classes for current language
	meta    : null, // hash of meta characters for current language
	escp    : null, // hash of escaped meta characters for current language
	prop    : null, // hash of Unicode properties support for current language
	init    : null, // hash of "starter" characters for current language
	anchor  : null, // hash of meta characters used as anchors
	ctxctrl : null, // hash of control context for current language
	ctxclss : null, // hash of class context for current language
	ctxmeta : null, // hash of meta context for current language
	ctxlook : null, // hash of lookaround grouping for current language
	ctxmod  : null, // hash of modifier context for current language
	literal : null, // hash of supported classes and meta strings
	modifier: null, // hash of modifiers for current language
	quantifier:null // hash of quantifiers characters for current language
}; // _goab

this._lang = function() {};
this._lang.prototype = { // map all languages to the used RegEx engine
   // goab.orig :    goab.lang
   //-----------+----------------
	':Java-code':   ':Java',
	':Java-prop':   ':Java',
	':JavaScript':  ':ECMA-262',
	':VBScript' :   ':.NET',
	':VB.NET'   :   ':.NET',
	':C#'       :   ':.NET',
	':boo'      :   ':.NET',
	':ModSecurity': ':PCRE',
	':Erlang'   :   ':PCRE',
	'_dump_'    :   ':Perl',    // fake; not a language
//	':user-regex':  ':user-regex',
	'_dumm'     :   ''
}; // _lang

// ugly JavaScript does not allow 'char', 'class' and 'escape' as variable
// names, hence we have to use chrs, clss and escp :-((

this._chrs = function() {}; // list of meta characters for each language
this._chrs.prototype = {
	'escchr': '\\',// other characters may be the escape character, like in MySQL
	'escchr:MySQL'    : "'",
	'escchr:VB.NET'   : '"',
	'escchr:UltraEdit': '^',
	ctrl: {
		'desc'      : 'list of supported control characters',
		/* Note that "control characters" are considered on character, while
		 * "shortcut classes" (see below) ar a group of characters.
		 */
		/*
			a   BELL
			b   backspace
			e   ESC
			h   backspace
			d   DEL character
// ToDo: d disabled 'cause of conflict with digit class
			f   form feed
			h   
			n   newline
			p   \r\n   // ToDo: a bit wrong here 'cause more than one character (see above)
			p   carriage return
			t   horizontal TAB
			v   vertical TAB
			z   EOF character (mainly Windows)
			0   0-byte
// ToDo: for 0-byte see also chrs.escp[]
		 */
		'fuchur'    : 'a b d e g h f n p r t v z 0',
		//----------+ +---------------------------+,
		':BRE'      : [O,K,x,O,O,O,O,K,O,K,K,K,O,O],
		':ERE'      : [O,K,x,O,O,O,O,K,O,K,K,K,O,O],
		':POSIX'    : [O,K,x,O,O,O,O,K,O,K,K,K,O,O],
		':awk'      : [O,O,O,O,O,O,O,K,O,K,K,O,O,O],
		':gawk'     : [K,K,O,O,O,O,K,K,O,K,K,r,O,K], // \v probably starting with gawk 3.0
		':bash'     : [K,K,O,O,O,O,K,K,O,K,K,K,O,K],
		':oldgrep'  : [O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':grep'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ggrep'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':egrep'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ed'       : [O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ex'       : [O,O,O,O,O,O,x,x,O,x,x,O,O,O],
		':sed'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':gsed'     : [O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':lex'      : [O,K,O,O,O,O,K,K,O,K,K,O,O,K],
		':flex'     : [K,K,O,O,O,O,K,K,O,K,K,K,O,K],
		':S-Lang'   : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':Emacs'    : [K,K,o,K,O,O,K,o,O,K,o,K,O,O], // t and n converted within string but unknown to RegEx engine
		':Java'     : [d,K,O,d,O,O,K,K,O,K,K,d,O,O], // \b within character class only
		':.NET'     : [K,K,O,K,O,O,K,K,O,K,K,K,O,K],
		':Perl'     : [K,K,x,K,O,O,K,K,O,K,K,r,O,K], // \v in 5.00x?, but not 5.8.x?
		':PCRE'     : [K,K,O,K,O,O,K,K,O,K,K,O,O,K],
		':PHP'      : [K,K,h,K,O,O,K,K,O,K,y,O,O,K],
		':Python'   : [y,y,x,O,O,O,y,y,O,y,y,r,O,y],
		':Ruby'     : [K,K,O,K,O,O,K,K,O,K,K,K,O,K],
		':Tcl'      : [K,K,x,K,O,O,K,K,O,K,K,K,O,K], // \B als Ersatz fuer \\
		':C'        : [K,K,x,K,O,O,K,K,O,K,K,K,O,K],
		':VisualSt' : [K,K,O,K,K,K,K,K,O,K,K,K,O,K],
		':ECMA-262' : [O,O,O,O,O,O,K,K,O,K,K,K,O,K],
		':oldvi'    : [O,K,O,O,O,O,x,K,O,K,K,O,O,O],
		':vi'       : [O,K,O,O,O,O,x,K,O,K,K,O,O,O],
		':vim'      : [O,K,O,K,O,O,O,K,O,K,K,O,O,O],
		':nvi'      : [O,K,O,O,O,O,x,K,O,K,K,O,O,O],
		':elvis'    : [O,K,O,O,O,O,x,K,O,K,K,O,O,O],
		':UltraEdit': [O,K,O,O,O,O,O,K,K,K,K,O,O,O],
		':UE32_Unix': [O,O,O,O,O,O,K,K,K,K,K,K,O,O],
		':ISAPI_rew': [K,O,O,K,O,O,K,K,O,O,K,K,O,O],
		':AS3'      : [O,O,O,O,O,O,O,K,O,K,K,O,O,K],
// ToDo
/*
		':AS2'      : [x,x,x,x,x,O,x,x,O,x,x,x,x,x],
		':CF'       : [x,x,x,x,x,O,x,x,O,x,x,x,x,x],
		':Lisp'     : [x,x,x,x,x,O,x,x,O,x,x,x,x,x],
		':XPath'    : [x,x,x,x,x,O,x,x,O,x,x,x,x,x],
		':XML'      : [x,x,x,x,x,O,x,x,O,x,x,x,x,x],
 ToDo: MySQL hat \' und \"
 */
		':MySQL'    : [O,y,O,K,O,O,K,K,O,K,K,K,K,h], // \0 not supported but 0 itself
		':SQL'      : [x,x,x,x,O,O,x,x,O,x,x,x,x,x]
	}, // ctrl

	clss: {
		'desc'      : 'list of supported shortcut classes',
// ToDo: enthaelt noch die Anchors  (AbBGmMZ), diese hier entfernen ..
// ToDo: enthaelt noch die Modifier (lLuUQE), diese hier entfernen ..
		/*
		 * NOTE that  a, f, n, r, t and v are used as controls
		 * NOTE that  b  is used as control in rare cases
		 * NOTE that  g, i, o  and x are used as modifiers
			m,M is word boundery (Tcl only)
			y,Y is word boundery
			v   vertical tab (white space)
			V   not vertical tab (white space)
			b   when used as word boundery
			e   when used as end of upper|lower case
			P   when unicode properties are supported
		 */
		'fuchur'    : 'A b B c C d D e E f F G h H i I k K l L m M N p P Q R s S u U v V w W X y Y z Z',
		//----------+ +-------------------------------------------------------------------------------+,
		':BRE'      : [O,O,O,x,x,K,K,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,K,K,O,O,O,O,K,K,O,O,O,O,O],
		':ERE'      : [O,O,O,x,x,K,K,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,K,K,O,O,O,x,K,K,O,O,O,O,O],
		':POSIX'    : [O,K,K,x,x,K,K,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,K,K,O,O,O,x,K,K,O,O,O,O,O],
		':awk'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O], // w,W description wrong in Friedl's 1'st edition
		':gawk'     : [O,O,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,K,O,O,O], // : within class only
		':bash'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':oldgrep'  : [O,O,O,x,x,O,O,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':grep'     : [O,O,O,x,x,O,O,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ggrep'    : [O,K,K,x,x,O,O,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O],
		':egrep'    : [O,K,K,x,x,O,O,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O],
		':ed'       : [O,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O],
		':ex'       : [O,x,x,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,K,K,O,O,K,K,O,O,O,O,O],
		':sed'      : [O,O,O,x,x,O,O,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':gsed'     : [O,K,K,x,x,O,O,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O],
		':lex'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':flex'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':S-Lang'   : [O,O,O,h,h,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':Emacs'    : [O,K,K,o,x,O,O,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,r,r,O,O,O,x,K,K,O,O,O,O,O], // s,S is special, somehow; \c is not used but ?\ instead
		':Java'     : [K,K,K,K,x,K,K,O,K,O,O,K,x,x,O,O,O,O,x,x,x,x,x,K,K,K,x,K,K,x,x,O,O,K,K,O,O,O,K,K],
		':.NET'     : [K,K,K,K,x,K,K,O,O,O,O,K,x,x,O,O,O,O,x,x,x,x,x,K,K,x,x,K,K,O,O,O,O,K,K,O,O,O,K,K],
		':Perl'     : [K,K,K,x,K,K,K,O,K,O,O,K,x,x,O,O,O,d,d,d,O,O,x,d,d,K,x,d,d,K,K,O,x,d,d,K,O,O,K,K], // p,P depends on version, Note that variables are interpolated inside \Q...\E, hence $ and @ are no literals there; \s  does not match vertical tab (\v); \K starting with 5.10
		':PCRE'     : [K,K,K,K,K,K,K,O,K,O,O,K,K,K,O,O,O,K,O,O,O,O,O,K,K,K,K,K,K,O,O,K,K,K,K,K,O,O,K,K], // p,P,X needs special compiler flags, but are supported i.g.; \g{} for relative backreference (see .esc{} below)
		':PHP'      : [K,K,K,K,K,K,K,O,K,O,O,K,K,K,O,O,O,x,x,x,O,O,x,K,K,K,K,K,K,O,x,K,K,K,K,K,O,O,K,K], // R is recursion of backreferences
		':Python'   : [O,K,K,x,x,K,K,O,O,O,O,O,x,x,O,O,O,O,x,O,O,O,O,O,O,O,O,K,K,O,O,O,x,d,d,O,O,O,O,h], // w,W description different in Friedl's 1'st and 3'rd edition
		':Ruby'     : [h,K,K,K,K,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,K,K,O,O,O,O,K,K,O,O,O,h,h], // b innerhalb [] ist backspace
		':Tcl'      : [K,O,h,K,O,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O,K,K,O,O,O,O,K,K,O,K,K,K,K], // up to Tcl 8.x; B is special escaping in Tcl, not word boundary
		':C'        : [x,x,x,x,x,x,x,O,x,O,O,x,x,x,O,O,O,O,x,x,x,x,x,x,x,x,x,x,x,x,x,O,x,x,x,x,x,x,x,x],
		':VisualSt' : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ECMA-262' : [O,K,K,O,O,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,K,K,O,O,O,O,O], // \b innerhalb [] ist backspace
		':oldvi'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O],
		':vi'       : [O,O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O],
		':vim'      : [O,O,O,O,O,O,O,K,K,K,K,O,O,O,K,K,K,K,K,K,O,O,O,K,K,O,O,K,K,K,K,O,O,O,O,O,O,O,O,O],
		':nvi'      : [O,O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O],
		':elvis'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':UltraEdit': [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':UE32_Unix': [O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,K,K,O,O,O,O,O],
		':ISAPI_rew': [O,K,K,K,K,K,K,O,K,O,O,O,O,O,O,O,O,O,K,K,O,O,O,O,O,K,O,K,K,K,K,O,O,K,K,K,O,O,O,O],
		':AS3'      : [O,O,O,x,x,K,K,O,O,O,O,O,O,O,O,O,O,O,x,O,O,O,O,O,O,O,O,K,K,O,O,O,O,K,K,O,O,O,O,O],
		':MySQL'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':SQL'      : [x,x,x,x,x,x,x,O,x,O,O,x,x,x,O,O,O,O,x,x,x,x,x,x,x,x,x,x,x,x,x,O,x,x,x,x,x,x,x,x]
		/*
			s,S,w,W is supported within character classes [...] only up to perl 5.x
			hence these entries are marked  d  instead of  i
		 */
// ToDo: need table with ctrl-chars and class chars marking if allowed within character class
// ToDo: behaviour of ^ . - ] \ within [...]
// ToDo: POSIX character equivalents, collating sequences
	}, // clss

	meta: {
		'desc'      : 'list of supported meta characters',
		// description for each column is same as in desc.meta
		/*
			/ when used as meta character (other than RegEx delimiter)
			\ when used as backreference
			& when used as backreference
			~ when used as backreference (vi)
			# when used as comment to end of line
			. when used as "match any character"
			_ when used as "match any character"
			? when used as "match one or none character"
			* when used as "match any number of characters"
			% when used as "match any number of characters"
			- when used as character range in class
			: --
			, --
			; --
			= --
		 */
// ToDo: single quote missing
		'fuchur'    : '( ) [ ] { } < > ^ $ ! " ` % & /\\ | ? = * + ~ # , ; . : - _ @',
		//----------+ +-------------------------------------------------------------+,
		':BRE'      : [a,e,a,e,a,e,O,O,K,K,x,O,x,O,O,O,K,O,O,O,K,O,O,O,O,O,K,O,K,O,O],
		':ERE'      : [a,e,a,e,a,e,O,O,K,K,x,O,x,O,O,O,K,K,K,O,K,K,O,O,O,O,K,O,K,O,O],
		':POSIX'    : [a,e,a,e,a,e,O,O,K,K,x,O,x,O,O,O,K,K,K,O,K,K,O,O,O,O,K,O,K,O,O],
		':awk'      : [a,e,a,e,O,O,O,O,K,K,O,O,O,O,O,O,K,K,K,O,K,K,O,O,O,O,K,O,K,O,O],
		':gawk'     : [a,e,a,e,a,e,K,K,K,K,O,O,K,O,O,O,K,K,K,O,K,K,O,O,O,O,K,O,K,O,O], // gawk also has '
		':bash'     : [h,h,a,e,h,h,h,h,K,K,K,K,K,O,K,O,K,K,h,O,K,O,h,h,O,h,h,O,K,O,O], // ? is any single character
		':oldgrep'  : [O,O,O,O,O,O,O,O,K,K,O,O,O,O,O,O,K,O,O,O,K,O,O,O,O,O,K,O,O,O,O],
		':grep'     : [a,e,a,e,a,e,O,O,K,K,O,O,O,O,O,O,K,d,O,O,K,O,O,O,O,O,K,O,K,O,O],
		':ggrep'    : [a,e,a,e,a,e,O,O,K,K,O,O,O,O,O,O,K,K,O,O,K,K,O,O,O,O,K,O,K,O,O],
		':egrep'    : [a,e,a,e,a,e,K,K,K,K,O,O,O,O,O,O,O,K,K,O,K,K,x,O,O,O,K,x,K,O,O],
		':ed'       : [a,e,a,e,a,e,K,K,K,K,O,O,K,O,O,O,K,O,K,O,K,O,O,O,O,O,K,O,K,O,O], // ' and ` fuer end of line
		':ex'       : [a,e,a,e,a,e,K,K,K,K,O,O,O,O,K,O,K,O,O,O,K,O,K,O,O,O,K,O,K,O,O],
		':sed'      : [a,e,a,e,O,O,O,O,K,K,O,O,O,O,y,O,K,K,K,O,K,O,O,O,O,O,K,O,K,O,O],
		':gsed'     : [a,e,a,e,a,e,K,K,K,K,x,O,x,O,y,O,K,i,K,O,K,O,O,O,O,O,K,O,K,O,O],
		':lex'      : [a,e,a,e,a,e,O,O,K,K,O,O,O,O,O,h,O,K,K,O,K,K,O,O,O,O,K,O,K,O,O],
		':flex'     : [a,e,a,e,a,e,O,O,K,K,O,O,O,O,O,h,O,K,K,O,K,K,O,O,O,O,K,O,K,O,O],
		':S-Lang'   : [a,e,a,e,O,O,K,K,K,K,O,O,O,O,O,O,K,O,K,O,K,K,O,O,O,O,K,O,O,O,O],
		':Emacs'    : [a,e,a,e,x,x,K,K,K,K,x,x,x,O,x,O,x,K,K,x,K,K,x,x,x,x,K,x,K,O,O],
		':Java'     : [a,e,a,e,a,e,O,O,K,K,x,O,x,O,x,O,x,K,K,x,K,K,x,x,x,x,K,x,K,O,O],
		':.NET'     : [a,e,a,e,a,e,O,O,K,K,x,O,x,O,x,O,x,K,K,x,K,K,x,x,x,x,K,x,K,O,O],
		':Perl'     : [a,e,a,e,a,e,O,O,K,K,x,O,x,O,K,O,K,K,K,x,K,K,x,h,x,x,K,x,K,O,O], // # with /x modifier only
		':PCRE'     : [a,e,a,e,a,e,O,O,K,K,x,O,x,O,x,O,x,K,K,x,K,K,x,x,x,x,K,x,K,O,O],
		':PHP'      : [a,e,a,e,a,e,O,O,K,K,x,O,x,O,x,O,x,K,K,x,K,K,x,x,x,x,K,x,K,O,O],
		':Python'   : [a,e,a,e,a,e,K,K,K,K,x,O,x,O,x,O,x,K,K,x,K,K,x,x,x,x,K,x,K,O,O],
		':Ruby'     : [a,e,a,e,a,e,O,O,K,K,O,O,O,O,O,O,K,K,K,O,K,K,O,O,O,O,K,O,K,O,O],
		':Tcl'      : [a,e,a,e,a,e,O,O,K,K,O,O,O,O,h,O,K,K,K,O,K,K,O,O,O,O,K,O,K,O,O], // ([bc])\1 matches bb or cc but not bc
		':C'        : [x,x,x,x,x,x,x,x,x,x,x,O,x,O,x,O,x,x,x,x,x,x,x,x,x,x,x,x,x,O,O],
		':VisualSt' : [a,e,a,e,a,e,K,K,K,K,O,O,O,O,O,O,K,K,O,O,K,K,h,h,O,O,K,h,K,O,h], // : for Unicode properties; NOTE: must be h, see parse()
		':ECMA-262' : [a,e,a,e,a,e,O,O,K,K,K,O,O,O,O,O,K,K,K,K,K,K,O,O,O,O,K,K,K,O,O], // what does =  ??
		':oldvi'    : [O,O,O,O,O,O,O,O,K,K,O,O,O,O,K,O,K,K,K,O,K,K,K,O,O,O,K,O,O,O,O],
		':vi'       : [a,e,a,e,a,e,K,K,K,K,O,O,O,O,K,O,K,K,K,O,K,K,K,O,O,O,K,O,K,O,O],
		':vim'      : [a,e,a,e,a,e,K,K,K,K,O,O,O,O,K,O,K,K,K,O,K,K,K,O,O,O,K,O,K,O,O],
		':nvi'      : [a,e,a,e,a,e,K,K,K,K,O,O,O,O,K,O,K,K,K,O,K,K,K,O,O,O,K,O,K,O,O],
		':elvis'    : [O,O,a,e,a,e,O,O,K,K,O,O,O,O,K,O,O,O,K,d,K,K,O,O,O,O,K,K,K,O,K], // what does =  ??
		':UltraEdit': [O,O,a,e,a,e,O,O,O,K,O,O,O,K,O,O,O,O,K,O,K,K,K,O,O,O,O,O,K,O,O], // ( and ) are valid in replacement part only
		':UE32_Unix': [a,e,a,e,a,e,O,O,K,K,O,O,O,O,O,O,K,K,O,O,K,K,O,O,O,O,K,O,K,O,O],
		':ISAPI_rew': [a,e,a,e,a,e,K,K,K,K,0,O,0,O,O,O,K,K,K,O,K,K,O,O,O,O,K,O,K,O,O],
		':AS3'      : [a,e,a,e,a,e,O,O,K,K,O,O,O,O,O,O,K,K,K,O,K,K,O,O,O,O,K,O,K,O,O],
		':MySQL'    : [a,e,a,e,a,e,x,x,K,K,d,x,x,K,x,x,K,K,K,O,K,K,x,x,x,x,K,x,x,K,O], // any character can be used as escape character
//	SQL-99	':SQL3'     : [x,x,a,e,x,x,x,x,K,K,x,x,x,K,x,x,K,x,x,x,K,K,x,x,x,x,x,x,K,K,O],
		':SQL'      : [x,x,a,e,x,x,x,x,K,x,x,x,x,K,x,x,x,x,x,x,x,x,x,x,x,x,x,x,x,K,O]
/* ToDo:
		allow empty alternate right to |
		POSIX, lex, awk, gawk: no
 */
	}, // meta

	escp: {
		'desc'      : 'list of characters becoming meta character if escaped',
// ToDo: 0-byte; oddities with \0078 (2 bytes?)
// ToDo: \9 is \011 in Tcl and awk but not in gawk
// ToDo: \10, \11, ... in perl but only if as much matches, otherwise octal value
		'(' :  'start grouping',
		')' :  'end grouping',
		'[' :  '** ? **',
		']' :  '** ? **',
		'{' :  'start quantifier range',
		'}' :  'end quantifier range',
		'<' :  'start word boundery',
		'>' :  'end word boundery',
		'|' :  'alternate in grouping',
		'?' :  'one allowed, but it is optional',
		'*' :  'any number, all are optional',
		'+' :  'at least one, more are optional',
		// ^ all above should be the same as in _desc.meta
		'O' :  'short octal \\O (value 9 if only \\O, others are backreferences)',
		'o' :  'long octal \\OOO',  //-------------------------------------, |
		'0' :  'octal value with mandatory \\0 prefix (0 = digit)',//----, | |
		'U' :  'unicode \\uHHHHHHH',//---------------------------------, | | |
		'u' :  'unicode \\uHHHH',   //-------------------------------, | | | |
		'v' :  'variable length hex \\x{HHH}', //------------------, | | | | |
		'X' :  'short hex \\xH',    //---------------------------, | | | | | |
		'x' :  'long hex \\xHH',    //-------------------------, | | | | | | |
		'z' :  '** unused **  ',    //-----------------------, | | | | | | | |
		'C' :  'exactly one byte \\C',  //-----------------, | | | | | | | | |
		'c' :  'character \\c',     //-------------------, | | | | | | | | | |
		'g' :  'when used as backreference', //--------, | | | | | | | | | | |
		'"' :  '^** ? **',          //---------------, | | | | | | | | | | | |
		'~' :  'when used as backreference', //----, | | | | | | | | | | | | |
		'&' :  'when used as backreference', //--, | | | | | | | | | | | | | |
		'=' :  'cursor position',   //-----\     | | | | | | | | | | | | | | |
					//                     |     | | | | | | | | | | | | | | |
		'fuchur'    : '( ) [ ] { } < > | ? = * + & ~ " g c C z x X v u U 0 o O',
		//----------+ +-------------------------------------------------------+,
		':BRE'      : [K,K,O,O,K,K,O,O,O,O,O,O,O,O,O,O,O,x,x,O,O,O,O,x,x,x,O,O],
		':ERE'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,x,O,O,O,O,x,x,x,O,O],
		':POSIX'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,x,O,O,O,O,x,x,x,O,O],
		':awk'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,O,O,K,O,O,O,O,O,K,O],
		':gawk'     : [O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,K,O,O,K,O,O,O,O,d,K,K], // also hex 0xHH, octal is 0oo
		':bash'     : [h,h,a,e,h,h,h,h,K,h,O,K,O,O,O,O,O,x,K,O,h,O,O,O,O,x,h,O], // octal is 0ooo not \o, hex is 0xhh
		':oldgrep'  : [K,K,O,O,K,K,O,O,x,x,O,O,x,O,O,O,O,x,x,O,O,O,O,O,O,x,O,O],
		':grep'     : [K,K,O,O,K,K,O,O,K,K,O,O,K,O,O,O,O,x,x,O,O,O,O,O,O,x,O,O],
		':ggrep'    : [K,K,O,O,K,K,O,O,K,K,O,O,K,O,O,O,O,x,x,O,O,O,O,O,O,x,O,O],
		':egrep'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,O,O],
		':ed'       : [K,K,O,O,K,K,K,K,O,K,O,O,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ex'       : [K,K,O,O,K,K,K,K,O,O,O,O,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':sed'      : [K,K,O,O,O,O,O,O,x,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,O,O],
		':gsed'     : [K,K,O,O,K,K,O,O,K,O,O,O,O,O,O,O,O,x,x,O,O,O,O,O,O,x,O,O],
		':lex'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,K,K],
		':flex'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,O,O,x,K,K],
		':S-Lang'   : [K,K,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':Emacs'    : [K,K,O,O,O,O,K,K,K,O,O,O,O,O,O,O,O,x,x,O,y,O,x,O,O,x,y,O],
		':Java'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,x,O,K,h,x,K,O,K,K,h],
		':.NET'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,x,O,K,O,x,K,O,x,K,h],
		':Perl'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,K,O,K,K,K,O,O,x,K,h], // \g11 works, but not \g{11}
		':PCRE'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,K,O,K,K,x,O,O,x,K,h], // \ooo is used for octal values too, grrr :-(
		':PHP'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,K,O,K,K,x,O,O,O,O,O],
		':Python'   : [O,O,O,O,O,O,O,O,K,O,O,O,O,O,O,O,O,x,x,O,y,O,x,O,O,x,y,h],
		':Ruby'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,O,O,K,K,x,O,O,x,K,K],
		':Tcl'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,O,O,K,K,x,K,K,O,K,K], // c beachtet nur die 5 letzten Bits
		':C'        : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,x,O,K,x,x,O,O,x,K,x],
		':VisualSt' : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,O,x,K,O,O,O,O],
		':ECMA-262' : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,O,O,K,O,x,K,O,x,O,O],
		':oldvi'    : [O,O,O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':vi'       : [K,K,O,O,K,K,K,K,O,K,O,O,d,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':vim'      : [K,K,O,O,K,K,K,K,K,K,O,O,d,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':nvi'      : [K,K,O,O,K,K,K,K,O,K,O,O,K,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':elvis'    : [O,O,O,O,K,K,x,x,O,K,K,O,K,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':UltraEdit': [K,K,O,O,K,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,O,O,O,O,O],
		':UE32_Unix': [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,O,O,O,O,O],
		':ISAPI_rew': [O,O,O,O,O,O,K,K,O,O,O,O,O,O,O,O,O,K,K,O,K,K,K,O,O,K,K,K], // octal is \[0-7]{1,3}
		':AS3'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,K,O,x,O,O,O,O,O],
		':MySQL'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,O,O,x,O,O],
		':SQL'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,x,x,O,O,O,x,O,O,x,O,O]
	}, // escp

	prop: {
		'desc'      : 'supported Unicode properties',
		/* this tables is used for all languages/flavours which are supported
		 * in _chrs.class[]['P']
		 */
		'1'         : 'supports shorthand Unicode properties like \\pL',
		'2'         : 'supports  longhand Unicode properties like \\p{Lu}',
		'{'         : 'supports  standard Unicode properties',
		'L'         : 'supports full (long names) Unicode properties',
		'-'         : 'supports - as word delimiter in full Unicode properties',
		'_'         : 'supports _ as word delimiter in full Unicode properties',
		'.'         : 'supports space as word delimiter in full Unicode properties',
		':'         : 'supports charset class Unicode properties like [:Lu]',
		'&'         : 'supports composite property like \\p{L&}',
		'P'         : 'supports  negated Unicode properties like \\P{L}',
		'^'         : 'supports  negated Unicode properties like \\p{^L}',
		's'         : 'supports Unicode script properties',
		'b'         : 'supports Unicode block properties',
		             /* NOTE that script and block properties are long names,
		              * this may also be possible if long names itself are not
		              * supported (like in .NET)
		              */
		'N'         : 'supports Unicode In prefix like \\p{InGreek}',
		'S'         : 'supports Unicode Is prefix like \\p{IsLatin}',
		'+'         : 'supports \\p{all}',
		'*'         : 'supports \\p{Any}',
		'='         : 'supports \\p{Assigned}',
		'!'         : 'supports \\p{Unassigned}',
		//
		'fuchur'    : '1 2 { L - _ . : & P ^ s b N S + * = !',
		//----------+ +-------------------------------------+,
		':BRE'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ERE'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':POSIX'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':awk'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':gawk'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':bash'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':oldgrep'  : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':grep'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ggrep'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':egrep'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ed'       : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ex'       : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':sed'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':gsed'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':lex'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':flex'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':S-Lang'   : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':Emacs'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':Java'     : [K,K,K,O,O,O,O,x,O,O,O,O,K,K,O,K,O,O,O],
		':.NET'     : [O,K,K,O,O,O,O,x,O,O,O,O,K,O,K,O,O,O,O],
		':Perl'     : [K,K,K,K,K,K,K,x,K,K,K,K,K,K,O,K,K,K,K],
		':PCRE'     : [K,K,K,O,O,O,O,x,K,K,K,K,K,K,K,O,K,x,x],
		':PHP'      : [K,K,K,O,O,O,O,x,K,K,K,K,K,K,K,O,K,x,x],
		':Python'   : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':Ruby'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':Tcl'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':C'        : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':VisualSt' : [O,K,O,O,O,O,O,K,O,O,O,O,O,O,O,O,O,O,O],
		':ECMA-262' : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':oldvi'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':vi'       : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':vim'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':nvi'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':elvis'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':UltraEdit': [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':UE32_Unix': [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ISAPI_rew': [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':AS3'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':MySQL'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':SQL'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O]
		}, // prop

	quantifier: {
		'desc'      : 'list of supported quantifiers, ranges, intervals',
	// NOTE that * + and ? column below must the same as in table chrs[] above
	// NOTE we use d instead of n and m in {n,m} so it can be used as \d later
					// /- greedy-\ /------- intervals -------\ /--- lazy ---\ /- possessive-\
		'fuchur'    : ['*','+','?','{d}','{,d}','{d,}','{d,d}','*?','+?','??','*+','++','?+'],
		//----------+ +---------------------------------------------------------------------+,
		':BRE'      : [ K,  O,  O,   K,     O,    K,      K,     K,   K,   K,   O,   O,   O ],
		':ERE'      : [ K,  K,  K,   K,     O,    K,      K,     K,   K,   K,   O,   O,   O ],
		':POSIX'    : [ K,  K,  K,   K,     O,    K,      K,     K,   K,   K,   O,   O,   O ],
		':awk'      : [ K,  O,  K,   O,     O,    O,      O,     O,   O,   O,   O,   O,   O ],
		':gawk'     : [ K,  K,  K,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':bash'     : [ K,  O,  h,   O,     O,    O,      O,     O,   O,   O,   O,   O,   O ],
		':oldgrep'  : [ K,  O,  O,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':grep'     : [ K,  O,  O,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':ggrep'    : [ K,  K,  O,   K,     O,    K,      K,     x,   x,   x,   x,   x,   x ],
		':egrep'    : [ K,  K,  K,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':ed'       : [ K,  K,  K,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':ex'       : [ K,  K,  K,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':sed'      : [ K,  O,  K,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':gsed'     : [ K,  O,  K,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':lex'      : [ K,  K,  K,   K,     O,    O,      K,     O,   O,   O,   O,   O,   O ],
		':flex'     : [ K,  K,  K,   K,     O,    O,      K,     O,   O,   O,   O,   O,   O ],
		':S-Lang'   : [ K,  K,  K,   O,     O,    O,      O,     O,   O,   O,   O,   O,   O ],
		':Emacs'    : [ K,  K,  K,   K,     O,    K,      K,     x,   x,   x,   x,   x,   x ],
		':Java'     : [ K,  K,  K,   K,     O,    K,      K,     K,   K,   K,   K,   K,   K ],
		':.NET'     : [ K,  K,  K,   K,     O,    K,      K,     K,   K,   K,   O,   O,   O ],
		':Perl'     : [ K,  K,  K,   K,     O,    K,      K,     K,   K,   K,   K,   K,   K ],
		':PCRE'     : [ K,  K,  K,   K,     O,    K,      K,     K,   K,   K,   K,   K,   K ],
		':PHP'      : [ K,  K,  K,   K,     O,    K,      K,     K,   K,   K,   K,   K,   K ],
		':Python'   : [ K,  K,  K,   K,     O,    K,      K,     x,   x,   x,   x,   x,   x ],
		':Ruby'     : [ K,  K,  K,   K,     O,    K,      K,     K,   K,   O,   O,   O,   O ],
		':Tcl'      : [ K,  K,  K,   K,     O,    K,      K,     K,   K,   K,   O,   O,   O ],
		':C'        : [ x,  x,  x,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':VisualSt' : [ K,  K,  O,   O,     O,    O,      O,     O,   O,   O,   O,   O,   O ],
		':ECMA-262' : [ K,  K,  K,   K,     O,    K,      K,     K,   K,   K,   O,   O,   O ],
		':oldvi'    : [ K,  K,  K,   O,     O,    O,      O,     O,   O,   O,   O,   O,   O ],
		':vi'       : [ K,  K,  K,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':vim'      : [ K,  K,  K,   K,     K,    K,      K,     O,   O,   O,   O,   O,   O ], // kann auch \{-n} \{-n,} \{-n,m} \{-,m}
		':nvi'      : [ K,  K,  K,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':elvis'    : [ K,  K,  K,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':UltraEdit': [ K,  K,  K,   O,     O,    O,      O,     O,   O,   O,   O,   K,   O ],
		':UE32_Unix': [ K,  K,  O,   O,     O,    O,      O,     O,   O,   O,   O,   O,   O ],
		':ISAPI_rew': [ K,  K,  K,   K,     O,    K,      K,     K,   x,   x,   O,   O,   O ],
		':MySQL'    : [ K,  K,  K,   K,     O,    K,      K,     O,   O,   O,   O,   O,   O ],
		':AS3'      : [ K,  K,  K,   K,     O,    O,      K,     K,   K,   O,   O,   O,   O ],
		':SQL'      : [ x,  x,  x,   K,     O,    K,      K,     x,   x,   x,   x,   x,   x ]
	}, // quantifier

	modifier: {
		'desc'      : 'list of supported modifiers',
		'fuchur'    : 'A b c D d e i g m n o p q s S t u U w x X',
		//----------+ +-----------------------------------------+,
		':BRE'      : [O,O,x,O,x,x,x,x,x,O,O,O,O,x,O,O,O,O,O,O,O],
		':ERE'      : [O,O,x,O,x,x,x,x,x,O,O,O,O,x,O,O,O,O,O,O,O],
		':POSIX'    : [O,O,x,O,x,x,K,K,K,O,O,O,O,x,O,O,O,O,O,O,O],
		':awk'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':gawk'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':bash'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':oldgrep'  : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':grep'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ggrep'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':egrep'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ed'       : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ex'       : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':sed'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':gsed'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':lex'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':flex'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':S-Lang'   : [O,O,K,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':Emacs'    : [O,O,x,O,O,x,x,x,x,O,O,O,O,x,O,O,O,O,O,O,O],
		':Java'     : [O,O,O,O,K,O,K,O,K,O,O,O,O,K,O,O,K,O,O,K,O],
		':.NET'     : [O,O,O,O,O,O,K,O,K,K,O,O,O,K,O,O,O,O,O,K,O],
		':Perl'     : [O,O,K,O,O,K,K,K,K,O,K,O,O,K,O,O,O,O,O,K,O],
		':PCRE'     : [O,O,O,O,O,O,K,O,K,O,O,O,O,K,O,O,O,O,O,K,O],
		':PHP'      : [K,O,O,K,O,K,K,O,K,O,O,O,O,K,K,O,O,K,O,K,K],
		':Python'   : [O,O,x,O,O,x,x,x,x,O,O,O,O,x,O,O,O,O,O,O,O],
		':Ruby'     : [O,O,O,O,O,O,K,O,h,O,K,O,O,O,O,O,O,O,O,K,O], // m behaves as s in perl
		':Tcl'      : [O,K,K,O,O,K,K,O,K,K,O,K,K,K,O,K,O,O,K,K,O],
		':C'        : [O,O,x,O,O,x,x,x,x,O,O,O,O,x,O,O,O,O,O,O,O],
		':VisualSt' : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ECMA-262' : [O,O,O,O,O,O,K,K,K,O,O,O,O,O,O,O,O,O,O,O,O],
		':oldvi'    : [O,O,O,O,O,O,O,K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':vi'       : [O,O,O,O,O,O,O,K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':vim'      : [O,O,O,O,O,O,O,K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':nvi'      : [O,O,O,O,O,O,O,K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':elvis'    : [O,O,O,O,O,O,O,K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':UltraEdit': [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':UE32_Unix': [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ISAPI_rew': [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':AS3'      : [O,O,x,O,O,O,O,K,K,O,O,O,O,K,O,O,O,O,O,K,O],
		':MySQL'    : [O,O,x,O,O,x,x,x,x,O,O,O,O,x,O,O,O,O,O,O,O],
		':SQL'      : [O,O,x,O,O,x,x,x,x,O,O,O,O,x,O,O,O,O,O,O,O]
		//	all above as greedy, lazy and possessive
	}, // modifier

	anchor: {
		'desc'      : 'list of supported anchor meta characters',
		'fuchur'    : '^ % A b B G m M y Y z Z < > $',
		//----------+ +-----------------------------+,
		':bash'     : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ed'       : [K,O,O,K,K,O,O,O,O,O,O,O,K,K,K],
		':ex'       : [K,O,O,x,x,O,O,O,O,O,O,O,K,K,K],
		':lex'      : [K,O,O,O,O,O,O,O,O,O,O,O,O,O,K],
		':flex'     : [K,O,O,O,O,O,O,O,O,O,O,O,O,O,K],
		':S-Lang'   : [K,O,O,O,O,O,O,O,O,O,O,O,K,K,K],
		':Java'     : [K,O,K,K,K,K,O,O,O,O,K,K,O,O,K],
		':.NET'     : [K,O,K,K,K,K,O,O,O,O,K,K,O,O,K],
		':Perl'     : [K,O,K,K,K,K,O,O,O,O,K,K,O,O,K],
		':PCRE'     : [K,O,K,K,K,K,O,O,O,O,K,K,O,O,K],
		':PHP'      : [K,O,K,K,K,K,O,O,O,O,K,K,O,O,K],
		':Ruby'     : [K,O,K,O,O,O,O,O,O,O,K,K,O,O,K], // ^ and $ match newline!
		':Tcl'      : [K,O,K,O,O,O,K,K,K,K,O,O,O,O,K],
		':VisualSt' : [K,O,O,O,O,O,O,O,O,O,O,O,K,K,K],
		':ECMA-262' : [K,O,K,K,K,O,O,O,O,O,K,O,O,O,K], // \b innerhalb [] ist backspace
		':oldvi'    : [K,O,O,O,O,O,O,O,O,O,O,O,x,x,K],
		':vi'       : [K,O,O,O,O,O,O,O,O,O,O,O,K,K,K],
		':vim'      : [K,O,O,O,O,O,O,O,O,O,O,O,K,K,K],
		':nvi'      : [K,O,O,O,O,O,O,O,O,O,O,O,K,K,K],
		':elvis'    : [K,O,O,O,O,O,O,O,O,O,O,O,O,O,K],
		':UltraEdit': [O,K,O,O,O,O,O,O,O,O,O,O,O,O,K],
		':UE32_Unix': [K,O,O,O,O,O,O,O,O,O,O,O,O,O,K],
		':ISAPI_rew': [K,O,O,K,K,O,O,O,O,O,O,O,K,K,K],
		':AS3'      : [K,O,O,K,K,O,O,O,O,O,O,O,O,O,K],
		':MySQL'    : [x,O,x,x,x,x,O,O,O,O,x,x,x,x,x],
		':SQL'      : [x,O,x,x,x,x,O,O,O,O,x,x,x,x,x]
	},

	init: {
		/*
			_   if string for RegEx does not require enclosing characters
			"   means that the RegEx is evaluated as a string first, some
			    characters need to be escaped (special handling in parse())
			@   when raw string is supported (@ in C#, r in python, ' in PHP)
			/   usual regular expression delimiter, literal string follows
			NOTE
			    if there are no delimiters (any starting at /) and no string
			    interpretation (" and/or @ not set), then it's a raw (literal)
			    RegEx (like in lex or flex)
		 */
		'desc'      : 'list of characters enclosing the RegEx',
		// special purpose-\ /-some possible delimiters
		'fuchur'    : '_ " @ / ( [ { < ! # ; , | :',
		//----------+ +---------------------------+,
		':BRE'      : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':ERE'      : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':POSIX'    : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':awk'      : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':gawk'     : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':bash'     : [O,O,O,K,O,O,K,O,O,O,O,O,O,O],
		':oldgrep'  : [K,O,O,O,O,O,O,O,O,O,O,O,O,O], // usually inside ' (for shell)
		':grep'     : [K,O,O,O,O,O,O,O,O,O,O,O,O,O], // usually inside ' (for shell)
		':ggrep'    : [K,O,O,O,O,O,O,O,O,O,O,O,O,O], // usually inside ' (for shell)
		':egrep'    : [K,O,O,O,O,O,O,O,O,O,O,O,O,O], // usually inside ' (for shell)
		':ed'       : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':ex'       : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':sed'      : [O,O,O,K,O,O,O,O,K,K,K,K,K,K], // sed can use (nearly) any character
		':gsed'     : [O,O,O,K,O,O,O,O,K,K,K,K,K,K],
		':lex'      : [K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':flex'     : [K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':S-Lang'   : [O,K,O,O,O,O,O,O,O,O,O,O,O,O],
		':Emacs'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':Erlang'   : [O,K,O,O,O,O,O,O,O,O,O,O,O,O],
		':Java'     : [O,K,K,O,O,O,O,O,O,O,O,O,O,O],
		':.NET'     : [O,K,K,O,O,O,O,O,O,O,O,O,O,O],
		':Perl'     : [O,K,K,K,K,K,K,K,K,K,K,K,K,K], // perl can use any character; ' also
		':PCRE'     : [O,K,K,K,K,x,K,x,O,O,O,O,O,O],
		':PHP'      : [O,K,K,K,K,K,K,K,K,K,K,K,K,K], // PHP can use any character
		':Python'   : [O,K,K,O,O,O,O,O,O,O,O,O,O,O],
		':Ruby'     : [O,K,O,K,O,O,O,O,O,O,O,O,O,O],
		':Tcl'      : [K,K,O,O,O,O,K,O,O,O,O,O,O,O], // both " and { may also be missing
		':C'        : [O,K,O,O,O,O,O,O,O,O,O,O,O,O],
		':VisualSt' : [O,K,O,O,O,O,O,O,O,O,O,O,O,O],
		':ECMA-262' : [O,K,O,K,O,O,O,O,O,O,O,O,O,O],
		':oldvi'    : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':vi'       : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':vim'      : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':nvi'      : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':elvis'    : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':UltraEdit': [K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':UE32_Unix': [K,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ISAPI_rew': [K,O,O,O,K,O,O,O,O,O,O,O,O,O],
		':AS3'      : [O,O,O,K,O,O,O,O,O,O,O,O,O,O],
		':MySQL'    : [O,K,O,O,O,O,O,O,O,O,O,O,O,O],
		':SQL'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O]
	}, // init

	raw:  {
		'desc'      : 'list of string literals identifying a raw regex string',
		/* first element in array is the delimiter, all following are prefixes
		 * allowed right before the delimiter to indicate a raw regex string
		 * delimiter can be a list of characters
		 */
		// NOTE that this table contains some more languages/flavours, i.e. C#
		'fuchur'    : '',
		//----------+ +-------------------------+,
		':BRE'      : [],
		':ERE'      : [],
		':POSIX'    : [],
		':awk'      : [],
		':gawk'     : [],
		':bash'     : [],
		':oldgrep'  : [],
		':grep'     : [],
		':ggrep'    : [],
		':egrep'    : [],
		':ed'       : [],
		':ex'       : [],
		':sed'      : [],
		':gsed'     : [],
		':lex'      : [],
		':flex'     : [],
		':S-Lang'   : [],
		':Emacs'    : [],
		':Erlang'   : [],
		':Java'     : ['"'],
		':Java-code': ['"'], // same as Java
		':Java-prop': [],   // properties files don't get string evaluated
		':.NET'     : ['"', '@'],
		':C#'       : ['"', '@'],
		':VB.NET'   : ['"'],
		':VBScript' : ['"'],
		//':ModSecurity': ['','@eq', '@streq', '@pmFromFile', '@contains', '@within'],
		':ModSecurity': ['','@rx', '@pm', '@validateByteRange'],
				// note that first entry is a dummy
		':Perl'     : ["'", 'qr', 'm'], // perl allows any bracket for qr
		':PCRE'     : ["'"],
		':PHP'      : ["'", 'm'],
		':Python'   : ['"\'', 'r'], // ' and " are identical, just ''' is different
		':Ruby'     : ['"'], // unsure
		':Tcl'      : ['{'],
		':C'        : [],
		':VisualSt' : ['"'],
		':ECMA-262' : ["'"], // not sure about "
		':JavaScript':["'"],
		':oldvi'    : [],
		':vi'       : [],
		':vim'      : [],
		':elvis'    : [],
		':UltraEdit': [],
		':UE32_Unix': [],
		':ISAPI_rew': [],
		':AS3'      : [],
		':MySQL'    : ["'"], // unsure if " or '
		':SQL'      : [],
		':user-regex':["'"]
	}, // raw

	subs: {
// ToDo: first simple attempt for allowed functions and prefixes
//       needs to be in sync with new EnDeRE.parsInit(language) function
		/*
		 */
		'desc'      : 'list of functions where RegEx is a parameter (may be a simple prefix too)',
		'fuchur'    : '',
		//----------+ +-------------------------+,
		':BRE'      : [],
		':ERE'      : [],
		':POSIX'    : [],
		':awk'      : ['sub', 'gsub'],
		':gawk'     : ['sub', 'gsub'],
		':bash'     : [],
		':oldgrep'  : [],
		':grep'     : [],
		':ggrep'    : [],
		':egrep'    : [],
		':ed'       : [],
		':ex'       : [],
		':sed'      : ['s'],
		':gsed'     : ['s'],
		':lex'      : [],
		':flex'     : [],
		':S-Lang'   : [],
		':Emacs'    : ['re-search-forward'  ],
		':Erlang'   : ['compile', 'replace', 'run', 'split'],
		':Java'     : ['compile', 'matcher', 'matches', 'match', 'end', 'find', 'flags', 'group', 'groupCount', 'hasAnchoringBounds', 'hasTransparentBounds', 'hitEnd', 'lookingAt', 'quote', 'quoteReplacement', 'region', 'regionEnd', 'regionStart', 'replaceAll', 'replaceAllRegion', 'replaceFirst', 'requireEnd', 'reset', 'split', 'start', 'text', 'toMatchResult', 'toString', 'useAnchoringBounds', 'usePattern', 'useTransparentBounds' ],
		':.NET'     : ['Regex', 'IsMatch', 'Matches', 'Match', 'Replace', 'Split', 'Groups', 'ECMAScript' ],
		':Perl'     : ['m', 's', 'tr', 'q', 'qq', 'qw', 'qr', 'qx'  ],
		':PCRE'     : [],
		':PHP'      : ['m', 's', 'tr', 'preg_match_all', 'preg_match', 'preg_replace_callback', 'preg_replace', 'preg_split', 'preg_quote', 'preg_grep', 'preg_regex_to_pattern', 'preg_pattern__error', 'preg_regex_error', 'reg_match'],
		':Prolog'   : ['regmatch', 'regcomp', 'regexec', 'regexpr', 'regsub', 'regsuball' ],
		':Python'   : ['compile', 'findall' ],  // also /regex/ or /regex/.match()
		':Ruby'     : ['compile', 'gsub', 'scan', 'split', 'escape', 'new', 'quote'],
		':Tcl'      : ['match', 'regexp', 'regsub', 'regsub -all'   ],
		':C'        : [],
		':VisualSt' : [],
		':ECMA-262' : ['match', 'replace'   ],
		':oldvi'    : [],
		':vi'       : [],
		':vim'      : [],
		':elvis'    : [],
		':UltraEdit': [],
		':UE32_Unix': [],
		':ISAPI_rew': [],
		':AS3'      : [],
		':MySQL'    : ['REGEXP', 'RLIKE'],  // REGEXP is not a prefix but a keyword: SELECT 'foobar' REGEXP '^foo';
		':SQL'      : [],
		':usr-regex': []
	}, // subs

	dot_behavior: {
		'desc'      : 'behaviour of . (dot) character'
		// Friedl 1: St. 183
		// match except \n, \r
		// does not match \0 in POSIX, Tcl
	},

	dollar_behavior: {
		'desc'      : 'behaviour of $ (dollar) character'
		// difference for match Word/Line/Text
	},

	property_behavior: {
		'desc'      : 'behaviour of p and P (property) character'
		// Friedl 3: St. 125
	},

	backreferences: {
		'desc'      : 'supported backreferences'
		// ERE, gawk, MySQL, flex:  keine!
		// BRE:  \1 .. \9
		// Perl:  unlimited ( > \9 only if as mutch matches, otherwise it's octal
		// Prolog:  \1 .. \9
		// Python:  \1 .. \9, \v10 .. \v99
		//   but as \v is vertical tab, we need to write \\v10 ..
		// AS3:  $1 .. $9 $& (matched substring), $` (position before match), $' (string after match)
		/* matches:
			Emacs, Tcl, Python  sopport location (index) of match
		 */
	},

	behavior: {
		'desc'      : 'misc. behaviours'
/*
		'fuchur'    : [ 'nonested_paranthese',
						'word_character_locale', 'word_character_ASCII',
						'' ],
 *
  nonested_paranthese     = [ ':oldgrep', ':grep' ];
  noparanthese_quantifier = [ ':oldgrep', ':grep', ':sed' ];
  word_character_locale   = [ ':ERE', ':POSIX' ];
  word_character_ASCII    = [ ];
*/
	} // behavior

}; //_chrs

this._literal = function() {}; // list of meta string literals
this._literal.prototype = {
	'desc'  : 'list of supported classes and meta strings',
	/* following arrays are generated from _desc.meta above, see EnDeRE.parse()
	 * they only contain known string literals which are independent of flavours
	 * if supported by any language/flavour is controled by _chrs.meta{} above
	 */
	clss	: [],
	meta	: [],
	misc	: []
}; // _literal

this._context = function() {}; // context where controls, classes and meta are allowed
this._context.prototype = {
	ctrl: {
		'desc'      : 'context where control characters are allowed',
		'maxl'      : 2,    // max number of characters to look ahead
		// description of columns
		'*'         : 'control character supported anywhere',
		'('         : 'control character supported insite grouping',
		'['         : 'control character supported insite character classes',
		//
		'fuchur'    : '* ( [',
		//----------+ +-----+,
		':BRE'      : [x,x,x],
		':ERE'      : [x,x,x],
		':POSIX'    : [x,x,x],
		':awk'      : [O,O,x],
		':gawk'     : [O,K,K],
		':bash'     : [O,O,K],
		':oldgrep'  : [O,O,O],
		':grep'     : [O,O,O],
		':ggrep'    : [x,x,x],
		':egrep'    : [O,O,O],
		':ed'       : [O,O,O],
		':ex'       : [O,O,O],
		':sed'      : [x,x,x],
		':gsed'     : [x,x,x],
		':lex'      : [K,K,K],
		':flex'     : [K,K,K],
		':S-Lang'   : [O,O,O],
		':Emacs'    : [x,x,x],
		':Erlang'   : [K,K,K],
		':Java'     : [x,x,K],
		':.NET'     : [x,x,K],
		':Perl'     : [K,K,K],
		':PCRE'     : [K,K,K],
		':PHP'      : [K,K,K],
		':Prolog'   : [K,K,K],
		':Python'   : [x,x,x],
		':Ruby'     : [O,K,K],
		':Tcl'      : [O,K,O],
		':C'        : [x,x,x],
		':VisualSt' : [K,K,K],
		':ECMA-262' : [K,K,K],
		':oldvi'    : [O,K,O],
		':vi'       : [O,K,O],
		':vim'      : [O,K,O],
		':nvi'      : [O,K,O],
		':elvis'    : [O,K,O],
		':UltraEdit': [K,K,K],
		':UE32_Unix': [K,K,K],
		':ISAPI_rew': [K,K,K],
		':AS3'      : [K,K,K],
		':MySQL'    : [K,K,K],
		':SQL'      : [x,x,x]
	}, // ctrl

	clss: {
		'desc'      : 'context which classes are allowed and where',
		'maxl'      : 10,   // max number of characters to look ahead
		/*
		 * this classification as "class context" sounds strange as it
		 * describes string literals (meta characters) which are identified
		 * in _chrs.meta{} above; but as these special (meta) string literals
		 * are mainly describing character classes, we treat them (the string
		 * literals) as classes see _literal.*{} above also
		 */
		// description of columns
		'a'         : '-  must be first character in []',
		':'         : 'supports POSIX [:..:] class',
		'.'         : 'supports POSIX [....] class',
		'='         : 'supports POSIX [=..=] class',
		'*'         : 'class shorthand supported anywhere',
		'('         : 'class shorthand supported insite grouping',
		'['         : 'class shorthand supported insite character classes',
		'-'         : 'class subtraction supported insite character classes',
		'&'         : 'class operations supported insite character classes',
// see Friedl 3, St. 125
/*
[a-d[m-p]]  	a through d, or m through p: [a-dm-p] (union)
[a-z&&[def]] 	d, e, or f (intersection)
[a-z&&[^bc]] 	a through z, except for b and c: [ad-z] (subtraction)
[a-z&&[^m-p]] 	a through z, and not m through p: [a-lq-z](subtraction)
*/
		//
		'fuchur'    : 'a : . = * ( [ - &',
		//----------+ +-----------------+,
		':BRE'      : [O,x,x,K,x,x,x,O,O],
		':ERE'      : [O,x,x,K,x,x,K,O,O],
		':POSIX'    : [O,K,K,K,x,K,K,K,K],
		':awk'      : [O,O,x,O,x,K,x,O,O],
		':gawk'     : [O,K,K,K,O,K,K,O,O], // : within class only
		':bash'     : [O,K,K,K,O,K,K,O,O],
		':oldgrep'  : [O,O,O,O,O,O,O,O,O],
		':grep'     : [O,O,O,O,O,O,O,O,O],
		':ggrep'    : [O,K,x,O,x,x,K,O,O],
		':egrep'    : [O,O,O,O,O,O,O,O,O],
		':ed'       : [O,K,K,K,O,K,O,O,O],
		':ex'       : [K,K,K,K,O,K,O,O,O],
		':sed'      : [O,O,x,O,x,x,x,O,O],
		':gsed'     : [O,K,x,O,x,x,x,O,O],
		':lex'      : [O,O,O,O,O,O,O,O,O],
		':flex'     : [O,K,O,O,O,O,O,O,O],
		':S-Lang'   : [K,O,O,O,O,O,O,O,O],
		':Emacs'    : [O,r,x,x,x,x,x,O,O],
		':Erlang'   : [O,K,K,K,K,K,K,O,O],
		':Java'     : [O,d,O,O,x,x,K,K,K],
		':.NET'     : [O,x,x,x,x,x,K,K,O],
		':Perl'     : [O,d,d,d,K,K,K,O,O],
		':PCRE'     : [O,K,K,K,K,K,K,O,O], // [ restricted to d, D, s, S, p, P, w, W
		':PHP'      : [O,K,K,K,K,K,K,O,O],
		':Prolog'   : [x,K,x,x,K,K,K,O,O],
		':Python'   : [O,O,x,x,x,x,x,O,O],
		':Ruby'     : [O,K,O,O,O,K,h,O,O],
		':Tcl'      : [O,K,K,K,O,K,h,O,O],
		':C'        : [O,x,x,x,x,x,x,O,O],
		':VisualSt' : [K,O,O,O,O,O,O,O,O],
		':ECMA-262' : [O,O,O,O,K,K,K,O,O],
		':oldvi'    : [K,O,O,O,O,O,O,O,O],
		':vi'       : [K,K,K,K,O,K,O,O,O],
		':vim'      : [K,K,K,K,O,K,O,O,O],
		':nvi'      : [K,K,K,K,O,K,O,O,O],
		':elvis'    : [O,O,O,O,O,K,O,O,O],
		':UltraEdit': [O,O,O,O,K,O,K,O,O],
		':UE32_Unix': [O,O,O,O,K,K,K,O,O],
		':ISAPI_rew': [K,K,K,K,K,K,K,O,O],
		':AS3'      : [O,O,O,O,K,K,K,O,O],
		':MySQL'    : [O,K,K,K,x,x,K,O,O],
		':SQL'      : [O,x,x,x,x,x,x,O,O]
	}, // clss

	meta: {
// ToDo: this table does not describe the context, but "meta literals"
		'desc'      : 'context which meta characters (literals) are allowed',
		'maxl'      : 20,   // max number of characters to look ahead
		// for example: ^ and $ as very first/last character only
		// description of columns
		/* NOTE that this should be the 3rd character in the '(?xxx' literal
		 * as this is the one used to check in EnDeRE.js
		 */
		':'         : 'supports non-capturing grouping (?:__)',
		'>'         : 'supports atomic grouping (?>__)',
		'('         : 'supports conditional grouping (?(condition)true-pattern|false-pattern)',
		'P'         : 'supports named variable (?P<var>__)',
// folgendes < aendern, da es fuer lookbehind gebraucht wird.
		'<'         : 'supports lookbehind (?<=__) and (?<!__)',
		'N'         : 'supports named variable (?<var>__)',
		'v'         : 'supports named variable reference (?P=var__)',
		'k'         : 'supports named variable reference \\k<var>__)',
		'#'         : 'supports comment grouping (?#__)',
		'{'         : 'supports embeded code evaluation (?{__})',
		'?'         : 'supports dynamic code evaluation (??{__})',
		'|'         : 'supports alternate grouping with |', // otherwise just characters inside class
		'='         : 'supports positive lookahead (?=)',
		'!'         : 'supports negative lookahead (?!)',
		'*'         : 'supports backtracking verbs (*__)',
		'b'         : 'supports positive lookbehind (?<=)',
		'B'         : 'supports negative lookbehind (?<!)',
		//
		'fuchur'    : ': > ( v P N k # { ? | = ! * < b B',
		//----------+ +---------------------------------+,
		':BRE'      : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':ERE'      : [O,O,O,O,O,O,O,O,O,O,K,x,x,O,O,O,O],
		':POSIX'    : [O,O,O,O,O,O,O,O,O,O,K,x,x,O,O,O,O],
		':awk'      : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':gawk'     : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':bash'     : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':oldgrep'  : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':grep'     : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':ggrep'    : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':egrep'    : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':ed'       : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':ex'       : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':sed'      : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':gsed'     : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':lex'      : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':flex'     : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':S-Lang'   : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':Emacs'    : [x,x,O,x,O,x,x,O,O,O,K,x,x,O,O,O,O],
		':Erlang'   : [K,K,K,K,O,O,K,K,O,O,K,K,K,h,K,K,K],
		':Java'     : [K,K,O,O,O,O,O,K,O,O,K,K,K,O,x,x,x],
		':.NET'     : [K,K,K,O,O,K,K,K,O,O,K,K,K,O,x,x,x], // (?<name-name>  balanced grouping missing, \k{name}
		':Perl'     : [K,K,K,h,h,O,K,K,K,K,K,K,K,K,K,K,K], // perl can mimick named capture with $^N; ?P<var> and ?P=var since 5.10
		':PCRE'     : [K,K,K,K,O,O,K,K,O,O,K,K,K,h,K,K,K], // * supported partial only, \k<name> and \k{name}
// ToDo: PCRE has b, B
		':PHP'      : [K,K,K,K,K,O,x,K,O,O,K,K,K,x,K,K,K],
// ToDo: perl and PHP can use embedded code with {..}
		':Python'   : [K,O,O,K,K,O,O,d,O,O,K,K,K,O,K,K,K],
		':Ruby'     : [K,K,O,O,O,O,O,K,O,O,K,K,K,O,x,x,x],
		':Tcl'      : [K,O,O,O,O,O,O,h,O,O,K,K,K,O,x,x,x],
		':C'        : [O,O,O,O,O,O,O,O,O,O,K,x,x,O,O,O,O],
		':VisualSt' : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':ECMA-262' : [K,O,O,O,O,O,O,O,O,O,K,d,d,O,O,O,O], // kein lookbehind; JavaScript 1.5 (nicht 1.2) kann (?= und (?!
		':oldvi'    : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':vi'       : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':vim'      : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':nvi'      : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':elvis'    : [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':UltraEdit': [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':UE32_Unix': [O,O,O,O,O,O,O,O,O,O,K,O,O,O,O,O,O],
		':ISAPI_rew': [K,O,O,O,O,O,O,O,O,O,K,K,K,O,O,O,O],
		':AS3'      : [K,O,O,O,O,O,O,O,O,O,K,K,K,O,K,K,K],
		':MySQL'    : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O],
		':SQL'      : [O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O]
	}, // meta

	look: {
		'desc'      : 'context for lookaround grouping',
		'maxl'      : 50,    // max number of characters to look ahead
		// description of columns
		'?'         : 'supports ? quantifier in lookbehind',
		'*'         : 'supports * quantifier in lookbehind',
		'+'         : 'supports + quantifier in lookbehind',
		//
		'fuchur'    : '? * +',
		//----------+ +-----+,
		':BRE'      : [O,O,O],
		':ERE'      : [O,O,O],
		':POSIX'    : [x,x,x],
		':awk'      : [O,O,O],
		':gawk'     : [O,O,O],
		':bash'     : [O,O,O],
		':oldgrep'  : [O,O,O],
		':grep'     : [O,O,O],
		':ggrep'    : [O,O,O],
		':egrep'    : [O,O,O],
		':ed'       : [O,O,O],
		':ex'       : [O,O,O],
		':sed'      : [O,O,O],
		':gsed'     : [O,O,O],
		':lex'      : [O,O,O],
		':flex'     : [O,O,O],
		':S-Lang'   : [O,O,O],
		':Emacs'    : [O,O,O],
		':Erlang'   : [K,O,O],
		':Java'     : [K,K,K], // Sun Java only?
		':.NET'     : [K,K,K],
		':Perl'     : [O,O,O],
		':PCRE'     : [K,O,O],
		':PHP'      : [K,O,O],
		':Python'   : [O,O,O],
		':Ruby'     : [x,x,x],
		':Tcl'      : [O,O,O],
		':C'        : [O,O,O],
		':VisualSt' : [O,O,O],
		':ECMA-262' : [x,x,x],
		':oldvi'    : [O,O,O],
		':vi'       : [O,O,O],
		':vim'      : [O,O,O],
		':nvi'      : [O,O,O],
		':elvis'    : [O,O,O],
		':UltraEdit': [O,O,O],
		':UE32_Unix': [O,O,O],
		':ISAPI_rew': [x,x,x],
		':AS3'      : [x,x,x],
		':MySQL'    : [O,O,O],
		':SQL'      : [O,O,O]
	}, // look

	verb: {
		'desc'      : 'special backtracking control verbs',
		'fuchur'    :['(*CR)','(*LF)','(*CRLF)','(*ANYCRLF)','(*ANY)','(*ACCEPT)','(*FAIL)','(*F)','(*COMMIT)','(*PRUNE)','(*SKIP)','(*THEN)','(*MARK)','(*UNICODE)','(*BSR_ANYCRLF)','(*BSR_UNICODE)'],
		':Perl'     : [  K,      K,       K,         K,         K,         d,         d,       K,       d,         d,         d,        d,        d,          d,             d,               d], // some are in perl 5.10 only
		':PCRE'     : [  K,      K,       K,         K,         K,         O,         O,       O,       O,         O,         O,        O,        O,          O,             K,               K]
	}, // verb

	quantifier: {
		'desc'      : 'context where quantifiers are allowed'
		// for example: valid scope of quantifiers
		// description of columns
	}, // quantifier

	modifier: {
		'desc'      : 'context for mode modifier',
		'maxl'      : 18,    // max number of characters to look ahead
		// description of columns
		')'         : 'supports mode modifier (?i)',
		':'         : 'supports mode modifier span (?i:',
		//
		'fuchur'    : ') :',
		//----------+ +---+,
		':BRE'      : [x,x],
		':ERE'      : [x,x],
		':POSIX'    : [K,K],
		':awk'      : [O,O],
		':gawk'     : [O,O],
		':bash'     : [O,O],
		':oldgrep'  : [O,O],
		':grep'     : [O,O],
		':ggrep'    : [O,O],
		':egrep'    : [O,O],
		':ed'       : [O,O],
		':ex'       : [O,O],
		':sed'      : [O,O],
		':gsed'     : [O,O],
		':lex'      : [O,O],
		':flex'     : [O,O],
		':S-Lang'   : [O,O],
		':Emacs'    : [x,x],
		':Erlang'   : [K,K],
		':Java'     : [K,K],
		':.NET'     : [K,K],
		':Perl'     : [K,K],
		':PCRE'     : [K,K],
		':PHP'      : [K,K],
		':Python'   : [K,O],
		':Ruby'     : [K,K],
		':Tcl'      : [K,K],
		':C'        : [x,x],
		':VisualSt' : [O,O],
		':ECMA-262' : [O,O],
		':oldvi'    : [O,O],
		':vi'       : [O,O],
		':vim'      : [x,x],
		':nvi'      : [x,x],
		':elvis'    : [x,x],
		':UltraEdit': [O,O],
		':UE32_Unix': [O,O],
		':ISAPI_rew': [O,O],
		':AS3'      : [O,O],
		':MySQL'    : [x,x],
		':SQL'      : [x,x]
		//	all above as greedy, lazy and possessive
	}, // modifier

	type: { // ToDo: not yet used as incomplete
	// see also _desc.type
		'desc'      : 'type of regex engine **EXPERIMENTAL**',
		// maily based on Mastering RegEx 1st Edition, page 90
		// description of columns
		'D'         : 'DFA   - Deterministic Finite Automation',
		'N'         : 'NFA   - (traditional) Nondeterministic Finite Automation',
		'P'         : 'POSIX - (POSIX) Nondeterministic Finite Automation',
		'h'         : 'Hybrid- DFA if possible, otherwise NFA',
		'd'         : 'Hybrid- mainly DFA, some NFA',
		//
		'fuchur'    : 'D N P h d',
		//----------+ +-----+,
		':BRE'      : [O,O,K,O,O],
		':ERE'      : [O,O,K,O,O],
		':POSIX'    : [O,O,K,O,O],
		':awk'      : [K,O,O,O,O],
		':nawk'     : [K,O,O,O,O],
		':gawk'     : [K,K,O,O,K],
		':bash'     : [O,O,O,O,O], // ToDo:
		':oldgrep'  : [O,O,O,O,O], // ToDo:
		':grep'     : [O,K,O,O,O],
		':ggrep'    : [K,K,O,O,K],
		':egrep'    : [K,h,O,O,h], // ToDo: some egrep switch engine depending on context
		':ed'       : [K,O,O,O,O],
		':ex'       : [K,O,O,O,O],
		':sed'      : [O,K,O,O,O],
		':gsed'     : [O,K,O,O,O],
		':lex'      : [K,O,O,O,O],
		':flex'     : [K,O,O,O,O],
		':less'     : [O,K,O,K,O],
		':more'     : [O,K,O,O,O],
		':S-Lang'   : [O,O,O,O,O], // ToDo:
		':Emacs'    : [O,K,K,O,O],
		':Erlang'   : [O,K,O,O,O],
		':Java'     : [O,K,O,O,O],
		':.NET'     : [O,K,O,O,O],
		':Perl'     : [O,K,O,O,O],
		':PCRE'     : [O,K,O,O,O],
		':PHP'      : [O,K,O,O,O],
		':Python'   : [O,K,O,O,O],
		':Ruby'     : [O,K,O,O,O],
		':Tcl'      : [O,K,O,O,O],
		':C'        : [O,O,O,O,O], // ToDo:
		':VisualSt' : [O,O,O,O,O], // ToDo:
		':ECMA-262' : [O,K,O,O,O],
		':oldvi'    : [K,O,O,O,O],
		':vi'       : [O,K,O,O,O],
		':vim'      : [O,K,O,O,O],
		':nvi'      : [O,K,O,O,O],
		':elvis'    : [K,O,O,O,O],
		':UltraEdit': [O,O,O,O,O], // ToDo:
		':UE32_Unix': [O,O,O,O,O], // ToDo:
		':ISAPI_rew': [O,O,O,O,O], // ToDo:
		':AS3'      : [O,O,O,O,O], // ToDo:
		':MySQL'    : [O,O,O,O,O], // ToDo:
		':SQL'      : [O,O,O,O,O]
	} // type

}; // _context

this._desc = function() {}; // description of meta characters
this._desc.prototype = {
	ctrl: { // control characters, character representation
		'0' :   '\\0 character (NUL)',
		'a' :   '\\a character (bell)',
		'b' :   '\\b character (BS - backspace)',
		'd' :   'DEL character',
		'd:Emacs':'DEL character',
		'd:Erlang':'DEL character',
		'e' :   'ESC character',
		'f' :   '\\f character (FF - from feed)',
		'n' :   '\\n character (NL - newline)',
		'p' :   '\\r\\n characters (carriage return and newline)',
		'r' :   '\\r character (CR - carriage return)',
		't' :   '\\t character (TAB - horizontal tab)',
		'v' :   '\\v character (vertical tab)',
		'z' :   '\\z character (EOF in DOS, Windows)'
	},

	clss: {}, // class characters, will be same as meta below

	meta: { // meta characters
			// NOTE that sequence of grouping hash entries below is important
			//      must be sorted according length of key!
  		// grouping, captuering
		'(' :   'start grouping',
		')' :   'end grouping',
		'{:UltraEdit' :   'start grouping',
		'}:UltraEdit' :   'end grouping',
		'|' :   'or', // 'group member separator',
		'})':   'end perl code',
		'(?(':  'start conditional grouping',
		'(?#':  'start comment grouping',
		'(?>':  'start atomic grouping',                // aka 'independent, non-capturing group'
		'(?:':  'start non-capturing group',
		'(?{':  'start perl code (result not used in RegEx)',
		'(??{': 'start dynamic perl code (result used in RegEx)',
		'(?C)': 'PCRE callout', // similar to perl's (?{..}
		// lookaround
		'(?=':  'start positive lookahead grouping',    // aka 'zero-width positive lookahead'
		'(?!':  'start negative lookahead grouping',    // aka 'zero-width negative lookahead'
		'(?<=': 'start positive lookbehind grouping',   // aka 'zero-width positive lookbehind'
		'(?<!': 'start negative lookbehind grouping',   // aka 'zero-width negative lookbehind'
		// capture variable grouping
/*
 * following keys are difficult to handle with JavaScript and/or HTML
		'(?<VAR>':  'named capture variable (.NET only)',
		'(?P<VAR>': 'named capture variable',
*/
		'(?<  >':   'named capture variable push on capture stack.NET only)',// .. is just an example of any string
		'(?<-  >':  'named capture variable pop from capture stack.NET only)',// .. is just an example of any string
		'(?P<  >':  'named capture variable',           // .. is just an example of any string
		// modifier grouping
		'(?..)':    'mode modifier grouping',           // .. is just an example of any modifier: i, x, s, m
		'(?..:':    'mode modifier span grouping',      // .. is just an example of any modifier: i, x, s, m
		// classes
		'c' :   'literal (control) character',
		'C:Ruby' :   'literal (control) character',
		'C' :   'matches one byte',
		'd' :   'digits [0-9]',
		'D' :   'anything else than digits [^0-9]',
		'g' :   'backreference',
//		'g{N}': 'backreference',
//		'G' :   'matches at the first matching position in the subject', // not sure where this is from ??
//		'G' :   'position where last match ended',  // see anchors, bounderies below
		'h' :   'horizontal tab',
		'H' :   'anything else than horizontal tab',
		'M:Ruby' :   'literal meta character',
		'K:PCRE' :   'reset start of match',
		'i:vim':'match any identifier character as defined by isident',
		'I:vim':'match any identifier character (excluding digits) as defined by isident',
		'k:vim':'match any keyword character as defined by iskeyword',
		'K:vim':'match any keyword character (excluding digits) as defined by iskeyword',
		'p:vim':'match any printable character as defined by isprint',
		'P:vim':'match any printable character (excluding digits) as defined by isprint',
		'p' :   'Unicode property, script, block',
		'P' :   'negated Unicode property, script, block',
		'R' :   'a newline sequence',
		's' :   'white spaces [space, tab]',
		'S' :   'anything else than white spaces [space, tab]',
		'v' :   'vertical tab (incl. Unicode)',
		'V' :   'anything else than vertical tab (incl. Unicode)',
		'w' :   'word character [a-zA-Z-]',
		'W' :   'anthing else than word character [^a-zA-Z-]',
//		'X' :   'Unicode combining character sequence',
		'X' :   'an extended Unicode sequence',
		        // also matches before a newline at the end of the subject
		// character class
		'.' :   'any character',
		'_' :   'any character (SQL only)',
		'%' :   'any number of any character (SQL only)',
		'[' :   'start character class (POSIX bracket expression)',
		']' :   'end character class (POSIX bracket expression)',
		'[]':   'character class (POSIX bracket expression)',
		'[^':   'start negated character class',
		'[:':   'start POSIX character class',
		':]':   'end POSIX character class',
		'[.':   'start POSIX collating sequence',
		'.]':   'end POSIX collating sequence',
		'[=':   'start POSIX character equivalent',
		'=]':   'end POSIX character equivalent',
/*
	* eigentlich ist folgendes richtig, aber obiges ist nur innerhalb [ .. ]
	* erlaubt, das ist eine Aufgabe fuer .parse() ...
		'[[.':  'start POSIX collating sequence',
		'.]]':  'end POSIX collating sequence',
		'[[=':  'start POSIX character equivalent',
		'=]]':  'end POSIX character equivalent',
*/
		'[=..=]': 'POSIX character equivalent',
		'[....]': 'POSIX collating sequence',
		// .. is a dummy, such classes do not exist, the last 2 are used
		// for a one-line description , see .parse()
		'-' :   'range separator',
		// description of POSIX bracket expression characters class
		'[:alnum:]' : 'alphabetic and numeric characters',
		'[:alpha:]' : 'alphabetic characters',
		'[:blank:]' : 'space and tab characters',
						// not in ggrep 2.0
		'[:cntrl:]' : 'control characters',
		'[:digit:]' : 'digits (same as \\d)',
		'[:graph:]' : 'non-blank characters (no spaces, no control)',
		'[:lower:]' : 'lowercase alphabetic characters',
						// SCO's grep use -i here
		'[:print:]' : 'like [:graph:] but includes space character',
		'[:punct:]' : 'punctation characters',
		'[:space:]' : 'all whitespace characters ([:blank:], newline, carriage return, tab)',
		'[:upper:]' : 'uppercase alphabetic characters',
						// SCO's grep doesn't use -i here
		'[:word:]'  : 'word characters (same as \\w)',
						// PCRE only
		'[:xdigit:]': 'alphabetic characters',
						// not in SCO's grep
		// quantifiers, intervals
		'{' :   'start quantifier range',
		'}' :   'end quantifier range',
		'?' :   'one allowed, but it is optional',
		'*' :   'any number, all are optional',
		'+' :   'at least one, more are optional',
		'*?':   'lazy quantifier',
		'+?':   'lazy quantifier',
		'??':   'lazy quantifier',
		'*+':   'possessive quantifier',
		'++':   'possessive quantifier',
		'?+':   'possessive quantifier',
		'{}'   :'match 0 or more times (same as *)',
		'{d}'  :'match n times',
		'{-d}' :'match n times',
		'{d,}' :'match at least n times',
		'{,d}' :'match 0 to m times, as much as possible',
		'{d,d}':'match n to m times, as much as possible',
		'{-d,d}':'match n to m times, as few as possible',
		'{-d,}':'match at least n times, as few as possible',
		'{-,d}':'match 0 to m times, as few as possible',
		'?:sh' :'match single character',
		'*:sh' :'match any string or null string',
		'?:csh' :    'match single character',
		'*:csh' :    'match any string or null string',
		'?:bash' :   'match single character; before (): one allowed, but it is optional',
		'*:bash' :   'match any string or null string; before (): any number, all are optional',
		'!:bash' :   'reference to command history; before (): inverted pattern match',
		// anchors, bounderies
		'<' :   'start word boundery',
		'>' :   'end word boundery',
		'A' :   'start of subject (string/line/page)',
		'b' :   'start of word',
		'B' :   'start of anything else than word',
		'E' :   'end of literal text span',
		'G' :   'end of previous match',
		'm:Tcl' :   'start of word (Tcl only)',
		'M:Tcl' :   'start of anything else than word (Tcl only)',
		'y:Tcl' :   'word boundery (gawk, Tcl only)',
		'Y:Tcl' :   'not word boundery (Tcl only)',
		'^' :   'start of line/string/page',
		'^:UltraEdit' :   'escape character',
		'%:UltraEdit' :   'start of line/string/page',
		'Q' :   'start of literal text span',
		'z' :   'only at the end of the subject (string/line/page)',
		'Z' :   'end of the subject (string/line/page)',
		'$' :   'end of line/string/page',
		'[[:<:]]':'word boundary (Tcl, MySql only?)',
		'[[:>:]]':'word boundary (Tcl, MySql only?)',
		// (back)references
		'(?P=VAR':  'named variable reference (Python, PHP)',
		'k<  >':    'named variable reference (Perl, PCRE)',
		'k{  }':    'named variable reference (.NET)',
//		'k<VAR>':   'named variable reference (.NET)',
		'\\N':  'back reference N',
		'$N':   'back reference N',
		'\\vNN':'back reference NN', // Python only
		// others
		'l' :   'lowercase character (case-folding prefix)',
		'L' :   'lowercase character',
		'N' :   '--',
		'u:Perl':   'uppercase character (case-folding prefix)',
		'U:Perl':   'uppercase character',
		'u' :   'Unicode 4-byte value',
		'U' :   'Unicode 7-byte value',
		'x' :   'hexadezimal n-byte value',
		'`:ed': 'matches at end of line',
		'`:gawk':   'matches the empty string at the beginning of the buffer',
//		"':gawk":   'matches the empty string at the end of the buffer',
//		"':ed": 'matches at end of line',
		'@' :   'match word under cursor (elvis only)',
		'~:ex': 'use previous replacement pattern',
		'~' :   '--',
		'=' :   'indicate cursor position if matched (elvis only)',
		':' :   'Unicode property, script, block (Visual Studio only)',
		';' :   '--',
		',' :   'interval separation character only',
		'\\':   'escape meta',
		'&' :   'complete match',
		'/:lex' :   'positive lookahead (lex only)',
		'/:flex' :  'positive lookahead (lex only)',
		'/' :   'start/end of expression',
		'"' :   'start/end of string',
		'":VB.NET' :   'literal "',
		'#' :   'start comment to  end of line',
		'!' :   'negated expression (SQL only?)',
		'$&':   'matched text',
		'$1':   'text matched by numbered group',
		// (back)references UltraEdit
		'^s:UltraEdit':'insert selected text',
		'^c:UltraEdit':'insert text from clipboard',
		// (back)references .NET, VB.NET, C#
		'$_:.NET'   : 'original source string',
		'$`:.NET'   : 'text before match',
		"$':.NET"   : 'text after match',
		'$$:.NET'   : 'the literal "$"',
		'${group_name}:.NET':   'text matched by named group',
		// backtracking verbs
		'(*CR)'     : '(*backtracking verb) carriage return',
		'(*LF)'     : '(*backtracking verb) linefeed',
		'(*CRLF)'   : '(*backtracking verb) carriage return, followed by linefeed',
		'(*ANYCRLF)': '(*backtracking verb) CR, LF or CRLF',
		'(*ANY)'    : '(*backtracking verb) all Unicode newline sequences',
		'(*ACCEPT)' : '(*backtracking verb) (Perl only)',
		'(*FAIL)'   : '(*backtracking verb) (Perl only)',
		'(*F)'      : '(*backtracking verb) (Perl only)',
		'(*COMMIT)' : '(*backtracking verb) (Perl only)',
		'(*PRUNE)'  : '(*backtracking verb) (Perl only)',
		'(*SKIP)'   : '(*backtracking verb) (Perl only)',
		'(*THEN)'   : '(*backtracking verb) (Perl only)',
		'(*MARK)'   : '(*backtracking verb) (Perl only)',
		'(*UNICODE)': '(*backtracking verb) any Unicode newline sequence',
		'(*BSR_ANYCRLF)': '(*backtracking verb) CR, LF or CRLF (without Unicode for \\R)',
		'(*BSR_UNICODE)': '(*backtracking verb) any Unicode newline sequence (without Unicode for \\R)',
		'***:'      : 'the rest of the RE is an ARE', // Tcl
		'***='      : 'the rest of the RE is literal string', // Tcl
		// Visual Studio only
		'@:VisualSt': 'zero or more occourrences, match as few as possible',
		'#:VisualSt': 'one or more occourrences, match as few as possible',
		'^N:VisualSt':'N occourrences',
		// private -EnDeRE- texts
		'rawString' : 'raw string initializer',
		'RegExstart': 'start of expression',
		'RegExend'  : 'end of expression',
		'RegExMulti': 'start of multiline expression',  // python special
		'Subststart': 'start of substitution pattern',
		'Substend'  : 'end of substitution pattern',
		'leading'   : 'leading literal text',
		'trailing'  : 'trailing literal text',
		'replace'   : 'replacement text',
		'literal'   : 'literal character(s)',
		'class'     : 'character class',
		'range'     : 'range, interval, quantifier'
	}, // meta

	quantifier: {}, // will be same as meta above

	escp: {},       // needed for this.help() only; defined in _chrs.escp

	prop: { // Unicode properties
		// basic Unicode sub-properties
		'Ll':  'Lowercase_Letter',
		'Lu':  'Uppercase_Letter',
		'Lt':  'Titlecase_Letter',
		'Lm':  'Modifier_Letter',
		'Lo':  'Other_Letter',
		// mark sub-properties
		'Mn':  'Non_Spacing_Mark',
		'Mc':  'Spacing_Combining_Mark',
		'Me':  'Enclosing_Mark',
		// separartor sub-properties
		'Zs':  'Space_Separator',
		'Zl':  'Line_Separator',
		'Zp':  'Paragraph_Separator',
		// symbol sub-properties
		'Sm':  'Math_Symbol',
		'Sc':  'Currency_Symbol',
		'Sk':  'Modifier_Symbol',// 'Combining characters represented as individual character',
		'So':  'Other_Symbol',
		// number sub-properties
		'Nd':  'Decimal_Digit_Number',
		'Nl':  'Letter_Number', // 'Letters representing numbers, like Roman',
		'No':  'Other_Number',  // 'Superscripts, symbols, or nondigit characters as numbers',
		// puntuation sub-properties
		'Pd':  'Dash_Punctuation',      // 'Dashes and Hyphens',
		'Ps':  'Open_Punctuation',
		'Pe':  'Close_Punctuation',     // 'Closing punctuation complementing',
		'Pi':  'Initial_Punctuation',   // 'Initial, opening punctuation',
		'Pf':  'Final_Punctuation',     // 'Final, closing punctuation',
		'Pc':  'Connector_Punctuation', // 'Connectig punctuation like underscore',
		'Po':  'Other_Punctuation',
		// other sub-properties
		'Cc':  'Control',       // 'ASCII and Latin-1 control characters',
		'Cf':  'Format',        // 'Nonevisible formating characters',
		'Co':  'Private_Use',
		'Cn':  'Unassigned',    // 'Unassigned code points',
		'Cs':  'Surrogates',
// ToDo: currently following done in EnDeRE.property programatically
//		'all'   : 'all characters',
//		'Any'   : 'any character',
//		'Assigned':'Assigned'
		/* now single letters last .. */
		// basic Unicode properties
		'L' :  'Letter',
		'M' :  'Mark',          // 'Mark to be combined with other base characters',
		'N' :  'Number',
		'P' :  'Punctuation',
		'S' :  'Symbol',
		'Z' :  'Separator',
		'C' :  'Other'          // 'Control codes and characters not in other categories',
	}, // prop
	
	propVS: {
		// Visual Studio only
		/* there're no standard full names, hence written with spaces */
		'Al':  'a single character',
		'Nu':  'one number or digit',
		'Pu':  'any punctuation',
		'Wh':  'any kind of white space',
		'Bi':  'right-to-left scripts',
		'Ha':  'Korean Hangul and Jamos Characters',
		'Hi':  'Hiragana Characters',
		'Ka':  'Katakana Characters',
		'Id':  'Ideographic Characters',
		'a' :  'alphanumeric character ([a-zA-Z0-9])',
		'b' :  'space or tab characters',
		'c' :  'alphabetic character ([a-zA-Z])',
		'd' :  'digit ([0-9])',
		'h' :  'hexadezimal digit ([0-9a-fA-F]+)',
		'i' :  'C/C++ identifier ([a-zA-Z_$][a-zA-Z0-9_$]*)',
		'n' :  'rational number (([0-9]+.[0-9]*)|([0-9]*.[0-9]+)|([0-9]+))',
		'q' :  'quoted string (("[^"]*")|(\'[^\']*\'))',
		'w' :  'word ([a-zA-Z]+)',
		'z' :  'integer ([0-9]+)'
	}, // propVS

	modifier: {  // modifier characters
		'A' :  'anchor entire match to attempt s initial starting position',
		'b:Tcl' : 'rest of RE is a BRE',
		'c:Tcl' : 'case sensitive (Tcl only)',
		'c' :  'do not reset match position ("tag-team" matching)', // always used as /gc
		'D' :  '$ matches only at end-of-string',
		'e' :  'evaluate replacement (code execution)',
		'e:Tcl' : 'rest of RE is a ERE',
		'E' :  'end literal text span',
		'gc':  'do not reset match position ("tag-team" matching)', 
		'g' :  _gm,
		'i' :  _ci,
		'I:Python' :  _ci,
		'J:PCRE': 'reset start of match',
		'l' :  'make next character is lowercase',
		'L' :  'make string lowercase until \\E',
		'L:Python' :  _lo,
		'm' :  _ml,
		'M:Python' :  _ml,
		'm:Tcl' : 'historical synonym for n',
		'n:Tcl' : 'newline-sensitive matching (Tcl only)',
		'n' :  'capture only named capture variables (.NET only)',
		'N' :  'named unicode character',
		'o' :  'compiled expression',
		'p' :  'print substitions',
		'p:Tcl' : 'partial newline-sensitive matching (Tcl only)',
		'q:Tcl' : 'rest of RegEx is literal',
		'Q' :  'start literal text span',
		's' :  _da,
		'S' :  'study RegEx (PHP only)',
		'S:Python' :  _da,
		't' :  'tight syntax',
		'u' :  'make next character is uppercase',
		'u:Java': 'case insensitive match for unicode characters',
		'U' :  'make string uppercase until \\E',
		'U:PHP' : 'swap greedeness of * and *? etc.',
		'U:PCRE': 'default ungreedy (lazy)',
		'U:Python' :  _un,
		'w' :  'inverse partial newline-sensitive matching (Tcl only)',
		'x:Java': 'ignore whitespace and support inline comments',
		'X' :  'enable PCRE "extra stuff"',
		'X:Python' :  _xx,
		'x' :  _xx,
		// Erlang Options
// ToDo: compile(): anchored | caseless | dollar_endonly | dotall | extended | firstline | multiline | no_auto_capture | dupnames | ungreedy | {newline, NLSpec}
// ToDo: replace(): anchored | global | notbol | noteol | notempty | {offset, int()} | {newline, NLSpec} | {return, ReturnType} | CompileOpt
// ToDo: run(): anchored | global | notbol | noteol | notempty | {offset, int()} | {newline, NLSpec} | {capture, ValueSpec} | {capture, ValueSpec, Type} | CompileOpt
// ToDo: split(): anchored | global | notbol | noteol | notempty | {offset, int()} | {newline, NLSpec} | {return, ReturnType} | {parts, NumParts} | group | CompileOpt
		// java.util.regex  Pattern.*
		'COMMENTS'         : _xx,
		'CASE_INSENSITIVE' : _ci,
		'DOTALL'           : _da,
		'MULTILINE'        : _ml,
		'UNIX_LINES'       : 'how . and ^ match',
		'UNICODE_CASE'     : 'case insensitive matching for non-ASCII',
		'CANON_EQ'         : 'unicode canonical equivalence',
		'LITERAL'          : 'RegEx is literal text',
		// Prolog
		'nocase'           : _ci,
		'indices'          : 'match contains position of first and last of matched character',
		// Python
//		'DOTALL'           : _da,   // see above
		'IGNORECASE'       : _ci,
		'LOCALE'           : _lo,
//		'MULTILINE'        : _ml,   // see above
		'UNICODE'          : _un,
		'VERBOSE'          : _xx,
		// Ruby
//		'IGNORECASE'       : _ci,   // see above
		'EXTENDED'         : _xx,
//		'MULTILINE'        : _ml,   // see above
		// .NET, VB.NET, C#
		'IgnoreCase'       : _ci,
		'IgnorePatternWithWhitespace' : _xx,
		'Singleline'       : _da,
		'Multiline'        : _ml,
		'ExplizitCapture'  : 'capture only named capture variables',
		'ECMAScript'       : 'mimic ECMA standards', // restrict \\w, \\d and \\s to match ASCII characters only; allow only Ignorecase, Multiline and Compiled options
		'RightToLeft'      : 'perform match of RegEx from right to left in string',
		'Compiled'         : 'compile regEx before using',
		// Tcl
		'-all'             : _gm,
		'-nocase'          : _ci,
		'-expanded'        : _xx + ', same as (?x)',
		'-line'            : 'newline-sensitive matching (. matches newline), same as (?n)',
		'-linestop'        : 'newline-sensitive matching (. does not match newline), same as (?p)',
		'-lineanchor'      : '^ and $ match at beginning and end of line, same as (?w)',
		'***:'             : 'the rest of the RE is an ARE',
		'***='             : 'the rest of the RE is literal string'
  	}, // modifier

	type: { // see also context.type
		'D' : 'DFA   - Deterministic Finite Automation',
		'N' : 'NFA   - (traditional) Nondeterministic Finite Automation',
		'P' : 'POSIX - (POSIX) Nondeterministic Finite Automation'
  	}, // type

	idx : { // finally describe myself
		// ToDo: does not work this way, needs to be done below :-(
		//'desc'  : 'describe myself',
		x   : _x,
		a   : _a,
		y   : _y,
		i   : _i,
		d   : _d,
		e   : _e,
		h   : _h,
		O   : _O,
		r   : _r,
		o   : _o,
		K   : _K
	}, // idx


/*
	http://www.regular-expressions.info/
	http://www.regular-expressions.info/refflavors.html
	http://en.wikipedia.org/wiki/Regular_expression
	http://www.serpentine.com/blog/2007/02/27/a-haskell-regular-expression-tutorial/
	http://swtch.com/~rsc/regexp/regexp1.html
	http://www.rorsecurity.info/2007/04/16/ruby-regular-expression-fun/	Ruby regular expression fun
	http://railsforphp.com/2008/01/17/regular-expressions-in-ruby/#preg_match_all	PHP vs. Ruby

		':BRE'      : 'basic (POSIX) regular expressions',
		':ERE'      : 'extended (POSIX) regular expressions',
		':ARE'      : 'advanced (POSIX) regular expressions',
		':TRE'      : '??', // http://laurikari.net/tre/
		'GNU BRE'   : 'BRE with GNU extenstions',
		'GNU ERE'   : 'ERE with GNU extenstions',
		':POSIX'    : 'POSIX regular expression, often simply RE',
*/
	refs : { // used references
		'desc'      : 'used references for known flavours',
		':bash'     : _mp,
		':BRE'      : _jf,
		':ERE'      : _jf,
		':POSIX'    : _jf,
		':awk'      : _mp,
		':gawk'     : _mp + ' and ' + _jf,
		':oldgrep'  : _mp,
		':grep'     : _mp,
		':ggrep'    : _mp,
		':egrep'    : _mp,
		':ed'       : _mp,
		':ex'       : _mp,
		':sed'      : _mp,
		':gsed'     : _mp,
		':lex'      : '',
		':flex'     : _jf,
		':S-Lang'   : 'http://www.s-lang.org/doc/html/slang.html',
		':Emacs'    : '',
		':Erlang'   : 'http://www.erlang.org/eeps/eep-0011.html',
		':Haskell'  : 'http://haskell.org/haskellwiki/Regular_expressions',
		// Haskell supports POSIX (ERE), PCRE or TRE, see link
		':Java'     : 'http://java.sun.com/j2se/1.5.0/docs/api/java/util/regex/Pattern.html', // :Java-code
		':Java-code': 'in Java code anything is parsed as string first, hence needs double escaping', // same as :Java
		':Java-prop': 'in Java properties files anything is a string literal, hence escape characters are used as is',
		':.NET'     : '',
		':Perl'     : 'man perlre and ' + _jf,
		':PCRE'     : 'http://www.pcre.org/',
		':PHP'      : '',
		':Python'   : 'http://docs.python.org/howto/regex.html',
		':Ruby'     : 'http://www.ruby-lang.org/',
		':Tcl'      : _mp + ' and ' + 'http://www.tcl.tk/man/tcl8.5/TclCmd/re_syntax.htm',
		':C'        : '',
//		':VB.NET'   : '',
		':VisualSt' : 'http://msdn2.microsoft.com/en-us/library/2k3te2cs(VS.80).aspx',
		':VBScript' : '',
		':ECMA-262' : '',
		':oldvi'    : _mp,
		':vi'       : _mp + ' and ' + _vi,
		':vim'      : _vi,
		':nvi'      : _vi,
		':elvis'    : _vi,
		':UltraEdit': 'UltraEdit32 Version 14.00 Help Pages',
		':UE32_Unix': 'UltraEdit32 Version 14.00 Help Pages',
		':ISAPI_rew': 'http://www.isapirewrite.com/docs/',
		':boost'    : 'http://www.boost.org/doc/libs/1_38_0/libs/regex/doc/html/boost_regex/syntax/basic_extended.html', // 01/2009
		':AS3'      : '',
		':MySQL'    : 'http://dev.mysql.com/doc/refman/5.0/en/regexp.html',
		':SQL'      : '',
		// esoteric labguages
		//  more see: http://www.esolangs.org/wiki/Brainfuck
		':3code'    : 'http://www.bigzaphod.org/3code/',
		':Brainfuck': 'http://de.wikipedia.org/wiki/Brainfuck',
		':Befunge'  : 'http://de.wikipedia.org/wiki/Befunge',
		':Cow'      : 'http://www.bigzaphod.org/cow/',
		':HQ9+'     : 'http://www.cliff.biffle.org/esoterica/hq9plus.html',
		':INTERCAL' : 'http://www.catb.org/~esr/intercal/',
		':LOLCATS'  : 'http://icanhascheezburger.com/',
		':LOLCODE'  : 'http://lolcode.com/specs/1.2',
		':LOLSQL'   : 'http://www.aaronbassett.com/tag/lolsql/',
		':Malbolge' : 'http://www.lscheffer.com/malbolge.shtml',
		':Ook'      : 'http://de.wikipedia.org/wiki/Ook%21',
		':Piet'     : 'http://www.dangermouse.net/esoteric/piet.html',
		':Rebol'    : 'http://www.rebol.com/docs.html',
		':SPL'      : 'http://shakespearelang.sf.net/',
		':Taxi'     : 'http://www.bigzaphod.org/taxi/',
		':Thue'     : 'http://lvogel.free.fr/thue.htm',
		':Unlambda' : 'http://www.madore.org/~david/programs/unlambda/',
		':Whirl'    : 'http://bigzaphod.org/whirl/',
		':whitespace':'http://compsoc.dur.ac.uk/whitespace/',
		':dumm'     : ''
	} // refs

}; // _desc
}; // EnDeTMP
