/* ========================================================================= //
#? NAME
#?      sha.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDe.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="sha.js"></SCRIPT>
#?
#? DESCRIPTION
#?      A JavaScript implementation of the Secure Hash Standard.
#?
#? VERSION
#?      @(#) sha.js 3.6 12/06/03 12:22:20
#?
#? AUTHOR
#?      Some parts of the code are derivied from
#?          http://pajhome.org.uk/crypt/sha, Copyright Paul Johnston 2000 - 2002
#?          http://anmar.eu.org/projects/jssha2/files/sha2.js,  Copyright Angel Marin 2003
#?      07-apr-07 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

if (typeof(EnDe)==='undefined') { EnDe = new function() {}; }

EnDe.SHA = new function() {
  this.SID      = '3.6';
  this.sid      = function() { return('@(#) sha.js 3.6 12/06/03 12:22:20 EnDe.SHA'); };

  // ======================================================================= //
  // global variables                                                        //
  // ======================================================================= //
  /*
   * Configurable variables. You may need to tweak these to be compatible with
   * the server-side, but the defaults work in most cases.
   */
  this.hexcase  = 0; /* hex output format. 0 - lowercase; 1 - uppercase      */
  this.b64pad   = "";/* base-64 pad character. "=" for strict RFC compliance */
  this.bits     = 8; /* bits per input character. 8 - ASCII; 16 - Unicode    */

  // ======================================================================= //
  // general utility functions for SHA1 and SHA2                             //
  // ======================================================================= //

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
  this.safe_add = function(x, y) {
	var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	return (msw << 16) | (lsw & 0xFFFF);
  };

/*
 * Bitwise rotate a 32-bit number to the left.
 */
  this.rol = function(num, cnt) {
	return (num << cnt) | (num >>> (32 - cnt));
  };

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
  this.str2binb = function(str) {
	var bin = Array();
	var mask = (1 << EnDe.SHA.bits) - 1;
	for (var i=0; i<str.length * EnDe.SHA.bits; i+=EnDe.SHA.bits) {
		bin[i>>5] |= (str.charCodeAt(i / EnDe.SHA.bits) & mask) << (32 - EnDe.SHA.bits - i%32);
	}
	return bin;
  };

/*
 * Convert an array of big-endian words to a string
 */
  this.binb2str = function(bin) {
	var str = "";
	var mask = (1 << EnDe.SHA.bits) - 1;
	for (var i=0; i<bin.length * 32; i+=EnDe.SHA.bits) {
		str += String.fromCharCode((bin[i>>5] >>> (32 - EnDe.SHA.bits - i%32)) & mask);
	}
	return str;
  };

/*
 * Convert an array of big-endian words to a hex string.
 */
  this.binb2hex = function(binarray) {
	var tab = EnDe.SHA.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	var str = "";
	for (var i=0; i<(binarray.length * 4); i++) {
		str += tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
		       tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
	}
	return str;
  };

/*
 * Convert an array of big-endian words to a base-64 string
 */
  this.binb2b64 = function(binarray) {
	var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var str = "";
	for (var i=0; i<(binarray.length * 4); i += 3) {
		var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                    | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                    |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
		for (var j=0; j<4; j++) {
			if (i * 8 + j * 6 > binarray.length * 32) { str += EnDe.SHA.b64pad; }
			else                                      { str += tab.charAt((triplet >> 6*(3-j)) & 0x3F); }
		}
	}
	return str;
  };

  // ======================================================================= //
  // SHA1 functions                                                          //
  // ======================================================================= //

  this.sha1     = new function() {
	this.sid    = function() { return(EnDe.SHA.sid() + '.sha1'); };

	/*
	 * perform the appropriate triplet combination function for the current iteration
	 */
	this.ft = function(t, b, c, d) {
		if (t<20) { return (b & c) | ((~b) & d); }
		if (t<40) { return (b ^ c ^ d); }
		if (t<60) { return (b & c) | (b & d) | (c & d); }
		return b ^ c ^ d;
	};

	/*
	 * determine the appropriate additive constant for the current iteration
	 */
	this.kt = function(t) {
		return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
		       (t < 60) ? -1894007588 : -899497514;
	};

	/*
	 * Calculate the SHA-1 of an array of big-endian words, and a bit length
	 */
	this.core = function(x,len) {
		/* append padding */
		x[len >> 5] |= 0x80 << (24 - len % 32);
		x[((len + 64 >> 9) << 4) + 15] = len;
		var w = Array(80);
		var a =  1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d =  271733878;
		var e = -1009589776;
		for (var i=0; i<x.length; i+=16) {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			var olde = e;
			for (var j=0; j<80; j++) {
				if (j<16) { w[j] = x[i+j]; }
				else      { w[j] = EnDe.SHA.rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1); }
				var t = EnDe.SHA.safe_add(EnDe.SHA.safe_add(EnDe.SHA.rol(a, 5), EnDe.SHA.sha1.ft(j, b, c, d)),
				                 EnDe.SHA.safe_add(EnDe.SHA.safe_add(e, w[j]), EnDe.SHA.sha1.kt(j)));
				e = d;
				d = c;
				c = EnDe.SHA.rol(b, 30);
				b = a;
				a = t;
			}
			a = EnDe.SHA.safe_add(a, olda);
			b = EnDe.SHA.safe_add(b, oldb);
			c = EnDe.SHA.safe_add(c, oldc);
			d = EnDe.SHA.safe_add(d, oldd);
			e = EnDe.SHA.safe_add(e, olde);
		}
		return Array(a, b, c, d, e);
	};

	// ===================================================================== //
	// public SHA1 functions                                                 //
	// ===================================================================== //

	this.test   = function() {return this.hex("abc").toLowerCase() == "a9993e364706816aba3e25717850c26c9cd0d89d"; };
	this.hex    = function(s){return EnDe.SHA.binb2hex(EnDe.SHA.sha1.core(EnDe.SHA.str2binb(s), s.length * EnDe.SHA.bits));};
	this.b64    = function(s){return EnDe.SHA.binb2b64(EnDe.SHA.sha1.core(EnDe.SHA.str2binb(s), s.length * EnDe.SHA.bits));};
	this.str    = function(s){return EnDe.SHA.binb2str(EnDe.SHA.sha1.core(EnDe.SHA.str2binb(s), s.length * EnDe.SHA.bits));};

	this.hmac   = new function() {
		this.sid= function()      { return(EnDe.SHA.sha1.sid() + '.hmac'); };
		this.hex= function(key, s){ return EnDe.SHA.binb2hex(EnDe.SHA.sha1.hmac.core(key, s));};
		this.b64= function(key, s){ return EnDe.SHA.binb2b64(EnDe.SHA.sha1.hmac.core(key, s));};
		this.str= function(key, s){ return EnDe.SHA.binb2str(EnDe.SHA.sha1.hmac.core(key, s));};

		/*
		 * Calculate the HMAC-SHA1 of a key and some data
		 */
		this.core = function(key, data) {
			var bkey = EnDe.SHA.str2binb(key);
			if (bkey.length>16) {
				bkey = EnDe.SHA.sha1.core(bkey, key.length * EnDe.SHA.bits);
			}
			var ipad = Array(16), opad = Array(16);
			for (var i=0; i<16; i++) {
				ipad[i] = bkey[i] ^ 0x36363636;
				opad[i] = bkey[i] ^ 0x5C5C5C5C;
			}
			var hash = EnDe.SHA.sha1.core(ipad.concat(EnDe.SHA.str2binb(data)), 512 + data.length * EnDe.SHA.bits);
			return EnDe.SHA.sha1.core(opad.concat(hash), 512 + 160);
		};
	}; // hmac

  }; // EnDe.SHA.sha1

  // ======================================================================= //
  // SHA2 functions                                                          //
  // ======================================================================= //

  this.sha2     = new function() {
	this.sid    = function()      { return(EnDe.SHA.sid() + '.sha2'); };

	this.S      = function(x,n)   {return ((x >>> n ) | (x << (32 - n)));   };
	this.R      = function(x,n)   {return ( x >>> n );                      };
	this.Ch     = function(x,y,z) {return ((x & y)  ^ ((~x)    & z));       };
	this.Maj    = function(x,y,z) {return ((x & y)  ^ (x & z)  ^ (y & z));  };
	this.sigma0256  = function(x) {return (this.S(x, 2)  ^ this.S(x, 13) ^ this.S(x, 22)); };
	this.sigma1256  = function(x) {return (this.S(x, 6)  ^ this.S(x, 11) ^ this.S(x, 25)); };
	this.gamma0256  = function(x) {return (this.S(x, 7)  ^ this.S(x, 18) ^ this.R(x, 3));  };
	this.gamma1256  = function(x) {return (this.S(x, 17) ^ this.S(x, 19) ^ this.R(x, 10)); };
	this.sigma0512  = function(x) {return (this.S(x, 28) ^ this.S(x, 34) ^ this.S(x, 39)); };
	this.sigma1512  = function(x) {return (this.S(x, 14) ^ this.S(x, 18) ^ this.S(x, 41)); };
	this.gamma0512  = function(x) {return (this.S(x, 1)  ^ this.S(x, 8)  ^ this.R(x, 7));  };
	this.gamma1512  = function(x) {return (this.S(x, 19) ^ this.S(x, 61) ^ this.R(x, 6));  };
	this.core256    = function(m, l) {
		/* append padding */
		m[l >> 5] |= 0x80 << (24 - l % 32);
		m[((l + 64 >> 9) << 4) + 15] = l;
		var K = new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);
		var H = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
		var W = new Array(64);
		var a, b, c, d, e, f, g, h, i, j;
		var T1, T2;
		for ( i=0; i<m.length; i+=16 ) {
			a = H[0];
			b = H[1];
			c = H[2];
			d = H[3];
			e = H[4];
			f = H[5];
			g = H[6];
			h = H[7];
			for ( j=0; j<64; j++) {
				if (j<16) { W[j] = m[j+i]; }
				else      { W[j] = EnDe.SHA.safe_add(EnDe.SHA.safe_add(EnDe.SHA.safe_add(this.gamma1256(W[j - 2]), W[j - 7]), this.gamma0256(W[j - 15])), W[j - 16]); }
				T1 = EnDe.SHA.safe_add(EnDe.SHA.safe_add(EnDe.SHA.safe_add(EnDe.SHA.safe_add(h, this.sigma1256(e)), this.Ch(e, f, g)), K[j]), W[j]);
				T2 = EnDe.SHA.safe_add(this.sigma0256(a), this.Maj(a, b, c));
				h = g;
				g = f;
				f = e;
				e = EnDe.SHA.safe_add(d, T1);
				d = c;
				c = b;
				b = a;
				a = EnDe.SHA.safe_add(T1, T2);
			}
			H[0] = EnDe.SHA.safe_add(a, H[0]);
			H[1] = EnDe.SHA.safe_add(b, H[1]);
			H[2] = EnDe.SHA.safe_add(c, H[2]);
			H[3] = EnDe.SHA.safe_add(d, H[3]);
			H[4] = EnDe.SHA.safe_add(e, H[4]);
			H[5] = EnDe.SHA.safe_add(f, H[5]);
			H[6] = EnDe.SHA.safe_add(g, H[6]);
			H[7] = EnDe.SHA.safe_add(h, H[7]);
		}
		return H;
	};

	this.core512    = function(m, l) {
		var K = new Array(0x428a2f98d728ae22, 0x7137449123ef65cd, 0xb5c0fbcfec4d3b2f, 0xe9b5dba58189dbbc, 0x3956c25bf348b538, 0x59f111f1b605d019, 0x923f82a4af194f9b, 0xab1c5ed5da6d8118, 0xd807aa98a3030242, 0x12835b0145706fbe, 0x243185be4ee4b28c, 0x550c7dc3d5ffb4e2, 0x72be5d74f27b896f, 0x80deb1fe3b1696b1, 0x9bdc06a725c71235, 0xc19bf174cf692694, 0xe49b69c19ef14ad2, 0xefbe4786384f25e3, 0x0fc19dc68b8cd5b5, 0x240ca1cc77ac9c65, 0x2de92c6f592b0275, 0x4a7484aa6ea6e483, 0x5cb0a9dcbd41fbd4, 0x76f988da831153b5, 0x983e5152ee66dfab, 0xa831c66d2db43210, 0xb00327c898fb213f, 0xbf597fc7beef0ee4, 0xc6e00bf33da88fc2, 0xd5a79147930aa725, 0x06ca6351e003826f, 0x142929670a0e6e70, 0x27b70a8546d22ffc, 0x2e1b21385c26c926, 0x4d2c6dfc5ac42aed, 0x53380d139d95b3df, 0x650a73548baf63de, 0x766a0abb3c77b2a8, 0x81c2c92e47edaee6, 0x92722c851482353b, 0xa2bfe8a14cf10364, 0xa81a664bbc423001, 0xc24b8b70d0f89791, 0xc76c51a30654be30, 0xd192e819d6ef5218, 0xd69906245565a910, 0xf40e35855771202a, 0x106aa07032bbd1b8, 0x19a4c116b8d2d0c8, 0x1e376c085141ab53, 0x2748774cdf8eeb99, 0x34b0bcb5e19b48a8, 0x391c0cb3c5c95a63, 0x4ed8aa4ae3418acb, 0x5b9cca4f7763e373, 0x682e6ff3d6b2b8a3, 0x748f82ee5defb2fc, 0x78a5636f43172f60, 0x84c87814a1f0ab72, 0x8cc702081a6439ec, 0x90befffa23631e28, 0xa4506cebde82bde9, 0xbef9a3f7b2c67915, 0xc67178f2e372532b, 0xca273eceea26619c, 0xd186b8c721c0c207, 0xeada7dd6cde0eb1e, 0xf57d4f7fee6ed178, 0x06f067aa72176fba, 0x0a637dc5a2c898a6, 0x113f9804bef90dae, 0x1b710b35131c471b, 0x28db77f523047d84, 0x32caab7b40c72493, 0x3c9ebe0a15c9bebc, 0x431d67c49c100d4c, 0x4cc5d4becb3e42b6, 0x597f299cfc657e2a, 0x5fcb6fab3ad6faec, 0x6c44198c4a475817);
		var H = new Array(0x6a09e667f3bcc908, 0xbb67ae8584caa73b, 0x3c6ef372fe94f82b, 0xa54ff53a5f1d36f1, 0x510e527fade682d1, 0x9b05688c2b3e6c1f, 0x1f83d9abfb41bd6b, 0x5be0cd19137e2179);
		var W = new Array(80);
		var a, b, c, d, e, f, g, h, i, j;
		var T1, T2;
// ToDo: to be completed ...
		return H;
	};

	// ===================================================================== //
	// public SHA2 functions                                                 //
	// ===================================================================== //

	this.test256= function() {return this.hex("abc").toLowerCase() == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"; };
	this.test   = function() {return this.test256();}; // ToDo: as long as there is no test512()
	this.hex    = function(s){return EnDe.SHA.binb2hex(EnDe.SHA.sha2.core256(EnDe.SHA.str2binb(s), s.length * EnDe.SHA.bits));};
	this.b64    = function(s){return EnDe.SHA.binb2b64(EnDe.SHA.sha2.core256(EnDe.SHA.str2binb(s), s.length * EnDe.SHA.bits));};
	this.str    = function(s){return EnDe.SHA.binb2str(EnDe.SHA.sha2.core256(EnDe.SHA.str2binb(s), s.length * EnDe.SHA.bits));};

// ToDo: 
/*
 *	this.hmac   = new function() {
 *		this.sid= function() { return(EnDe.SHA.sha2.sid() + '.hmac'); };
 *		this.hex= function(key, s){ return EnDe.SHA.binb2hex(EnDe.SHA.sha2.hmac.core(key, s));};
 *		this.b64= function(key, s){ return EnDe.SHA.binb2b64(EnDe.SHA.sha2.hmac.core(key, s));};
 *		this.str= function(key, s){ return EnDe.SHA.binb2str(EnDe.SHA.sha2.hmac.core(key, s));};
 *	}; // hmac
*/
  }; // EnDe.SHA.sha2

}; // EnDe.SHA
