/* ========================================================================= //
#?
#? NAME
#?      EnDeIP.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDe.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeIP.js"></SCRIPT>
#?
#? DESCRIPTION
#?      Functions for various IP conversions.
#?
#? SEE ALSO
#?      EnDe.js
#?
#? HACKER's INFO
#?
#? VERSION
#?      @(#) EnDeIP.js 3.1 12/06/04 21:21:51
#?
#? AUTHOR
#?      21-mai-12 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

// ========================================================================= //
// IP conversion functions                                                   //
// ========================================================================= //

if ((typeof EnDe)==='undefined') { EnDe = new function() {}; }

EnDe.IP = new function() {

  this.SID      = '3.1';
  this.sid      = function() { return(EnDe.sid() + '.IP'); };

  this.trace    = false;

  // ======================================================================= //
  // internal/private functions                                              //
  // ======================================================================= //

  function __dbx(t,n) { if (EnDe.IP.trace===true) { return EnDe.dpr(t,n); } };

  // ======================================================================= //
  // global functions                                                        //
  // ======================================================================= //

  this.ip2num   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert dotted quad IP address to integer
	//#dbx __dbx('.ip2num: '+src);
	var bux = 0;
	var n   = src.split(delimiter);
	var i   = 0;
	if (n[0]==='') { return bux; }  // defensive programming ..
	for (i=3; i>=0; i--) {
// ToDo: following check should depend on mode
/*
		if (n[(3-i)]>255) {
			bux += ((n[(3-i)]-255)*(Math.pow(256,(i+1))));
			//*(Math.pow(256,i)));
		}
*/
		bux += (n[(3-i)]*(Math.pow(256,i)));
	}
	return bux;
  }; // ip2num

  this.ip2big   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert dotted quad IP address to long integer
	//#dbx __dbx('.ip2big: '+src);
	var bux = this.ip2num(0,0,0,src,0,0,delimiter);
	if (bux!=='') { bux += EnDe.CONST.INT.lng; }  // defensive programming ..
	return bux;
  }; // ip2big

  this.ip2xeh   = function(_n1_,_n2_,uppercase,src,prefix,_n6_,delimiter) {
  //#? convert dotted quad IP address to hex value
	//#dbx __dbx('.ip2xeh: '+src);
	var bux = this.ip2num(_n1_,_n2_,uppercase,src,prefix,_n6_,delimiter);
	if (bux==='')    {      return bux; }  // defensive programming ..
	bux = parseInt(bux, 10).toString(16);
	if (uppercase===true) { bux = bux.toUpperCase(); }
	if (prefix!=='') {      bux = prefix + bux; }
	return bux;
  }; // ip2xeh

  this.ip2hex   = function(type,mode,uppercase,src,prefix,_n6_,delimiter) {
  //#? convert dotted quad IP address to dotted hex
  //#type? url: convert dotted quad IP address to dotted url-encoded hex
  //#type? hex: convert dotted quad IP address to dotted hex
  //#type? xeh: convert dotted quad IP address to hex value (wrapper for .IP.ip2xeh())
	//#dbx __dbx('.ip2hex: '+src);
	var bux = '';
	var n   = src.split('.');
	if (n[0] == '') { return bux; }  // defensive programming ..
	var sig = '';
	var i   = 0;
	switch (type) {
	  case 'xeh': return this.ip2xeh(type,mode,uppercase,src,prefix,'',delimiter);  break; // dummy wrapper
	  case 'hex': sig = '';  break;
	  case 'url': sig = '%'; break;
	}
	for (i=0; i<=3; i++) {
		if ((n[i]===null) || (n[i]===undefined)) {    // defensive programming ..
			/* loop fails if less than 4 elements in Safari, iCab, WebKit */
			break;
			//n.push('0'); // ToDo: causes some NaN in GUI for Safari, iCab, Webkit
		}
		n[i] = n[i].match('^0*(.*)')[1]; // strip leading 0 'cause some browsers treat them as octal
		if (n[i]==='') { n[i] = '0'; }   // but keep 0 itself
		n[i] = parseInt(n[i], 10).toString(16);
		if (uppercase===true) {
			n[i] = n[i].toUpperCase();
		}
			bux += sig;
		if (n[i].length===1) {
			bux += '0';
		}
			bux += n[i];
		if (i<3) {
			bux += delimiter;
		}
	}
	if (prefix!=='') { bux = prefix + bux; }
	n = null;
	return bux;
  }; // ip2hex

  this.ip2oct   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert dotted quad IP address to dotted octal
	//#dbx __dbx('.ip2oct: '+src);
	var bux = '';
	var n   = src.split('.');
	var i   = 0, k = 0;
	if (n[0]==='') { return bux; }  // defensive programming ..
	for (i=0; i<=3; i++) {
		n[i] = parseInt(n[i], 10).toString(8);
		for (k=n[i].length; k<=3; k++ ) {
			bux += '0';
		}
		bux += n[i];
		if (i<3) { bux += delimiter; }
	}
	return bux;
  }; // ip2oct

  this.ip2bin   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert dotted quad IP address to dotted binary
	//#dbx __dbx('.ip2bin: '+src);
	var bux = '';
	var n   = src.split('.');
	var i   = 0, k = 0;
	if (n[0]==='') { return bux; }  // defensive programming ..
	for (i=0; i<=3; i++) {
		n[i] = parseInt(n[i], 10).toString(2);
		for (k=n[i].length; k<8; k++ ) {
			bux += '0';
		}
		bux += n[i];
		if (i<3) { bux += delimiter; }
	}
	return bux;
  }; // ip2bin

  this.ip2bit   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert dotted quad IP address to plain binary
	return parseInt(this.ip2num(_n1_,_n2_,_n3_,src,_n5_,_n6_,'.'), 10).toString(2);
  }; // ip2bit

  this.ip2ip6   = function(type,mode,uppercase,src,prefix,_n6_,delimiter) {
  //#? convert dotted quad IP address to dotted IPv6
	//#dbx __dbx('.ip2ip6: '+src);
	var bux = '';
	var kkk = this.ip2hex('hex',mode,uppercase,src,'','',''); // ToDo: input delimiter
	if (kkk.length <= 0) { return bux; }  // defensive programming ..
	var ccc = 1;
	var dot = 0;
	var i = kkk.length;
	while (i>0) {
		i--;
		bux = kkk[i] + bux;
		kkk[i] = null;
		if ((ccc%4)===0) { bux = delimiter + bux; dot++; }
		ccc++;
	}
	while (dot<2) { bux = delimiter + bux; dot++; }
	if (prefix!=='') { bux = prefix + bux; }
	kkk = null;
	return bux;
  }; // ip2ip6

  this.ip62ip   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert dotted IPv6 to dotted quad IP address
	return this.xeh2ip(_n1_,_n2_,_n3_,src.replace(/:/g,''),_n5_,_n6_,delimiter);
  }; // ip62ip

  this.bit2ip   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert binary address to dotted quad IP address
	//#dbx __dbx('.bit2ip: '+src);
	return this.num2ip(_n1_,_n2_,_n3_,parseInt(src, 2),_n5_,_n6_,delimiter);
  }; // bit2ip

  this.num2ip   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert integer address to dotted quad IP address
	//#dbx __dbx('.num2ip: '+src);
	var bux = '';
	var i   = 0;
	src = EnDe.z2n(src);
	for (i=3; i>=0; i--) {
		bux += parseInt(Math.floor(src/(Math.pow(256,i))), 10);
		// Math.floor() necessary cause of exponental numbers, i.e. 16/16777216
		src %= (Math.pow(256,i));
		if (i>0) { bux += delimiter; }
	}
	return bux;
  }; // num2ip

  this.big2ip   = function(type,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert long integer address to dotted quad IP address
  //#type? big2ip: convert long (64-bit) integer address to dotted quad IP address
  //#type? low2ip: convert long (32-bit) integer address to dotted quad IP address
	//#dbx __dbx('.big2ip: '+src);
// ToDo: handle negative values ...
	if ((type!=='big2ip') || (src < EnDe.CONST.INT.lng)) {
		return(this.num2ip(0,0,0,(src),0,0,delimiter));
	} else {
		return(this.num2ip(0,0,0,(src - EnDe.CONST.INT.lng),0,0,delimiter));
	}
	return '';
  }; // big2ip

  this.arr2ip   = function(base,arr,arrsize,delimiter) {
  //#? build dotted quad IP from given array; internal function, should not be used in API
	// should check for 4 items, but without check works vor IPv6 too ;-)
	//#dbx __dbx('.arr2ip: '+src);
	var bux = '';
	var i   = 0, k = 0;
	while (i<arr.length) {
		if (i>0) { bux += delimiter; }
		bux += parseInt(arr[i], base);
		i++;
	}
	// add leading 0 if array too small
	for (k=arr.length; k<arrsize; k++ ) {
		bux = '0' + delimiter + bux;
	}
	return bux;
  }; // arr2ip

  this.xeh2ip   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert hex value to dotted quad IP address
	//#dbx __dbx('.xeh2ip: '+src);
	var bux = parseInt(src, 16).toString(10);
	    bux = this.num2ip(_n1_,_n2_,_n3_,bux,_n5_,_n6_,delimiter);
	return bux;
  }; // xeh2ip

  this.hex2ip   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert Hex address to dotted quad IP address
	//#dbx __dbx('.hex2ip: '+src);
	var arr = [];
	var kkk = '';
	var i   = 0;
	arr = src.split(delimiter);
	if (arr.length > 1) {    // try: DxxDxxDxxDxx  (where D is delimiter)
		for (i=0; i<arr.length; i++) {
			// ToDo: following allows even mixed codings, should depend on mode strict
			if (arr[i].match(/^%/)!==null) {
				arr[i] = arr[i].replace(/^%/,'');
			} else
			if (arr[i].match(/^x/)!==null) {
				arr[i] = arr[i].replace(/^x/,'');
			} else
			if (arr[i].match(/^0x/)!==null) {
				arr[i] = arr[i].replace(/^0x/,'');
			}
		}
	}
// ToDo: need to take care if there is a initial prefix  (or part of delimiter)
	kkk = kkk.substring(1,src.length); // strip left most character
	if (arr.length <= 1) {  // try: %XX%XX%XX%XX
		arr = kkk.split('%');
	}
	if (arr.length <= 1) {  // try: xXXxXXxXXxXX
		arr = kkk.split('x');
	}
	kkk = kkk.substring(1,src.length); // strip 2'nd left most character
	if (arr.length <= 1) {  // try: %XX.%XX.%XX.%XX
		arr = kkk.split('.%');
	}
	if (arr.length <= 1) {  // try: xXX.xXX.xXX.xXX
		arr = kkk.split('.x');
	}
	if (arr.length <= 1) {  // try: 0xXX.0xXX.0xXX.0xXX
		kkk = kkk.substring(1,kkk.length);
		arr = kkk.split('.0x');
	}
	if (arr.length <= 1) {
		// try: src as hex value as is
		arr = src;
		// ToDo: is this the same as xeh2ip?
	}
	// following could not simply be distinguished from previous
	//if (arr.length <= 1) {
	//	// try: XXxxXXxx (simple hex)
	//	kkk = src;
	//	while (kkk.length > 0) {
	//		arr[i] = kkk.substring(0,1);
	//		i++;
	//		kkk = kkk.substring(2,kkk.length);
	//	}
	//}
	kkk = null;
	return(this.arr2ip(16,arr,4,'.'));
// ToDo: make output delimiter configurable
  }; // hex2ip

  this.oct2ip   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert octal address to dotted quad IP address
	//#dbx __dbx('.oct2ip: '+src);
	var arr = [];
	    arr = src.split(delimiter);
	return(this.arr2ip(8,arr,4,'.'));
// ToDo: make output delimiter configurable
  }; // oct2ip

  this.bin2ip   = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? convert binary address to dotted quad IP address
	//#dbx __dbx('.bin2ip: '+src);
	var arr = [];
	    arr = src.split(delimiter);
	return(this.arr2ip(2,arr,4,'.'));
// ToDo: make output delimiter configurable
  }; // bin2ip

  this.reverse  = function(_n1_,_n2_,_n3_,src,_n5_,_n6_,delimiter) {
  //#? reverse dotted IP address
	//#dbx __dbx('.reverse: '+src);
	var bux = src.split(delimiter);
	return(bux.reverse().join(delimiter));
// ToDo: make output delimiter configurable
  }; // reverse

  this.ipv6     = new function() {
	this.sid    = function() { return(EnDe.IP.sid() + '.v6'); };
	this.ip2num = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
	//#? **not yet implemented**
	//#dbx __dbx('.ipv6.ip2num: '+src);
// ToDo: 129.416.258.9, 217.746.272.94 217.115.281.34.    ist IPv6 dezimal dargestellt
	return 'ENDe.IP.ipv6.ip2num: NOT YET IMPLEMENTED';
	};
  }; // EnDe.IP.ipv6

  this.dispatch = function(type,mode,uppercase,src,prefix,suffix,delimiter) {
  //#? dispatcher for IP functions
// ToDo: make input and output delimiter configurable
	__dbx('.IP.dispatch: '+type+'\t:uppercase='+uppercase+'\tprefix='+prefix+'\tsuffix='+suffix+'\tdelimiter='+delimiter);
	switch (type) {
	case 'ip2xeh'   : return this.ip2xeh('null', mode, uppercase, src,'0x','', '.'   ); break;
	case 'ip2hex'   : return this.ip2hex('hex',  mode, uppercase, src, '', '', '.'   ); break;
	case 'ip2oct'   : return this.ip2oct('null', mode, uppercase, src, '', '', '.'   ); break;
	case 'ip2bin'   : return this.ip2bin('null', mode, uppercase, src, '', '', '.'   ); break;
	case 'ip2bit'   : return this.ip2bit('null', mode, uppercase, src, '', '', '.'   ); break;
	case 'ip2url'   : return this.ip2hex('url',  mode, uppercase, src, '', '', '.'   ); break;
	case 'ip2num'   : return this.ip2num('null', mode, uppercase, src, '', '', '.'   ); break;
	case 'ip2big'   : return this.ip2big('null', mode, uppercase, src, '', '', '.'   ); break;
	case 'ip2ip6'   : return this.ip2ip6('null', mode, uppercase, src, '', '', ':'   ); break;
	case 'ip62ip'   : return this.ip62ip('null', mode, uppercase, src, '', '', '.'   ); break;
	case 'big2ip'   : return this.big2ip( type , mode, '',        src, '', '', '.'   ); break;
	case 'low2ip'   : return this.big2ip( type , mode, '',        src, '', '', '.'   ); break;
	case 'num2ip'   : return this.num2ip('null', mode, uppercase, src, '', '', '.'   ); break;
	case 'xeh2ip'   : return this.xeh2ip('null', mode, '',        src, '', '', '.'   ); break;
	case 'hex2ip'   : return this.hex2ip('null', mode, '',        src, '', '', '.'   ); break;
	case 'oct2ip'   : return this.oct2ip('null', mode, '',        src, '', '', '.'   ); break;
	case 'bin2ip'   : return this.bin2ip('null', mode, '',        src, '', '', '.'   ); break;
	case 'bit2ip'   : return this.bit2ip('null', mode, '',        src, '', '', '.'   ); break;
	case 'url2ip'   : return this.hex2ip('null', mode, '',        src, '', '', ''    ); break;
	case 'reverse'  : return this.reverse('null',mode, uppercase, src, '', '', '.'   ); break;
	case 'normal'   : return this.reverse('null',mode, uppercase, src, '', '', '.'   ); break; // dummy
	}
	return ''; // ToDo: internal error
  }; // dispatch

}; // EnDe.IP

