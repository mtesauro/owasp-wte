/* ========================================================================= //
#?
#? NAME
#?      EnDeTS.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDe.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeTS.js"></SCRIPT>
#?
#? DESCRIPTION
#?      Functions for various timestamp conversions.
#?
#? SEE ALSO
#?      EnDe.js
#?
#? HACKER's INFO
#?
#? VERSION
#?      @(#) EnDeTS.js 3.1 12/06/04 21:51:41
#?
#? AUTHOR
#?      21-mai-12 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

// ========================================================================= //
// Timestamp functions                                                       //
// ========================================================================= //

if ((typeof EnDe)==='undefined') { EnDe = new function() {}; }

// ToDo: TS need to rename function parameters as describen in "Function Parameters"

EnDe.TS = new function() {

  this.SID      = '3.1';
  this.sid      = function() { return(EnDe.sid() + '.TS'); };

  this.trace    = false;

  // ======================================================================= //
  // internal/private functions                                              //
  // ======================================================================= //

  function __dbx(t,n) { if (EnDe.TS.trace===true) { return EnDe.dpr(t,n); } };

  // ======================================================================= //
  // global constants                                                        //
  // ======================================================================= //

  this.win32offset  = 116444736000000000;
  this.win64offset  = 621354801000000000;   // ToDo: is this correct?
  this.nanoseconds  = 10000000;
  this.milliseconds = 1000;
  this.offset       = this.nanoseconds / this.milliseconds;
  this.year1980     = 315529200;            // 1. Jan. 1980 (start at IBM PC)
  this.year2000     = 946681200;            // 1. Jan. 2000
  this.year1999     = this.year2000 - 1;    // last 4-byte signed integer
// ToDo: EnDe.CONST.INT.* does not work ??
  this.year2038     = 2147483647;           // signed 4-byte integer  // EnDe.CONST.INT.MAX31
											// starting at 1. Jan. 1970
  this.year2116     = 4294967296 + this.year1980;   // EnDe.CONST.INT.exp32 + this.year1980;

  // ======================================================================= //
  // local constants for simplification                                      //
  // ======================================================================= //

  var _ws       = '\s+';                            // white spaces
  var _sep      = '[/:\ \|\.\,\-]';                 // common separators
  var _1o2      = '([0-9]{1,2})';                   // 1 or 2 digits
  var _mm       = '(0?[1-9]|[1-5][0-9])';           // minute 1 .. 59
  var _hh       = '(0?[1-9]|1[0-9]|2[0-3])';        // hour 1 .. 23
  var _day      = '(0?[1-9]|[12][0-9]|3[01])';      // day 1 .. 31
  var _mon      = '(0?[1-9]|1[012])';               // month 1 .. 12
  var _y2       = '([0-9]{2})';                     // 2 digits
  var _y4       = '([0-9]{4})';                     // 4 digits

  // ======================================================================= //
  // global functions                                                        //
  // ======================================================================= //

  this.u2a  = function(ts) { return Math.floor((ts * this.offset) + this.win64offset); };
  //#? convert Unix to windows ASP.NET (64bit) timestamp; ts have to be in millisecond format

  this.w2a  = function(ts) { return Math.floor( ts - this.win32offset  + this.win64offset); };
  //#? convert windows TDateTime (32bit) to ASP.NET (64bit) timestamp

  this.d2a  = function(ts) { return ( '* DOS not implemented *'); };
  //#? convert DOS (32bit) to ASP.NET (64bit) timestamp
// ToDo: EnDe.TS.d2a() NOT YET IMPLEMENTED

  this.o2a  = function(ts) { return ( '* OLE not implemented *'); };
  //#? convert OLE to ASP.NET (64bit) timestamp
// ToDo:EnDe.TS.o2a() NOT YET IMPLEMENTED

  this.a2u  = function(ts) { return Math.floor((ts - this.win64offset) / this.offset); };
  //#? convert windows ASP.NET (64bit) to Unix timestamp; ts returned in millisecond format

  this.a2d  = function(ts) { return ( '* DOS not implemented *'); };
  //#? convert windows ASP.NET (64bit) to DOS (32bit) timestamp
// ToDo: not yet implemented

  this.a2o  = function(ts) { return ( '* OLE not implemented *'); };
  //#? convert windows ASP.NET (64bit) to OLE timestamp
// ToDo: not yet implemented

  this.a2w  = function(ts) { return Math.floor( ts - this.win64offset  + this.win32offset); };
  //#? convert windows ASP.NET (64bit) to TDateTime (32bit) timestamp

  this.w2u  = function(ts) { return Math.floor((ts - this.win32offset) / this.offset); };
  //#? convert windows TDateTime (32bit) to Unix timestamp; ts returned in millisecond format

  this.u2w  = function(ts) { return Math.floor((ts * this.offset) + this.win32offset); };
  //#? convert Unix to windows TDateTime (32bit) timestamp; ts have to be in millisecond format

  this.matchTime = function(_n1_,_n2_,year2digits,strict,now,src) {
  //#? try to match a time value
	if (src == undefined) { return undefined; }
	var yy = _y4;
	var mm = _1o2;
	var dd = _1o2;
	var hh = _1o2;
	var mi = _1o2;
	var ss = _1o2;
	if (year2digits) {// allow 2-digit years
		yy = _y2;
	}
	if (strict) {     // use strict matches
		mm = _mon;
		dd = _day;
		hh = _hh;
		mi = _mm;
		ss = _mm;
	}
	// define regex to match
	var sec   = '(?:' +_sep + mi + ')?';    // optional :ss
	var hm    = hh + _sep + ss +  sec;      // hh:mm with optional :ss
	// leading time needs to have : as separator
	var hms   = '^' + hh + ':'  + mi + '(?:\\:' + ss + ')?';
	var ymd   = '^' + yy + _sep + mm + _sep + dd + '$';
	var ymdhm = '^' + yy + _sep + mm + _sep + dd + _sep + '+'  +  hm + '$';
	var dmy   = '^' + dd + _sep + mm + _sep + yy + '$';
	var dmyhm = '^' + dd + _sep + mm + _sep + yy + _sep + '+'  +  hm + '$';
	var hmymd = hms + _sep + yy + _sep + mm + _sep + dd+ '$';
	var hmdmy = hms + _sep + dd + _sep + mm + _sep + yy + '$';
	    hms   = hms + '$';

	var kkk;
	//                  0  1  2  3  4  5  6  7  8
	//                  y  m  d  H  M  S ms format error
	var hor = new Array(-1,-1,-1,-1,-1,-1,-1,'','');
// ToDo:	if (src) { src   = EnDe.trim(src); }
	src   = EnDe.trim(src);

	// don't change the sequence of following tests!
	kkk = src.match(hms);       // hh:mm:ss, hh:mm
	if (kkk!==null) {
		hor[7] = 'hms';
		hor[3] = kkk[1];
		hor[4] = kkk[2];
		if (kkk[3] != '') { hor[5] = kkk[3]; }
		if (kkk.length) { kkk.length = 0; }; kkk = null;
		return hor;
	}
	kkk = src.match(hmymd);     // hh:mm:ss yyyy/mm/dd, hh:mm yyyy/mm/dd
	if (kkk!==null) {
		hor[7] = 'hmymd';
		hor[0] = kkk[4];
		hor[1] = kkk[5];
		hor[2] = kkk[6];
		hor[3] = kkk[1];
		hor[4] = kkk[2];
		if (kkk[3] != '') { hor[5] = kkk[3]; }
		if (kkk.length) { kkk.length = 0; }; kkk = null;
		return hor;
	}
	kkk = src.match(hmdmy);     // hh:mm:ss dd/mm/yyyy, hh:mm dd/mm/yyyy
	if (kkk!==null) {
		hor[7] = 'hmdmy';
		hor[0] = kkk[6];
		hor[1] = kkk[5];
		hor[2] = kkk[4];
		hor[3] = kkk[1];
		hor[4] = kkk[2];
		if (kkk[3] != '') { hor[5] = kkk[3]; }
		if (kkk.length) { kkk.length = 0; }; kkk = null;
		return hor;
	}
	kkk = src.match(ymd);       // yyyy/mm/dd
	if (kkk!==null) {
		hor[7] = 'ymd';
		hor[0] = kkk[1];
		hor[1] = kkk[2];
		hor[2] = kkk[3];
		if (kkk.length) { kkk.length = 0; }; kkk = null;
		return hor;
	}
	kkk = src.match(dmy);       // dd/mm/yyyy
	if (kkk!==null) {
		hor[7] = 'dmy';
		hor[0] = kkk[3];
		hor[1] = kkk[2];
		hor[2] = kkk[1];
		if (kkk.length) { kkk.length = 0; }; kkk = null;
		return hor;
	}
	kkk = src.match(ymdhm);     // yyyy/mm/dd hh:mm:ss, yyyy/mm/dd hh:mm
	if (kkk!==null) {
		hor[7] = 'ymdhm';
		hor[0] = kkk[1];
		hor[1] = kkk[2];
		hor[2] = kkk[3];
		hor[3] = kkk[4];
		hor[4] = kkk[5];
		if (kkk[6] != '') { hor[5] = kkk[6]; } // seconds also
		if (kkk.length) { kkk.length = 0; }; kkk = null;
		return hor;
	}
	kkk = src.match(dmyhm);     // dd/mm/yyyy hh:mm:ss, dd/mm/yyyy hh:mm
	if (kkk!==null) {
		hor[7] = 'dmyhm';
		hor[0] = kkk[3];
		hor[1] = kkk[2];
		hor[2] = kkk[1];
		hor[3] = kkk[4];
		hor[4] = kkk[5];
		if (kkk[6] != '') { hor[5] = kkk[6]; } // seconds also
		if (kkk.length) { kkk.length = 0; }; kkk = null;
		return hor;
	}
	if (kkk!==null) { if (kkk.length) { kkk.length = 0; }; kkk = null; }
	hor[8] = 'unknown format';
	return(undefined);
  }; // matchTime

  this.matchOffset = function(_n1_,_n2_,year2digits,strict,now,src) {
  //#? check if value is a timestamp offset
// ToDo: evtl. direkt in EnDeGUI.TS.dispatch('date2offset') implementieren ...
	var x   = 0;
	var ts = this.matchTime(_n1_,_n2_,year2digits,strict,now,src);
	if (ts == undefined) { return(undefined); }
	// Safari is happy with <0 check, mozilla needs ==undefined check too
	for (x in ts) { if ((ts[x] < 0) || (ts[x] == undefined) || (ts[x] == '')) { ts[x] = 0; } } // set 0 if unset
	ts[0] *= 31536000;      // 365 * 86400;
	ts[1] *= 2592000;       //  30 * 86400;
	ts[2] *= 86400;
	ts[3] *= 3600;
	ts[4] *= 60;
	ts[5] *= 1;
	//ts[6] /= 1000;
	return(ts[0] + ts[1] + ts[2] + ts[3] + ts[4] + ts[5] + ts[6]);
  }; // matchOffset

  this.matchDateTime = function(_n1_,_n2_,year2digits,strict,now,src) {
  //#? try to match a date/time value
	var x   = 0;
	var hor = new Date();
	var ts = this.matchTime(_n1_,_n2_,year2digits,strict,now,src);
	if (ts == undefined) { return(undefined); }
	if (ts[8]!=='') { return(ts[8]); }
	if (now == true) {
		if (ts[0] < 0) { ts[0] = hor.getYear() + 1900; }
		if (ts[1] < 0) { ts[1] = hor.getMonth() + 1; }
		if (ts[2] < 0) { ts[2] = hor.getDate(); }
		if (ts[3] < 0) { ts[3] = hor.getHours(); }
		if (ts[4] < 0) { ts[4] = hor.getMinutes(); }
		if (ts[5] < 0) { ts[5] = hor.getSeconds(); }
	} else {
		for (x in ts) { if ((ts[x] < 0) || (ts[x] == undefined) || (ts[x] == '')) { ts[x] = 0; } } // set 0
	}
	if (ts[1] > 0) { ts[1] -= 1; }
	hor.setYear(   ts[0]);
	hor.setMonth(  ts[1]);
	hor.setDate(   ts[2]);
	hor.setHours(  ts[3]);
	hor.setMinutes(ts[4]);
	hor.setSeconds(ts[5]);
	if (now == false) {
	}
	if (ts.length) { ts.length = 0; }; ts = null;
	return hor;
  }; // matchDateTime

  this.joinTime = function(hor) { return( hor.getHours()      + ':' +  hor.getMinutes()  + ':' +  hor.getSeconds()   ); };
  //#? return human readable time h:m:s
  this.joinEmit = function(hor) { return( hor.getSeconds()    + ':' +  hor.getMinutes()  + ':' +  hor.getHours()     ); };
  //#? return human readable time s:m:h
  this.joinDate = function(hor) { return((hor.getYear()+1900) + '/' + (hor.getMonth()+1) + '/' +  hor.getDate()      ); };
  //#? return human readable date Y/M/D
  this.joinEtad = function(hor) { return( hor.getDate()       + '/' + (hor.getMonth()+1) + '/' + (hor.getYear()+1900)); };
  //#? return human readable date D/M/Y

  this.guessInt = function(src) {
  //#? guess time ..
	var bux = '';
	var typ = '';
	var kkk = '';
	var hor = new Date();
	switch (src.length) {
	  case 6:       // full time
		    kkk = src.match('^' + _hh + _mm + _mm + '$');
		if (kkk != undefined) {
			hor.setHours(  kkk[1]);
			hor.setMinutes(kkk[2]);
			hor.setSeconds(kkk[3]);
			typ = 'full time (hh:mm:ss): ' + this.joinTime(hor);
			bux += '\n' + typ + '\n\t=>' + hor;
		}
		typ += '\n';
		    kkk = src.match('^' + _mm + _mm + _hh + '$');
		if (kkk != undefined) {
			hor.setHours(  kkk[3]);
			hor.setMinutes(kkk[2]);
			hor.setSeconds(kkk[1]);
			typ = 'full time (ss:mm:hh): ' + this.joinEmit(hor);
			bux += '\n' + typ + '\n\t=>' + hor;
		}
		typ += '\n';
		    kkk = src.match('^' + _y2 + _mon + _day + '$');
		if (kkk != undefined) {
			hor.setYear( kkk[1]);
			hor.setMonth(kkk[2]-1);
			hor.setDate( kkk[3]);
			typ = 'short date (yy/mm/dd): ' + this.joinDate(hor);
			bux += '\n' + typ + '\n\t=>' + hor;
		}
		typ += '\n';
		    kkk = src.match('^' + _y2 + _day + _mon + '$');
		if (kkk != undefined) {
			hor.setYear( kkk[1]);
			hor.setMonth(kkk[3]-1);
			hor.setDate( kkk[2]);
			typ = (hor.getYear()+1900) + '/' + hor.getDate() + '/' + (hor.getMonth()+1);
			typ = 'short date (yy/dd/mm): ' + typ;
			bux += '\n' + typ + '\n\t=>' + hor;
		}
		typ += '\n';
		    kkk = src.match('^' + _day + _mon + _y2 + '$');
		if (kkk != undefined) {
			hor.setYear( kkk[3]);
			hor.setMonth(kkk[2]-1);
			hor.setDate( kkk[1]);
			typ = 'short date (dd/mm/yy): ' + this.joinEtad(hor);
			bux += '\n' + typ + '\n\t=>' + hor;
		}
		break;
	  case 8:       // full date
		    kkk = src.match('^' + _y4 + _mon + _day + '$');
		if (kkk != undefined) {
			hor.setYear( kkk[1]);
			hor.setMonth(kkk[2]-1);
			hor.setDate( kkk[3]);
			typ = 'full date (yyyy/mm/dd): ' + this.joinDate(hor);
			bux += '\n' + typ + '\n\t=>' + hor;
		}
		typ += '\n';
		    kkk = src.match('^' + _y4 + _day + _mon + '$');
		if (kkk != undefined) {
			hor.setYear( kkk[1]);
			hor.setMonth(kkk[3]-1);
			hor.setDate( kkk[2]);
			typ = (hor.getYear()+1900) + '/' + hor.getDate() + '/' + (hor.getMonth()+1);
			typ = 'full date (yyyy/dd/mm): ' + typ;
			bux += '\n' + typ + '\n\t=>' + hor;
		}
		typ += '\n';
		    kkk = src.match('^' + _day + _mon + _y4 + '$');
		if (kkk != undefined) {
			hor.setYear( kkk[3]);
			hor.setMonth(kkk[2]-1);
			hor.setDate( kkk[1]);
			typ = 'full date (dd/mm/yyyy): ' + this.joinEtad(hor);
			bux += '\n' + typ + '\n\t=>' + hor;
		}
		break;
	  case 9:       // timestamp in seconds < 9-sep-2001
	  case 10:      // timestamp in seconds
		hor.setTime(src*1000);
		typ = 'common 9- or 10-digit timestamp in seconds';
		break;
	  case 12:      // timestamp in miliseconds < 9-sep-2001
	  case 13:      // timestamp in miliseconds
		hor.setTime(src);
		typ = 'common 12- or 13-digit timestamp in miliseconds';
		bux += '\n' + typ + '\n\t=>' + hor;
		break;
	  case 14:      // full date/time in seconds
		    kkk = src.match('^' + _y4 + _mon + _day + _hh + _mm + _mm + '$');
		if (kkk != undefined) {
			hor.setYear( kkk[1]);
			hor.setMonth(kkk[2]-1);
			hor.setDate( kkk[3]);
			hor.setHours(kkk[4]);
			hor.setMinutes(kkk[5]);
			hor.setSeconds(kkk[6]);
			typ = 'full date/time (yyyy/mm/dd hh:mm:ss): ' + this.joinDate(hor) + ' ' + this.joinTime(hor);
			bux += '\n' + typ + '\n\t=>' + hor;
		}
		typ += '\n';
		    kkk = src.match('^' + _mm + _mm + _hh + _day + _mon + _y4 + '$');
		if (kkk != undefined) {
			hor.setYear( kkk[6]);
			hor.setMonth(kkk[5]-1);
			hor.setDate( kkk[4]);
			hor.setHours(kkk[3]);
			hor.setMinutes(kkk[2]);
			hor.setSeconds(kkk[1]);
			typ = 'full date/time (ss:mm:hh dd/mm/yyyy): ' + this.joinEmit(hor) + ' ' + this.joinEtad(hor);
			bux += '\n' + typ + '\n\t=>' + hor;
		}
		break;
	  default:
		// yY  strict now
		bux += '\n' + 'common automatched timestamp in seconds' + '\n\t=>' + this.matchDateTime('all','',false,true,false,src.toString());
		break;
	}
	if (hor != undefined) { if (hor.length) { hor.length = 0; }; hor = null; }
	if (kkk != undefined) { if (kkk.length) { kkk.length = 0; }; kkk = null; }
	return bux;
  }; // guessInt

  this.guessOffset= function(src) {
  //#? guess time offset
	/*
	year = Math.floor(src  / 31536000);      // 365 * 86400;
	src  = src     - (year * 31536000);
	mons = Math.floor(src  / 2592000);       //  30 * 86400;
	src  = src     - (mons * 2592000);
	*/
	days = Math.floor(src  / 86400);
	src  = src     - (days * 86400);
	hour = Math.floor(src  / 3600);
	src  = src     - (hour * 3600);
	mins = Math.floor(src  / 60);
	secs = src     - (mins * 60);
	return(days + ' days, ' + hour + ' hours, ' + mins + ' minutes, ' + secs + ' seconds');
  }; // guessOffset

  this.guess    = function(src) {
  //#? guess date/time ..
	var bux = '';
	var asint  = 0;
	if (src.match('^[0-9]+$')!==undefined) {        // integer ===========
		var ts  = new Date();
		bux += '\n*Timestamp* '+src+'\n';
		bux += EnDe.CONST.___;
		ts.setTime(Math.floor(src * 1000));
		bux += '\nseconds\n\t=>' + ts;
		ts.setTime(src);
		bux += '\nmiliseconds\n\t=>' + ts;
		bux += '\n';
		bux += '\n*Integer* '+src+'\n';
		bux += EnDe.CONST.___;
		bux += this.guessInt(src);
		bux += '\nas offset in seconds\n\t=>' + this.guessOffset(src);
		asint= Math.floor(src / 1000);
		bux += '\nas offset in miliseconds\n\t=>' + this.guessOffset(asint);
		bux += '\n';
	}
	if (src.match('^[0-9a-fA-F]+$')!==undefined) {  // hex ===============
		bux += '\n*Hex* '+src+'\n';
		bux += EnDe.CONST.___;
		asint   = parseInt(('0x'+src), 16);
		bux += '\n\t' + src + ' => ' + asint;
		bux += this.guessInt(asint.toString());
		bux += '\nas offset in seconds\n\t=>' + this.guessOffset(asint.toString());
		asint= Math.floor(asint / 1000);
		bux += '\nas offset in miliseconds\n\t=>' + this.guessOffset(asint.toString());
	} else {                                        // anything else =====
		//                                   yY  strict now
		bux += '\n' + 'common automatched timestamp' + '\n\t=>' + this.matchDateTime('all','',false,true,false,src);
	}
	return bux;
  }; // guess

}; // EnDe.TS
