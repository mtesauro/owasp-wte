/* ========================================================================= //
// vi:  set ts=4:
// vim: set ts=4:
#? NAME
#?      EnDeRE.js - functions for parsing regular expressions
#
# ToDo: just a simple parser implemented, does not check
#   - identify greedy/lazy quantifiers
#   - behaviour of . and $
#   - improve 'leading' and 'trailing' texts
#   - special behavours of selected language (like version dependence)
#   - take care about double escaped characters (see  y  below)
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeREMap.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeRE.js"></SCRIPT>
#?
#?      Additional for GUI:
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeGUI.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeREGUI.js"></SCRIPT>
#?
# ?     Additional for testing:
# ?     <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeTest.js"></SCRIPT>
# ?
#? DESCRIPTION
#?      Functions for testing, analysing and displaying regular expressions.
#?
#?          EnDeRE.parse()      - parse given source as regular expression
#?          EnDeRE.match()      - try to  match  regular expression  against
#?                                given source (text)
#?          EnDeRE.lang()       - return RegEx engine type for given language
#?
#       Internal functions:
#           EnDeRE.parseInit()  - convert an array to a hash
#           EnDeRE.arr2hash()   - convert an array to a hash
#           EnDeRE.explain()    - add description if meta character
#           EnDeRE.level()      - check for identation grouping, class, etc)
#           EnDeRE.parse._checkmeta()  - does the nasty things/checks
#?
#? WHAT IT IS NOT
#?      These functions are not
#?          - test for RegEx syntax (lint or alike)
#?          - converter for RegEx from to another syntax (flavour)
#?      The result,  either just pretty printed or with description text, is
#?      not always reversible to the original given RegEx  (because of added
#?      blank, space, tab and/or newline characters).
#?
# HACKER's INFO
#       The functions and methods found herein are used to parse and explain
#       regular expressions (RegEx for now) in various flavours.
#       So we first have to explain the terminology used for RegEx:
#           RegEx           - the string of the regular expression itself
#           text/string     - the text the RegEx should match against
#           flavour         - implementation specific syntax of RegEx
#           match           - the match of an RegEx in a string
#           character       - character, byte or bytes representing a letter
#           literal         - a character or string used as shown
#           metacharacter   - character with special behaviour,  in fact the
#                             the oposite of a literal
#           metasequence    - sequence of  characters  which build a special
#                             behaviour like metacharacters
#           escape          - a sequence of characters,  either to make it a
#                             metacharacter or to treat a  metacharacter  as
#                             literal, i.g. \ is used to escape characters
#           class           - a character class (enclosed in [ ] usually)
#           subexpression   - part of an expresseion or an expression within
#                             another expression
#           grouping        - grouping alternate text literals
#           quantifier      - metacharacter to specify amount of matches
#           interval        - min. and max. amount of matches (quantifier)
#           backreferences  - "remember" matches, in particular groups
#           modifiers       - metasequences to turn  follwoing characters in
#                             RegEx to literals
#           ...
#       Following terms are used interchangable (as most literature does:)
#           string - text - character literal
#           meta - metacharacter - metasequence
#           grouping - capturing
#           modifiers - RegEx literals
#           quantifier - interval
#
#       The algorithm used  to parse and explain the given  RegEx  according
#       the specified flavour is as follows:
#
#           Step0   - (to be found in EnDeREMap.js)
#                     A (hash) table with all known and available behaviours
#                     will be defined for each flavour.
#                     For better maintanance and because we ran out of uniqe
#                     keys (for example  d is DEL control character and also
#                     digit class) the table is organized in sevaral smaller
#                     tables (see  chrs.ctrl[], .meta[], .clss[] etc. ).
#                     This static definition is done once using JavaScript's
#                     (ECMA) prototopy functionality, aka JSON.
#                     Note to future hackers:
#                       instead of using several of smaller tables, we could
#                       have used one big three dimensional array like:
#                           chararray['flavour']['meta-character'] = magic;
#                       but that's harder to maintain. 
#                       You also my initializing such an array at startup ..
#           Step1   - For faster/better access, extract the definitions from
#                     Step0 according the given RegEx flavour to a new hash,
#                     where the hash key is the (literal) character itself.
#                     Note to hackers: this is a contribution to Step0.
#           Step2   - Build an array according the given  RegEx  which marks
#                     all meta or special characters  as defined in the hash
#                     table (see Step0, Step1), and also marks all remaining
#                     (other) characters as literals.
#           Step3   - Loop over the source and find start of RegEx.
#                     Detecting the RegEx  string and knowing how it will be
#                     evaluated by the language/flavour depends on following
#                     - the language/flavour itself
#                     - if the language/flavour evaluates the string first
#                       and passes the result to the regex engine
#                     - raw RegEx mode selected in GUI (passed as parameter)
#                     As result the RegEx literal string is known for Step4.
#                     If the regEx string is evaluated as string first, then
#                     the result from Step2 needs to be modified according.
#           Step4   - Loop over the source -the given RegEx- split the RegEx
#                     at functional units (groups) and   insert descriptions
#                     for all non-literal characters.
#             Step4a  - ignore initial /
#             Step4b  - check for leading ^
#             Step4c  - check for end of RegEx
#             Step4d  - unused
#             Step4e  - check for escaped character
#             Step4f  - check for escape character
#             Step4g  - all other characters
#             Step4h  - special handling inside character classes []
#             Step4t  - collect trailing text after RegEx
#
#       NOTE: this is a parser and hence ugly code by nature.
#
#       Some very special behaviours are not implemented in the parser.  See
#       EnDeREMap.js  for details (mainly marked with // ToDo: ).
#
#       if (ccc=='indexOf') { continue; }
#           This check inside  'for (key in array)'  loops is a contribution
#           to ancient Mozilla 1.x which has this property.
#?
#? REFERENCES
#?      Following informations where used:
#?          Mastering Regular Expressions (1st and 3rd Edition), J. Friedl
#?          PCRE      http://www.pcre.org/pcre.txt
#?          MySQL 5.1 http://dev.mysql.com/doc/refman/5.1/en/regexp.html
# ?         MySQL 5.1 http://dev.mysql.com/doc/refman/5.1/en/string-comparison-functions.html
# ?                   ==> REGEX and RLIKE is not multy-byte safe!
# ?         MySQL 4.x is same as 5.x and 6.x according RegEx.
#?
#? VERSION
#?      @(#) EnDeRE.js 3.6 12/01/15 10:52:32
#?
#? AUTHOR
#?      02-mar-08 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

/* ToDo:  more languages ..
 * -----

	C, C#, D, lua
	PHP and some more    need \\t in RegEx to become \t
	VB.NET supports (?# .. ) as comment

  escape/quote functions:
	Perl:	\Q .. \E ; q(), qq(), qr(), qx()
	:NET:	Regex.Escape()
	PHP:	preq_quote()
	Java:	quote()
*/

// ========================================================================= //
// public definition of all features and behaviours                          //
// ========================================================================= //

  // == Step0 ==

  /* ---- Description of the internal data structure see EnDeREMap.js */

// ========================================================================= //
// public  EnDeRE  object                                                    //
// ========================================================================= //

var EnDeRE      = new function() {  // already initializes in EnDeREMaps.js
  this.SID	= '3.6';
  this.sid	= function()    { return('@(#) EnDeRE.js 3.6 12/01/15 10:52:32 EnDeRE'); };

  // ======================================================================= //
  // public and alias functions                                              //
  // ======================================================================= //

  this.lang     = function(src) {
  //#? map language to RegEx engine type, return engine type
	/* some languages are identical in the settings, they just differ in some
	 * minor behaviours (for example string parsing in  C#  versus  VB.NET)
	 */
	if (EnDeTMP._lang.prototype[src] != undefined) {
		// #dbx alert(EnDeTMP._lang.prototype[src]);
		return(EnDeTMP._lang.prototype[src]);
	}
		return(src);
  }; // lang

  // ======================================================================= //
  // global variables                                                        //
  // ======================================================================= //

  this.chrs     = new EnDeTMP._chrs;    // list of meta characters foreach language/flavour
  this.desc     = new EnDeTMP._desc;    // description of control, class and meta characters
  this.desc.clss        = this.desc.meta; // both are the same
  this.desc.quantifier  = this.desc.meta; // both are the same
  this.context  = new EnDeTMP._context; // context of some meta and classes
  this.rex      = null;         // this array is a copy of the parsed RegEx and
				                // holds the value accoding this.meta for each character
  this.matches  = null;         // this array holds all matches in given text for RegEx
  this.backref  = null;         // this array holds all backreferences in given text for RegEx
				                // index number corresponds to backreference (index 0 unused)
  this.usexml   = 0;            // 1: output as XML, 0: output as text

  // finally describe myself (as .prototype in EnDeREMap.js fails):
  this.x = EnDeTMP.x; this.desc.idx[EnDeTMP.x] = EnDeTMP._x;
  this.a = EnDeTMP.a; this.desc.idx[EnDeTMP.a] = EnDeTMP._a;
  this.y = EnDeTMP.y; this.desc.idx[EnDeTMP.y] = EnDeTMP._y;
  this.i = EnDeTMP.i; this.desc.idx[EnDeTMP.i] = EnDeTMP._i;
  this.d = EnDeTMP.d; this.desc.idx[EnDeTMP.d] = EnDeTMP._d;
  this.e = EnDeTMP.e; this.desc.idx[EnDeTMP.e] = EnDeTMP._e;
  this.h = EnDeTMP.h; this.desc.idx[EnDeTMP.h] = EnDeTMP._h;
  this.O = EnDeTMP.O; this.desc.idx[EnDeTMP.O] = EnDeTMP._O;
  this.r = EnDeTMP.r; this.desc.idx[EnDeTMP.r] = EnDeTMP._r;
  this.o = EnDeTMP.o; this.desc.idx[EnDeTMP.o] = EnDeTMP._o;
  this.K = EnDeTMP.K; this.desc.idx[EnDeTMP.K] = EnDeTMP._K;

  this.sample = '"\'/^group[[:digit:]]*?^(*LF)use linefeed(?:grp2(foo|bar)+e(?P<var>val)(?<push>value)[s\\nS]caped\\n%sed\\(escaped \\bgrouping\\)null\\0(_$QL(3\\s4)){1,3})(?-im:noCase)class[\\s[:alpha:]]?Python(?P=var)PCRE\\k<var>.NET\\k{var}(?<-pop>)invalid class[:punct:](Unicode properties:\\pL\\p{Me}\\p{^Other}\\P{InvertedScript}\\pN(?:Visual Studio Unicode Property:[:Lu:N:n:h]))EnDe$"\'/mg';
							// sample used in (EnDe)GUI

  this.map = new Array();   // map brackets
  this.map['('] = ')';
  this.map['['] = ']';
  this.map['{'] = '}';
  this.map['<'] = '>';

  this.ident  = 4;
// ToDo: ident NOT YET IMPLEMENTED

  // ======================================================================= //
  // RegEx functions                                                         //
  // ======================================================================= //
this.out = function(tag,src) {
//#? return given data formated for output: plain text or XML
	var kkk = '';
	var anf = '<'  + tag + '>';
	var end = '</' + tag + '>';
	switch (tag) {
	  case 'desc':  kkk = '\t# '; break;
	}
	if (this.usexml == 1) {
		return anf + src + end;
	} else {
		return kkk + src;
	}
};

  this.bracket  = function(src) {
  //#? return matching closing bracket for src, otherwise src itself
	if (this.map[src] != undefined) { return(this.map[src]); }
	return(src);
  };

  this.explain  = function(src,goab,meta,desc) {
  //#? return description of meta character, formated if required
	/* src   - the character or string to describe
     * goab  - the current state object of parsing
	 * meta  - behaviours of src according language (see this.parse() Step1)
	 * desc  - corresponding descriptions (for meta)
	 */
	var bux = '';
	if ((meta != null) && (meta != undefined)) { // got something ..
		switch (meta) {
		  case this.O:   bux  = goab.hold + src; break;  // nothing to do
		  case this.o:   bux  = goab.hold + src; break;  // ToDo: needs something special ...
		  case this.x:   alert('explain: '+src);
		  default: // need formating
					if (src != '') { // avoid some useless newlines ..
						bux  = '\n' + goab.ident + goab.hold + src;
					}
					if (goab.print == true) {
						//bux += this.out('desc', desc);
						bux += '\t# ' + desc;
						if (meta == this.x) { bux += '\t' + this.desc.idx[this.x]; }
					}
					bux += '\n';
					break;
		}
		if (goab.print != true) { bux += goab.ident; }
	} else {            // got nothing, return as is
			bux  = goab.hold + src;
	}
	return(bux);
  }; // explain

  this.property = function(p,src,goab) {
  //#? return description for Unicode properties
	/* p    - initial character can be p or P
	 *        will be P for \p{^..} also
	 * src  - the property string literal
	 * goab - as usual ..
	 */
// ToDo: some special Unicode properties
/*
		'2'         : 'supports  longhand Unicode properties like \\p{Lu}',
		'&'         : 'supports composite property like \\p{L&}',
		'P'         : 'supports  negated Unicode properties like \\P{L}',
		'^'         : 'supports  negated Unicode properties like \\p{^L}',
		's'         : 'supports Unicode script properties',
		'b'         : 'supports Unicode block properties',
 */
	var bux = '';
	var kkk = '';
	var block='';
	var bbb = src.replace(/[{}\^:]/g,'');

	if (bbb == src) {   // nothing replaced, hence no {}
		if (goab.prop['1'] <= this.O) {  // not supported, just return
			return(goab.hold + p + src);
		}
	}
	if (goab.prop['N'] > this.O) {
		kkk = bbb.match(/^In(.*)$/i);
		if (kkk != null) {
			bbb = kkk[1]; // simply strip it off
			block = '(block longhand/pseudo-script) ';
		}
	}
	if (goab.prop['S'] > this.O) {
		kkk = bbb.match(/^Is(.*)$/i);
		if (kkk != null) {
			bbb = kkk[1]; // simply strip it off
			block = '(block longhand/pseudo-script) ';
		}
	}
	bux += this.explain(p, goab, goab.meta, goab.desc.meta[p]);
	var ccc = '';
	var desc= '** EnDeRE: unknown Unicode property (may be block or script)';
	var hhh = '';
	var c   = '';
	var map = [];   // map description text
	var ids = '{_-.L:'; // these are the letters used in this.chrs.prop['fuchur']
	var j   = '';
	for (j in ids) {
		/* loop through this.chrs.prop{} and build a regex combined of all
		 * entries found, depending on the letter (ids) the hash key or the
		 * hash value will be used and finally the _ in the value replaced
		 * by - a space or nothing
		 * This results in checking all combinations of for example:
		 *     {        _              -              .              L
		 *   {Sm}, {Math_Symbol}, {Math-Symbol}, {Math Symbol}, {MathSymbol}
		 *
		 * As all of these strings (except the first 2) are not in goab.desc
		 * we need to build an addition map[] also. This  map[] contains all
		 * the keys lowercase and the value as is (as defined in desc.prop).
		 */
		ccc = '';
		if (goab.prop[ids[j]] > this.O) {
			map.length = 0;
			switch (ids[j]) {
			  case '{':
					for (c in goab.desc.prop) { ccc += c + '|'; map[c.toLowerCase()] = goab.desc.prop[c]; };
					break;
			  case ':':
					if (goab.lang == ':VisualSt') { // ViasualSt has additional entries
						/* Visual Studio Unicode properties are case insensitive */
						for (c in goab.desc.prop) { ccc += c + '|'; map[c] = goab.desc.prop[c]; };  
						// add desc.propVS{} which may overwrite some defined descriptions
// ToDo: check for language needs to be removed here but done in parseInit()
						for (c in goab.desc.propVS) { ccc += c + '|'; map[c] = goab.desc.propVS[c]; };
					}
					break;
			  case 'L':
			  case '_':
			  case '-':
			  case '.':
					for (c in goab.desc.prop) {
						kkk = goab.desc.prop[c];						
						switch (ids[j]) {
						  case '_': break; // strings are already with _
						  case '-': kkk = kkk.replace(/_/g, '-'); break;
						  case '.': kkk = kkk.replace(/_/g, ' '); break;
						  case 'L': kkk = kkk.replace(/_/g, '');  break;
						}
						ccc += kkk + '|';
						map[kkk.toLowerCase()] = goab.desc.prop[c];
					}
// ToDo: following should be in EnDeREMaps, somehow ...
					if (goab.prop['+'] > this.O) { kkk = 'all';        ccc += kkk +'|'; map[kkk.toLowerCase()] = kkk; }
					if (goab.prop['*'] > this.O) { kkk = 'Any';        ccc += kkk +'|'; map[kkk.toLowerCase()] = kkk; }
					if (goab.prop['='] > this.O) { kkk = 'Assigned';   ccc += kkk +'|'; map[kkk.toLowerCase()] = kkk; }
					if (goab.prop['!'] > this.O) { kkk = 'Unassigned'; ccc += kkk +'|'; map[kkk.toLowerCase()] = kkk; }
					kkk = '';
					break;
			}

			kkk = bbb.match(new RegExp('^(' + ccc + 'dummy)$', goab.ic));
			if (kkk != null) {
				if (goab.ic != '') {
					desc= map[kkk[1].toLowerCase()];
				} else {
					desc= map[kkk[1]];
				}
				kkk = null;
				break; // only one possibility as all strings are unique
			}
		} // ids[j] > this.O
	} // loop all variants
	ccc = '';
	kkk = goab.ident;
	hhh = goab.hold;
	goab.ident += '\t';
	goab.hold   = '';
// ToDo: check for 's' and 'b' here if necessary (desc==**EnDeRE: ...)
	bux += this.explain(src.replace(/:/,''), goab, 'K', block + desc); // : already printed
	goab.ident = kkk;
	goab.hold  = hhh;
	bux += goab.ident;
	return(bux);
  }; // property

  this.modifier = function(src,goab) {
  //#? return description for modifiers (one per line)
	var bux = '';
	var bbb = '';
	var c   = '';
	var ccc = src.match(/^(?:[\/]|\(\?)?([a-zA-Z-]+)(?:[:)])?$/); // strict match to /../ or (?..)
	if (ccc != null) {
		for (c in ccc[1]) {
			if (ccc[1][c] == '-') { bbb = 'negated '; continue; }
			if (goab.modifier[ccc[1][c]] > this.O) {
				if (goab.print == true) {
					bux += goab.ident + '\t# ' + ccc[1][c] + ' : ' + bbb +  goab.desc.modifier[ccc[1][c]] + '\n';
					//bux += goab.ident + this.out('desc', ccc[1][c] + ' : ' + bbb +  goab.desc.modifier[ccc[1][c]]) + '\n';
				}
			}
			bbb = '';
		}
	}
	return(bux);
  }; // modifier

  this.quantifier=function(src,goab) {
  //#? return description for modifier literals, empty if not a literal
	var bux = '';
	var ccc = null;
	var qqq = null;
	for (qqq in goab.quantifier) { // loop over quantifiers
		if (qqq==='indexOf') { continue; }
		ccc = src.match(new RegExp('^(' + goab.quantifier[qqq].replace(/(.)/g, '\\$1') + ')'));
		if (ccc!==null) {
// ToDo: 'K' not really correct here, replace by proper goab.xxx variable
			bux = this.explain(ccc[1], goab, 'K', goab.desc.meta[src[0]] + '; '+ goab.desc.meta[goab.quantifier[qqq]]);
			goab.skip = ccc[1].length - 1;
		}
		ccc = null;
	}
	return(bux);
  }; // quantifier

  this.level    = function(src,goab,meta,typ) {
  //#? return description and identation for braces etc.
	/* src   - the character or string to describe
     * goab  - the current state object of parsing
	 * meta  - behaviours of src according language (see this.parse() Step1)
	 *         (not used herein, but passed through to this.explain())
	 * typ   - the type of meta character (see Step1)
	 *
	 * function modifies goab
	 */
// ToDo: should become part of this.explain()
	function _no (src) { if (src != '') { return(' (#' + src + ')' ); }; return(src); }
	var bux = '';
	var bbb = '';
	var ccc = src[0];
	var kkk = '';
	var reg = null;
	var br  = 0; // 1 if backreferences need to be reset
	var j   = '';
	if (goab.print == true) {
		// take care about state (braces, parantheses, etc.)
		if (typ != this.O) {
			// kkk used for backreference counter
// ToDo: kkk does not work for closing (left) parantheses, hence we omit it for now
			switch (ccc) {
			  case '(':
					if (goab.isclass == true) { return(ccc); break; } // simple character inside character class
					goab.backr++; kkk = goab.backr; // ToDo: no backr for non-capturing groups
					goab.isgroup += typ;
					bbb = ccc;
					br  = 0;
					if (src[1] == '?') {    // most (all?) '(?' are non-capturing, hence no backreference
						if (src[2].match(/[<:!=#?>({]/) != null) { br = 1; }
					}
					// now we have to check our meta string literals starting with (
					for (j in goab.literal.meta) {
						if (j==='indexOf') { continue; }
						if (goab.ctxmeta[src[2]] == this.O) { continue; }    // not supported, hence nothing to do
// ToDo: need to check goab.ctxlook here
						ccc = goab.literal.meta[j];
						bux = src.substr(0,ccc.length);
						if (ccc == bux) {   // found meta string literal
							switch (ccc) {  // ugly hack to find the proper description
							  case '(k<':   // ToDo: never reached as k is not prefixed (
									br  = 1;    // ToDo: goab.backr is wrong backreference, need to find correct one
									bbb = '(k<  >';
									break;
							  default:      bbb = ccc;       break;
							}
							if (br != 0) { // reset backreferences counts
								goab.backr--;
								kkk = '';
							}
							bux = this.explain(ccc, goab, meta, goab.desc.meta[bbb] + _no(kkk));
							goab.skip   = ccc.length - 1;
							goab.ident += '\t';
							if (goab.print == true) { bux += goab.ident; }
							return(bux);
							break; // never reached
						}
					} // all literals
					// some special meta string literals
					ugly: {
						/*
						 * now we check special string literals which contain dynamic parts
						 * this works as follows:
						 *  1. check if given source matches the desired string literal
						 *  2. if it matches, set bbb to the key used in _desc.*{} and
						 *     exit ugly scope
						 *     the key for _desc.*{} is special, it must be known here
						 *  keep in mind that the sequence for the matches is important,
						 * 'cause the first match wins
						 */
						// backtracking verbs
						ccc = src.match(/^\(\*[A-Z]+\)/);
						if ((ccc != null) && (goab.ctxmeta['*'] > this.O)) { br = 1; bbb = ccc;  break ugly; }
// ToDo: need to check goab.ctxverb  also
						// named capture variable
						ccc = src.match(/^\(\?\P<[a-zA-Z_]+\>/); // most common ..
						if ((ccc != null) && (goab.ctxmeta['P'] > this.O)) { br = 1; bbb = '(?P<  >'; break ugly; }
// ToDo: python fails 'cause of escaped \( and \)
						ccc = src.match(/^\(\?P=[a-zA-Z_]+\)/); // python, PHP
						if ((ccc != null) && (goab.ctxmeta['v'] > this.O)) { br = 1; bbb = '(?P=VAR'; break ugly; }
						ccc = src.match(/^\(\?\<[a-zA-Z_]+\>/);  // .NET only
						if ((ccc != null) && (goab.ctxmeta['N'] > this.O)) { br = 1; bbb = '(?<  >';  break ugly; }
						ccc = src.match(/^\(\?\<-[a-zA-Z_]+\>/);  // .NET only
						if ((ccc != null) && (goab.ctxmeta['N'] > this.O)) { br = 1; bbb = '(?<-  >'; break ugly; }
						ccc = this.chrs.modifier.fuchur.replace(/\s*/g,'');
// ToDo: check if supported by flavour
						if (goab.ctxmod[')'] != this.O) {
							reg = new RegExp('\\(\\?[' + ccc + '-]+' + '\\)', ''); // mode modifier (?-ceimx)
							ccc = src.match(reg);
							reg = null;
							if (ccc != null) {                        br = 2; bbb = '(?..)';   break ugly; }
						}
						ccc = this.chrs.modifier.fuchur.replace(/\s*/g,'');
						if (goab.ctxmod[':'] != this.O) {
							reg = new RegExp('\\(\\?[' + ccc + '-]+' + '\\:', ''); // mode modifier  span (?-ceimx)
							ccc = src.match(reg);
							reg = null;
							if (ccc != null) {                        br = 2; bbb = '(?..:';   break ugly; }
						}
						ccc = null;
					} // ugly
					if (br != 0) { // reset backreferences counts
						goab.backr--;
						kkk = '';
					}
					if (ccc != null) { // got something
// ToDo: lookbehind ctxmeta['b'] ctxmeta['b'] is not supported by all flavours, needs to be checked here
						bux = this.explain(ccc[0], goab, meta, goab.desc.meta[bbb] + _no(kkk));
						if (br == 2) { bux += this.modifier(ccc.toString(),goab); }
						goab.skip   = ccc[0].length - 1;
						if (ccc.toString().match(/^\(\*[A-Z]+\)/) == null) { // no ident for backtracking verbs
							goab.ident += '\t';
						}
						if (goab.print == true) { bux += goab.ident; }
						bbb = null;
						ccc = null;
						return(bux);
					}
					// we reach here if no meta string literal found; now check specials
/*
					ccc = src.substr(0,2)
					if (ccc = '(?') {
						kkk = src.match(new RegExp('\\(\\?[' + bbb + '-]+' + '\\)', '')); // (?-ceimx)
						if (kkk != null) { // found mode modifier
								bbb = ccc + '..' + ccc[1] + ']'; // '[....]' or '[=..=]'
								ccc = kkk.toString(); // JavaScript is picky, need cast to String here!
						}
					}
*/
					// no break; !
			  case ')': goab.isgroup   += typ;        break;
			  case '[':
					if (goab.isclass == false) {
						goab.isclass  = true;
						if (src[1] == '^') {    // this is special
							bbb = '[^';
							bux = this.explain(bbb, goab, meta, goab.desc.meta[bbb]);
							goab.skip   = 1;
							goab.ident += '\t';
							bux += goab.ident;
							return(bux);
						}
						break;
					}
					// already parsing a character class
					// now we have to check our class string literals starting with [
					for (j in goab.literal.clss) {
						if (j==='indexOf') { continue; }
						ccc = goab.literal.clss[j];
						bux = src.substr(0,goab.literal.clss[j].length);
//alert('ccc:'+ccc+'  bux:'+bux);
						if (ccc == bux) {   // found clss string literal
							// first check if this flavour supports this literal
							if (goab.ctxclss[ccc[1]] == this.O) { continue; } // ToDo: can we break here?
							switch (ccc) {  // ugly hack to find the proper description
							  case '[:':
							  case '[=':
							  case '[.':
									// need to find the closing bracket '.]' or '=]';
									bbb = ccc;
// ToDo: not sure if character equivalents [=x=] may have more than one character
// ToDo: not sure if multiple character equivalents [=x=] can occur inside [...],
//       if not then following match must end with \]\]
									kkk = src.match(new RegExp('\\' + ccc + '[a-zA-Z-]+' + '\\' + ccc[1] + '\\' + ']', ''));
									if (kkk != null) { // found a POSIX special class
										bbb = ccc + '..' + ccc[1] + ']'; // '[....]' or '[=..=]'
										ccc = kkk.toString(); // JavaScript is picky, need cast to String here!
									} else {
										//kkk =''
										//ccc = src;
										bux = this.explain(ccc[0], goab, meta, '** WARNING: probably unescaped [ character inside character class **') + goab.ident;
										return(bux);
										break; // never reached
									}
									kkk = '';
									break;
							  default:  bbb = ccc; break;
							}
							if (goab.ctxclss[ccc[1]]===this.x) { kkk += '\t' + this.desc.idx[this.x]; }
							bux = this.explain(ccc, goab, meta, goab.desc.meta[bbb] + _no(kkk));
							goab.skip   = ccc.length - 1;
							if (goab.print == true) { bux += goab.ident; }
							return(bux);
							break; // never reached
						}
					}
					// we reach here if it is not a class string
					if ((goab.isclass == true) && (goab.isesc == false)) {
// ToDo: this check should be part of EnDeREMap.js (new column in EnDeTMP._context.class needed)
						bux = this.explain('[', goab, meta, '** WARNING: unescaped [ character inside character class **');
						return(bux);
					}
					break;
			  case ']':
					if (goab.isclass == false) { return(ccc); }
					goab.isclass= false;
					break;
			  case '}':
					if (goab.isrange == false) { return(ccc); }
					goab.isrange= false;
					break;
			  case '{': goab.isrange= true;
					// check for quantifiers ranges
					if (goab.quantifier.length > 0) {
						bbb = this.quantifier(src, goab); 
						if (bbb != '') {    // .. got something
							return(bbb);
						}
					}
					goab.isrange = false; // not a valid quantifier, just return
					return(ccc);
					break;
			} // switch (ccc)
		}
		kkk = _no(kkk);
	}  // desc
	bbb = null;
	// continue here if we got a simple (single) meta
	ccc = src[0];
	switch (typ) {
	  case this.a :
				bux = this.explain(ccc, goab, meta, goab.desc.meta[ccc]+kkk);
				goab.ident += '\t';
				if (goab.print == true) { bux += goab.ident; }
				break;
	  case this.e :
				goab.ident = goab.ident.substr(0,(goab.ident.length-1));
				bux = this.explain(ccc, goab, meta, goab.desc.meta[ccc]+kkk);
				if (goab.print == true) { bux += goab.ident; }
				break;
	  case this.K :
				bux = this.explain(ccc, goab, meta, goab.desc.meta[ccc]+kkk);
				if (goab.print == true) { bux += goab.ident; }
				break;
	  case 0 :
	  default:  bux = ccc; break;
	}
	return(bux);
  }; // level

  this.str2regex= function(lng,arr) {
  }; // str2regex

  this.arr2hash = function(lng,arr) {
  //#? convert an array to a hash
	/* Example:
		EnDeTMP._chrs.ctrl = {
			'fuchur' : 'n r t',
			'foo'    : [O,K,O],
			'bar'    : [K,O,K]
		};
	   will be convertet by  EnDeRE.arr2hash('foo',EnDeTMP._chrs.ctrl)  to:
		{
			'n' : O,
			'r' : K,
			't' : O,
		};
	 */
	var bbb = arr[lng];
	if (bbb == undefined) { return(null); }
	var ccc = arr['fuchur'].replace(/\s/g, ''); // avoid white spaces
	var bux = []; bux.length = ccc.length;
	var j   = 0;
	for (j=0; j<ccc.length; j++) { bux[ccc[j]] = bbb[j]; }
	return(bux);
  }; // arr2hash

  this.checkraw = function(goab,meta,raw) {
  //#? check for special string handling; reset goab.init['"'] if necessary
  /* meta  - the detetcted string delimiter 
   * raw   - array with raw delimiter and prefixes from this.chrs.raw[goab.orig]
   */
	var bux = 0;
	switch (goab.orig) {
	  case ':Perl':
	  case ':PCRE':
	  case ':PHP' :
		if (raw[0] == "'") { // raw string mode
			goab.init['"'] = this.O;
			goab.asis= false;
		}
		if (raw[0] == '"') {
			goab.asis= true;
		}
		break;
	  case ':ModSecurity' :
		break;
	}
	// #dbx alert('#dbx checkraw: '+raw[0]+' : '+goab.raw);
  }; // checkraw

  this.XML  = new function() {
  //#? container for reading XML files and evaluating their data
  this.tag  = 'user-regex';     // the XML tag we expect in the file
  this.file = null;
  this.data = function() {
  //#? get XML data as JavaScript
	var bux = EnDeRE.XML.file.getElementsByTagName(EnDeRE.XML.tag);
    if (bux.length == 0) { return void(0); } // ToDo: what to do here??
/*
	for (c=0;c<bux.length;c++) {
		// #dbx alert('= = = = = = = = = = '+c);
		if (bux[c].childNodes.length == 0) continue; // skip empty nodes
		if (bux[c].nodeType          != 1) continue; // skip empty or text nodes
		var n = 0;
		for (n=0;n<bux[c].childNodes.length;n++) {
			if (bux[c].childNodes[n].nodeType != 4) continue; // skip non CDATA_SECTION_NODE
			txt = bux[c].childNodes[n].nodeValue;
		}
	}
*/
/*  above for-loop would be the correct way to get the data from the file but
	but we are lazy as we know that there should/must be exactly one node and
	this nodes must contain our data as CDATA text, hence we read it directly
 */
	var kkk = '';
	try      { kkk = bux[0].childNodes[1].nodeValue; }
	catch(e) { /*EnDeGUI.*/alert('** EnDeRE.XML.data: failed: ',e); }
	// #dbx alert('\n'+kkk);
	bux = null;
	return(kkk);
  }; // data
 
  }; // XML

  this.template = function(goab) {
  //#? write JavaScript template for user definable RegEx; returns template
	function _escapeK(src) { // escape javaScript's own escape character
		return(src.replace(/([\\'])/g, '\\$1'));
	};
	function _array(obj,arr) {
		var bux = "\n  '" + _escapeK(obj) + "': [";
		bux += "\n\t'" + arr.join("',\n\t'") + "'\n\t], // " + obj;
		return(bux);
	};
	function _serialize(idx,obj) {
		var tab = '\n';
		var i   = 0, k = 0;
		for (i=0; i<idx; i++) { tab += '\t'; }
		idx++;
		var bbb = typeof(obj);
		if (bbb.match(/object/i) != null) {
			bux  = '{';
			for (k in obj) { bux += tab + "'" + _escapeK(k) + "'\t:" + _serialize(idx,obj[k]); } 
			bux += tab + "'dumm'\t:0\n\t}, // ";
			return(bux);
		} else {
			if (bbb.match(/number/i) != null) { return(0 + ','); }
			return(" '" + obj + "',");
		}
		return(obj); // dummy, never reached
	};
	var bbb = '\n  // remove of comment out unsupported ';
	var c,j,k;
	goab.quantifier = this.chrs.quantifier.fuchur; // we want to print all
	var bux  = '<?xml version="1.0"?>\n<' + EnDeRE.XML.tag + '><![CDATA[';
	    bux += '\n/* Do not change the XML tag name!';
		bux += '\n *\n * Replace  0  as value for supported features in your RegEx';
		bux += '\n * in following arrays. The values allowed beside preset  0  are:';
	var ccc = [this.x,this.a,this.y,this.i,this.d,this.e, this.h,this.O,this.r,this.o,this.K];
	//for (c in EnDeTMP._desc.prototype.idx) {
	for (c in ccc) {
		bux += '\n *    ' + ccc[c] + '   :  ' /*+ _idx(ccc[c])*/ + EnDeTMP._desc.prototype.idx[ccc[c]];
	}
	bux += '\n *\n * Do not remove any hash entries!';
	bux += '\n * Do not change strings of the hash keys!';
	bux += '\n * Strings in array values can be changed or removed.';
	bux += "\n * Ensure that XML's CDATA syntax is not broken.";
	bux += '\n *\n * For detailed description of following keys see help page ([?] button).';
	bux += '\n */\n\n';
	bux += '\nfunction _user() {};// container for user defined regex flavour';
	bux += '\n_user.prototype = {';
	bux += "\n  'lang'\t: ':user-regex', // ** DO NOT CHANGE THIS **";
	bux += "\n  'user'\t: '-- your description here --',";
	bux += "\n  'escchr'\t: '\\\\', // set the escape character here";
	for (j in goab) {
		switch (j) {
		  case 'quantifier':
				bux += bbb + j;
				bux += _array(j, goab[j]);
				break;
		  case 'literal':
				// ToDo: JavaScript's typeof() is too stupid to identify arrays
				//       uniquely, hence this one done manually ...
				bux += "\n  '" + _escapeK(j) + "': {";
				for (k in goab[j]) {
					if (k == 'desc') { continue; }
					bux += '\t' + bbb + j + '.' + k;
					bux += _array(k, goab[j][k]);
				}
				bux += "\n\t}, // " + j;
				break;
		  case 'ctrl':
		  case 'clss':
		  case 'meta':
		  case 'escp':
		  case 'prop':
		  case 'init':
		  case 'anchor':
		  case 'modifier':
		  case 'ctxctrl':
		  case 'ctxclss':
		  case 'ctxmeta':
		  case 'ctxlook':
		  case 'ctxtype':
		  case 'ctxmod':
				bux += "\n  '" + _escapeK(j) + "': ";
				bux += _serialize(1,goab[j]) + j;// + '\n';
				break;
		  default: continue; break; // anything else not yet used
		}
	}
//	bux += "\n  'raw'  : { ':user-regex': ['\"'] },";
//	bux += "\n  'subs' : { ':user-regex': ['whatever','prefix','here'] },";
	bux += "\n  'dumm'\t:0";
	bux += "\n}; // _user";
	bux += "\n\n_user.parseInit = function(goab) {";
	bux += "\n  //#? user definable settings"; 
	bux += "\n\talert('_user.parseInit: ');";
	bux += "\n\n\t/* write your initialization code here .. */";
	bux += "\n\n\t//return(); // **DON'T USE it, as it will break eval()";
/*   return(); does not work as eval()ing this function fails */
	bux += "\n};";
	bux += "\n]]></" + EnDeRE.XML.tag + ">\n";
	return(bux);
  }; // writeUser

  this.parseInit= function(goab) {
  //#? special initialization for specified language
	/* to be called after initialization of goab{} !! */
	var j = 0;
	switch (goab.orig) {
	  case ':Java-prop' :   goab.init['"'] = this.O; break;
	  case ':VisualSt'  :   goab.ic        = '';   break; // Todo add goab.desc.propVS to goab.desc.prop
	  case ':VB.NET'    :   for (j in goab.ctrl) { goab.ctrl[j] = this.O; }; break;
// ToDo: more comming here ...
	}
	/*
	:lex:
		{{egal}} bezeichnet eine Variable egal
		- in [] Klasse kann als erstes oder letztes Zeichen stehen
		Texte in " oder ' eingeschlossen sind String-Literale
		/ ist ein "lookahead" Operator
	:elvis
		\@ matches word under cursor
		\= indicate where to put cursor after match
	:nvi
		kann von BRE nach ERE umgeschalten werden mit:  set extended
	:vim, :vile, :elvis
		im extended Mode wird () statt \(\)  benutzt;
		erlaubt \{n,m} statt \{n,m\}
	:JavaScript, [\u0400-04ff]  \u nur am Anfang
		 \b ist Anchor aber innerhalb [] backspace
	:Java, :C#  \t wird tab, \w liefert error
		Sun's java.util.regex kennt Unicode fuer \b aber nicht fuer \w
		\w, \d, \s matches only US-ASCII
		in free formating mode spaces are not allowed in character classes
	:C#  hat Strings mit ".." und raw Strings mit @".."
	:VB.NET  hat Strings mit ".." einzigstes Escape ist " selbst fuer ein "
	:Perl hat Strings mit ".." und '..'
		".." \-escapes werden umgewandelt, {..} ist Ergebnis des Perl-Codes, $variablen werden expandiert
	    \Q und \E haben besondere Bedeutung in ".."; \N nur in ".." moeglich
		m?..?  ist besonders, da nur einmal moeglich
	:PHP hat Strings mit ".." und '..'
		".." \-escapes werden umgewandelt, {..} ist Ergebnis des PHP-Codes, $variablen werden expandiert
			\t wird tab, aber \w bleibt \w
		'..' \ bleibt \ , also muss nur \ und ' selbst escaped werden
		cannot use named variable reference more than once
		word boundery shorhands work with ASCII only
		bei preg_match* ist RegEx ein String: preg_match_all('/(to|the|t.xt)/', input, $match)
	:Python  kennt ".." und '..', das ist kein Unterschied
		aber '''...''' erlaubt newlines, r".."  ist raw String *ohne Escape, d.h. \ bleibt*
	:Tcl see http://www.tcl.tk/man/tcl8.5/TclCmd/re_syntax.htm
		Within bracket expressions, \d, \s, and \w lose their outer brackets, and \D,
		\S, and \W are illegal. (So, for example, [a-c\d] is equivalent to
		[a-c[:digit:]]. Also, [a-c\D], which is equivalent to [a-c^[:digit:]], is illegal.)
		***: und ***= innerhalb der RegEx besonders
	:Ruby
		benutzt POSIX (behauptet aber PCRE)
		Erweiterungen:
		http://www.rubyfu.com/2007/06/named-captures-for-regular-expressions.html
	 */
  }; // parseInit

/*
var n='name';var x=new XML('<foo {n}="bar">heureca</foo>');alert(x.toXMLString()+'\n'+x.@name);
var n='name';var x=<foo {n}="bar">heureca</foo>;alert(x.toXMLString()+'\n'+x.@name);
var n='name';var x=<foo {n}="42"><bar id="5">ooh</bar><bar id="3">heureca</bar></foo>;alert(x.toXMLString()+'\n'+x[/bar@id="3"]);
*/

  this.parse    = function(src,lng,pre,cmt,raw) {
  //#? regular expression parser
	/* src  - the text of the RegEx
	 * lng  - language/flavour to analyze
	 * pre  - pattern for prefix (may be empty)
	 * cmt  - true if comment/description should be added
	 * raw  - true if RegEx is raw data or prefixed/suffixed by other text
	 *        (anything left of / or " is ignored)
	 *
	 * it should be possible to call this fnction multiple times simultaneously
	 */

	function delobj(arr) {
		if (arr==undefined) { arr = null; return; }
		if ((typeof arr).match(/(boolean|number)/i)!=null) { delete arr; return; }
		if ((typeof arr).match(/string/i)!=null) { arr = null; return; }
		//if ((typeof arr).match(/string/i)!=null) { arr = ''; delete arr; return; }
		var j = '';
		if ((typeof arr).match(/object/i)!=null) {
			for (j in arr) {
				delobj(arr[j]);
				arr[j] = null;
				delete arr[j];
			}
			arr.length = 0;
			arr = null;
			delete arr;
			// if (arr!=undefined) { alert(arr); }
		} else { // hopefully never reached
			if ((typeof arr).match(/array/i)!=null) {
				arr.length = null;
				arr = null;
			}
		}
	};

	var bux = '';
	var bbb = '';
	var ccc = null;
	var kkk = '';
	var hex = '';
	var h, k, m;
	var goab   = new EnDeTMP._goab();
	goab.print = cmt;
	goab.orig  = lng;
	goab.lang  = this.lang(lng);
	goab.escchr= this.chrs.escchr;
	// check for other escape character than default
	if (this.chrs['escchr' + goab.orig] != undefined) {
		goab.escchr = this.chrs['escchr' + goab.orig];
	}
	switch (lng) {  // set language/flavour
		// some special initializations ..
	  case ':user-regex':
			kkk = EnDeRE.XML.data();
			eval(kkk); kkk = '';
			kkk = new _user();
			goab.refs[lng] = kkk.user;
			for (j in kkk) { goab[j] = kkk[j]; } // just assign what we got from file
			kkk = null;
			goab.print = cmt;
			goab.orig  = lng;
			goab.lang  = lng;
			_user.parseInit(goab);
			break;
	}

	function _checkmeta(src, goab) {
	// helper function to detect proper control, class or meta character
	// needs to be called for characters right after \ (escchr)
// ToDo: this should depend on: are control characters allowed at this position
		var bux = '';
		var kkk = '';
		switch (src) {  // ugly hack to handle laguage dependent quirks
		  case 'z': // MySQL is currently the only one which supports it as control
				if (goab.lang != ':MySQL') { break; }
				// else no break;
		  case '1':
		  case '2':
		  case '3':
		  case '4':
		  case '5':
		  case '6':
		  case '7':
		  case '8':
		  case '9':
				if (goab.meta['\\'] > EnDeRE.O) {
					kkk = EnDeRE.explain(src, goab, 'OK', 'backreference'); // ToDo: dirty hack; should be goab.desc.meta[src];
					break;
				}
			// no break;
		  case 'b': // might be a control but we assume a word boundary
		  case 'd': // might be a control but we assume a class
// ToDo: we have to check (ctrl['d' > EnDeRE.O), then it's a control
// ToDo: then need to check if controls are allowed in current context
		  default:
			if ((goab.ctrl[src] != null) && (goab.ctrl[src] != undefined)) { // .. it's a control
				kkk += EnDeRE.explain(src, goab, goab.ctrl[src], EnDeRE.desc.ctrl[src]);
			}
			break;
		}
		if ((kkk != '') && (kkk != src)) { // was a valid control
			bux += kkk;
			bux += goab.ident;
		} else {
			if ((goab.clss[src] != null) && (goab.clss[src] != undefined)) { // .. it's a class
				bux += EnDeRE.explain(src, goab, goab.clss[src], EnDeRE.desc.clss[src]);
				bux += goab.ident;
			} else {            // not a control, print as is
				bux += goab.hold + src;
			}
		}
		return(bux);
	}; // _checkmeta

	// == Step1 == // build hash for meta characters according lng parameter

	if (goab.lang != ':user-regex') {
		goab.ctrl     = this.arr2hash(goab.lang, this.chrs.ctrl);
		goab.clss     = this.arr2hash(goab.lang, this.chrs.clss);
		goab.meta     = this.arr2hash(goab.lang, this.chrs.meta);
		goab.escp     = this.arr2hash(goab.lang, this.chrs.escp);
		goab.prop     = this.arr2hash(goab.lang, this.chrs.prop);
		goab.init     = this.arr2hash(goab.lang, this.chrs.init);
		goab.anchor   = this.arr2hash(goab.lang, this.chrs.anchor);
		goab.literal  = new EnDeTMP._literal; // initialized below
		goab.modifier = this.arr2hash(goab.lang, this.chrs.modifier);
		goab.quantifier=[];
		goab.ctxctrl  = this.arr2hash(goab.lang, this.context.ctrl);
		goab.ctxclss  = this.arr2hash(goab.lang, this.context.clss);
		goab.ctxmeta  = this.arr2hash(goab.lang, this.context.meta);
		goab.ctxlook  = this.arr2hash(goab.lang, this.context.look);
		goab.ctxtype  = this.arr2hash(goab.lang, this.context.type);
		goab.ctxmod   = this.arr2hash(goab.lang, this.context.modifier);
	}

	// set language/flavour-specific descripton texts
	goab.desc     = this.desc;
	for (j in goab.desc) {
		for (k in goab.desc[j]) {
			kkk = k.match(new RegExp('^(.*?)' + goab.orig));
			if (kkk != null) {
				goab.desc[j][kkk[1]] = goab.desc[j][k];
			}
		}
	}
	j = null; k = null;

	if (goab.lang != ':user-regex') {
		// build special array with string literals
		for (j in goab.desc.meta) {
			if (j.length<2) { continue; }
			//kkk += goab.desc.meta[j] + ' - ';
			if (j.match(/^\(/) != null) {
				if (j.match(/\(\*/) != null) { continue; } // needs to be done programatically
				//if (j.match(/\(\?P?<.+>/)  != null) { continue; } // needs to be done programatically
				if (j.match(/\(\?-?[.]+:/) != null) { continue; } // needs to be done programatically
				goab.literal.meta.push(j);
			}
			if (j.match(/\[/) != null) {
				if (j.match(/\[[=.]\.\.[=.]\]/) != null) { continue; } // special description [....] and [=..=]
				goab.literal.clss.push(j);
			}
		}
		goab.literal.meta.push('k{  }');
		goab.literal.meta.push('k<  >');
		/* following keys are difficult to handle with JavaScript and/or HTML
		goab.literal.meta.push('(?<!');
		goab.literal.meta.push('(?<VAR');
		goab.literal.meta.push('(?P<VAR');
		 */
		goab.literal.meta = goab.literal.meta.reverse();
		goab.literal.clss = goab.literal.clss.reverse();
			/* .literal.clss are not strictly sorted according their length
			 * but that doesn't matter as the sorting is good enough if the
			 * keys consisting of just 2 or 3 characters sorted well at the
		     * end; all others are unique anyway
		     */

		for (j in this.chrs.quantifier.fuchur) {
			ccc = this.chrs.quantifier.fuchur[j];
			switch (ccc) {
			  case '*': // not needed as literal, handled as single meta
			  case '+': // ..
			  case '?': continue; break;
			  default:
					if (this.chrs.quantifier[goab.lang][j] > this.O) { // only the supported ones ..
						goab.quantifier.push(ccc);
					}
					break;
			}
		}
	}
	ccc = null;
	
	switch (goab.orig) {
	  case '_dump_':         return(this.template(goab));       break;  // ready
	  case ':ModSecurity':// src = src.replace(/\\\\/g, '\\');  break;
		// ToDo: diabled for now (02sep11)
			/*
			 * ModSecurity is special when RegEx comes frm CRS file
			 * \ are \-escaped and some are even double \-escaped
			 * which means that \\\\ shoud become \
			 * currently there is only \\ to \ reduction
			 * Also it may contain binary caracters written like \\xce
			 * they are not yet handled proper
			 */
		break;
	}

	this.parseInit(goab);
	// strip off prefix
	j   = 0;
	if (pre != '') {
		kkk = src.match(new RegExp('(' + pre + ')'));
		if (kkk != null) {
			bux += kkk[1];
			bux += this.explain('', goab, this.K, goab.desc.meta['leading']); 
			src = src.substr(kkk[1].length); // ToDo: quick&dirty solution
			/* simply print prefix as leading text and strip it off from src */
		}
	}

	// == Step2 == // now build this.rex[] according chrs.meta[]

	this.rex  = new Array(); this.rex.length = src.length;
	for (j=0; j<src.length; j++) {
		ccc = src.charAt(j);
		kkk = goab.meta[ccc];

		if (ccc == goab.escchr) {   // first check if char is escaped ========
			goab.isesc = !goab.isesc;
			this.rex[j] = kkk;
			continue;
		}
		if ((kkk == null) || (kkk == undefined)) { kkk = this.O; }

		if (goab.escp[ccc] == this.K) {  // escaped char becomes meta =============
			if (goab.isesc == true)  {
				this.rex[j] = kkk;
				goab.isesc = !goab.isesc;
			} else {
				this.rex[j] = this.O;
			}
			continue;
		}

		if (goab.isesc == false)  { // none-escaped char becomes meta ========
			this.rex[j] = kkk;
		} else {
			this.rex[j] = this.O;
			goab.isesc = !goab.isesc;
		}
	} // loop over src
	ccc = null;
	j   = 0;
	kkk = '';
	/* this.rex  now contains marks for  all meta characters  according the
	 * given language; classes and some boundaries are *not* marked
	 */

	// == Step3 == // detect RegEx, if required

	// ToDo: following description to be improved ...
	/* Detecting the RegEx istself depends on
	 *  - leading text (function name or a like)
	 *  - initial delimiter (like / or ")
	 *  - GUI parameter raw==true if the whole string should be the RegEx
	 * If  raw==true  is given by GUI, then there is nocthing special to do,
	 * we can continue parsing the given RegEx as is.
	 *
	 * Otherwise we construct a regex to detect [1] the leading text and [2]
	 * the delimiter. Allowed delimiters are found in goab.init and added as
	 * inverted class [1] followed by a single character [2] which then must
	 * be the delimiter itself (see Step3i).
	 * This regex is matched against the string (the RegEx to be parsed) and
	 * returns the leading text -if any- in ccc[1] and the delimiter -if any
	 * in ccc[2] (see Step3m). If these results are to be used (see Step3o),
	 * depends on parameter raw==true.
	 * NOTE that some languages/flavours support special quotings to inhibit
	 * that string evaluation takes place first. This special quoteing (like
	 * r in python or @ in C#) must now be the right most end of the leading
	 * text to be found in ccc[1]. Another regex will be used to detect such
	 * possible string literals marking raw strings (see Step3q).
	 *
	 * Beside some special characters and string literals  used to force the
	 * string as RegEx, a  / used as delimiter always forces a literal RegEx
	 * (if / is supported by that language/flavour).  If a  / is detected as
	 * delimiter we can safely assume the raw string as RegEx (see Step3r).
	 */
	 // ToDo: following ugly code ...
	 /* there's goab.quote and goab.asis, can probably reduced to only one
	  * this is a parser, hence no nice OO code ..
	  */
	 if (raw == false) {    // == Step3i ==
		for (j in goab.init) { // generate pattern to match start of RegEx
			if (j == '_') { continue; } // see EnDeTMP._chrs.init{}
			if (j == '"') { continue; }
			if (j == '@') { continue; }
			if (goab.init[j] > this.O) { kkk += goab.escchr + j; }
		}
		if (goab.init['"'] > this.O) {
			goab.quote = this.chrs.raw[goab.orig][0];  // the string delimiter
		}
		if (goab.quote != '') { kkk += goab.escchr + goab.quote; }
		if (kkk == '') {    // only raw mode possible? then ignore GUI raw parameter ..
			goab.asis= false;
			// #dbx alert('force raw '+raw);
		} else {            // got some delimiters == Step3m ==
	// ToDo: match is scary if more than one of the characters from goab.init match
			ccc = src.match(new RegExp('^([^' + kkk + ']*)?(.)?')); // matches leading text and the initial character
//bux+='\n#dbx 0: '+ccc.join(', ')+'#\n';
			// #dbx alert(kkk+' #'+ccc.length+' : '+ccc[1]+' - '+ccc[2]);
		}
		// now we have leading text (if any) in ccc[1], and delimiter in ccc[2]
		// note that ccc[1] also contains the the special "raw" character
		kkk = null;
	}
	j   = 0;
	if (ccc != null) { // could only be if raw==false  == Step3o ==
		/*
		 *     1 und 2: leading Text und Delimiter
		 * undef und 2: kein leading Text aber Delimiter
		 * 1 und undef: leading Text aber kein Delimiter
		 */
		if (ccc[2] != undefined) {
			goab.start = ccc[2];
			goab.stop  = this.bracket(ccc[2]);
		}
		if (goab.quote != '') {     // language feeds regex to string first ..
			// NOTE that following test is not necessary in mode raw==true
			if (goab.quote == goab.start) { // == Step3q ==
				for (m=1; m<this.chrs.raw[goab.orig].length; m++) { // test all prefixes
					// [1] is first string prefix! see EnDeREMaps.js
					/* something like:
					 *    match(@"
					 *    match(r '
					 *    REGEX '
					 */
// ToDo: \s* in following RegExp useless 'cause not matched in ccc[1] before
					bbb = null;
					if (ccc[1] != undefined) {
						bbb = ccc[1].match(new RegExp('.*?(' + this.chrs.raw[goab.orig][m] + '\\s*)$'));
// leading text ends with a special prefix
					}
					if (bbb != null) { // matched
						goab.asis= false;
						ccc[3] = bbb[1];    // add the raw string initializer
						ccc[1] = ccc[1].substring(0,ccc[1].length-bbb[1].length);
						bbb = null;
						break;
					}
				}
			}
			// else not a raw RegEx string
		}   // quoted string
		if (ccc[1] != undefined) {
			if (ccc[2] != undefined) {
				bux += ccc[1];
				bux += this.explain('',     goab, this.K, goab.desc.meta['leading']); // nice, this works too ;-)
				j   += ccc[1].length;
				if (ccc[3] != undefined) { // raw mode, see above
					bux += ccc[3];
					bux += this.explain('', goab, this.K, goab.desc.meta['rawString']);
					j   += ccc[3].length;
				}
				this.checkraw(goab, ccc[2], this.chrs.raw[goab.orig]);
				j   += ccc[2].length;
				switch (goab.orig) {
				  case ':Python' :
						if ((ccc[2] == src.charAt(j)) && (src.charAt(j) == src.charAt(j+1))) {
							bux += this.explain(ccc[2]+ccc[2]+ccc[2], goab, this.K, goab.desc.meta['RegExMulti']);
							j += 2;
// ToDo: need to match end of regex ''' or """
							break;
						}
						// else use default below
						// no break;
				  default        :
						bux += this.explain(ccc[2], goab, this.K, goab.desc.meta['RegExstart']);
						break;
				}
				if ((goab.init['/'] > this.O) && (goab.start == '/')) { goab.asis= false; }// == Step3r ==
			} else {    // check all prefixes
				for (m=1; m<this.chrs.raw[goab.orig].length; m++) {
					bbb = src.match(new RegExp('^(' + this.chrs.raw[goab.orig][m] + '\\s*)'));
					if (bbb != null) { // matched
						bux += bbb[1];
						bux += this.explain('', goab, this.K, goab.desc.meta['rawString']);
						j += bbb[1].length;
						goab.asis= false;
// ToDo: dirty hack: needs to be some function .. {
						switch (goab.orig) {
						  case ':ModSecurity' :
							if ( bbb[1].match('@pm\\s') != null) {
								src = src.replace(/\s/g, '|');
								for (x=0; x<src.length; x++) { // need to redefine this.rex[]
									if (src.charAt(x) == '|') { this.rex[x] = this.K; }
								}
							}
							break;
						}
// ToDo: dirty hack: }
						break; // found string, no more checks ..
					}
				}
			}
		}
	} else {// start parsing right away
		goab.asis= false;
	} // detect RegEx
	if (goab.asis== false) {// raw mode, reset string evaluation
		goab.init['"'] = this.O;
	}
	ccc = null;
	goab.regex++;

	// == Step4 == // now we can parse the RegEx ..

	// == Step4a == // ignore initial / -no longer needed with above regex-test

	// == Step4b == // check for leading ^ and \A
	ccc = src.charAt(j);
	if (ccc == '^') {
		// for now we don't care if it is really a meta character ..
		kkk = this.explain(ccc, goab, goab.meta[ccc], goab.desc.meta[ccc]);
		if (ccc != kkk) { // .. it's a meta
			bux += kkk;
			j++;
		}
	} // ^
	bbb = src.charAt(j+1);
	if ((ccc == goab.escchr) && (bbb == 'A')) {
		goab.hold = goab.escchr;    // required for this.explain()
		kkk = this.explain(bbb, goab, goab.clss[bbb], goab.desc.clss[bbb]);
		if (bbb != kkk) { // .. it's a meta
			bux += kkk;
			j += 2;
		}
		goab.hold = '';
	} // \A
	goab.regex++;

	// == Step4c == // check for end of RegEx
	k = src.length;
	if (raw == false) { // .. but only if required (selected in GUI)
		for (k=j; k<src.length; k++) {
			/* If RegEx is enclosed in delimiters, like / or " in JavaScript
			 * then we need to identify the end of the  RegEx  which must be
			 * the same character we stored in  goab.stop  (see Step3).
			 * If this character should be part of the RegEx itself, it must
			 * be escaped inside the RegEx.
			 */
			if ((src[k] == goab.stop) && (src[k-1] != goab.escchr)) {
				if (goab.orig != ':VBScript') { break;  // normal case
				} else {    // VBScript is very special, grrrr
					// ToDo: the following 2 lines highly depend on configuration
					//       in EnDeREMap !! take care when something changes
					if (src[k] == src[k+1]) { k++; continue; }
					break;
				}
			}
		}
	} // RegEx
//dbx bux += '\n#dbx [' + j + '..' + k + ']\n';
	for (j=j; j<k; j++) {
		if (goab.skip > 0 ) { goab.skip--; continue; } // got something to ignore
		ccc = src.charAt(j);
		kkk = '';

		// == Step4d == // unused

		// == Step4e == // check for escaped character
		if ((ccc == goab.escchr) && (goab.hold == goab.escchr) && (goab.init['"'] > this.O)) {
			/* languages/flavours  which do a string evaluation first, need to
			 * have the escape character doubled,
			 * doubling is done if there is only one character in goab.hold so
			 * far
			 */
			goab.hold += ccc;
			continue;
		}

		if ((goab.hold == goab.escchr) || (goab.hold == goab.escchr + goab.escchr)) {
			// last character was \, next one may be meta ..
//alert('bs:'+ccc+'\n\t'+goab.escp[ccc]);

			bbb = '';
			if (goab.escp[ccc] > this.O) { // escaped meta character becomes meta
				kkk = goab.desc.meta[ccc];
				switch (ccc) {   // .. though some are more special
				  case 'g':
						hex = ['new', 'old'];
						for (h in hex) {
							bbb = src.substr(j,src.length-1);
							switch (hex[h]) {
							  case 'new': bbb = bbb.match(/^g(\{\d+\})/); break;
							  case 'old': bbb = bbb.match(/^g(\d+)/);     break; // old-fashioned variant
							  default :   bbb = null; break; // fallback
							}
							if (bbb === null) { // got a \x without valid following numbers
								bbb = ''; // reset to empty string
							} else {
								bbb = bbb[1];
								goab.skip = bbb.toString().length;
								if (hex[h] === 'old') { kkk += ' ** depricated, use: \g{N}'; }
								break; // for loop
							}
						}
						if (bbb === '') { // got a \g without valid following number
							bbb = '';
							kkk = '** invalid \\g **; ' + goab.desc.meta[ccc];
						}
						break;
				  case 'x':
						// check for \x variants
						hex = ['v', 'x', 'X']; //  (sequence of these checks important!)
						for (h in hex) {
							bbb = src.substr(j,src.length-1);
							if (goab.escp[hex[h]] > this.O) {
								switch (hex[h]) {  // catch hex value
								  case 'v': bbb = bbb.match(/^x(\{[a-fA-F\d]+\})/); break; // variable length hex
								  case 'x': bbb = bbb.match(/^x([a-fA-F\d]{2})/);   break; // long hex
								  case 'X': bbb = bbb.match(/^x([a-fA-F\d])/);      break; // short hex
								  default : bbb = null; break; // fallback
								}
							} else {        bbb = null; }
							if (bbb === null) {
								bbb = ''; // reset to empty string
							} else {
								bbb = bbb[1];
								kkk = goab.desc.meta[ccc] + '; ' + EnDeTMP._chrs.prototype.escp[hex[h]]; // ugly hack to improve description
								goab.skip = bbb.toString().length;
								break; // for loop
							}
						}
						if (bbb === '') { // got a \x without valid following hex characters
							bbb = '';
							kkk = '** invalid \\x **; ' + goab.desc.meta[ccc];
						}
						break;
				  case 'u':
						// check for \u variants
						hex = ['U', 'u']; //  (sequence of these checks important!)
						for (h in hex) {
							bbb = src.substr(j,src.length-1);
							if (goab.escp[hex[h]] > this.O) {
								switch (hex[h]) {  // catch hex value
								  case 'U': bbb = bbb.match(/^u([a-fA-F\d]{7})/);   break; // long unicode
								  case 'u': bbb = bbb.match(/^u([a-fA-F\d]{4})/);   break; // short unicode
								  default : bbb = null; break; // fallback
								}
							} else {        bbb = null; }
							if (bbb === null) {
								bbb = ''; // reset to empty string
							} else {
								bbb = bbb[1];
								kkk = goab.desc.meta[ccc] + '; ' + EnDeTMP._chrs.prototype.escp[hex[h]]; // ugly hack to improve description
								goab.skip = bbb.toString().length;
								break; // for loop
							}
						}
						if (bbb === '') { // got a \u without valid following hex characters
							bbb = '';
							kkk = '** invalid \\u **; ' + goab.desc.meta[ccc];
						}
						break;
				  default: break;
				}
				bux += this.explain(ccc + bbb, goab, goab.escp[ccc], kkk);
				bux += goab.ident ;
			} else {             // just escaped character ..
				switch (ccc) {   // .. though some are more special
				  case 'A':
						// allowed at very first position only
						if (goab.regex != 1) {
// ToDo: this is a simple check which works as long as all RegEx flavours
//       allow \A at the beginning only
							bux += goab.escchr + ccc;
							ccc = '';
						}
						break;
				  case 'k':
						bbb = null;
						switch (goab.lang) {
						  case ':.NET':
						  case ':#C':
						  case ':VB.NET':
								// .NET is that ugly :-((
								bbb = src.substr(j,src.length-1);
								bbb = bbb.match(/^k\{[a-zA-Z_]+\}/); // catch variable name
								kkk = goab.desc.meta['k{  }'];
								break;
						  case ':PCRE':
						  case ':Perl':
								bbb = src.substr(j,src.length-1);
								bbb = bbb.match(/^k[<{'][a-zA-Z_]+[>}']/); // catch variable name
								kkk = goab.desc.meta['k<  >'];
// ToDo: perl also supports \k'name' and \k{name}, hence above regex is too lazy
								break;
						  default:  break;
						}
						if ((bbb != null) && (goab.ctxmeta['k'] > this.O)) {
							bux += this.explain(src.substr(j,6), goab, goab.meta, kkk);
							bux += goab.ident;
							goab.skip = bbb.toString().length - 1;
						} else {
							bux += goab.hold + ccc;
						}
						bbb = null;
						kkk = '';
						ccc = '';
						break;
				  /* unicode properties have their own description */
				  case 'P':
						if (goab.prop['P'] <= this.O) { goab.clss['P'] = this.O; break; } // not supported
// ToDo: dirty hack for goab.clss[]
						// no break;
				  case 'p':
						kkk = ccc;
						// if ((goab.clss['p'] > this.O) || (goab.clss['P'] > this.O)) // already done with goab.prop[]
						if (goab.clss['p'] <= this.O) { goab.clss['P'] = this.O; break; } // not supported
// ToDo: dirty hack for goab.clss[]
						bbb = src.substr(j,src.length-1);
						kkk = bbb.match(/^p\{\^[a-zA-Z_ -]+\}/);
						if (kkk != null) {
							kkk ='P'; // \p{^...} is same as \P{...}
						} else {
							kkk = ccc;
						}
						bbb = bbb.match(new RegExp('^p([a-z]|\\{\\^?[a-z_ -]+\\})','i'));
						if (bbb != null) {
							bux += this.property(kkk, bbb[1], goab);
							goab.skip = bbb[1].length; // not -1 'cause we also skip one P
							ccc  = '';
						}
						bbb = null;
						kkk = '';
						break;
				  case 'z':
				  case 'Z':
// ToDo: \Z fails :-((
						// allowed at very last position only
						/* \Z, \z  can not be detected when end of the RegEx
						 * is reached because  escchr is lost then, hence we
						 * need to look behind the current character if it
						 * is the end of the RegEx
						 */
// #dbx alert(ccc+' +- '+src.charAt(j+1)+' -- '+goab.stop);
						if (src.charAt(j+1) != goab.stop) {
// ToDo: this is a simple check which works as long as all RegEx flavours
//       allow \Z at the end only
							bux += goab.escchr + ccc;
							ccc = '';
						}
						break;
				  default: break;
				}
				if (ccc != '') { // nothing special happend, go for meta
					if ((goab.hold == goab.escchr) && (goab.hold == goab.escchr) && (goab.init['"'] > this.O)) {
						/* got a escaped character in string evaluation mode,
						 * but there was only one escape character, hence it
						 * becomes a literal string
						 */
						bux += this.explain(ccc, goab, this.K, goab.desc.meta['literal']);

					} else {
						bux += _checkmeta(ccc, goab);
					}
				}
			} // escp
			goab.hold = '';
			continue; // nothing more to do
		} // goab.hold
		// == Step4f == // check for escape character
		if (ccc == goab.escchr) { goab.hold += ccc; continue; }

		// formating goes here ..

		// == Step4g == // all other characters
		if (this.rex[j] != this.O) {
			// some characters are special, we use a switch for now
// ToDo: replace switch with logic in this.chrs.{ctrl,clss,meta} context ..

			// == Step4h == // things are different inside character classes
			if (goab.isclass == true) {
				switch (ccc) {
				  case '[':  break;	    // needs to be checked further
				  case ']':  break;	    // needs to be checked further
				  case '\\': break;	    // needs to be checked further
				  case '-':
						if (goab.ctxclss['a'] != this.O) {
							if (src.charAt(j-1) == '[' ) {
								bux += ccc; // it's a literal if not the very first one
								continue;   // loop over src
							}
						}
						break;
				  case '^': // it's a literal here; ^ as first character already handled
				  default :
						bux += ccc;	    // it's a literal here
						continue;       // loop over src
						break;          // never reached
				}
			} // isclass

			switch (ccc) {
			  case ':':
					if ((goab.isclass == true) && (goab.meta[ccc] == h)) {  // currently VisulSt only
						bbb = src.substr(j,src.length-1);
						bbb = bbb.match(/:([a-zA-Z][a-zA-Z]?)/);
						if (bbb != null) {
							bux += this.property(':', ':'+bbb[1], goab);
							goab.skip = bbb[1].length; // not -1 'cause we also skip one :
						}
						bbb = null;
						kkk = '';
						ccc = '';
					} else {
						bux += ccc;
					}
					break;
			  case '$': // ignore it for now, the last one needs special care
			  case '^':
					if (goab.regex == 1) {
						bux += ccc;
					} else {
						if (goab.isclass == true) {
// ToDo: such characters inside a class should be removed from this.rex[]
//       in Step2 or right after that instead detecting here
							bux += ccc; // it's a literal here
						} else {
							// hmm, should never match here ..
							bux += this.level(src.substr(j,12), goab, goab.meta[ccc], this.rex[j]);
						}
					}
					break;
			  case '*':
			  case '+':
			  case '?':
					// check for lazy and possessive quantifiers
					if (goab.quantifier.length > 0) {
						kkk = this.quantifier(src.substr(j,2), goab);  // that are not more than 2 characters
						if (kkk != '') {    // .. got something
							bux += kkk;
							break;
						}
					}
					// we reach here if not a lazy or possessive quantifiers
					// no break; // 'caus we use following default for single
					// meta characters
			  default:
					// first check for meta, if empty check for clss too
					kkk = this.explain(ccc, goab, goab.clss[ccc], goab.desc.clss[ccc]);
					if (ccc != kkk) { // .. it's a meta
						bux += kkk;
					} else {
						bux += this.level(src.substr(j,12), goab, goab.meta[ccc], this.rex[j]);
						break;
// ToDo: not sure if 12 is sufficient for all POSIX classes
					}
			}
		} else {
			bux += ccc;
		}
	} // loop over src

	if (raw == false) {
		/* enclosed in delimiters, we're either at the closing delimiter at
		 * position k, or at end of string
		 */
		ccc  = src.charAt(j);
		bux += this.explain(ccc, goab, this.K, goab.desc.meta['RegExend']);
		bux += '\n';
		j++;
	}

	// == Step4t == // collect trailing text after RegEx
	if (j < src.length) {
		bux += src.substr(j);
		bux += this.modifier(src.substr(j-1), goab); 
		j = src.length;
	}
// ToDo: following not yet used as modifiers above eats all
	kkk = '';
	if (j<src.length) { // there's something more ..
		kkk += this.explain('', goab, this.K, goab.desc.meta['trailing']);
	}
	for (j=j; j<src.length; j++) { bux += src[j]; }
	bux += kkk;

// ToDo: buggy garbage collector
/*
 * buggy garbage collector does not fully remove goab data
 * but following does not work either :-(
 * hence the description may be wrong for continous calls

var x = '';
	for (j in goab) {
x+='\n'+j+' # '+typeof goab[j];
		delobj(goab[j]);
		goab[j] = null;
	}
alert('goab:'+x);
x=''; for (j in goab) { x+='\n'+j+' # '+typeof goab[j]; } alert('.null:'+x);
*/
	goab= null;
	delete goab;
	this.rex.length      = 0;
	bbb = null;
	ccc = null;
	kkk = null;
// ToDo: following replace() is a contribution to use the result in a browser
//       it's a lazy quick&dirty aproach, need to replace & " and ' too
//       but works this way in reliable browsers
//       .replace() should go to EnDeREGUI.js
	return(bux.replace(/</g,'&lt;'));
  }; // parse

  this.match    = function(rex,src,lng) {
  //#? regular expression matcher
	var bux = 'matches:';
	var ccc = rex[0];
	var kkk = '';
	lazy: { // ToDo: quick&dirty sanatize
	if ((ccc == '/') || (ccc == '"') || (ccc == "'")) { rex = rex.substr(1,rex.length); }
	ccc = rex[rex.length-1];
	if ((ccc == '/') || (ccc == '"') || (ccc == "'")) { rex = rex.substr(0,rex.length-1); }
	}
	try       { kkk = src.match(new RegExp(rex,'')); }
	catch (e) { return(e); }
	if (kkk != null) {
		var j = 1;
		while ((ccc=kkk.pop()) != null) {
			bux += '\n#' + j + ': ' + ccc;
			j++;
		}
	}
	return(bux);
  }; // match

}; // EnDeRE
