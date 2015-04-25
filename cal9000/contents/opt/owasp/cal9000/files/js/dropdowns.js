/*
 * Contains many of the load/processing functions for dropdowns used in CAL9000.
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
 */

/*
 * Arrays for Wrappers.
 */ 
var prefixArray = new Array(
    '',
    'alert(',
    '<script>',
    '<script src=',
    '\"javascript:',
    '<img src=\"',
	'<IMG \"\"\">',
    '<style>',
    'eval(',
    'String.fromCharCode(',
    'document.writeln(',
	'<!--[if gte IE 4]>'
    );

var suffixArray = new Array(
    '',
    ')',
    '</script>',
    '></script>',
    '\"',
    '\">',
	'\">',
    '</style>',
    ')',
    ')',
    ');document.close;',
	'<![endif]-->'
    );
    
var encWrapperArray = new Array(
	'Wrap Plain Text','before',
	'Wrap Encoded Text','after',
	'Remove Outermost - Plain','removeP',
	'Remove Outermost - Enc','removeE'
	);
	
/*
 * Sets the prefix and suffix given the wrapper value.
 */
function setWrapper() {
	var prefix = '';
	var suffix = '';
	var wrapTiming = '';
	var wrapper = '';
	var wrapText  = '';

	wrapper = document.ENCODE.wrapper.value;
	wrapTiming = document.ENCODE.wrapTiming.value;

	if (wrapper != '') {
		prefix = prefixArray[wrapper];
		suffix = suffixArray[wrapper];
	} else {
		prefix = '';
		suffix = '';	
	}

	// Applies the wrapper option.
	switch (wrapTiming) {
		case ('before'):
			// Add wrapper to plain text textarea.
			wrapText = prefix + document.ENCODE.plain.value + suffix;
			document.ENCODE.plain.value = wrapText;
			; break;	
		case ('after'):
			// Add wrapper to encoded text textarea.
			wrapText = prefix + document.ENCODE.encoded.value + suffix;
			document.ENCODE.encoded.value = wrapText;
			; break;	
		case ('removeP'):
			// Remove outermost wrapper from plain text textarea.
			wrapText = document.ENCODE.plain.value;
	
			if ((wrapText.substring(0,prefix.length).toLowerCase() == prefix.toLowerCase()) &&
				(wrapText.slice(wrapText.length - suffix.length).toLowerCase() == suffix.toLowerCase())) {
					wrapText = wrapText.substring(prefix.length, (wrapText.length - suffix.length));
					document.ENCODE.plain.value = wrapText;
			} else {
				displayMessage('Cannot find that wrapper');
			}	
			; break;
		 case ('removeE'):
			// Remove outermost wrapper from encoded text textarea.
			wrapText = document.ENCODE.encoded.value;
	
			if ((wrapText.substring(0,prefix.length).toLowerCase() == prefix.toLowerCase()) &&
				(wrapText.slice(wrapText.length - suffix.length).toLowerCase() == suffix.toLowerCase())) {
					wrapText = wrapText.substring(prefix.length, (wrapText.length - suffix.length));
					document.ENCODE.encoded.value = wrapText;
			} else {
				displayMessage('Cannot find that wrapper');
			}	
			; break;	
		default:
			displayMessage('Select a Wrapper option');
	}
	
	prefix = '';
	suffix = '';
	wrapTiming = '';

}

/*
 * Arrays for Dropdown boxes.
 */ 
var	reqSchemaArray = new Array(
	'http://' ,
	'https://',
	'file:///',
	'ftp://',
	'ldap://',
	'ldaps://'
	);

// var reqVersionArray = new Array(
// 	'HTTP/1.1',
// 	'HTTP/1.0',
// 	'HTTP/0.9',
// 	);
	
var reqAuthArray = new Array(
	'URL',
	'Basic'
	);

var reqMethodArray = new Array(
	'GET',
	'POST',
	'HEAD',
	'TRACE',
	'TRACK',
	'OPTIONS',
	'CONNECT',
	'PUT',
	'DELETE',
	'COPY',
	'LOCK',
	'MKCOL',
	'MOVE',
	'PROPFIND',
	'PROPPATCH',
	'SEARCH',
	'UNLOCK'
	);

var reqHeadAccept = new Array(
	'*/*','text/xml','text/plain','text/html','multipart/form-data','application/x-www-form-urlencoded',
	'application/xml','application/xhtml+xml','text/*','text/richtext','text/enriched',
	'text/tab-separated-values','text/sgml','multipart/*','multipart/mixed','multipart/alternative',
	'multipart/digest','multipart/parallel','multipart/appledouble','multipart/header-set',
	'multipart/related','multipart/report','multipart/voice-message','message/*','message/rfc822',
	'message/partial','message/external-body','message/news','message/http','application/*',
	'application/octet-stream','application/postscript','application/oda',
	'application/atomicmail','application/andrew-inset','application/slate',
	'application/wita','application/dec-dx','application/dca-rft','application/activemessage',
	'application/rtf','application/applefile','application/mac-binhex40','application/news-message-id',
	'application/news-transmission','application/wordperfect5.1','application/pdf',
	'application/zip','application/macwriteii','application/msword','application/remote-printing',
	'application/mathematica','application/cybercash','application/commonground',
	'application/iges','application/riscos','application/eshop','application/x400-bp',
	'application/sgml','application/cals-1840','application/vnd.framemaker','application/vnd.mif',
	'application/vnd.ms-excel','application/vnd.ms-powerpoint','application/vnd.ms-project',
	'application/vnd.ms-works','application/vnd.ms-tnef','application/vnd.svd',
	'application/vnd.music-niff','application/vnd.ms-artgalry','application/vnd.truedoc',
	'application/vnd.koan','image/*','image/jpeg','image/gif','image/ief','image/g3fax','image/tiff',
	'image/cgm','image/naplps','image/vnd.dwg','image/vnd.svf','image/vnd.dxf','audio/*','audio/basic',
	'audio/32kadpcm','video/*','video/mpeg','video/quicktime','video/vnd.vivo');

var reqHeadAccChar = new Array(
	'us-ascii','iso-8859-1','iso-8859-2','iso-8859-3','iso-8859-4','iso-8859-5',
	'iso-8859-6','iso-8859-7','iso-8859-8','iso-8859-9','iso-2022-jp','iso-2022-jp-2',
	'iso-2022-kr','unicode-1-1','unicode-1-1-utf-7','unicode-1-1-utf-8');

var reqHeadAccEnc = new Array(
	'*','gzip','x-gzip','compress','x-compress','identity');

var reqHeadAccLang = new Array(
	navigator.language,'aa','ab','af','am','ar','as','ay','az','ba','be','bg','bh',
	'bi','bn','bo','br','ca','co','cs','cy','da','de','dz','el','en','en-US','eo','es','et','eu',
	'fa','fi','fj','fo','fr','fy','ga','gd','gl','gn','gu','ha','he','hi','hr','hu','hy','ia',
	'id','ie','ik','is','it','iu','iw','ja','jw','ka','kk','kl','km','kn','ko','ks','ku','ky',
	'la','ln','lo','lt','lv','mg','mi','mk','ml','mn','mo','mr','ms','mt','my','na','ne',
	'nl','no','oc','om','or','pa','pl','ps','pt','qu','rm','rn','ro','ru','rw','sa','sd','sg',
	'sh','si','sk','sl','sm','sn','so','sq','sr','ss','st','su','sv','sw','ta','te','tg','th','ti',
	'tk','tl','tn','to','tr','ts','tt','tw','ug','uk','ur','uz','vi','vo','wo','xh','yi','yo','za','zh','zu'
	);

var reqHeadValAllow = new Array(
	'GET','POST','HEAD','TRACE','TRACK','OPTIONS','CONNECT','PUT','DELETE','COPY',
	'LOCK','MKCOL','MOVE','PROPFIND','PROPPATCH','SEARCH','UNLOCK');

var reqHeadValAuth = new Array('Basic {b64 user:pass}','Digest [USER DEFINED]');

var reqHeadValCache = new Array(
	'no-cache',
	'no-store',
	'max-age [n Seconds]',
	'max-stale',
	'min-fresh [n Seconds]',
	'no-transform',
	'only-if-cached',
	'cache-extension'
	);

var reqHeadValConnect = new Array('close','keep-alive');

var reqHeadValConEnc = new Array('gzip','compress','deflate');

var reqHeadValConLang = new Array(
	navigator.language,'aa','ab','af','am','ar','as','ay','az','ba','be','bg','bh','bi','bn',
	'bo','br','ca','co','cs','cy','da','de','dz','el','en','en-US','eo','es','et','eu','fa',
	'fi','fj','fo','fr','fy','ga','gd','gl','gn','gu','ha','he','hi','hr','hu','hy','ia','id',
	'ie','ik','is','it','iu','iw','ja','jw','ka','kk','kl','km','kn','ko','ks','ku','ky','la',
	'ln','lo','lt','lv','mg','mi','mk','ml','mn','mo','mr','ms','mt','my','na','ne','nl','no',
	'oc','om','or','pa','pl','ps','pt','qu','rm','rn','ro','ru','rw','sa','sd','sg','sh','si',
	'sk','sl','sm','sn','so','sq','sr','ss','st','su','sv','sw','ta','te','tg','th','ti','tk','tl',
	'tn','to','tr','ts','tt','tw','ug','uk','ur','uz','vi','vo','wo','xh','yi','yo','za','zh','zu'
	);

var reqHeadValConLen = new Array('{Request Body Length}');

var reqHeadValConLoc = new Array('[AbsoluteURI or RelativeURI]');

var reqHeadValConMD5 = new Array('{md5 Request Body}');

var reqHeadValConRan = new Array('[Byte Range eg 1024-2047]');

var reqHeadValConTrEn = new Array('7bit','8bit','binary','base64','quoted-printable');

var reqHeadValConTyp = new Array(
	'*/*','text/xml','text/plain','text/html','multipart/form-data','application/x-www-form-urlencoded',
	'application/xml','application/xhtml+xml','text/*','text/richtext','text/enriched',
	'text/tab-separated-values','text/sgml','multipart/*','multipart/mixed','multipart/alternative',
	'multipart/digest','multipart/parallel','multipart/appledouble','multipart/header-set',
	'multipart/related','multipart/report','multipart/voice-message','message/*','message/rfc822',
	'message/partial','message/external-body','message/news','message/http','application/*',
	'application/octet-stream','application/postscript','application/oda',
	'application/atomicmail','application/andrew-inset','application/slate',
	'application/wita','application/dec-dx','application/dca-rft','application/activemessage',
	'application/rtf','application/applefile','application/mac-binhex40','application/news-message-id',
	'application/news-transmission','application/wordperfect5.1','application/pdf',
	'application/zip','application/macwriteii','application/msword','application/remote-printing',
	'application/mathematica','application/cybercash','application/commonground',
	'application/iges','application/riscos','application/eshop','application/x400-bp',
	'application/sgml','application/cals-1840','application/vnd.framemaker','application/vnd.mif',
	'application/vnd.ms-excel','application/vnd.ms-powerpoint','application/vnd.ms-project',
	'application/vnd.ms-works','application/vnd.ms-tnef','application/vnd.svd',
	'application/vnd.music-niff','application/vnd.ms-artgalry','application/vnd.truedoc',
	'application/vnd.koan','image/*','image/jpeg','image/gif','image/ief','image/g3fax','image/tiff',
	'image/cgm','image/naplps','image/vnd.dwg','image/vnd.svf','image/vnd.dxf','audio/*','audio/basic',
	'audio/32kadpcm','video/*','video/mpeg','video/quicktime','video/vnd.vivo');

var reqHeadValCook = new Array('[name1=value1; name2=value2]');

var reqHeadValCook2 = new Array('[name1=value1; name2=value2]');

var reqHeadValDate = new Array(Date());

var reqHeadValDepth = new Array('0','1','infinity');

var reqHeadValDerFrom = new Array('[Upload File Version]');

var reqHeadValDest = new Array('[AbsoluteURI]');

var reqHeadValExpect = new Array('100-continue');

var reqHeadValExpire = new Array(Date());

var reqHeadValForward = new Array('By [URI] for [FQDN]');

var reqHeadValFrom = new Array('[Email Address]');

var reqHeadValHost = new Array('{FQDN}');

var reqHeadValIf = new Array('[Statement]');

var reqHeadValIfMatch = new Array('*');

var reqHeadValIfModSin = new Array(Date());

var reqHeadValIfNoMat = new Array('*');

var reqHeadValIfRan = new Array('[entity-tag]');

var reqHeadValIfUnSin = new Array(Date());

var reqHeadValKeepAl = new Array('0','60','300','600')

var reqHeadValLastMo = new Array(Date());

var reqHeadValLink = new Array('[Absolute URL]');

var reqHeadValLocat = new Array('[Absolute URI]');

var reqHeadValLockTok = new Array('[Coded-URL]');

var reqHeadValMand = new Array('[Field Name]');

var reqHeadValMaxFor = new Array('0','1','9');

var reqHeadValMessID = new Array('[Unique Identifier @ FQDN]');

var reqHeadValMIMEV = new Array('1.0');

var reqHeadValOver = new Array('T','F');

var reqHeadValPrAuth = new Array('Basic {b64 user:pass}','Digest [creds]');

var reqHeadValPrConn = new Array('keep-alive');

var reqHeadValPragma = new Array('no-cache');

var reqHeadValRange = new Array('[Byte Range eg 1024-2047]');

var reqHeadValRefer = new Array('[absoluteURI or relativeURI]');

var reqHeadValSOAPA = new Array('[USER DEFINED]');

var reqHeadValTE = new Array('chunked','deflate','trailers');

var reqHeadValTitle = new Array('[Document Title]');

var reqHeadValTrail = new Array('[Message Header Field]');

var reqHeadValTime = new Array('infinite','Second-[# of Seconds]');

var reqHeadValTransEn = new Array('chunked');

var reqHeadValUpgr = new Array('HTTP/1.1','HTTP/1.2','HTTP/2.0','TLS/1.0');

var reqHeadValURI = new Array('[New location of document]');

var reqHeadValUserAg = new Array(
	navigator.userAgent,
	'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.8.1) Gecko/20061010 Firefox/2.0',
	'Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en-US; rv:1.8.0.4) Gecko/20060508 Firefox/1.5.0.5',
	'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.8.0.5) Gecko/20060723 Firefox/1.5.0.5',
	'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en) AppleWebKit/418.8 (KHTML, like Gecko) Safari/419.3',

	'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.4) Gecko/20060608 Ubuntu/dapper-security Firefox/1.5.0.5',
	'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.7.13) Gecko/20060707 Red Hat/1.7.13-1.1.3.1',
	'Mozilla/5.0 (X11; U; Linux i586; en-US; rv:1.7.3) Gecko/20040924 Epiphany/1.4.4 (Ubuntu)',
	'Mozilla/5.0 (X11; U; Linux; i686; en-US; rv:1.6) Gecko Debian/1.6-7',
	'Mozilla/5.0 (X11; U; FreeBSD; i386; en-US; rv:1.7) Gecko',
	'Mozilla/4.77 [en] (X11; I; IRIX;64 6.5 IP30)',
	'Mozilla/4.8 [en] (X11; U; SunOS; 5.7 sun4u)',
	'Mozilla/3.0 (compatible; NetPositive/2.1.1; BeOS)',
	'Konqueror/3.0-rc4; (Konqueror/3.0-rc4; i686 Linux;;datecode)',
	'Lynx/2.8.5rel.1 libwww-FM/2.14 SSL-MM/1.4.1 GNUTLS/0.8.12',
	'Links (2.1pre15; FreeBSD 5.3-RELEASE i386; 196x84)',

	'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.0.6) Gecko/20060728 Firefox/1.5.0.6',
	'Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.8.0.4) Gecko/20060508 Firefox/1.5.0.6',
	'Mozilla/5.0 (Windows; U; Windows XP) Gecko MultiZilla/1.6.1.0a',

	'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
	'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0)',
	'Mozilla/4.0 (compatible; MSIE 5.0; Windows 98)',
	'Mozilla/3.01Gold (Win95; I)',
	'Mozilla/2.02E (Win95; U)',
	
	'Opera/7.51 (Windows NT 5.1; U) [en]',
	'Opera/7.50 (Windows XP; U)',
	'Opera/7.50 (Windows ME; U) [en]',

	'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
	'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
	'Mozilla/5.0 (compatible; grub-client-1.5.3; (grub-client-1.5.3)',
	'Mozilla/5.0 (compatible; Gulper Web Bot 0.2.4 (www.ecsl.cs.sunysb.edu/~maxim/cgi-bin/Link/GulperBot)',
	'Mozilla/5.0 (compatible; msnbot/1.0 (+http://search.msn.com/msnbot.htm)'
	);

var reqHeadValVia = new Array('1.0 [Proxy Server]','1.1 [Proxy Server]');

var reqHeadValVers = new Array('[Resource Version]');

var reqHeadValWarn = new Array('110','111','112','113','199','214','299');

var reqHeadNameArray = new Array(
 	'Accept',reqHeadAccept,
 	'Accept-Charset',reqHeadAccChar,
 	'Accept-Encoding',reqHeadAccEnc,
 	'Accept-Language',reqHeadAccLang,
	'Allow',reqHeadValAllow,
 	'Authorization',reqHeadValAuth,
 	'Cache-Control',reqHeadValCache,
 	'Connection',reqHeadValConnect,
 	'Content-Encoding',reqHeadValConEnc,
 	'Content-Language',reqHeadValConLang,
 	'Content-Length',reqHeadValConLen,
 	'Content-Location',reqHeadValConLoc,
 	'Content-MD5',reqHeadValConMD5,
 	'Content-Range',reqHeadValConRan,
 	'Content-Transfer-Encoding',reqHeadValConTrEn,
 	'Content-Type',reqHeadValConTyp,
 	'Cookie',reqHeadValCook,
 	'Cookie2',reqHeadValCook2,
 	'Date',reqHeadValDate,
 	'Depth',reqHeadValDepth,
	'Derived-From',reqHeadValDerFrom,
	'Destination',reqHeadValDest,
 	'Expect',reqHeadValExpect,
	'Expires',reqHeadValExpire,
	'Forwarded',reqHeadValForward,
 	'From',reqHeadValFrom,
 	'Host',reqHeadValHost,
 	'If',reqHeadValIf,
 	'If-Match',reqHeadValIfMatch,
 	'If-Modified-Since',reqHeadValIfModSin,
 	'If-None-Match',reqHeadValIfNoMat,
 	'If-Range',reqHeadValIfRan,
 	'If-Unmodified-Since',reqHeadValIfUnSin,
 	'Keep-Alive',reqHeadValKeepAl,
	'Last-Modified',reqHeadValLastMo,
	'Link',reqHeadValLink,
	'Location',reqHeadValLocat,
	'Lock-Token',reqHeadValLockTok,
	'Mandatory',reqHeadValMand,
 	'Max-Forwards',reqHeadValMaxFor,
	'Message-ID',reqHeadValMessID,
 	'MIME-Version',reqHeadValMIMEV,
	'Overwrite',reqHeadValOver,
 	'Proxy-Authorization',reqHeadValPrAuth,
 	'Proxy-Connection',reqHeadValPrConn,
 	'Pragma',reqHeadValPragma,
 	'Range',reqHeadValRange,
 	'Referer',reqHeadValRefer,
 	'SOAPAction',reqHeadValSOAPA,
 	'TE',reqHeadValTE,
	'Title',reqHeadValTitle,
 	'Trailer',reqHeadValTrail,
	'Timeout',reqHeadValTime,
 	'Transfer-Encoding',reqHeadValTransEn,
 	'Upgrade',reqHeadValUpgr,
	'URI-header',reqHeadValURI,
 	'User-Agent',reqHeadValUserAg,
 	'Via',reqHeadValVia,
	'Version',reqHeadValVers,
 	'Warning',reqHeadValWarn
	);

var reqBrowHeadArray = new Array(
	'Firefox',reqBrowHeadFirefox,
	'IE',reqBrowHeadIE
	);

var reqBrowHeadFirefox = new Array(
	'Host','{FQDN}',
	'User-Agent','Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.8.1) Gecko/20061010 Firefox/2.0',
	'Accept-Encoding','gzip',
	'Accept','text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5',
	'Accept-Language','en-us,en;q=0.5',
	'Accept-Charset','ISO-8859-1,utf-8;q=0.7,*;q=0.7',
	'Connection','keep-alive'
	);
	
var reqBrowHeadIE = new Array(
	'Accept','*/*',
	'Accept-Language','en-US',
	'UA-CPU','x86',
	'Accept-Encoding','gzip, deflate',
	'User-Agent','Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)',
	'Host','{FQDN}',
	'Connection','Keep-Alive'
	);
	
var dropdownLoadArray1 = new Array(
	reqSchemaArray,'reqSchema',
//	reqVersionArray,'reqVersion',
	reqAuthArray,'reqAuth',
	reqMethodArray,'reqMethod',
	reqBrowHeadArray,'reqBrowHead',
	reqMethodArray,'reqMethHead'
	);

var reqInternalField = new Array(	
	'FQDN','reqFqdn',
	'Port','reqPort',
	'Path','reqPath',
	'Parameter','reqParameter',
	'QueryString','reqQString',
	'Add Parm Name','reqParmName',
	'Add Parm Value','reqParmVal',
	'UserName','reqUser',
	'Password','reqPass',
	'Header Textarea','reqHead',
	'Body Textarea','reqBody',
	'Upload File','reqUpFile'
	);

var reqQuickEncode = new Array(	
	'Url','encodeUrl',
	'Hex','encodeHex',
	'Unicode','encodeUni',
	'Base64','encodeB64',
	'MD5','encodeMd5'
	);

var reqBodyAction = new Array(	
	'Split Name/Value Pairs','splitNV',
	'Concat Name/Value Pairs','concatNV',
	'Show Char Count','charCount'
	);

var reqSelectArray = new Array(
	'Auth User','reqUser',
	'Auth Pass','reqPass',
	'FQDN','reqFqdn',
	'Port','reqPort',
	'Path','reqPath',
	'Separator','reqSeparator',
	'Parameter','reqParameter',
	'QueryString','reqQString',
	'Add Parm Name','reqParmName',
	'Add Parm Value','reqParmVal',
	'Upload File','reqUpFile',
	'Header Textarea','reqHead',
	'Body Textarea','reqBody'
	);

var reqClearValueArray = new Array(	
	'ALL FIELDS','reqClearAll',
	'Auth User','reqUser',
	'Auth Pass','reqPass',
	'FQDN','reqFqdn',
	'Port','reqPort',
	'Path','reqPath',
	'ParamSeparator','reqSeparator',
	'Parameter','reqParameter',
	'QStringSeparator','reqQSep',
	'QueryString','reqQString',
	'Add Parm Name','reqParmName',
	'Add Parm Value','reqParmVal',
	'Upload File','reqUpFile',
	'Header Textarea','reqHead',
	'Body Textarea','reqBody'
	);

var resSelectArray = new Array(
	'Target Url','resTargetUrl',
	'Status Code','resStatCode',
	'Status Text','resStatText',
	'Headers','resHead',
	'Body','resBody'
	);

var resClearValueArray = new Array(	
	'ALL FIELDS','resClearAll',
	'Elements','resElements',
	'Target Url','resTargetUrl',
	'Status Code','resStatCode',
	'Status Text','resStatText',
	'Response Headers','resHead',
	'Response Body','resBody'
	);

var xssSelectArray = new Array(
	'Code','attackCode',
	'Description','description',
	'Attack Title','udAttackTitle',
	'Regex Code','regExpr',
	'Regex Flags','regFlag',
	'Regex Replace','regReplace'
	);

var xssClearValueArray = new Array(	
	'ALL FIELDS','xssClearAll',
	'Checkboxes','xssBrowCheck',
	'Code','attackCode',
	'Description','description',
	'Attack Title','udAttackTitle',
	'Regex Code','regExpr',
	'Regex Flags','regFlag',
	'Reg Replace','regReplace'
	);

var xssRegexArray = new Array(	
	'Show Matches','regMatch',
	'Replace Matches','regReplace',
	'Split on Matches','regSplit',
	'Replace then Test','regNewW'
	);

var xssBrowserArray = new Array(	
	'Works in All','ALL'
	);

var dropdownLoadArray2 = new Array(
	xssSelectArray,'xssSelect',
	xssClearValueArray,'xssClear',
	xssRegexArray,'regAction',
	xssBrowserArray,'browFilter',
	encWrapperArray,'wrapTiming',
	reqInternalField,'reqInField',
	reqQuickEncode,'reqEncode',
	reqQuickEncode,'autoEncode',
	reqBodyAction,'reqBodyAction',
	reqSelectArray,'reqSelect',
	resSelectArray,'resSelect',
	reqClearValueArray,'reqClear',
	resClearValueArray,'resClear'
	);
	
var selTextArray = new Array(
	'Show Current Selection','show',
	'Test in New Window','test',
	'Send for RegEx Test','attackCode',
	'Send for Encoding','plain',
	'Send for Decoding','encoded',
	'Send to Request FQDN','reqFqdn',
	'Send to Request QString','reqQString',
	'Send to Request Header','reqHead',
	'Send to Request Body','reqBody',
	'Send to Scratchpad','pad',
	'Send to IP Encoder','ip',
	'Send to AutoAttack','workArea',
	'Clear Current Selection','clear',
	'Delete Current Selection','delete'
	);
	
var textArray  = new Array();
var valueArray = new Array();

/*
 * Driver function for loading the smaller select boxes.
 */
function loadDropDowns() {

	loadXssBrowserArray();
	loadDropDowns1();
	loadDropDowns2();
	loadSelectedTextDD();
	loadWrapperDD();
	loadHeaderNameDD();
}

/*
 * Loads the browser filter array and creates the browser checkboxes.
 */
function loadXssBrowserArray() {

	var boxHold = document.getElementById('browBox'); 
	var newBox = '';
	
	for (var e=0;e<editBrowString.length;e++) {
		xssBrowserArray.push('Works in ' + editBrowString[e]);
		xssBrowserArray.push(editBrowString[e]);
		
		newBox = document.createElement('input');
		newBox.type = 'checkbox';
		newBox.id = 'ud'+ editBrowString[e];
		document.getElementById('browBox').innerHTML += '&nbsp;&nbsp;' + editBrowString[e].toString() + '</input>';

		try {
			boxHold.appendChild(newBox); // Standards compliant (non-IE)
		} catch(ex) {
			boxHold.add(newBox); // IE only
		}
	}
}

/*
 * Load drop-downs type1.
 */
function loadDropDowns1() {
	var ddlaLen = dropdownLoadArray1.length;

	for (var a=0; a<ddlaLen; a++) {
		textValueEqual(dropdownLoadArray1[a],dropdownLoadArray1[a+1]);
		a+=1;
	}	
}

/*
 * Load drop-downs type2.
 */
function loadDropDowns2() {

	var ddlaLen2 = dropdownLoadArray2.length;
	
	for (var b=0; b<ddlaLen2; b++) {
		textValueDifferent(dropdownLoadArray2[b],dropdownLoadArray2[b+1]);
		b+=1;
	}	
}

/*
 * Load the Selected Text dropdowns.
 */
function loadSelectedTextDD() {

	// Load the text and value arrays from the Selected Text arrays.
	var selLen = selTextArray.length;
	
	for (var c=0; c<selLen; c++) {
		textArray[c]  = selTextArray[c];
		valueArray[c] = selTextArray[c+1];
		c+=1;
	}
	
	// Build the Selected Text select boxes.
	var idValue = '';
	
	for (var d=0;d<9;d++) {
		idValue = 'sendIt' + d.toString();
		addOptions(idValue);
	}
	clearDDArrays();
}	
	
/*
 * Load Wrapper dropdown.
 */
function loadWrapperDD() {
	// Get info from Wrapper arrays to create array holding the text values for
	// the Wrapper select box.
	for (e in prefixArray) {
		if (prefixArray[e] != '') {
			textArray[e] = prefixArray[e] + ' ... ' + suffixArray[e];
		}
	}		
	addOptions('wrapper');
	clearDDArrays();	
}

/*
 * Adds the options for the Header Name select box.
 */
function loadHeaderNameDD() {
	var arrayLen = reqHeadNameArray.length;
	
	for (var i=0; i<arrayLen; i++) {
		textArray[i]  = reqHeadNameArray[i];
		valueArray[i] = reqHeadNameArray[i];
		i += 1;
	}
	
	addOptions('reqHeadName');		
	clearDDArrays();
}


/*
 * Adds the options for the small select boxes that have equal Text and Value values.
 */
function textValueEqual(arrayName,id) {
	
	for (i in arrayName) {
		textArray[i]  = arrayName[i];
		valueArray[i] = arrayName[i];	
	}
	
	addOptions(id);		
	clearDDArrays();
}

/*
 * Adds the options for the small select boxes that have different Text and Value values.
 */
function textValueDifferent(arrayName,id) {

	var arrayLen = arrayName.length;
	
	for (var j=0; j<arrayLen; j++) {
		textArray[j]  = arrayName[j];
		valueArray[j] = arrayName[j+1];
		j+=1;
	}
	
	addOptions(id);		
	clearDDArrays();
}

/*
 * Adds the options for the small select boxes.
 */
function addOptions(inID) {
	var newOpt = '';
	var elementSel = document.getElementById(inID);
	
	for (k in textArray) {

		if (typeof textArray[k] != typeof undefined) {
			// Create the new option.
			newOpt = document.createElement('option');

			// Load the text
			newOpt.text = textArray[k];
	
			// Load the value
			if (valueArray[k] == null) {
				newOpt.value = k;
			} else {
				newOpt.value = valueArray[k];
			}
			
			// Add the new option to the select box.
			try {
				elementSel.add(newOpt, null); // Standards compliant (non-IE)
			} catch(ex) {
				elementSel.add(newOpt); // IE only
			}
		}
	}
}

/*
 * Clears out the Text and Value arrays.
 */
function clearDDArrays() {  
	textArray  = new Array();
	valueArray = new Array();
}
