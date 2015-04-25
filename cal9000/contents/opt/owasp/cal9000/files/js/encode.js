/*
 * Handles all of the encoding and decoding functions for the application.
 *
 * This file is part of CAL9000 
 *
 * CAL9000 Web Application Security Testing Assistant, Version 2.0
 * Copyright (C) 2006 Christopher Loomis
 *
 * Distributed under the GNU General Public License
 *
 * CAL9000 is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 * 
 * CAL9000 is distributed in the hope that it will be useful, but WITHOUT 
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with 
 * CAL9000; if not, write to the Free Software Foundation, Inc., 51 Franklin 
 * Street, Fifth Floor, Boston, MA 02110-1301 USA
 *
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
 * DATA OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * See http://www.digilantesecurity.com/CAL9000/index.html for more info.
 * You may direct email inquiries to cal9000tool at mac.com
 *
 * Thanks to Ben Ramsey (http://md5.benramsey.com) for the MD5 server-side decode file.
 * Thanks to Mateusz Turcza (mturcza at tlen dot pl) for IE Selected Text Coordinates function.
 *
 */

/*
 * Main driver for encoding functions. Takes plaintext, encoding type, trailing character, delimiter
 *  as inputs. Determines which encoding function to use and returns encoded text.
 */
function encode() {  
	var encType    = '';
	var uppercase  = false;
	var delimiter  = '';
	var postchars  = '';
	var keep = '';
	var plainText = '';

	encType    = document.ENCODE.encodingType.value;
	uppercase  = document.ENCODE.uppercase.checked;
	delimiter  = document.ENCODE.delimiter.value;
	postchars  = document.ENCODE.trailChar.value;
	keep       = document.ENCODE.keep.checked;
	
	// Checks the textarea 'plain' for selected text.
	setSelectedText('plain');
	
	if (selectedText != '') {
		plainText = selectedText;
	} else {
		plainText = document.ENCODE.plain.value;
	}

	// Checks encoding type and routes request to proper function.
	if (plainText != '') {
		switch (encType) {
			case 'url':
				if (delimiter != '') {
					displayMessage('Delimiter not Processed');
				}
				document.ENCODE.encoded.value 
					= plainToUrl(plainText,uppercase,postchars); 
				break;	
			case 'straightHex': 
			case 'standardHex': 
			case 'entityHex': 
			case 'entityHex4': 
			case 'IE0': 
			case 'IE1': 
			case 'IE2': 
			case 'IE3': 
			case 'IE4': 
			case 'IE5': 
				document.ENCODE.encoded.value 
					= plainToHex(plainText,encType,uppercase,delimiter,postchars); 
				break;
			case 'unicode': 
			case 'IEu': 
				document.ENCODE.encoded.value 
					= plainToUnicode(plainText,encType,uppercase,delimiter,postchars); 
				break;
			case 'straightDec': 
			case 'entityDec': 
				document.ENCODE.encoded.value 
					= plainToDecimal(plainText,encType,delimiter,postchars); 
				break;	
			case 'entityName':
				if (delimiter != '') {
					displayMessage('Delimiter not Processed');
				}
				document.ENCODE.encoded.value 
					= plainToEntityName(plainText,uppercase,postchars); 
				break;
			case 'escapeJS':
				if ((uppercase) || (delimiter != '') || (postchars != '')) {
					displayMessage('Uppercase,Delimiter,Trail Char not Processed');
				}
				document.ENCODE.encoded.value = plainToEscapeJS(plainText); 
				break;
			case 'escapeXML':
				if ((uppercase) || (delimiter != '') || (postchars != '')) {
					displayMessage('Uppercase,Delimiter,Trail Char not Processed');
				}
				document.ENCODE.encoded.value = plainToEscapeXML(plainText); 
				break;
			case 'base64':
				if ((uppercase) || (delimiter != '') || (postchars != '')) {
					displayMessage('Uppercase,Delimiter,Trail Char not Processed');
				}
				document.ENCODE.encoded.value = plainToBase64(plainText); 
				break;
			case 'md4':	
				if ((uppercase) || (delimiter != '') || (postchars != '') || (keep)) {
					displayMessage('No Parameters Processed');
				}
				document.ENCODE.encoded.value = hex_md4(plainText); 
				break;
			case 'md5':	
				if ((uppercase) || (delimiter != '') || (postchars != '') || (keep)) {
					displayMessage('No Parameters Processed');
				}
				document.ENCODE.encoded.value = hex_md5(plainText); 
				break;
			case 'sha1':	
				if ((uppercase) || (delimiter != '') || (postchars != '') || (keep)) {
					displayMessage('No Parameters Processed');
				}
				document.ENCODE.encoded.value = hex_sha1(plainText); 
				break;
			default:
				displayMessage('Invalid encoding type ' + encType);
		}
	} else {
		document.ENCODE.plain.value = ('Paste or type text here to encode');	
		document.ENCODE.plain.focus();
		document.ENCODE.plain.select();
	}

	// Check if supposed to keep unselected text.
	if ((keep) && (encType != 'md5')) {
		keepUnselectedText('plain','encoded','');
	}	
} 

/*
 * Converts plaintext to URL Encoded text. Will leave letters, numbers and some
 * special characters intact and hex encode all others. Note that the reserved and
 * syntax characters are not encoded regardless of context. Restricted to ASCII.
 */
function plainToUrl(source,uppercase,postchars) { 
	var urlReg = /[a-zA-Z0-9\$\_\.\+\!\*\~\(\)\,\&\/\:\;\=\?\@\#\'\-]/;
	var inLength = 0;
	var urlResult = ''; 
	var invalidChar = false;

	// Cycle through each input character.
	if ((source != '') && (typeof source != typeof undefined)) {
		var srcLen = source.length;
	
		for (var i=0; i<srcLen; i++) {
			inLength = source.charCodeAt(i).toString(16).length;
			
			// Leave character as is.
			if (urlReg.test(source.charAt(i))) {
				urlResult += source.charAt(i);
				
			// Encode all other ASCII characters.
			} else if (source.charCodeAt(i) < 128) {
				var hex = source.charCodeAt(i).toString(16) + postchars;
	
				if (uppercase) {		
					hex = hex.toUpperCase(); 
				} 
				// Pad with zero for results < 10.
				if (inLength == 1) {
					urlResult += '%0' + hex;
				} else if (inLength == 2) {
					urlResult += '%'  + hex;
				}
			} else {
				urlResult += (' ['+ source.charAt(i) +' Not Valid] ');
				invalidChar = true;
			}	
		}	
	}
	
	// Message to indicated invalid character.
	if (invalidChar) {
		displayMessage('Attempting to encode Invalid Character');

		invalidChar = false;
	}	

	return urlResult;
} 

/*
 * Converts plaintext to Hex Encoded text. Restricted to character codes < 256. 
 */
function plainToHex(source,encType,uppercase,delimiter,postchars) { 
	var inLength = 0;	
	var prechars = ''; 
	var hexTemp = ''; 
	var hexResult = '';
	var invalidChar = false;
	
	// Sets prechars based on encoding type.
	switch (encType) {
		case 'straightHex'	: prechars = '';			break;
		case 'standardHex'	: prechars = '%';			break;
		case 'entityHex'	: prechars = '&#x';			break;
		case 'entityHex4'	: prechars = '&#x00';		break;
		case 'IE0'			: prechars = '\\x';			break;
		case 'IE1'			: prechars = '\\x0';		break;
		case 'IE2'			: prechars = '\\x00';		break;
		case 'IE3'			: prechars = '\\x000';		break;
		case 'IE4'			: prechars = '\\x0000';		break;
		case 'IE5'			: prechars = '\\x00000';	break;
		default:
			displayMessage('Invalid encoding type ' + encType);
	}

	// Cycle through each input character.
	if ((source != '') && (typeof source != typeof undefined)) {
		var srcLen = source.length;
	
		for (var i=0; i<srcLen; i++) {
			hexTemp = source.charCodeAt(i).toString(16);
			inLength = source.charCodeAt(i).toString(16).length;
		
			if (uppercase) {
				prechars = prechars.toUpperCase();
				hexTemp  = hexTemp.toUpperCase();
			}
			
			// Encode all characters with character code < 256.
			if (inLength) {
				if (source.charCodeAt(i) < 256) {
					if (inLength == 1) {
						hexResult += prechars + '0' + hexTemp + postchars + delimiter;
	
					} else if (inLength == 2) {
						hexResult += prechars + hexTemp + postchars + delimiter; 
	
					} else {
						hexResult += (' [ '+ source.charAt(i) +' Not Valid] ' + delimiter);
						invalidChar = true;
					}
				} else {
					hexResult += (' [ '+ source.charAt(i) +' Not Valid] ' + delimiter);
					invalidChar = true;
				}
			} else {
				hexResult += (' [ '+ source.charAt(i) +' Not Valid] ' + delimiter);
				invalidChar = true;
			}	
		}
		
		// Shave off final delimiter.
		if (delimiter != '') {
			hexResult = hexResult.substring(0,hexResult.length-delimiter.length);
		}
	
		// Message to indicated invalid character.
		if (invalidChar) {
			displayMessage('Attempting to encode Invalid Character');
			invalidChar = false;
		}	
	}
	return hexResult;
} 

/*
 * Converts plaintext to Unicode Encoded text. No restrictions. 
 */
function plainToUnicode(source,encType,uppercase,delimiter,postchars) { 
	var inLength = 0;	
	var prechars = ''; 
	var uniTemp = ''; 
	var uniResult = new stringBuffer();
	var strResult = '';
	
	// Sets prechars based on encoding type.
	switch (encType) {
		case 'unicode' : prechars = '%u'  ; break;
		case 'IEu'     : prechars = '\\u' ; break;
		default:
			displayMessage('Invalid encoding type ' + encType);
	}

	// Cycle through each input character.
	if ((source != '') && (typeof source != typeof undefined)) {
		var srcLen = source.length;
	
		for (var i=0; i<srcLen; i++) {
			inLength = source.charCodeAt(i).toString(16).length;
			
			if (inLength) {
				uniTemp = source.charCodeAt(i).toString(16);
				if (uppercase) {
					prechars = prechars.toUpperCase();
					uniTemp  = uniTemp.toUpperCase(); 
				} 
				
				switch (true) {
					case (inLength == 1):
						uniResult.sbAppend(prechars + '000' + uniTemp + postchars + delimiter); break;
					case (inLength == 2):
						uniResult.sbAppend(prechars + '00' + uniTemp + postchars + delimiter); break;
					case (inLength == 3):
						uniResult.sbAppend(prechars + '0' + uniTemp + postchars + delimiter); break;
					case (inLength >= 4):
						uniResult.sbAppend(prechars + uniTemp + postchars + delimiter); break;
					default:
						uniResult.sbAppend(' ['+ source.charAt(i) +' Not Valid] ' + delimiter);
				}
				
			} else {
				uniResult.sbAppend(' ['+ source.charAt(i) +' Not Valid] ' + delimiter);
			}
		}
		
		strResult = uniResult.sbToString();

		// Shave off final delimiter.
		if ((delimiter != '') && (typeof delimiter != typeof undefined)) {
			strResult = strResult.substring(0,strResult.length-delimiter.length);
		}
	}
	return strResult;
} 

/*
 * Converts plaintext to Decimal Encoded text (HTML-Entity). No restrictions. 
 */
function plainToDecimal(source,encType,delimiter,postchars) {
	var inLength  = 0;
	var prechars = ''; 
	var decResult = new stringBuffer();
	var strResult = '';

	// Sets prechars based on encoding type.
	switch (encType) {
		case 'straightDec': prechars = ''   ;break;
		case 'entityDec'  : prechars = '&#' ;break;
		default:
			displayMessage('Invalid encoding type ' + encType);
	}

	// Cycle through each input character.
	if ((source != '') && (typeof source != typeof undefined)) {
		var srcLen = source.length;
	
		for (var i=0; i<srcLen; i++) {
			inLength = source.charCodeAt(i).toString().length;
	
			if (inLength) {
				if (inLength == 1) {
					decResult.sbAppend(prechars + '0' + source.charCodeAt(i) + postchars + delimiter);
				} else if (inLength >= 2) {
					decResult.sbAppend(prechars + source.charCodeAt(i) + postchars + delimiter); 
				} else {
					decResult.sbAppend(' ['+ source.charAt(i) +' Not Valid] ' + delimiter);
				}
			} else {
				decResult.sbAppend(' ['+ source.charAt(i) +' Not Valid] ' + delimiter);
			}
		}		

		strResult = decResult.sbToString();
		// Shave off final delimiter.
		if (delimiter != '') {
			strResult = strResult.substring(0,strResult.length-delimiter.length);
		}
	}
	return strResult;
}

/*
 * Arrays for Entity Name encoding and decoding.
 */
var plainChars = new Array(
    ' ','!','"','#','$','%','\'','(',')','*',
    '-','.','/',':',';','<','=','>','?',
    '@','[','\\',']','_','`','{','|','}',
    '~',' ','¡','¤','¢','£','¥','¦','§','¨',
	'©','ª','«','¬','­','®','¯','°','±','²','³',
	'´','µ','¶','·','¸','¹','º','»','¼','½',
	'¾','¿','À','Á','Â','Ã','Ä','Å','Æ','Ç',
	'È','É','Ê','Ë','Ì','Í','Î','Ï','Ð',
	'Ñ','Ò','Ó','Ô','Õ','Ö','×','Ø','Ù',
	'Ú','Û','Ü','Ý','Þ','ß','à','á','â',
	'ã','ä','å','æ','ç','è','é','ê','ë',
	'ì','í','î','ï','ð','ñ','ò','ó','ô',
	'õ','ö','÷','ø','ù','ú','û','ü','ý',
	'þ','ÿ','Œ','œ','Š','š','Ÿ','ˆ',
	' ',' ',' ','–','—','‘','’','‚','“',
	'”','„','†','‡','…','‰','‹','›',
	'€','™','+',',','&');
	
var htmlChars = new Array(
    '&sp','&excl','&quot','&num','&dollar','&percnt','&apos','&lpar','&rpar','&ast',
    '&hyphen','&period','&sol','&colon','&semi','&lt','&equals','&gt','&quest',
    '&commat','&lsqb','&bsol','&rsqb','&lowbar','&grave','&lcub','&verbar','&rcub',
    '&tilde','&nbsp','&iexcl','&curren','&cent','&pound','&yen','&brvbar','&sect','&uml',
    '&copy','&ordf','&laquo','&not','&shy','&reg','&macr','&deg','&plusmn','&sup2','&sup3',
    '&acute','&micro','&para','&middot','&cedil','&sup1','&ordm','&raquo','&frac14','&frac12',
	'&frac34','&iquest','&Agrave','&Aacute','&Acirc','&Atilde','&Auml','&Aring','&AElig','&Ccedil',
	'&Egrave','&Eacute','&Ecirc','&Euml','&Igrave','&Iacute','&Icirc','&Iuml','&ETH',
	'&Ntilde','&Ograve','&Oacute','&Ocirc','&Otilde','&Ouml','&times','&Oslash','&Ugrave',
	'&Uacute','&Ucirc','&Uuml','&Yacute','&THORN','&szlig','&agrave','&aacute','&acirc',
	'&atilde','&auml','&aring','&aelig','&ccedil','&egrave','&eacute','&ecirc','&euml',
	'&igrave','&iacute','&icirc','&iuml','&eth','&ntilde','&ograve','&oacute','&ocirc',
	'&otilde','&ouml','&divide','&oslash','&ugrave','&uacute','&ucirc','&uuml','&yacute',
	'&thorn','&yuml','&OElig','&oelig','&Scaron','&scaron','&Yuml','&circ',
	'&ensp','&emsp','&thinsp','&ndash','&mdash','&lsquo','&rsquo','&sbquo','&ldquo',
	'&rdquo','&bdquo','&dagger','&Dagger','&hellip','&permil','&lsaquo','&rsaquo',
	'&euro','&trade','&plus','&comma','&amp');   

/*
 * Make a copy the htmlChars Array in all-caps.
 */
var htmlAllCaps = new Array();

function makehtmlAllCapsArray() {

	for (x in htmlChars) {	
		htmlAllCaps[x] = htmlChars[x].toUpperCase();
	}
}

/*
 * Convert plaintext to HTML-Entity Name. 
 *
 * Note that there are several HTML Entity Names that have the same spellings, 
 * differentiated only by case (&Ntilde != &ntilde). This becomes an issue when you want 
 * to encode in uppercase, as both of these examples would encode to (&NTILDE).
 * When decoding back from this, it is not possible to determine which "ntilde"
 * it should be - "&Ntilde" or "&ntilde". Therefore, names that would have ambiguous 
 * meanings if in all-caps are not rendered in all-caps, but left as they appear
 * in the htmlChars array above. That way, they will decode correctly.
 *
 * Remember that if you encode with the Uppercase Checkbox checked, you need to also
 * have the box checked when you decode. 
 */

function plainToEntityName(source,uppercase,postchars) {
	var tempResult = ''; 
	var nameResult = new stringBuffer();
	var holdValue  = '';
	var found = 0;
	
	if ((source != '') && (typeof source != typeof undefined)) {
		var srcLen = source.length;
	
		// The following code checks to see if a particular HTML-Entity Name has 
		// more than one occurrence with the same spelling but different cases of some
		// of the letters. See above for more info.
		
		for (var i=0; i<srcLen; i++) {
			tempResult = source.charAt(i);
	
			// Cycle through the plainChars array.
			for (j in plainChars) {
				// Check for a match.
				if (source.charAt(i) == plainChars[j]) {
					if (uppercase) {
						// Makes a copy of htmlChars Array in Uppercase.
						makehtmlAllCapsArray();
	
						holdValue = htmlChars[j].toUpperCase();
	
						// For browsers that can handle indexOf
						if (htmlAllCaps.indexOf) {
							if (htmlAllCaps.indexOf(holdValue) == htmlAllCaps.lastIndexOf(holdValue)) {
								tempResult = htmlChars[j].toUpperCase() + postchars;
							} else {
								tempResult = htmlChars[j] + postchars;
							}	
						// For browsers that cannot handle indexOf.
						} else {
							// Searches through array to see if there is more than one match. 
							found = 0;
							for (k in htmlAllCaps) {
								if (htmlAllCaps[k] == holdValue) {
									found += 1;
								}
							}
							// If there is, that means it is a case like "ntilde/Ntilde" and you 
							// cannot encode in all uppercase.
							if (found > 1) {
								tempResult = htmlChars[j] + postchars;
							} else {
								tempResult = htmlChars[j].toUpperCase() + postchars;
							}
						}					
					} else {
						tempResult = htmlChars[j] + postchars;
					} 
				}
			}
			nameResult.sbAppend(tempResult);
		}
	}
	return nameResult.sbToString();
}

/*
 * Converts plaintext to JavaScript-escaped text.
 */
function plainToEscapeJS(source) { 
	var escResult = new stringBuffer();

	// Cycle through source and encode if applicable.
	if ((source != '') && (typeof source != typeof undefined)) {
		var srcLen = source.length;
	
		for (var i=0; i<srcLen; i++) {
			switch (source.charAt(i)) {
				case "'"  : escResult.sbAppend("\\'"); break;
				case '"'  : escResult.sbAppend('\\"'); break;
				case '\n' : escResult.sbAppend('\\n'); break;
				case '	' : escResult.sbAppend('\\t'); break;
				case '\\' : escResult.sbAppend('\\\\'); break;
				default   : escResult.sbAppend(source.charAt(i));
			}
		}	
	}
	return escResult.sbToString();
}

/*
 * Converts plaintext to XML-escaped text.
 */
function plainToEscapeXML(source) { 
	var escResult = new stringBuffer();

	// Cycle through source, encode if applicable.
	if ((source != '') && (typeof source != typeof undefined)) {
		var srcLen = source.length;
	
		for (var i=0; i<srcLen; i++) {
			switch (source.charAt(i)) {
				case '<' : escResult.sbAppend('&lt;'); break;
				case '>' : escResult.sbAppend('&gt;'); break;
				case "'" : escResult.sbAppend('&apos;'); break;
				case '"' : escResult.sbAppend('&quot;'); break;
				case '&' : escResult.sbAppend('&amp;'); break;
				default  : escResult.sbAppend(source.charAt(i));
			}
		}	
	}
	return escResult.sbToString();
}

/*
 * Array for Base64 encoding and decoding. 
 */
var base64Chars = new Array(
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
    'Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f',
    'g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v',
    'w','x','y','z','0','1','2','3','4','5','6','7','8','9','+','/');

/*
 * Converts plaintext to Base64 Encoded text. Restricted to character codes < 256. 
 */
function plainToBase64(source) {

	var decConvert = 0;
	var decResult = 0;
	var binResult = '';
	var binConvert = '';
	var base64Result = '';
	var remainder = 0;

	if ((source != '') && (typeof source != typeof undefined)) {
		// Cycle through each input character.
		var srcLen = source.length;
	
		for (var i=0; i<srcLen; i++) {	
			// Get the character code for each input character.
			decConvert = source.charCodeAt(i);
	
			// Check for invalid characters.
			if ((decConvert == 0) || (decConvert > 255)) {
				displayMessage('Illegal Character: ' + source.charAt(i));
				return '';
			
			// Process valid characters.
			} else {	
				// Convert each input character to its 8-bit binary equivalent.
				for (var j=7; j>-1; j--) {
					if (decConvert >= Math.pow(2,j)) {
						binResult += '1';
						decConvert -= Math.pow(2,j);
					} else {
						binResult += '0';
					}
				}
			}
		}		
		
		var binLen = binResult.length;
	
		while (binLen > 0) {
			// Process resulting binary string 6 bits at a time.
			binConvert = binResult.substring(0,6);
	
			// Convert each 6-bit input binary string to its decimal equivalent.
			for (var k=0; k<=5; k++) {
				if (binConvert.charAt(k) == '1') {
					decResult = (decResult + Math.pow(2,(5-k)));
				} 
			}
			// Using the decimal value as an index, find the corresponding Base64
			// value from the array above. Append result to the output string.
			base64Result += base64Chars[decResult];
	
			// Reset decimal value.
			decResult = 0;
			// Shave off the 6-bit chunk we processed above.
			binResult = binResult.substring(6,binLen)
			binLen = binResult.length;
		}
		// Check to see if the resulting string length is a multiple of 4.
		remainder = (base64Result.length % 4);
		
		// Append the Base64 filler character "=" until resulting string length a multiple of 4.
		while (remainder != 0) {
			base64Result += '=';
			remainder = (base64Result.length % 4);
		}
		
		base64Result = altB64Enc(base64Result);
	}
	
	return base64Result;
}	

/*
 * Checks to see if the user has specified alternate Bsse64 filler characters (usually +/)
 * and/or padding character (usually =).
 */
function altB64Enc(result) { 
	var altResult = '';
	
	if (result != '') {
		altResult = result.replace(/\+/g, document.ENCODE.b64Fill1.value);
		altResult = altResult.replace(/\//g, document.ENCODE.b64Fill2.value);
		altResult = altResult.replace(/\=/g, document.ENCODE.b64Fill3.value);
	}
	
	return altResult;
}

/*
 * Main driver for decoding functions. Takes encoded text and decoding type as inputs
 * and returns plain text.
 */
function decode() { 
	var encText = ''; 
	var decType = '';
	var uppercase  = false;
	var delimiter  = '';
	var postchars  = '';
	var keep = false;

	decType    = document.ENCODE.decodingType.value;
	uppercase  = document.ENCODE.uppercase.checked;
	delimiter  = document.ENCODE.delimiter.value;
	postchars  = document.ENCODE.trailChar.value;
	keep       = document.ENCODE.keep.checked;

	// Checks for selected text in 'encoded' textarea.
	setSelectedText('encoded');
	
	if (selectedText != '') {
		encText = selectedText;
	} else {
		encText = document.ENCODE.encoded.value;
	}

	// Checks encoding type and routes request to proper function.
	if (encText != '') {
		switch (decType) {
			case 'url':
				if (delimiter != '') {
					displayMessage('Delimiter not Processed');
				}
				document.ENCODE.plain.value = decodeUrl(encText,postchars); 
				break;
			case 'straightHex': 
			case 'standardHex': 
			case 'entityHex': 
			case 'entityHex4': 
			case 'IE0': 
			case 'IE1': 
			case 'IE2': 
			case 'IE3': 
			case 'IE4': 
			case 'IE5': 
			case 'unicode': 
			case 'IEu': 
				document.ENCODE.plain.value = decodeHex(encText,decType,delimiter,postchars); 
				break;
			case 'straightDec': 
			case 'entityDec': 
				document.ENCODE.plain.value = decodeDecimal(encText,decType,delimiter,postchars); 
				break;	
			case 'entityName': 
				if (delimiter != '') {
					displayMessage('Delimiter not Processed');
				}
				document.ENCODE.plain.value = decodeEntityName(encText,uppercase,postchars); 
				break;
			case 'escapeJS':
				if ((uppercase) || (delimiter != '') || (postchars != '')) {
					displayMessage('Uppercase,Delimiter,Trail Char not Processed');
				}
				document.ENCODE.plain.value = decodeJS(encText); 
				break;
			case 'escapeXML':
				if ((uppercase) || (delimiter != '') || (postchars != '')) {
					displayMessage('Uppercase,Delimiter,Trail Char not Processed');
				}
				document.ENCODE.plain.value = decodeXML(encText); 
				break;
			case 'base64':
				if ((uppercase) || (delimiter != '') || (postchars != '')) {
					displayMessage('Uppercase,Delimiter,Trail Char not Processed');
				}
				document.ENCODE.plain.value = decodeBase64(encText); 
				break;
			case 'md5':	
				if ((uppercase) || (delimiter != '') || (postchars != '') || (keep)) {
					displayMessage('No Parameters Processed');
				}
				decodeMd5(encText);
				break;
			case 'md4':
			case 'sha1':
				displayMessage('Sorry - Encode Only'); break;
			default:
				displayMessage('Invalid decoding type ' + decType);
		}
	} else {
		document.ENCODE.encoded.value = ('Paste or type text here to decode');
		document.ENCODE.encoded.focus();
		document.ENCODE.encoded.select();
	}
	
	// Check if supposed to keep unselected text.
	if ((keep) && (decType != 'md5')) {
		keepUnselectedText('encoded', 'plain','');
	}
} 

/*
 * Converts URL Encoded text to Plaintext.
 */
function decodeUrl(source,postchars) {
	var plainResult = '';
	
	// Cycles through encoded text. Finds all instances of %XX and converts them
	// to the plain text equivalent.
	if ((source != '') && (typeof source != typeof undefined)) {
		var srcLen = source.length;
	
		for (var i=0; i<srcLen; i++) { 
			// Trailing characters present.
			if (postchars != '') {
				if (source.charAt(i) == '%') {	
					plainResult += unescape(source.charAt(i) + source.charAt(i+1) + source.charAt(i+2));	
					i=i+2+postchars.length;
				} else {
					plainResult += source.charAt(i);
				}	
			// No trailing characters present.
			} else {
				if (source.charAt(i) == '%') {	
					plainResult += unescape(source.charAt(i) + source.charAt(i+1) + source.charAt(i+2));	
					i=i+2;
				} else {
					plainResult += source.charAt(i);
				}
			}	
		}
	}
	
	return plainResult;
}

/*
 * Converts Hex-Based Encoded text to Plaintext.
 */
function decodeHex(source,decType,delimiter,postchars) {
	var prechars = '';
	var filteredResult = ''; 
	var plainResult = ''; 
	
	if ((source != '') && (typeof source != typeof undefined)) {
		// Sets prechars based on encoding type.
		switch(decType) {
			case 'straightHex'	: prechars = '';			break;
			case 'standardHex'	: prechars = '%';			break;
			case 'unicode'		: prechars = '%u';			break;
			case 'entityHex'	: prechars = '&#x';			break;
			case 'entityHex4'	: prechars = '&#x00';		break;
			case 'IE0'			: prechars = '\\\\x';		break;
			case 'IE1'			: prechars = '\\\\x0';		break;
			case 'IE2'			: prechars = '\\\\x00';		break;
			case 'IE3'			: prechars = '\\\\x000';	break;
			case 'IE4'			: prechars = '\\\\x0000';	break;
			case 'IE5'			: prechars = '\\\\x00000';	break;
			case 'IEu'			: prechars = '\\\\u';		break;
			default:
				displayMessage('Invalid decoding type ' + decType);
		}
	
		var filteredResult = source;
		
		if (delimiter != '' ) {
			var delLength = delimiter.length;
		}
		
		if (postchars != '' ) {	
			var postLength = postchars.length;
		}
		
		// Conversion process varies, depending on decoding type.
		switch (decType) {
			case 'straightHex': 			
				var holdValue = '';
				var filtLen = filteredResult.length;
				
				// All hex encoded representations have a length of 2.
				// Adds '%' to each pair of characters and unescapes to get to plain.
				for (var i=0; i<filtLen; i++) {
					holdValue = unescape('%' + 
					filteredResult.charAt(i) + 
					filteredResult.charAt(i+1));
					
					// Skip over any delimiter.
					if (delimiter != '' ) {
						i += delLength;
					} 
					
					// Skip over any trailing character.
					if (postchars != '' ) {
						i += postLength;
					}
				
					i++;
					if (holdValue != '') {
						plainResult += holdValue;
					}
				}	
				break;
			case 'standardHex':
			case 'entityHex':
			case 'entityHex4':
			case 'IE0':
			case 'IE1':
			case 'IE2':
			case 'IE3':
			case 'IE4':
			case 'IE5':
				// Replaces Prechars with '%' and unescapes.
				var regPre = new RegExp(prechars,'gi');
				filteredResult = filteredResult.replace(regPre,'%');			
	
				var holdValue = '';
				var filtLen = filteredResult.length;
				
				for (var i=0; i<filtLen; i++) {
					if (filteredResult.charAt(i) == '%') {
						holdValue = unescape(filteredResult.charAt(i) + 
						filteredResult.charAt(i+1) + 
						filteredResult.charAt(i+2));
		
						// Skip over any delimiter.
						if (delimiter != '') {
							i += delLength;
						} 
						
						// Skip over any trailing character.
						if (postchars != '') {
							i += postLength;
						}
					
						i+=2;
						if (holdValue != '') {
							plainResult += holdValue;
						}
					} else {
						plainResult += filteredResult.charAt(i);
					}	
				}	
				break;
			case 'unicode': 
			case 'IEu':
				// Replaces Prechars with '%' and unescapes.
				var regPre = new RegExp(prechars,'gi');
				filteredResult = filteredResult.replace(regPre,'%u');			
	
				var holdValue = '';
				var filtLen = filteredResult.length;
				
				for (var i=0; i<filtLen; i++) {
					if ((filteredResult.charAt(i) + filteredResult.charAt(i+1)) == '%u') {
						holdValue = unescape(filteredResult.charAt(i) + 
						filteredResult.charAt(i+1) +
						filteredResult.charAt(i+2) +				
						filteredResult.charAt(i+3) +				
						filteredResult.charAt(i+4) +				
						filteredResult.charAt(i+5));
		
						// Skip over any delimiter.
						if (delimiter != '' ) {
							i += delLength;
						} 
						
						// Skip over any trailing character.
						if (postchars != '' ) {
							i += postLength;
						}
					
						i=i+5;
						if (holdValue != '') {
							plainResult += holdValue;
						}
					} else {
						plainResult += filteredResult.charAt(i);
					 }	
				}	
				break;
			default:
				displayMessage('Invalid decoding type ' + decType);
		}
	}
	return plainResult;
}

/*
 * Converts Decimal-Based Encoded text to Plaintext.
 */
function decodeDecimal(source,decType,delimiter,postchars) {
	var prechars = '';
	var filteredResult = ''; 
	var filtArray = new Array();
	var filtLen = 0;
	var resultString = new Array();
	var itemLength = 0;
	
	if ((source != '') && (typeof source != typeof undefined)) {
		// Sets prechars based on encoding type.
		switch (decType) {
			case 'straightDec': prechars = ''   ;break;
			case 'entityDec'  : prechars = '&#' ;break;
			default:
				displayMessage('Invalid decoding type ' + decType);
		}
			
		filteredResult = source;
	
		switch (decType) {
			case 'straightDec': 			
				
				// Try the delimiter as the driver for processing.
				if (delimiter != '') {
					if (postchars != '') {
						var delimPostChars = postchars + delimiter; 
	
						// Split the string based on combo of postchars & delimiter.
						// This way , there is a better chance that it won't mess up
						// the decode.
						if (filteredResult.indexOf(delimPostChars) != -1) {
							filtArray = filteredResult.split(delimPostChars);
							filtLen = filtArray.length;
		
							// Shave off final trailing character.
							var lastItem = (filtLen - 1);
							filtArray[lastItem] = filtArray[lastItem].substring(0,filtArray[lastItem].length - postchars.length);
						} else {
							displayMessage('Delimiter/Trailing Char combo not found');
						}
	
					} else {
						// Split the string based on delimiter.
						if (filteredResult.indexOf(delimiter) != -1) {
							filtArray = filteredResult.split(delimiter);
							filtLen = filtArray.length;
						} else {
							displayMessage('Delimiter not found');
						}
					}	
	
				// Trailing character present, but no delimiter.	
				} else if (postchars != '') {
					
					// Split the string based on the trailing characters.
					if (filteredResult.indexOf(postchars) != -1) {
						filtArray = filteredResult.split(postchars);
						filtLen = filtArray.length;
					} else {
						displayMessage('Trailing Character not found');
					}
				} else {
					displayMessage('Need Delimiter or Trailing Char');
					document.ENCODE.delimiter.focus();
				}
				break;
	
			case 'entityDec':
	
				// Split on the entityDec prechars &#.
				filtArray = filteredResult.split(prechars);
				filtLen = filtArray.length;
				
				// Remove any null elements of the array.
				for (var i=0; i< filtLen; i++) {
					if (filtArray[i] == '') {
						filtArray.splice(filtArray[i],1);
						filtLen = filtArray.length;
					}
				}				
	
				// Shave off delimiters.
				if (delimiter != '') {
					for (var i=0; i< filtLen-1; i++) {
						if (filtArray[i] != '') {
							filtArray[i] = filtArray[i].substring(0,filtArray[i].length - delimiter.length);
						}				
					}
				}	
				
				// Shave off trailing characters.
				if (postchars != '') {
					for (var i=0; i< filtLen; i++) {
						if (filtArray[i] != '') {
							filtArray[i] = filtArray[i].substring(0,filtArray[i].length - postchars.length);					
						}
					}				
				}
				
				break;
			default:
				displayMessage('Invalid decoding type ' + decType);
		}
		
		// Cycle through the filtered result.
	
		for (var i=0; i<filtLen; i++) { 
			itemLength = decToHex(filtArray[i]).length;
	
			// Converts each decimal value to hex or unicode. 
			if ((filtArray[i] != '') || (filtArray[i] != '00') || (filtArray[i] != '0')) {
				if (itemLength) {	
					switch (true) {
						case (itemLength == 1):
							resultString += '%0'  + decToHex(filtArray[i]); break;
						case (itemLength == 2):
							resultString += '%'   + decToHex(filtArray[i]); break;
						case (itemLength == 3):
							resultString += '%u0' + decToHex(filtArray[i]); break;
						case (itemLength >= 4):
							resultString += '%u'  + decToHex(filtArray[i]); break;
						default:
							resultString += ('['+ filtArray[i] +' Not Valid]');
					}	
				} else {
					resultString += ('['+ filtArray[i] +' Not Valid]');
				}
			}	
		}
	
		if (resultString == '%00') {
			resultString = '';
		}	
	}
	return unescape(resultString);
}

/*
 * Converts Decimal Encoded text to Hex Encoded text.
 */
function decToHex(nmbr) {
	var hex = '0123456789ABCDEF';
	var mask = 0xf;
	var result = '';

	while (nmbr != 0) {
		result = hex.charAt(nmbr & mask) + result;
		nmbr>>>=4;
	}	
	return result.length == 0 ? '0' : result;
}

/*
 * Converts Html Entity Names to Plaintext.
 */
function decodeEntityName(source,uppercase,postchars) {
	var plainResult = '';
	
	if ((source != '') && (typeof source != typeof undefined)) {
		plainResult = source;
		
		// Escapes characters that could screw up the regEx statement.
		if (postchars != '') {
			var regexReg = /[\$\&\#\%\.\^\?\*\+\[\]\\]/gi;
	
			if (postchars.match(regexReg)) {
				postchars = '\\' + postchars;
			}
		}	
	
		// Cycle through the htmlChars Array. Create regEx for each item, search
		// input source for matches and replace with plain text equivalents.
		var htmlLen = htmlChars.length;
	
		for (var i=0; i<htmlLen; i++) { 
			
			if (uppercase) {
				if (postchars != '') {
					var regEntity = new RegExp(htmlChars[i].toUpperCase() + postchars,'g');
				} else {
					var regEntity = new RegExp(htmlChars[i].toUpperCase(),'g');
				}
				
				if (regEntity.test(plainResult)) {
					plainResult = plainResult.replace(regEntity,plainChars[i]);
				} else {
					if (postchars != '') {
						var regEntity = new RegExp(htmlChars[i] + postchars,'g');
					} else {
						var regEntity = new RegExp(htmlChars[i],'g');
					}	
					plainResult = plainResult.replace(regEntity,plainChars[i]);
				}
				
			} else {
				if (postchars != '') {
					var regEntity = new RegExp(htmlChars[i] + postchars,'g');
				} else {
					var regEntity = new RegExp(htmlChars[i],'g');
				}
				plainResult = plainResult.replace(regEntity,plainChars[i]);
			}
		}
	}	
	return plainResult;
}

/*
 * Converts Javascript Encoded text to Plaintext.
 */
function decodeJS(source) {
	var plainResult = '';
	
	if ((source != '') && (typeof source != typeof undefined)) {
		// Search input source for matches and replace with plain text equivalents.
		var srcLen = source.length;
		var holdResult = '';
		
		for (var i=0;i<srcLen;i++) { 
			if (source.charAt(i) == '\\') {
				if (source.charAt(i+1) == "'") {
					i++;
					holdResult += source.substring(i,(i+1));				
				} else if (source.charAt(i+1) == '"') {
					holdResult += '"';				
					i++;
				} else if (source.charAt(i+1) == 't') {
					holdResult += '\t';				
					i++;
				} else if (source.charAt(i+1) == 'n') {
					holdResult += '\n';				
					i++;
				} else if (source.charAt(i+1) == '\\') {
					holdResult += '\\';				
					i++;
				}
			} else{
				holdResult += source.charAt(i);
			}
		}
		plainResult = holdResult;
 	}
	return plainResult;
}

/*
 * Arrays for XML decoding. 
 */
var xmlChars = new Array('&lt;','&gt;','&apos;','&quot;','&amp;');
var xmlPlain = new Array('<','>',"'",'"','&');

/*
 * Converts XML Encoded text to Plaintext.
 */
function decodeXML(source) {
	var plainResult = '';
	
	if ((source != '') && (typeof source != typeof undefined)) {
		plainResult = source;
		
		// Cycle through the xmlChars Array. Create regEx for each item, search
		// input source for matches and replace with plain text equivalents.
	
		for (i in xmlChars) { 
			var regEntity = new RegExp(xmlChars[i],'g');
	
			plainResult = plainResult.replace(regEntity,xmlPlain[i]);
		}
 	}
	return plainResult;
}

/*
 * Converts Encoded Base64 to Plaintext.
 */
function decodeBase64(source) {

	var b64Str = '';
	var b64Convert = 0;
	var binResult = '';
	var remainder = 0;
	var binConvert = '';
	var decResult = 0;
	var plainResult = '';

	if ((source != '') && (typeof source != typeof undefined)) {
		// Very basic check to see if a valid Base64 hash.
		if ((source.length % 4) != 0) {
			displayMessage('Not a Base64 Hash');
			return document.ENCODE.plain.value;
		}
	
		source = altB64Dec(source);
		
		// Remove padding at end of input string.
		b64Str = source.replace(/\=/g, '');
		var b64Len = b64Str.length;
	
		for (var i=0; i < b64Len; i++) {
			// Get the index of the Base64 character from the array above.
			if (base64Chars.indexOf) { 
				b64Convert = base64Chars.indexOf(b64Str.charAt(i));
			} else {
				// Some browsers cannot process "indexOf" function.
				b64Convert = base64CharsXindexOf(b64Str.charAt(i));
			}
	
			// Convert index value to 6-bit binary string.
			for (var j=0; j < 6; j++) {
				if (b64Convert >= Math.pow(2,5-j)) {
					binResult += '1';
					b64Convert -= Math.pow(2,5-j);
				} else {
					binResult += '0';
				}
			}
		}
		// Check if binary string is a multiple of 8.
		remainder = (binResult.length % 8);
		
		// Remove trailing zeros until binary string is a multiple of 8.
		while (remainder != 0) {
			binResult = binResult.substring(0, (binResult.length-1));
			remainder = (binResult.length % 8);
		}
	
		while (binResult.length > 0) {
			// Process resulting binary string 8 bits at a time.
			binConvert = binResult.substr(0,8);
	
			// Convert each 8-bit binary string to its decimal equivalent.
			for (var k=0; k<8; k++) {
				if (binConvert.charAt(k) == '1') {
					decResult = (decResult + Math.pow(2,(7-k)));
				} 
			}
			// Convert decimal to plaintext and append to result.
			plainResult += String.fromCharCode(decResult);
		
			// Reset decimal result.
			decResult = 0;
			// Shave off 8-bit chunk we processed above.
			binResult = binResult.substring(8, binResult.length);
		}
 	}
 	return plainResult;
}

/*
 * Checks to see if the user has specified alternate Bsse64 filler characters (usually +/)
 * and/or padding character (usually =).
 */
function altB64Dec(source) { 
	var altResult = '';

	if ((source != '') && (typeof source != typeof undefined)) {
		var srcLen = source.length;
		var altVal1 = document.ENCODE.b64Fill1.value;
		var altVal2 = document.ENCODE.b64Fill2.value;
		var altVal3 = document.ENCODE.b64Fill3.value;
		
		for (var i=0; i<srcLen; i++) {
			if (source.charAt(i) == altVal1) {
				altResult += '+';
			} else if (source.charAt(i) == altVal2) {
				altResult += '/';
			} else if (source.charAt(i) == altVal3) {
				altResult += '=';
			} else {
				altResult += source.charAt(i);
			}		
		}
	}	
	return altResult;
}

/*
 * Workaround for browsers that cannot do indexOf function.
 */
function base64CharsXindexOf(sChar) {
	var i = 0;
	var base64Index = '';
	
	for (i in base64Chars) {	
		if (base64Chars[i] == sChar) { 
			base64Index = i; 
		}
	}
	return base64Index;
}

/*
 * Convert MD5 Hash to plaintext.
 */
function decodeMd5(hash) {
	var data = new Array();
	var url = 'http://www.digilantesecurity.com/md5Decode.php?hash=';
	
	if (hash != '') {
		// Check that it has the proper length for an MD5 Hash.
		if (hash.length != 32) {
			displayMessage('Not an MD5 Hash');
			return;
		}
	
	try {
		if (netscape.security.PrivilegeManager.enablePrivilege) {
			netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
		}
	} catch(ex) {
	}
	
		try {
			createHttpRequest();
	
			if (reqHttp_request) {
				reqHttp_request.onreadystatechange = function() {
				
				try {
					if (netscape.security.PrivilegeManager.enablePrivilege) {
						netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
					}
				} catch(ex) {
				}
				
					// Insert cracked hash into textarea.
					try {
						if (reqHttp_request.readyState == 4) {
							if (reqHttp_request.status == 200) {
								data = reqHttp_request.responseXML.getElementsByTagName('md5lookup');

								if ((data[0]) && (data[0].getElementsByTagName('string')[0])) {
									document.ENCODE.plain.value = getText(data[0].getElementsByTagName('string')[0]);
									displayMessage('Hash Found');
								} else {
									displayMessage('Hash Not In Databases');
								}
							} else {
								displayMessage('Hash Not In Databases');
							} 
						} else {
							displayMessage('Processing...'); 	
						}
					} catch (e) {
						displayMessage('Hash Not In Databases');
					}
				}
				
				reqHttp_request.open('GET', url + hash, true);
				reqHttp_request.send(null);
			} else {
				displayMessage('There was a problem creating the XHR');
			}	
		} catch (e) {
			alert('decodeMd5 Error:\n' + e);
		}
	} else {
		displayMessage('Hash cannot be null');
	}
}

/*
 * Validate incoming IP addresses. 
 */
function validateIP(ip,level) {
	var checkIP = '';
	var regexp = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;

	checkIP = ip;

	if (!regexp.test(checkIP)) {
		document.IPHIDE.ipdword.value = ('');
		document.IPHIDE.iphex.value = ('');
		document.IPHIDE.ipoct.value = ('');
		document.IPHIDE.ip.focus();
		document.IPHIDE.ip.select();
		displayMessage('Invalid IP Address');
	} else {
		convertIP(checkIP,level);
	}
}

/*
 * Driver for IP conversion functions. 
 */
function convertIP(ip,level) {
  
	document.IPHIDE.ipdword.value = ipToDword(ip,level);
	document.IPHIDE.iphex.value   = ipToHexOct(ip,16);
	document.IPHIDE.ipoct.value   = ipToHexOct(ip,8);
}

/*
 * Converts dotted quad IP address to dword address. 
 */
function ipToDword(ip,level) {
	
	var dword = 0;
	var n = ip.split('.');
	
	// Find dword value for each IP quad.
	for (var i=3; i>=0; i--) {
		dword += (n[(3-i)]*(Math.pow(256,i)));	
	}
	// Adds additional amount if dword level 1.
	if (level == '1') {
		dword += 4294967296;
	}

	return dword;
} 

/*
 * Converts dotted quad IP address to hex or octal, driven by input value "base". 
 */
function ipToHexOct(ip,base) { 
	var quad = '';  
	var result = '';
	var n = ip.split('.'); 
  	
  	for (var i=0; i<4; i++) { 
    	n[i] = parseInt(n[i]);
	}
	
	// Find resulting value for each IP quad.
	for (var i=0; i<=3; i++) { 
		quad = n[i].toString(base).toUpperCase();

		// Hexadecimal
		if (base == 16) {
			if (quad.length == 1) {
				result += '%0' + quad;
			} else {
				result += '%' + quad;
			}
		// Octal
		} else if (base == 8) {
			if (quad.length == 1) {
				result += '000' + quad + '.';
			} else if (quad.length == 2) {
				result += '00' + quad + '.';
			} else if (quad.length == 3) {
				result += '0' + quad + '.';			
			}
		}			
	}	
	// Shave off trailing "."
	if (base == 8) {
		result = result.substring(0,result.length-1);
	}
	
	return result;
}

/*
 * Converts Dword address to dotted quad IP address. 
 */
function convertDword(dword,level) {

	var value = 0;
	var ip = '';	
	var quad = '';
	
	value = dword;
	
	// Subtracts additional amount if dword level 1.
	if (level == '1') {
		value -= 4294967296;
	}

	// Find resulting value for each dword quad.
	for (var i=3; i>=0; i--) { 
		quad = parseInt(value/(Math.pow(256,i)));
		value %= (Math.pow(256,i));

		// Append "."
		ip += quad + '.';
	}
	// Shave off trailing "."
	ip = ip.substring(0,ip.length-1);
	
	document.IPHIDE.ip.value = ip;

	// This is redundant, but it finds the corresponding Hex and Octal addresses.
	convertIP(ip,level);
} 

/*
 * Converts Hex or Octal address to dotted quad IP address. 
 */
function convertHexOct(addr,level,base) {
  
	var ip = '';	
	var quad = '';
	var n = new Array();

	// Hexadecimal.
	if (base == 16) {
		// Shave off leading "%".
		addr = addr.substring(1,addr.length);

		n = addr.split('%');

		// Invalid Hex address or uses "0x" convention.
		if (n.length != 4) {
			// Shave off leading "0x".
			addr = addr.substring(1,addr.length);
			n = addr.split('.0x');
		}
	// Octal.
	} else if (base == 8) {	
		n = addr.split('.');
	} else {
		displayMessage('Invalid Base');
	}	
 
	// Must have four quads to be valid.
	if (n.length == 4) {
		for(var i=0; i<4; i++) { 
			quad = parseInt(n[i],base);
			ip += quad + '.';
		}
	
		// Shave off trailing "."
		ip = ip.substring(0,ip.length-1);
		
		document.IPHIDE.ip.value = ip;

		// This is redundant, but it finds the corresponding Dword and Hex/Octal addresses.
		convertIP(ip,level);
	} else {
		displayMessage('Invalid Address');
	}	
}

/*
 * Clear fields associated with the IP Encoder/Decoder function.
 */
function clearIP() {
	document.IPHIDE.level.value = ('0');
	document.IPHIDE.ip.value = ('');
	document.IPHIDE.ipdword.value = ('');
	document.IPHIDE.iphex.value = ('');
	document.IPHIDE.ipoct.value = ('');
	document.IPHIDE.ip.focus();
}

/*
 * Display unselected text in result window in its original format.
 */
function keepUnselectedText(fromField, toField, toText, caller) {

	var preText  = '';
	var postText = '';
	var fromVal = '';
	var toVal   = '';

	if (toText != '') {
		if (toText == 'delSelection') {
			toVal = '';	
		} else {
			toVal = toText;
		}	
	} else {
		toVal = document.getElementById(toField).value;
	}
	
	if ((fromField != '') && (toField != '')) {
	
		fromVal = document.getElementById(fromField).value;
	
		// Processing for Internet Explorer.
		if (document.selection) {
			var posArray = new Array();
	
			var element = document.getElementById(fromField);	
		
			posArray = selectionCoords(element, caller);
	
			if (posArray[0] != posArray[1]) {
				preText  = fromVal.substring(0,posArray[0]);
				postText = fromVal.substring(posArray[1]+1, fromVal.length);
			}
			
			document.getElementById(toField).value = preText + toVal + postText;	
			
		// Processing for other browsers.
		} else {
	
			var selected = '';
			var textArea = document.getElementById(fromField);
		
			selected = setSelectedText(fromField);
	
			if (selected != fromVal) {
				preText  = fromVal.substring(0,textArea.selectionStart);
				postText = fromVal.substring(textArea.selectionEnd, fromVal.length);
			}
			
			document.getElementById(toField).value = preText + toVal + postText;	
		}
	} else {
		displayMessage('Need To Select Some Text First');
	}	
}

/*
 * Get selected text for IE.
 */
function selectionCoords(obj, caller) {
/* 
   Get the selection start and end positions inside a text object

   Syntax:
     coords = selectionCoords ( object )

   Return value:
     Returns an array with 2 elements. Index 0 contains the start 
     position of the selection. Index 1 contains the end position 
     of the selection.
     On error or empty selection function returns an array filled
     with -1.

   Copyright (C) Mateusz Turcza (mturcza at tlen dot pl)

   License:
     GNU General Public License
     (http://www.gnu.org/licenses/lgpl.html)
*/
	var selectionStart = 0;
	var selectionEnd   = 0;
	
	if(document.selection && document.selection.createRange) {
	// document.selection is native to Internet Explorer 4+
	// (Mac versions of IE 4.0x may have problems with TextRange)
		var ini = obj.value; // initial value of text field
		var sel = document.selection;
		var srn = sel.createRange();
		
		if(srn.text.length>0 && srn.parentElement().id == obj.id) {
		// selection not empty, and within text field
			var sbf = String(srn.text);			// - buffer selected text
			sel.clear();						// - remove selected string
			var bkm = srn.getBookmark();		// - mark current place of carriage
			var trn = obj.createTextRange();	// - create text range
			trn.moveToBookmark(bkm);			// - the beginning of text range is
			trn.moveStart('character',0);		//   the last position of carriage
			var len = obj.value.length;			// - total length of text in the text field
												//   after removing selection
			trn.moveEnd('character',len);		// - end of text range is equal to total length
			trn.select();						// - select text range
			var rgt = String(trn.text);			// - string on the right hand side of selection
			var lft = ini.substring(0,len-trn.text.length); // - string on the left hand side
	
		// recreate selection
			obj.value = ini;						// - recreate initial text field value
			trn.collapse();							// - move carriage to the beginning 
			trn.moveStart('character',lft.length);	// - start of selection 
			trn.moveEnd('character',sbf.length);	// - end of selection
			trn.select();							// - select
			selectionStart = lft.length;
			selectionEnd   = lft.length + sbf.length -1;
		}
	}

	if (caller == 'httpReq') {
		return [(selectionStart-2),(selectionEnd-2)];
	} else {
		return [selectionStart,selectionEnd];
	}
}


