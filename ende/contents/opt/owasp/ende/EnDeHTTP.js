/* ========================================================================= //
# vi:  set ts=4:
# vim: set ts=4:
#?
#? NAME
#?      EnDeHTTP.js
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeForm.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeHTTP.js"></SCRIPT>
#?
#? DESCRIPTION
#?      This file contains functiosn/methods HTTP text analysis.
#?      It defines the  EnDe.HTTP  class with following functions:
#?          parse()     - parse request and/or response, store result
#?          dispatch()  - manipulate text accoding given mode
#?          Request:
#?          analyze()   - analyze HTTP request
#?          get(typ)    - get "typ" of request
#?              SCHEMA  : schema
#?              USER    : user:password
#?              FQDN    : FQDN
#?              PORT    : port
#?              VERB    : verb (method) of request
#?              VERSION : version of request
#?              URL     : URL
#?              PARAM   : URL parameter
#?              SEARCH  : URL search part
#?              QUERY   : URL search part as list of key=value pairs
#?              BODY    : HTTP POST body as list of key=value pairs
#?              <any>   : value of <any> header
#?          set()       - build new request
#?          Response:
#?          analyze()   - analyze HTTP response
#?          get(typ)    - get "typ" of response
#?              VERSION : version of response
#?              STATUS  : status value
#?              TEXT    : status text
#?              BODY    : complete HTTP body
#?              <any>   : value of <any> header
#?          set()       - build new response
#?          dispatch()  - format text accoding given mode
#?          modes are:
#?              httpNULL: set text to NULL

parse_xml()
	<xml attr="a" key="val" />
parse_gwt()
	x|y|z|<xml .../>

#?
#? SEE ALSO
#?      EnDeForm.js
#?
# HACKER's INFO
#       -----------------------------------------------------------------------
#?
#? VERSION
#?      @(#) EnDeHTTP.js 1.7 12/05/29 22:13:54
#?
#? AUTHOR
#?      10-may-10 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

/*
POST /path/file.fcc;sid=dead-beaf?TYPE=42&key=val HTTP/1.0
Host: host.some.tld
User-Agent: ...
Accept: text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png;q=0.5
Accept-Language: de, en
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7
Keep-Alive: 300
Connection: close
Cookie: SID=dead-beaf
Referer: https://...
cookie: SID=second
Content-Type: application/x-www-form-urlencoded
Content-Length: 259

USER=user&PASSWORD=pass&lang=tr&


HTTP/1.1 302 Found
Date: Thu, 06 May 2010 15:48:32 GMT
Server: Apache
Set-Cookie: smm=1; path=/; domain=.bmwgroup.com
Set-Cookie: smm=; expires=Sat, 07 Nov 2009 15:48:32 GMT; path=/; domain=.some.tld
Expires: Thu, 01 Dec 1994 16:00:00 GMT
Location: https://...
Content-Length: 260
Connection: close
Content-Type: text/html; charset=iso-8859-1

*/

// ========================================================================= //
// EnDe.HTTP object                                                          //
// ========================================================================= //

if (typeof(EnDe)==='undefined') { EnDe = new function() {}; }

EnDe.HTTP   = new function() {
  this.SID      = '1.7';
  this.sid      = function() { return('@(#) EnDeHTTP.js 1.7 12/05/29 22:13:54 EnDe.HTTP'); };

	// ===================================================================== //
	// EnDe.HTTP object variables                                            //
	// ===================================================================== //

  this.schemas  = [ 'ftp', 'file', 'http', 'https', 'imap', 'imaps', 'ldap', 'ldaps', 'smb', 'ssh' ];
  this.methods  = [ 'GET', 'HEAD', 'POST', 'OPTIONS', 'TRACE', 'CONNECT', 'PUT', 'DELETE' ]; // http://www.ietf.org/rfc/rfc2616.txt
  this.webdav   = [ 'COPY', 'LOCK', 'MKCOL', 'MOVE', 'PROPFIND', 'PROPPATCH', 'SEARCH', 'UNLOCK' ];
  this.methodsMS= [ 'TRACK' ];
  this.versions = [ 'HTTP/0.9', 'HTTP/1.0', 'HTTP/1.1' ];

  this.headers  = new function() {
	this.Info_from = 'http://www.ietf.org/rfc/rfc2616.txt';
	// not used    = 'http://www.ietf.org/rfc/rfc2068.txt';
	var _types  = [
		'*/*','text/xml','text/plain','text/html','text/*','text/richtext','text/enriched',
		'text/tab-separated-values','text/sgml',
		'multipart/form-data',
		'multipart/mixed','multipart/alternative',
		'multipart/digest','multipart/parallel','multipart/appledouble','multipart/header-set',
		'multipart/related','multipart/report','multipart/voice-message','multipart/*',
		'message/*','message/rfc822','message/partial','message/external-body','message/news','message/http',
		'application/x-www-form-urlencoded',
		'application/xml','application/xhtml+xml',
		'application/octet-stream','application/postscript','application/oda',
		'application/atomicmail','application/andrew-inset','application/slate',
		'application/wita','application/dec-dx','application/dca-rft','application/activemessage',
		'application/news-transmission','application/wordperfect5.1','application/pdf',
		'application/rtf','application/applefile','application/mac-binhex40','application/news-message-id',
		'application/zip','application/macwriteii','application/msword','application/remote-printing',
		'application/mathematica','application/cybercash','application/commonground',
		'application/iges','application/riscos','application/eshop','application/x400-bp',
		'application/sgml','application/cals-1840','application/vnd.framemaker','application/vnd.mif',
		'application/vnd.ms-excel','application/vnd.ms-powerpoint','application/vnd.ms-project',
		'application/vnd.ms-works','application/vnd.ms-tnef','application/vnd.svd',
		'application/vnd.music-niff','application/vnd.ms-artgalry','application/vnd.truedoc',
		'application/vnd.koan',
		'application/*',
		'image/*','image/jpeg','image/gif','image/ief','image/g3fax','image/tiff',
		'image/cgm','image/naplps','image/vnd.dwg','image/vnd.svf','image/vnd.dxf',
		'audio/*','audio/basic','audio/32kadpcm',
        'video/*','video/mpeg','video/quicktime','video/vnd.vivo'
	];
	var _langs  = [
		navigator.language,'aa','ab','af','am','ar','as','ay','az','ba','be','bg','bh',
		'bi','bn','bo','br','ca','co','cs','cy','da','de','dz','el','en','en-US','eo','es','et','eu','fa',
		'fi','fj','fo','fr','fy','ga','gd','gl','gn','gu','ha','he','hi','hr','hu','hy','ia',
		'id','ie','ik','is','it','iu','iw','ja','jw','ka','kk','kl','km','kn','ko','ks','ku',
		'la','ln','lo','lt','lv','mg','mi','mk','ml','mn','mo','mr','ms','mt','my','na','ne',
		'nl','no','oc','om','or','pa','pl','ps','pt','qu','rm','rn','ro','ru','rw','sa','sd','sg',
		'sh','si','sk','sl','sm','sn','so','sq','sr','ss','st','su','sv','sw','ta','te','tg','th','ti',
		'tk','tl','tn','to','tr','ts','tt','tw','ug','uk','ur','uz','vi','vo','wo','xh','yi','yo','za','zh','zu'
	];
	var _cache  = [
		'no-cache', 'no-store', 'max-stale',
		'max-age [__int__ Seconds]', 'min-fresh [__int__ Seconds]',
		'no-transform', 'only-if-cached', 'cache-extension'
		];
	var _cache_response=[
		'public', 'private __string__', 'no-cache __string__', 'no-store', 'no-transform',
		'must-revalidate', 'proxy-revalidate',
		'max-age __int__', 's-maxage __int__', 'cache-extension'
		];
	var _chars  = [
		'iso-8859-1','iso-8859-2','iso-8859-3','iso-8859-4',
		'iso-8859-5','iso-8859-5','iso-8859-6','iso-8859-7',
		'iso-8859-8','iso-8859-9','iso-8859-10','iso-8859-11',
		'iso-8859-12','iso-8859-13','iso-8859-14','iso-8859-15',
		'iso-2022-jp','iso-2022-jp-2','iso-2022-kr','us-ascii',
		'unicode-1-1','unicode-1-1-utf-7','unicode-1-1-utf-8'
	];

//	#	#	#	#	#	#	#	#	#	#	#	#	#	#	#	#	#	#
	this.values = {
		'Accept':           _types,
		'Accept-Charset':   _chars,
		'Accept-Encoding':  [ '*','gzip','x-gzip','compress','x-compress','identity' ],
		'Accept-Language':  _langs,
		'Authorization':    [ 'Basic __string__', 'Digest __string__' ],
		'Cache-Control':    _cache,
		'Connection':       [ 'close','keep-alive' ],
		'Content-Encoding': [ 'gzip','compress','deflate' ],
		'Content-Language': _langs,
		'Content-Transfer-Encoding':[ '7bit','8bit','binary','base64','quoted-printable' ],
		'Content-Type':     _types,
		'Depth':            [ '0','1','infinity' ],
		'Expect':           [ '100-continue' ],
		'Forward':          [ 'By __URL__ for __string__' ],
		'If-Match':         [ '*' ],
		'If-None-Match':    [ '*' ],
		'Max-Forwards':     [ '0','1','9' ],
		'MIME-Version':     [ '1.0' ],
		'Overwrite':        [ 'T','F' ],
		'Proxy-Authorization':      [ 'Basic __string__','Digest __string__' ],
		'Proxy-Connection': [ 'keep-alive' ],
		'Pragma':           [ 'no-cache' ],
		'TE':               [ 'chunked','deflate','trailers' ],
		'Time':             [ 'infinite','Second-[__int__]' ],
		'Transfer-Encoding':[ 'chunked', '__string__' ],
		'Upgrade':          [ 'HTTP/1.1','HTTP/1.2','HTTP/2.0','TLS/1.0' ],
		'Via':              [ '1.0 [Proxy Server]','1.1 [Proxy Server]' ],
		'Warning':          [ '110','111','112','113','199','214','299' ]
	}; // values

	this.head   = {
	 	'Accept':           this.values['Accept'],
	 	'Accept-Charset':   this.values['Accept-Charset'],
	 	'Accept-Encoding':  this.values['Accept-Encoding'],
	 	'Accept-Language':  this.values['Accept-Encoding'],
//		'Allow':            EnDe.HTTP.methods + EnDe.HTTP.methodsMS + EnDe.HTTP.webdav,
	 	'Authorization':    this.values['Authorization'],
	 	'Cache-Control':    this.values['Cache-Control'],
	 	'Connection':       this.values['Connection'],
	 	'Content-Encoding': this.values['Content-Encoding'],
	 	'Content-Language': this.values['Content-Language'],
	 	'Content-Length':   '__int__',      // Request Body Length
	 	'Content-Location': '__URL__',      // AbsoluteURI or RelativeURI
	 	'Content-MD5':      '__hex__',      // MD5 Request Body
	 	'Content-Range':    '__string__',   // bytes 1024-2047/1234
	 	'Content-Transfer-Encoding':this.values['Content-Transfer-Encoding'],
	 	'Content-Type':     this.values['Content-Type'],
	 	'Cookie':           '__string__',
	 	'Cookie2':          '__string__',
	 	'Date':             '__date__',
	 	'Depth':            this.values['Depth'],
		'Derived-From':     '__string__',
		'Destination':      '__URL__',
	 	'ETag':             '__string__',   // FQDN
	 	'Expect':           this.values['Expect'],
		'Expires':          '__data__',
		'Forwarded':        this.values['Forward'],
	 	'From':             '__string__',   // Email Address
	 	'Host':             '__string__',   // FQDN
	 	'If':               '__string__',   // Statement
	 	'If-Match':         this.values['If-Match'],
	 	'If-Modified-Since':'__data__',
	 	'If-None-Match':    this.values['If-None-Match'],
	 	'If-Range':         '__string__',   // entity-tag
	 	'If-Unmodified-Since':  '__data__',
	 	'Keep-Alive':       '__int__',
		'Last-Modified':    '__data__',
		'Link':             '__URL__',
		'Location':         '__URL__',
		'Lock-Token':       '__URL__',
		'Mandatory':        '__string__',   // Field Name
	 	'Max-Forwards':     this.values['Max-Forwards'],
		'Message-ID':       '__string__',   // Unique Identifier @ FQDN
	 	'MIME-Version':     this.values['MIME-Version'],
		'Overwrite':        this.values['Overwrite'],
	 	'Proxy-Authorization':  this.values['Proxy-Authorization'],
	 	'Proxy-Connection': this.values['Proxy-Connection'],
	 	'Pragma':           this.values['Pragma'],
	 	'Range':            '__string__',   // Byte Range eg 1024-2047
	 	'Referer':          '__URL__',
	 	'SOAPAction':       '__string__',
	 	'TE':               this.values['TE'],
		'Title':            '__string__',
	 	'Trailer':          '__string__',   // Message Header Field
		'Timeout':          this.values['Time'],
	 	'Transfer-Encoding':this.values['Transfer-Encoding'],
	 	'Upgrade':          this.values['Upgrade'],
		'URI-header':       '__URL__',
	 	'User-Agent':       '__string__',
	 	'Via':              this.values['Via'],
		'Version':          '__string__',
	 	'Warning':          this.values['Warning']
	}; // .head

/*
general-header = Cache-Control
               | Connection
               | Date
               | Pragma
               | Trailer
               | Transfer-Encoding
               | Upgrade
               | Via
               | Warning
request-header = Accept
               | Accept-Charset
               | Accept-Encoding
               | Accept-Language
               | Authorization
               | Expect
               | From
               | Host
               | If-Match
               | If-Modified-Since
               | If-None-Match
               | If-Range
               | If-Unmodified-Since
               | Max-Forwards
               | Proxy-Authorization
               | Range
               | Referer
               | TE
               | User-Agent
response-header =
               | Accept-Ranges
               | Age
               | ETag
               | Location
               | Proxy-Authenticate
               | Retry-After
               | Server
               | Vary
               | WWW-Authenticate 
entity-header  = Allow
               | Content-Encoding
               | Content-Language
               | Content-Length
               | Content-Location
               | Content-MD5
               | Content-Range
               | Content-Type
               | Expires
               | Last-Modified
               | extension-header
*/

	this.UAs    = [
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
	];

	this.UA     = {
		'Firefox' : [
			'Host','{FQDN}',
			'User-Agent','Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.8.1) Gecko/20061010 Firefox/2.0',
			'Accept-Encoding','gzip',
			'Accept','text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5',
			'Accept-Language','en-us,en;q=0.5',
			'Accept-Charset','ISO-8859-1,utf-8;q=0.7,*;q=0.7',
			'Connection','keep-alive'
		],
	
		'IE' : [
			'Accept','*/*',
			'Accept-Language','en-US',
			'UA-CPU','x86',
			'Accept-Encoding','gzip, deflate',
			'User-Agent','Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)',
			'Host','{FQDN}',
			'Connection','Keep-Alive'
		],
		'dumm' : []
	}; // .UA
	

  }; // .headers

  this.status   = {
	'rfc2068':  {
		'100':  'Continue',
		'101':  'Switching Protocols',
		'200':  'OK',
		'201':  'Created',
		'202':  'Accepted',
		'203':  'Non-Authoritative Information',
		'204':  'No Content',
		'205':  'Reset Content',
		'206':  'Partial Content',
		'300':  'Multiple Choices',
		'301':  'Moved Permanently',
		'302':  'Moved Temporarily',
		'303':  'See Other',
		'304':  'Not Modified',
		'305':  'Use Proxy',
		'400':  'Bad Request',
		'401':  'Unauthorized',
		'402':  'Payment Required',
		'403':  'Forbidden',
		'404':  'Not Found',
		'405':  'Method Not Allowed',
		'406':  'Not Acceptable',
		'407':  'Proxy Authentication Required',
		'408':  'Request Time-out',
		'409':  'Conflict',
		'410':  'Gone',
		'411':  'Length Required',
		'412':  'Precondition Failed',
		'413':  'Request Entity Too Large',
		'414':  'Request-URI Too Large',
		'415':  'Unsupported Media Type',
		'416':  'Requested range not satisfiable',
		'417':  'Expectation Failed',
		'500':  'Internal Server Error',
		'501':  'Not Implemented',
		'502':  'Bad Gateway',
		'503':  'Service Unavailable',
		'504':  'Gateway Time-out',
		'505':  'HTTP Version not supported'
	}, // rfc2068
	'rfc2616':  {
		'100':  'Continue',
		'101':  'Switching Protocols',
		'200':  'OK',
		'201':  'Created',
		'202':  'Accepted',
		'203':  'Non-Authoritative Information',
		'204':  'No Content',
		'205':  'Reset Content',
		'206':  'Partial Content',
		'300':  'Multiple Choices',
		'301':  'Moved Permanently',
		'302':  'Found',                             // <-- 2068
		'303':  'See Other',
		'304':  'Not Modified',
		'305':  'Use Proxy',
		'307':  'Temporary Redirect',                // <-- 2068
		'400':  'Bad Request',
		'401':  'Unauthorized',
		'402':  'Payment Required',
		'403':  'Forbidden',
		'404':  'Not Found',
		'405':  'Method Not Allowed',
		'406':  'Not Acceptable',
		'407':  'Proxy Authentication Required',
		'408':  'Request Time-out',
		'409':  'Conflict',
		'410':  'Gone',
		'411':  'Length Required',
		'412':  'Precondition Failed',
		'413':  'Request Entity Too Large',
		'414':  'Request-URI Too Large',
		'415':  'Unsupported Media Type',
		'416':  'Requested range not satisfiable',   // <-- 2068
		'417':  'Expectation Failed',                // <-- 2068
		'500':  'Internal Server Error',
		'501':  'Not Implemented',
		'502':  'Bad Gateway',
		'503':  'Service Unavailable',
		'504':  'Gateway Time-out',
		'505':  'HTTP Version not supported'
	}, // rfc2616
	'variants': {
		//***:  'character case variants are not listed here',
		'401':  'Authorization Required',
		'404':  '', // ma be a path
		'502':  'Server or forwarder response invalid',
		'503':  'Service Temporarily Unavailable',
		'dum':  ''
	}  // variants
  }; // .status

  // ======================================================================= //
  // object for parsed request and response                                  //
  // ======================================================================= //


// ToDo: replace __head__ and __body__ with a more unique string: EnDe.HTTP....
  this.request  = {
	 '_id_':    'EnDe.HTTP.request',
	 '_ok_':    false,
	 'http':    '',
	 'url':     '',
	 'CRLF':    '\r\n', // line separator used for output
	 'DATA':    {       // parsed data of request
	 	'SCHEMA':  '',
	 	'USER':    '',
	 	'FQDN':    '',
	 	'PORT':    '',
	 	'URL':     '',
	 	'VERSION': '',
	 	'VERB':    '',
	 	'URL':     '',
	 	'PARAM':   '',
	 	'SEARCH':  '',
	 	'QUERY':   '',
	 	'HEADER':  {
			'__head__': []  // list of all identified headers, keeps sequence
			// head: value,
			},
	 	'BODY':    {
			'__body__': '', // body as is
			'__parm__': ''  // list of all identified key=values, keeps sequence
			// parm: value,
			}
		},
	 'PROPS':   {       // properties of keys and values listed in 'DATA'
	 	'SCHEMA':  '',
	 	'USER':    '',
	 	'FQDN':    '',
	 	'PORT':    '',
	 	'URL':     '',
	 	'VERSION': '',
	 	'VERB':    '',
	 	'URL':     '',
	 	'PARAM':   '',
	 	'SEARCH':  '',
	 	'QUERY':   '',
	 	'HEADER':  {
			'__head__': []  // NOT YET USED
			// head: [properties],
			/*
			 * lws:  string (whitespaces) between header key and :
			 * rws:  string (whitespaces) between : and header value
			 * rfc:  header key strictly confirms RFC 2616
			 * rfc:  header key strictly confirms RFC 2616
			 */
			},
	 	'BODY':    {
			'__body__': '', // NOT YET USED
			'__parm__': ''  // list of all identified key=values, keeps sequence
			// parm: [properties],
			}
		}
  };

  this.response = {
	 '_id_':    'EnDe.HTTP.response',
	 '_ok_':    false,
	 'CRLF':    '\r\n', // line separator used for output
	 'DATA':    {       // parsed data of response
	 	'VERSION': '',
	 	'STATUS':  '',
	 	'TEXT':    '',
	 	'HEADER':  {
			'__head__': []  // list of all identified headers, keeps sequence
			// head: value,
			},
	 	'BODY':    {
			'__body__': '', // body as is
			'__parm__': ''  // list of all identified key=values, keeps sequence
			// parm: value,
			}
		},
	 'PROPS':   {       // properties of keys and values listed in 'DATA'
	 	'VERSION': '',
	 	'STATUS':  '',
	 	'TEXT':    '',
	 	'HEADER':  {
			'__head__': []  // NOT YET USED
			// head: [properties],
			},
	 	'BODY':    {
			'__body__': '', // NOT YET USED
			'__parm__': ''  // list of all identified key=values, keeps sequence
			// parm: [properties],
			}
		}
  };

//src.replace(/(%)([0-9a-fA-F]{2})/g,  function(b,c,d){return c + c + d + d; });

	// ===================================================================== //
	// EnDe.HTTP string functions                                            //
	// ===================================================================== //

  this.str_index    = function(idx,src) {
  //#? return end of string starting at position idx 'til next occourance of character found at idx
	/*
	 * character itself must be \-escaped inside strings
	 */
	var bux = idx;
	var ccc = src[idx];
	bux++; // skip initial character
	while (bux<src.length) {
		if (src[bux]==='\\') {
			bux++;
			if (bux<src.length) { bux++; }
			continue;
		}
		if (src[bux]===ccc) { break; } // end of quoted string
		bux++;
	}
	return bux;
  }; // str_index

  this.str_scope    = function(idx,src) {
  //#? return end of string starting at position idx 'til next occourance proper closing bracket
	/*
	 * allows nested bracket scopes
	 */
	var bux = idx;
	var ccc = '';
	switch (src[idx]) {
	  case '(': ccc = ')'; break;
	  case '[': ccc = ']'; break;
	  case '{': ccc = '}'; break;
	  case '<': ccc = '>'; break;
	  default:  return ''; break;
	}
	while (bux<src.length) {
		if (src[bux]===ccc) { bux++; break; } // end of scope
		if (src[bux]===src[idx]) { // nested
			bux = this.str_scope(bux, src);
		}
		bux++;
	}
	return bux;
  }; // str_scope

  this.str_split    = function(typ,src) {
  //#? split src on separator typ, return array
	/*
	 * takes care for strings enclosed in " or ' 
	 * " or ' must be \-escaped inside strings
	 * separators inside strings are literal characters
	 */
	var bux = [];
	var bbb = '';
	var i   = 0, k = 0;
	while (i<src.length) {
		switch (src[i]) {
		  case '"': 
		  case "'":
			k = this.str_index(i,src);
			bbb += src.substring(i,k+1);
			//bux.push(bbb);
			i = k; //-1; // +1 added at end 
			break;
		  default:
			if (src[i]===typ) { // found separator
				bux.push(bbb);
				bbb = '';
			} else {
				bbb += src[i];
			}
			break;
		}
		i++;
	}
	if (bbb!=='') { bux.push(bbb); bbb = ''; }
	return bux;
  }; // .str_split

  this.parse    = function(typ,src) {
  //#? dispatcher for parsing QUERY string, POST data, etc., returns array
  //#typ?   GET:  assume search part of URL, split on &
  //#typ?   POST: assume POST request: split on &
  //#typ?   mult: assume POST request: split on boundary
  //#typ?   GWT:  assume POST request for GWT: split on |
  //#typ?   XML:  assume POST request as XML: split on tags insede outer scope
  //#typ?   JSON: assume POST request: split on ,
  //#typ?   JSON-GWT: assume response from GWT: split on , inside []

	var bux = [];
	var bbb = '';
	var i   = 0, k = 0;
	switch (typ) {
	  case 'GET':   return this.str_split('&', src); break;
	  case 'POST':  return this.str_split('&', src); break;
	  case 'GWT':   return this.str_split('|', src); break;
	  case 'JSON-GWT':
		i = src.indexOf('[');
		bux.push(src.substr(0,i));
		while (i<src.length) {
			switch (src[i]) {
			  case ',': bux.push(bbb); bbb = ''; break;
			  case '[':
				k = this.str_scope(i, src);
				i = k;
				break;
			  case ']': // end of data, anything following is trash
				bux.push(bbb);
				bbb = src.substr(i, src.length);
				bux.push(bbb);
				i = src.length;
				break;
			  default:  bbb += src[i]; break;
			}
		}
		if (bbb!=='') { bux.push(bbb); bbb = ''; }
		break;
	}
	return bux;
  }; // .parse

	// ===================================================================== //
	// analysing functions                                                   //
	// ===================================================================== //

  this.DE       = new function() {
  //# object for parsing HTTP messages
	// DEcoding is a synonym for parsing, somehow ..

	this.header   = function(src) {
	//#? parse HTTP message headers, return hash {'head': value, ... }
		// NOTE that src is an array of lines which will be reduced
		 	var bux = {};
			var bbb = '';
			var ccc = '';
			var kkk = '';
			bux['__head__'] = [];
			bbb = src.shift();
			while (src.length>0) {
				if(/^$/.test(bbb)===true) { break; }
				if(/^\s+/.test(bbb)===true) {
					if (bux[ccc]===undefined) {
						// continous header line without preceeding header line, is this possible?
					}
					kkk = bux[ccc].pop();
					bux[ccc].push(kkk + '\n' + bbb);
					break;
				} else {
					kkk = bbb.match(/^([a-zA-Z0-9._-]+\s*):(.*)/);
					ccc = kkk[1];
					bux['__head__'].push(ccc);
					if (bux[ccc]===undefined) {
						bux[ccc] = [];
					}
					bux[ccc].push(kkk[2]);
				}
				bbb = src.shift();
			}
			return bux;
	}; // .header
	
	this.body     = function(src) {
	//#? parse HTTP message body, return hash {'key': value, ... }
		// NOTE that src is an array of lines which will be reduced
		 	var bux = {};
			var bbb = '';
			var ccc = '';
			var kkk = '';
			var key = '';
			bux['__body__'] = src.join('');
			bux['__parm__'] = [];
			bbb = src.shift();
			while (src.length>0) {
				if(/^$/.test(bbb)===true) { break; }
				kkk = bbb.split('&');
				while (kkk.length>0) {  // parse key=value pairs
					ccc = kkk[0].match(/^([^=]+)(?:=)(.*)/);
					if (ccc!==null) {
						key = ccc[1];
					} else { // not a key=value, store as is
						key = kkk[0];
					}
					bux['__parm__'].push(key);
					if (bux[key]===undefined) {
						bux[key] = [];
					}
					if (ccc!==null) {
						bux[key].push(ccc[2]);
					}
					kkk.shift();
				}
				bbb = src.shift();
			}
			return bux;
	}; // .body

	this.parse    = function(src) {
	//#? parse given source and store data in EnDe.HTTP.request, EnDe.HTTP.response

		function _get(typ,dst,src) {
		//# internal function to extract specified data using a regex
			// matched data stored in dst[typ]
			// returns src reduced by requested and detected string
			if (src===null)      { return src; }
			if (src===undefined) { return src; }
			var bbb = null;
			switch (typ) {
			  // request URL line
			  case 'SCHEMA': bbb = src.match(/^\s*([a-z]+):(.*)/);  break;
			  case 'USER':   bbb = src.match(/^([^@]+)@(.*)/);      break;
			  case 'FQDN':   bbb = src.match(/^(?:\/\/)([a-zA-Z.-]+)([:\/].*)/); break;
			  case 'PORT':   bbb = src.match(/^:([0-9]+)(.*)/);     break;
			  // request VERB line
			  case 'VERB':   bbb = src.match(/(^[a-zA-Z]+)\s+(.*)/);break;
			  case 'URL':    bbb = src.match(/([^&?]*)(.*)/);       break;
			  case 'PARAM':  bbb = src.match(/;([^&?]*)(.*)/);      break;
			  case 'SEARCH': bbb = src.match(/[&?]([^# ]*)\s+(.*)/);break;
			  // request and response line
			  case 'VERSION':bbb = src.match(/^([^ ]*)(.*)/);       break;
			  // response line
			  case 'STATUS': bbb = src.match(/^\s*([^ ]+)\s+(.*)/); break;
			  case 'TEXT':   bbb = src.match(/^\s*(.*)(.*)/);       break;
			  // no default:
			}
			if (bbb!==null) {
				dst[typ] = bbb[1];
				if (typ==='USER') { // take care for wrong formatted URLs
					if (/\//.test(bbb[2])===true) {
						/* we store potential user:pass value which contains
						 * a / but return the given string without removing
						 * the matched user:pass string
						 */
						return src;
					}
				}
				return bbb[2];
			}
			// nothing matched, return src
			return src;
		}; _get

		var kkk = false;    // true if it is a full URL line

		/*
		 * remove all leading empty lines
		 */
		var arr = src.replace(/\r/g,'').split(/\n/);
		while (arr.length>0) {  // remove all leading empty lines
			if (/^\s*$/.test(arr[0])===false) { break; }
			arr.shift();
		}

		if(/^\s*(?:[a-z]+:)(?:\/\/)[a-zA-Z.-]+/.test(arr[0])===true) {
			/*
			 * parse full URL
			 */
			kkk = true;
			EnDe.HTTP.request['http'] = arr[0];
			arr[0] =_get('SCHEMA',  EnDe.HTTP.request['DATA'], arr[0]);
			arr[0] =_get('USER',    EnDe.HTTP.request['DATA'], arr[0]);
			arr[0] =_get('FQDN',    EnDe.HTTP.request['DATA'], arr[0]);
			arr[0] =_get('PORT',    EnDe.HTTP.request['DATA'], arr[0]);
			EnDe.HTTP.request['url'] = arr[0];
			EnDe.HTTP.request['_ok_']= true;
			if (kkk===true) { // full URL, remove it
				arr.shift();
				while (arr.length>0) {  // remove all leading empty lines
					if (/^\s*$/.test(arr[0])===false) { break; }
					arr.shift();
				}
			}
		}

		// arr[] now contains HTTP message header starting with VERB line
		if (arr.length>0) {
			/*
			 * parse HTTP request VERB line
			 */
			arr[0] =_get('VERB',    EnDe.HTTP.request['DATA'], arr[0]);
			arr[0] =_get('URL',     EnDe.HTTP.request['DATA'], arr[0]);
			arr[0] =_get('PARAM',   EnDe.HTTP.request['DATA'], arr[0]);
			arr[0] =_get('SEARCH',  EnDe.HTTP.request['DATA'], arr[0]);
			arr[0] =_get('VERSION', EnDe.HTTP.request['DATA'], arr[0]);
			EnDe.HTTP.request['DATA']['QUERY']  = EnDe.HTTP.request['DATA']['SEARCH'];
			arr.shift(); // get rid of now empty VERB line
			/*
			 * parse HTTP request message header
			 */
			EnDe.HTTP.request['DATA']['HEADER'] = this.header(arr);
			/*
			 * parse HTTP request message body
			 */
			EnDe.HTTP.request['DATA']['BODY']   = this.body(arr);
			EnDe.HTTP.request['_ok_']   = true;
		}

		while (arr.length>0) {  // remove all leading empty lines
			if (/^\s*$/.test(arr[0])===false) { break; }
			arr.shift();
		}
		// arr[] now contains HTTP response message
		if (arr.length>0) {
			/*
			 * parse HTTP response
			 */
			arr[0] =_get('VERSION', EnDe.HTTP.response['DATA'], arr[0]);
			arr[0] =_get('STATUS',  EnDe.HTTP.response['DATA'], arr[0]);
			arr[0] =_get('TEXT',    EnDe.HTTP.response['DATA'], arr[0]);
			arr.shift(); // get rid of now empty response line
			/*
			 * parse HTTP response message header
			 */
			EnDe.HTTP.response['DATA']['HEADER'] = this.header(arr);
			/*
			 * parse HTTP response message body
			 */
			EnDe.HTTP.response['DATA']['BODY']   = this.body(arr);
			EnDe.HTTP.response['_ok_']   = true;
		}

	}; // .parse

	this.get      = function(typ,dst,src) {
	//#? get value of specified typ from dst

		var bux = '';
		var bbb = null;
		var i   = 0;

		if (EnDe.HTTP.request['_ok_']!==true) {
			return null;
		}
		switch (typ) {
		  // following for VERB
		  case 'SCHEMA':
		  case 'USER':
		  case 'FQDN':
		  case 'PORT':
		  case 'VERB':
		  case 'URL':
		  case 'PARAM':
		  case 'SEARCH':
		  case 'QUERY':
		  case 'VERSION':
			bux = dst['DATA'][typ];
			break;
		  // following HTTP message body only
		  case 'BODY':
			for (i=0; i<dst['DATA']['BODY']['__parm__'].length; i++) {
				bbb = dst['DATA']['BODY']['__parm__'][i];
				bux += bbb + '=' + dst['DATA']['BODY'][bbb] + '&';
			}
			bux = bux.substr(0, (bux.length-1)); // remove trailing &
			break;
		  default: // '<any>': value of <any> header
			if (dst['DATA']['HEADER'][typ]!==undefined) {
				bux = dst['DATA']['HEADER'][typ].join('\n');
			}
			bbb = typ.toLowerCase();
			if (bbb===typ) { break; }
			if (dst['DATA']['HEADER'][bbb]!==undefined) {
				if (bux!=='') { bux += '\n'; }
				bux += dst['DATA']['HEADER'][bbb].join('\n');
			}
			break;
		} // switch(typ)
		return bux;
	}; // .get

  }; // .DE

  this.EN       = new function() {
  //# object for building HTTP messages
	// ENcoding is a synonym for constructing, somehow ..

	this.header   = function(dst) {
	//#? build HTTP message header from dst (request or response)
		var bux = '';
		var key = '';
		var h   = 0;
		var v   = 0;
		for (h=0; h<dst['DATA']['HEADER']['__head__'].length; h++) {
			key   = dst['DATA']['HEADER']['__head__'][h];
			for (v=0; v<dst['DATA']['HEADER'][key].length; v++) {
				bux += [
					key,
					':',
					dst['DATA']['HEADER'][key][v],
					dst['CRLF']
				].join('');
			}
		}
		return bux;
	}; // .header

	this.body     = function(dst) {
	//#? build HTTP message body from dst (request or response)
		var bux = '';
		var key = '';
		var k   = 0;
		var v   = 0;
//alert(k);
// ToDo:  hier ist k=1, keine Ahnung warum
		for (k=0; k<dst['DATA']['BODY']['__parm__'].length; k++) {
			key   = dst['DATA']['BODY']['__parm__'][k];
			for (v=0; v<dst['DATA']['BODY'][key].length; v++) {
				bux += [
					key,
					'=',
					dst['DATA']['BODY'][key][v],
					'&'
				].join('');
			}
		}
		return bux;
	}; // .body

	this.set      = function(_n1_,dst,src) {
	//#? build HTTP message from dst (request or response)

		var bux = '';
		var bbb = null;

		if (/request/.test(dst['_id_'])===true) {
			/*
			 * build HTTP request VERB line
			 */
			if (dst['DATA']['QUERY']!=='') {
				bbb = '?' + dst['DATA']['QUERY'];
			}
			bux = [
				dst['DATA']['VERB'],    ' ',
				dst['DATA']['URL'],     ' ',
				dst['DATA']['PARAM'],
				bbb       /* QUERY */,  ' ',
				dst['DATA']['VERSION'], dst['CRLF']
			].join('');
		} else {
			/*
			 * build HTTP response STATUS line
			 */
			bux = [
				dst['DATA']['VERSION'], ' ',
				dst['DATA']['STATUS'],  ' ',
				dst['DATA']['TEXT'],
				dst['CRLF']
			].join('');
		}
		/*
		 * build HTTP request message header
		 */
		bux += this.header(dst);
		bux += dst['CRLF'];
		/*
		 * build HTTP request message body
		 */
		bux += this.body(dst);
		return bux;
	}; // .set

  }; // .EN

  this.req  = new function() {
  //#? object for request methods
	this.analyze  = function(src) {
		/*
			Header general:
				line end: \n or \r or \r\n
			Header Keywords:
				whitspace before : separator:
				duplicates (same spelling):
				duplicates (different spellings):
				none-RFC spelling (first char only):
				none-RFC spelling (any charachter):
				none-RFC headers (X-prefixed):
				none-RFC headers (without prefixed):
				none 7-bit ASCII characters:
				continuous lines:
			Header values:
				no whitspace after : separator:
				multiple values (Cookies only):
				none-RFC value (Location without schema; Set-Cookie Expire; ...):
				none-RFC spelling:
				none US-ASCII characters:
				URL-encoded characters:
				base64-encoded characters:
				mismatches (i.e. length, encoding, ..):
				trailing whitespaces

			Query general:
				missing ? separator (starts with &): true/false
				duplicate keys:
			Body general:
				content-type: multipart/form-data vs. application/x-www-form-urlencoded
			Body Keywords:
				duplicates:
				duplicates with Query:

			Body and Query:
				empty (no value):
				empty (no =value):
				URL-encoded keys, values:
				base64-encoded keys, values:
		 */
	}; // .analyze
	this.get      = function(typ,src) {
		var bux = '';
		EnDe.HTTP.DE.parse(src);
		bux = EnDe.HTTP.DE.get(typ,EnDe.HTTP.request,src);
		return bux;
	}; // .get
	this.set      = function(_n1_,src) {
		var bux = '';
		EnDe.HTTP.DE.parse(src);
		bux = EnDe.HTTP.EN.set(_n1_,EnDe.HTTP.request,src);
		return bux;
	}; // .set
  }; // .req

  this.res  = new function() {
	this.analyze  = function(src) {};
	this.get      = function(typ,src) {
		var bux = '';
		EnDe.HTTP.DE.parse(src);
		bux = EnDe.HTTP.DE.get(typ,EnDe.HTTP.response,src);
		return bux;
	}; // .get
	this.set      = function(_n1_,src) {
		var bux = '';
		EnDe.HTTP.DE.parse(src);
		bux = EnDe.HTTP.EN.set(_n1_,EnDe.HTTP.response,src);
		return bux;
	}; // .set
  }; // .res

	// ===================================================================== //
	// dispatch method                                                       //
	// ===================================================================== //

  this.dispatch = function(item,src,pos) {
//#? wrapper for various HTTP text analysis; returns array with data
	/* src   : text to be modified
	 * item  : mode of information/modification
	 * pos   : position where modification takes place (default: 0)
	 */
	if (src===null) { return ''; }
	var bux = src;
	var bbb = '';
	var ccc = '';
	var i   = 0;
EnDe.HTTP.DE.parse(src);
	item = item.substr(4,item.length);  // strip off http
	switch (item) {
	  // request message body
	  case 'NULL':  bux = null; break;
	  case 'GET':
		bux = this.parse(item, EnDe.HTTP.request['DATA']['SEARCH']);
		break;
	  case 'POST':
	  case 'GWT':
		bux = this.parse(item, EnDe.HTTP.request['DATA']['BODY']['__body__']);
		break;
	  case 'JSON':
		bux = EnDe.Form.dispatch('JSFormat', 'lazy', EnDe.HTTP.request['DATA']['BODY']['__body__'], true, 1).split('\n');
		break;
	  case 'XML':
	  // response message body
	  case 'JSON-GWT':
		bux = this.parse(item, EnDe.HTTP.response['DATA']['BODY']['__body__']);
		break;
	} // switch(item)
	bbb = null; ccc = null;
	return bux;
  }; // dispatch

	// ===================================================================== //
	// procedural interface                                                  //
	// ===================================================================== //

  this.NULL     = function(src) { return EnDe.HTTP.dispatch( src, 'txtNULL'  );    };

}; // EnDe.HTTP


EnDe.HTTPGUI= new function() {

	this.set      = function(typ,dst,src) {
	//#? build HTTP message from dst (request or response)

		function _span(typ,src) {
		//# internal function to enclose data in <span> tag
			switch (typ) {
			  case 'HTML':   return '<span>' + src + '</span>'; break;
			}
			return src;
		}; // _span

		var bux = '';
		var bbb = null;

		if (/request/.test(dst['_id_'])===true) {
			/*
			 * build HTTP request VERB line
			 */
			if (dst['DATA']['QUERY']!=='') {
				bbb = '?' + dst['DATA']['QUERY'];
			}
			bux = [
				_span(typ,dst['DATA']['VERB']),    ' ',
				_span(typ,dst['DATA']['URL']),     ' ',
				_span(typ,dst['DATA']['PARAM']),
				_span(typ,bbb       /* QUERY */),  ' ',
				_span(typ,dst['DATA']['VERSION']), dst['CRLF']
			].join('');
		} else {
			/*
			 * build HTTP response STATUS line
			 */
			bux = [
				_span(typ,dst['DATA']['VERSION']), ' ',
				_span(typ,dst['DATA']['STATUS']),  ' ',
				_span(typ,dst['DATA']['TEXT']),
				dst['CRLF']
			].join('');
		}
		/*
		 * build HTTP request message header
		 */
		bux += this.header(dst);
		bux += dst['CRLF'];
		/*
		 * build HTTP request message body
		 */
		bux += this.body(dst);
		return bux;
	}; // .set

}; // EnDe.HTTPGUI
