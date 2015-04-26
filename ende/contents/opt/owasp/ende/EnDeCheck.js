/* ========================================================================= //
// vi:  ts=4:
// vim: ts=4:
#?
#? NAME
#?      EnDeCheck.js - functions for checksums
#?
#? SYNOPSIS
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDe.js"></SCRIPT>
#?      <SCRIPT language="JavaScript1.3" type="text/javascript" src="EnDeCheck.js"></SCRIPT>
#?
#?      Additional for GUI:
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeUser.js"></SCRIPT>
#?
#?      Additional for testing:
#?      <SCRIPT language="JavaScript1.5" type="text/javascript" src="EnDeTest.js"></SCRIPT>
#?
#? DESCRIPTION
#?      Following classes for various checksum functions are provided:
#?
#?          EnDe.Check.Luhn     - object for functions according Luhn algorithm
#?                                (aka "modulus 10" aka "mod 10" aka (IBM10")
#?          EnDe.Check.EFT      - object for functions to check EFT numbers
#?                                (Electronic Funds Transfer Routing Number Check)
#?                                these are 10 digits without checksum
#?          EnDe.Check.UPC      - object for functions to check UPC numbers
#?                                these are 11 digits without checksum
#?          EnDe.Check.EAN      - object for functions to check EAN numbers
#?                                these are 12 digits without checksum
#?          EnDe.Check.ISBN     - object for functions to check ISBN numbers
#?                                these are 10 or 11 digits with checksum
#?          EnDe.Check.D5       - object for functions to check Verhoeff's
#?                                Dihedral Group D5 Check
#?          EnDe.Check.CC       - object for functions to check credit card numbers
#?          EnDe.Check.IBAN     - object for functions to check IBAN *NOT YET READY*
#?          EnDe.Check.SSN      - object for functions to check social security numbers
#?          EnDe.Check.Byte1    - object for functions for 1 byte checksum
#?
#?      Each of above classes provides following functions:
#?          get()   - return checksum for given data as a number
#?                    returns  -1  if there is some error
#?          is()    - return true if given data has a valid checksum
#?          valid() - return true if given data ends with expected checksum
#?                    Note that some numbers  do not  use the checksum digits,
#?                    in such cases  valid()  is the same as  is()
#?          code()  - return special known code of numbering system
#?                    (implemented for EnDe.Check.EAN, EnDe.Check.CC only)
# ?          force() - force last number of data to be checksum, returns string
# // ToDo: force() functions need to be tested
#?
#?      There exist also following alias functions:
#?          ---------------------+-----------------------
#?          alias function        called function
#?          ---------------------+-----------------------
#?          EnDe.Check.luhn()     EnDe.Check.Luhn.is()
#?          EnDe.Check.mod10()    EnDe.Check.Luhn.is()
#?          EnDe.Check.IBM()      EnDe.Check.Luhn.is()
#?          EnDe.Check.IBMmod11() EnDe.Check.ISBN.is()
#?          EnDe.Check.mod11()    EnDe.Check.ISBN.is()
#?          EnDe.Check.eft()      EnDe.Check.EFT.is()
#?          EnDe.Check.upc()      EnDe.Check.UPC.is()
#?          EnDe.Check.ean()      EnDe.Check.EAN.is()
#?          EnDe.Check.ean13()    EnDe.Check.EAN.is()
#?          EnDe.Check.ian()      EnDe.Check.EAN.is()
#?          EnDe.Check.iln()      EnDe.Check.EAN.is()
#?          EnDe.Check.gln()      EnDe.Check.EAN.is()
#?          EnDe.Check.gs1()      EnDe.Check.EAN.is()
#?          EnDe.Check.gtin()     EnDe.Check.EAN.is()
#?          EnDe.Check.ssn()      EnDe.Check.SSN.is()
#?          EnDe.Check.Byte1()    EnDe.Check.Byte1.is()
#?          EnDe.Check.dispatch() EnDe.User.Check.dispatch()
#?          ---------------------+-----------------------
#?
#?      Following general functions are available:
#?          EnDe.Check.val2num  - force any value to a string containing just
#?                                digits
#?
# HACKER's INFO
#       This file contains UTF-8 characters!
#?
#? VERSION
#?      @(#) EnDeCheck.js 3.9 12/06/02 17:22:47
#?
#? AUTHOR
#?      08-feb-08 Achim Hoffmann, mailto: EnDe (at) my (dash) stp (dot) net
#?
 * ========================================================================= */

// ToDo: more to check ...
/*
 * http://www.pruefziffernberechnung.de/
 * http://euro.ecom.cmu.edu/resources/elibrary/everycc.htm Everything You Ever Wanted to Know about Credit Cards
 * -----
 * http://en.wikipedia.org/wiki/Luhn_mod_N_algorithm
 * http://www.gslis.utexas.edu/~ssoy/organizing/l391d2c.htm H.P. Luhn and Automatic Indexing
 * -----
 * http://code.google.com/p/checkdigits/
 * http://checkdigits.googlecode.com/svn/trunk/javascript/
 *	CheckDihedral.js
 *	CheckISO7064Mod11_10.js
 *	CheckISO7064Mod11_2.js
 *	CheckISO7064Mod97_10.js
 * -----
 * http://search.cpan.org/src/JPETERSON/Algorithm-Verhoeff-0.3/lib/Algorithm/Verhoeff.pm
 * -----
 * ISMN, ISAN, ISWC, ISRC, ISTC, ISPI
 * http://en.wikipedia.org/wiki/International_Standard_Music_Number
 * -----
 * ISSN, ISBN-8, ISBN-10,ISBN-13
 * http://www.merlyn.demon.co.uk/js-misc0.htm#ISBN
 * -----
 * Number to Four Bytes as Int32 (2^53)
 * http://www.merlyn.demon.co.uk/js-misc0.htm#ISBN
 * -----
 * BigCat, EjHCat, Jaguar
 * http://www.merlyn.demon.co.uk/js-misc0.htm#ISBN
 * -----
 * NVE - Nummer der Versandeinheit
 * http://www.gs1-germany.de/content/e39/e56/e552/e295/datei/11999/c199_18.pdf
 *     (00) 3 1234567 123456789 0
 *    ----  - ------- --------- \___ Pruefziffer der vorhergehenden 17 Ziffern, EAN
 *      |   |     |       \_________ eindeutige Nummer vom Absender vergeben
 *      |   |     \_________________ Basisnummer (eindeutig, mit 3 Ziffern GLN)
 *      |   \_______________________ Undefineirte Versandeinheit
 *      \___________________________ Datenbezeichner (Nummer der Versandeinheit)
 * aka SSCC - Serial Shipping Container Code
 * aka ISO-15459
 * http://www.gs1-germany.de/internet/content/e39/e50/e221/e5639/e5640
 * -----
 * D-U-N-S  - Data Universal Numbering System
 * -----
 * GS1-128-Strichcode
 * http://www.gs1-germany.de/internet/content/e39/e50/e244/e7628/
 * GRAI - Globale MTV-Identnummer - Global Returnable Asset Item (GRAI aka MTV)
 * http://www.gs1-germany.de/internet/content/e39/e50/e221/e5645/e5647
 * aka DataBar-14
 *     (01) 06001240720288
 * aka RSS-14 - Reduced Space Symbology
 *     (01) 06001240720288
 * -----
 * http://www.barcoderobot.com/  Create EAN, UPC and ISBN Barcodes
 * -----
 * http://en.wikipedia.org/wiki/Bank_card_number
 * -----
 * http://www.merriampark.com/anatomycc.htm
 *    4408 0412 3456 7890
 *    ---- ---- ---- ----
 *    |     ||         |\_________ Check Digit
 *    |\_  _/\_________/__________ Account Number
 *    |  \/_______________________ Issuer Identifier (6 digits including MII digit)
 *    \___________________________ MII - Major Industry Identifier
 * -----
 * Pr�fsumme bei IMEI und IMEISV ist Luhn-Algorithmus
 * -----
 * DOI - Digital Object Identifier
 * http://WWW.DOI.org/  http://dx.DOI.org/
 * -----
 */
/*
  http://www.beau.lib.la.us/~jmorris/linux/cuecat/cuecat_decode.html
 */

if (typeof(EnDe)==='undefined') { EnDe = new function() {}; }

EnDe.Check  = new function() {
  this.SID	= '3.9';
  this.sid	= function()    { return('@(#) EnDeCheck.js 3.9 12/06/02 17:22:47 EnDe.Check'); };

  // ======================================================================= //
  // public and alias check functions                                        //
  // ======================================================================= //

  // some aliases ..
  this.luhn     = function(src) { return(EnDe.Check.Luhn.is(src)); };
  this.mod10    = function(src) { return(EnDe.Check.Luhn.is(src)); };
  this.IBM      = function(src) { return(EnDe.Check.Luhn.is(src)); };
  this.imei     = function(src) { return(EnDe.Check.Luhn.is(src)); };
  this.imeisv   = function(src) { return(EnDe.Check.Luhn.is(src)); };
  this.mod11    = function(src) { return(EnDe.Check.ISBN.is(src)); };
  this.IBMmod11 = function(src) { return(EnDe.Check.ISBN.is(src)); };
  this.eft      = function(src) { return(EnDe.Check.EFT.is(src));  };
  this.upc      = function(src) { return(EnDe.Check.UPC.is(src));  };
  this.ean      = function(src) { return(EnDe.Check.EAN.is(src));  };
  this.ean13    = function(src) { return(EnDe.Check.EAN.is(src));  };
  this.ian      = function(src) { return(EnDe.Check.EAN.is(src));  };
  this.iln      = function(src) { return(EnDe.Check.EAN.is(src));  };
  this.gln      = function(src) { return(EnDe.Check.EAN.is(src));  };
  this.gs1      = function(src) { return(EnDe.Check.EAN.is(src));  };
  this.gtin     = function(src) { return(EnDe.Check.EAN.is(src));  };
  this.ssn      = function(src) { return(EnDe.Check.SSN.is(src));  };
  this.Byte1    = function(src) { return(EnDe.Check.Byte1.get(src));};
  this.iban     = function(src) { return(EnDe.Check.IBAN.is(src)); };
  // just a wrapper, we don't want any GUI functions herein
  // all functions to be called by dipatch() must be added there
  this.dispatch = function(src) { return(EnDe.User.Check.dispatch(src)); };
  this.guess    = function(src) { return(EnDe.User.Check.guess(src)); };

  // ======================================================================= //
  // global prototypes                                                       //
  // ======================================================================= //

	/*
	 * http://de.wikipedia.org/wiki/Internationale_Lokationsnummer
	 * http://en.wikipedia.org/wiki/GS1
	 * http://www.gepir.de/v31_client/ubergepir.aspx
	 *
	 * aka:  GS1 - Global Standards One
	 * aka:  GLN - International Location Number
	 * aka:  EAN - European Article Numbers
	 * aka:  IAN - International Article Number
	 * aka:  ILN - International Location Number
	 * aka: GTIN - Global Trade Item Number
	 *
	 * See Also:
	 *      http://www.gs1-germany.de/internet/content/e39/e50/e221/e222/e5636
	 *      http://www.gepir.de/router.asmx?list
	 *      http://www.gepir.de/router.asmx?wsdl
	 *      http://en.wikipedia.org/wiki/List_of_Bank_Identification_Numbers // ToDo:
	 */
  function _GLN() {}; // International Location Numbers
  _GLN.prototype = {
	/* Note: keys with 'x' as last "digit" mean that all digis 0..9
	 * are valid, it's a range, example:
	 *  400: Deutschland
	 *  40x: Deutschland
	 *  41x: Deutschland
	 *  42x: Deutschland
	 *  43x: Deutschland
	 *  440: Deutschland
	 * means that "Deutschland" covers all keys 400 .. 440
	 * See .code() how to detect these ranges.
	 */
	'desc':   'from http://de.wikipedia.org/wiki/EAN-L%C3%A4ndernummer',
	'000':    'U.S.A. & Canada (leading 0 for 12-digit UPC)',
	'09x':    'U.S.A. & Canada (leading 0 for 12-digit UPC)',
	'099':    'U.S.A. & Canada (leading 0 for 12-digit UPC)',
	'100':    'U.S.A. & Canada',
	'10x':    'U.S.A. & Canada',
	'11x':    'U.S.A. & Canada',
	'12x':    'U.S.A. & Canada',
	'13x':    'U.S.A. & Canada',
	'139':    'U.S.A. & Canada',
	'200':    'internal numbering',
	'20x':    'internal numbering',
	'21x':    'internal numbering',
	'22x':    'internal numbering',
	'23x':    'internal numbering',
	'24x':    'internal numbering',
	'25x':    'internal numbering',
	'26x':    'internal numbering',
	'27x':    'internal numbering',
	'28x':    'internal numbering',
	'29x':    'internal numbering',
	'299':    'internal numbering',
	'300':    'Frankreich',
	'30x':    'Frankreich',
	'31x':    'Frankreich',
	'32x':    'Frankreich',
	'33x':    'Frankreich',
	'34x':    'Frankreich',
	'35x':    'Frankreich',
	'36x':    'Frankreich',
	'37x':    'Frankreich',
	'379':    'Frankreich',
	'380':    'Bulgarien',
//	'381':    '?',
//	'382':    '?',
	'383':    'Slowenien',
//	'384':    '?',
	'385':    'Kroatien',
//	'386':    '?',
	'387':    'Bosnien-Herzegowina',
//	'388':    '?',
//	'389':    '?',
	'400':    'Deutschland',
	'40x':    'Deutschland',
	'41x':    'Deutschland',
	'42x':    'Deutschland',
	'43x':    'Deutschland',
	'440':    'Deutschland',
	'450':    'Japan',
	'45x':    'Japan',
	'46x':    'Japan',
	'47x':    'Japan',
	'48x':    'Japan',
	'49x':    'Japan',
	'499':    'Japan',
	'460':    'Russland',
//	'46x':    'Russland',   // same as Japan?
	'469':    'Russland',
	'471':    'Taiwan',
	'474':    'Estland',
	'475':    'Lettland',
	'476':    'Aserbeidschan',
	'477':    'Litauen',
	'478':    'Usbekistan',
	'479':    'Sri Lanka',
	'480':    'Philippinen',
	'481':    'Belarus',
	'482':    'Ukraine',
	'483':    '?',
	'484':    'Moldawien',
	'485':    'Armenien',
	'486':    'Georgien',
	'488':    '?',
	'487':    'Kasachstan',
	'489':    'Hongkong',
	'500':    'Großbritanien',
	'50x':    'Großbritanien',
	'509':    'Großbritanien',
	'520':    'Griechenland',
	'528':    'Libanon',
	'529':    'Zypern',
	'531':    'Mazedonien',
	'535':    'Malta',
	'539':    'Irland',
	'540':    'Belgien & Luxemburg',
	'54x':    'Belgien & Luxemburg',
	'549':    'Belgien & Luxemburg',
	'560':    'portugal',
	'569':    'Island',
	'570':    'Dänemark',
	'57x':    'Dänemark',
	'579':    'Dänemark',
	'590':    'Polen',
	'594':    'Rumänien',
	'599':    'Ungarn',
	'600':    'Südafrika',
	'601':    'Südafrika',
	'608':    'Bahrein',
	'609':    'Mauritius',
	'611':    'Marokko',
	'613':    'Algerien',
	'616':    'Kenia',
	'619':    'Tunesien',
	'621':    'Syrien',
	'622':    'Ägypten',
	'624':    'Libyen',
	'625':    'Jordanien',
	'626':    'Iran',
	'627':    'Kuweit',
	'628':    'Saudi-Arabien',
	'629':    'Vereinigte Arabische Emirate',
	'640':    'Finnland',
	'64x':    'Finnland',
	'649':    'Finnland',
	'690':    'China',
	'691':    'China',
	'692':    'China',
	'693':    'China',
	'700':    'Norwegen',
	'70x':    'Norwegen',
	'709':    'Norwegen',
	'729':    'Israel',
	'730':    'Schweden',
	'73x':    'Schweden',
	'739':    'Schweden',
	'740':    'Guatemala',
	'741':    'El Salvador',
	'742':    'Honduras',
	'743':    'Nicaragua',
	'744':    'Costa Rica',
	'745':    'Panama',
	'746':    'Dominikanische Republik',
	'750':    'Mexiko',
	'759':    'Venezuela',
	'760':    'Schweiz & Liechtenstein',
	'76x':    'Schweiz & Liechtenstein',
	'769':    'Schweiz & Liechtenstein',
	'770':    'Kolumbien',
	'773':    'Uruguay',
	'775':    'Peru',
	'777':    'Bolivien',
	'779':    'Argentinien',
	'780':    'Chile',
	'784':    'Paraguay',
	'786':    'Ecuador',
	'789':    'Brasilien',
	'830':    'Italien',
	'83x':    'Italien',
	'839':    'Italien',
	'840':    'Spanien',
	'84x':    'Spanien',
	'849':    'Spanien',
	'850':    'Kuba',
	'858':    'Slowakei',
	'859':    'Tschechien',
	'860':    'Jugoslawien',
	'867':    'Nord Korea',
	'869':    'Türkei',
	'870':    'Niederlande',
	'87x':    'Niederlande',
	'879':    'Niederlande',
	'880':    'Süd Korea',
	'885':    'Thailand',
	'888':    'Singapur',
	'890':    'Indien',
	'893':    'Vietnam',
	'899':    'Indonesien',
	'900':    'Österreich',
	'90x':    'Österreich',
	'91x':    'Österreich',
	'919':    'Österreich',
	'930':    'Australien',
	'93x':    'Australien',
	'939':    'Australien',
	'940':    'Neuseeland',
	'94x':    'Neuseeland',
	'949':    'Neuseeland',
	'950':    'EAN Headquarter',
	'955':    'Malaysia',
	'958':    'Macao',
	'977':    'Zeitschriften',
	'978':    'Bücher',
	'979':    'Bücher',
	'980':    'refund receipts',
	'981':    'Common Currency Coupons',
	'982':    'Common Currency Coupons',
	'999':    'Coupons',
	'999999': '--unknown--'  // end of list
  }; // _GLN

  function _MII() {}; // list of Major Industry Identifier (1 digit)
  _MII.prototype = {
	'desc':   'from http://www.pruefziffernberechnung.de/K/Kreditkarten.shtml',
	'0':      'ISO/TC 68 industrie',
	'1':      'airlines',
	'2':      'airlines and industrie',
	'3':      'Touristic and advertaisement',
	'4':      'Finance',
	'5':      'Finance',
	'6':      'marketing and finance',
	'7':      'Petro industrie',
	'8':      'Tele-communication and Industrie',
	'9':      'National Applications',
	'999999': '--unknown--'  // end of list
  }; // _MII

  function _IIN() {}; // list of Issuer Identification Number (6 digits)
  _IIN.prototype = {  /* NOT YET COMPLETE */
	'desc'  : 'from http://en.wikipedia.org/wiki/List_of_Bank_Identification_Numbers',
	'18'    : '------- (Japan Credit Bureau) ??',
	'1800'  : 'Japan Credit Bureau',
	'2014'  : 'Diners Club enRoute',
	'201400': 'Air Canada enRoute',
	'2018'  : 'Canadian Pacific',
	'21'    : '------- (Japan Credit Bureau) ??',
	'2131'  : 'Japan Credit Bureau',
	'2149'  : 'Diners Club enRoute',
//	'30'    : '------- (Diners Club) ??',
	'30'    : '------- (Discover Card; starting 2009)',
	'300'   : 'Diners Club Carte Blanche',
	'301'   : 'Diners Club Carte Blanche',
	'302'   : 'Diners Club Carte Blanche',
	'303'   : 'Diners Club Carte Blanche',
	'304'   : 'Diners Club Carte Blanche',
	'305'   : 'Diners Club Carte Blanche',
	'34'    : '------- (American Express)',
	'35'    : '------- (Japan Credit Bureau)',
	'356210': 'HSBC JCB Credit Card (Hong Kong)',
	'36'    : '------- (Diners Club International)',
//	'54'    : MasterCard in Canada only',   // JavaScript cannot have the same hash again
	'3616'  : 'Diners Club International, Hiunday Card (Korea)',
	'3633'  : 'Diners Club International, defunct (Canada)',
	'3634'  : 'Diners Club International, IBM defunct (Canada)',
	'3635'  : 'Diners Club International Credit Card (Singapore)',
	'3643'  : 'Diners Club International (UK)',
	'3670'  : 'Diners Club International (India)',
	'37'    : '------- (American Express)',
	'370246': 'Industrial and Commercial Bank of China (ICBC) Peony American Express Card (PRC)',
	'370247': 'Industrial and Commercial Bank of China (ICBC) Peony American Express Gold Card (PRC)',
	'3703'  : 'American Express Credit Card (Platinum)',
	'3710'  : 'American Express Credit Card',
	'3712'  : 'Platinum Cash Rebate from American Express (Credit Card, grandfathered) (US)',
	'3713'  : 'JetBlue from American Express Credit Card (US)& Blue For Students American Express & Blue from American Express',
	'3715'  : 'American Express Credit Card (Blue)',
	'3717'  : 'American Express Charge Card (US)',
	'3718'  : 'American Express Credit Card (Amex Gold)',
	'3723'  : 'American Express Credit Card (US)',
	'372395': 'Blue Cash American Express Card',
	'3725'  : 'American Express Credit Card',
	'372550': 'Starwood Preferred Guest hotel loyalty credit card',
	'3727'  : 'American Express Credit Card',
	'372734': 'Blue for Business credit (small business)',
	'3728'  : 'American Express Credit Card',
	'3731'  : 'American Express Credit Card',
	'3732'  : 'American Express Blue Airmiles Cash Back Card (Canada)',
	'3733'  : 'American Express Blue Cash Back Card (Canada)',
	'3735'  : 'American Express Blue Cash Back Card (Canada)',
	'3737'  : 'American Express Credit Card',
	'3738'  : 'American Express Credit Card',
	'3742'  : 'American Express Charge Card (UK in GBP)',
	'374288': 'American Express Centurion Charge Card (UK in ?)',
	'3743'  : 'American Express Charge Card (UK in Euros)',
	'374345': 'Citi American Express Cards (USA)',
	'374388': 'American Express ICC Centurion Charge Card (UK in Euros)',
	'3745'  : 'American Express Charge Card (UK in USD)',
	'374588': 'American Express ICC Centurion Charge Card (UK in USD)',
	'3746'  : 'American Express Platinum Credit Card (UK)',
	'374622': 'American Express Optima Credit Card (France)',
	'374630': 'American Express card issued by MBNA',
	'374660': 'American Express BMW Card',
	'374693': 'American Express Platinum Credit Card (UK)',
	'3749'  : 'American Express Charge Card (France)',
	'3750'  : 'American Express Charge Card (Germany)',
	'375082': 'American Express Platinum Charge Card (Germany)',
	'3751'  : 'American Express Platinum Charge Card (Switzerland)',
	'3753'  : 'American Express Credit Card',
	'3756'  : 'American Express Credit Card',
	'3758'  : 'American Express Charge Card (Switzerland)',
	'3760'  : 'American Express Card (Australia)',
	'3763'  : 'American Express Credit Card',
	'3770'  : 'American Express Credit Card (South Africa)',
	'3773'  : 'American Express Credit Card',
	'3778'  : 'American Express Bancolombia',
	'3782'  : 'American Express Credit Card',
	'3783'  : 'American Express Credit Card',
	'3787'  : 'American Express Credit Card',
	'377867': 'Bank of New Zealand American Express Credit Card',
	'3790'  : 'American Express Travellers Cheque Card (UK)',
	'3791'  : 'American Express Credit Card (UK)',
	'379102': 'American Express / British Airways Credit Card (UK)',
	'379108': 'American Express / British Airways Credit Card (UK)',
	'3793'  : 'American Express Credit Card',
	'3794'  : 'American Express Corporate Charge Card',
	'38'    : '------- (Diners Club International; old before 2009)',
//	'38'    : '------- (Discover Card; starting 2009)',
	'39'    : '------- (Discover Card; starting 2009)',
	'40'    : '------- (VISA)',
	'400610': 'META Bank, (Rewards 660 VISA) Credit Limit Between $200 & $2000',
	'4009'  : 'Bank of China Great Wall VISA',
	'400937': 'Bank of China Great Wall International Card Corporate',
	'400938': 'Bank of China Great Wall International Card Corporate Gold',
	'400941': 'Bank of China Great Wall International Card',
	'400942': 'Bank of China Great Wall International Card Gold',
	'401106': 'McCoy Federal Credit Union VISA Debit Card',
	'401171': 'Delta Community Credit Union VISA',
	'401180': 'Suntrust Bank Debit Card VISA',
	'4016'  : 'Citybank (El Salvador)',
	'401612': 'Banco Tequendama Visa CREDIT PLATINUM CARD (Colombia)',
	'4017'  : 'NAB Visa Debit Card (Australia)',
	'4018'  : '1st Financial Bank USA',
	'4019'  : 'Wachovia Bank VISA Credit Card',
	'4023'  : 'Poste Italiane VISA Electron Card',
	'402791': 'ICBC VISA Electron Card',
	'405086': 'Fleet Fusion VISA Card with a smart chip',
	'4060'  : 'Bank One (Chase) Debit Card',
	'4063'  : 'Guangdong Development Bank (China) VISA Credit Card',
	'409311': 'BB&T Check Card USA VISA Debit Card',
	'4097'  : 'Bank Mandiri (Indonesia) VISA Debit Card',
	'41'    : '------- (VISA)',
	'4105'  : 'Bank Nasional Indonesia, VISA Credit Card',
	'410636': 'Columbus Bank & Trust Company, (Aspire VISA Gold Card)',
	'4112'  : 'Lloyds TSB VISA Credit Card',
	'4117'  : 'Bank of America (formerly Fleet) VISA Debit Card',
	'4119'  : 'DBS Live Fresh Platinum VISA Credit Card (Singapore)',
	'4121'  : 'Pennsylvania State Employees Credit Union (PSECU) Credit Card',
	'4128'  : 'Citibank Platium Select Dividends VISA Credit Card',
	'4129'  : 'Alliance & Leicester Credit Card',
	'4143'  : 'Capital One VISA',
	'4147'  : 'CitiBank Dividend VISA Signature Credit Card (Singapore)',
	'4159'  : 'Sovereign Bank VISA Debit Card',
	'4170'  : 'Bank of America (Formerly Fleet) Business VISA Card',
	'417500': 'VISA Electron',
	'4182'  : 'UOB NOW VISA Platinum Debit Card (Singapore)',
	'4190'  : 'U.S. Bank WorldPerks VISA Credit Card',
	'42'    : '------- (VISA)',
	'4205'  : 'Volkswagen Bank direct VISA Credit Card (Germany)',
	'4213'  : 'China Minsheng Bank VISA Debit Card; Landesbank Berlin Xbox Live VISA Prepaid Card (Germany)',
	'421325': 'UTI Bank Prepaid VISA Card',
	'4216'  : 'Citizens Bank of Canada/Vancouver City Savings Credit Union VISA Gift Card',
	'4217'  : 'Bank of America VISA Debit Card',
	'4218'  : 'China Minsheng Banking Corporation VISA Credit Card',
	'424631': 'Chase Bank USA VISA Business Credit Card',
	'4254'  : 'Washington Mutual (formerly Fleet) VISA Debit Card',
	'4256'  : 'Bank of America GM VISA Check Card',
	'4258'  : 'M & T Bank VISA Check Card',
	'4263'  : 'Comdirect Bank (Germany) VISA Credit Card, Natwest UK VISA',
	'4264'  : 'MBNA Platinum VISA Credit Card',
	'426588': 'UOB Singtel Platinum VISA Credit Card (Singapore)',
	'426569': 'CitiBank Platinum VISA Credit Card (Singapore)',
	'4266'  : 'Bank1One (Chase) Sony VISA Credit Card',
	'4270'  : 'Industrial and Commercial Bank of China VISA',
	'4282'  : 'Landesbank Berlin (Germany) VISA Credit Card',
	'43'    : '------- (VISA)',
	'4300'  : 'Standard Chartered Platinum VISA Credit Card (Singapore)',
	'4301'  : 'Chase VISA',
	'4305'  : 'Bank of America (formerly Fleet) VISA Credit Card',
	'4312'  : 'IW Bank VISA/VISA Electron',
	'4313'  : 'Bank of America (formerly MBNA) Preferred VISA & VISA Signature Credit Cards',
	'431732': 'Plains Commerce, (Total VISA), Small Credit Limit, Credit Repair Card',
	'4321'  : 'Citizens Bank of Canada/Vancouver City Savings Credit Union VISA Gift Card',
	'432628': 'Bank of America (formerly Fleet National Bank) VISA Check Card, Debit',
	'4327'  : 'North Carolina State Employees\' Credit Union VISA Check Card',
	'4356'  : 'Bank of America VISA Debit Card',
	'435688': 'Bank of America, VISA, Platinum Check Card, Debit',
	'435760': 'Compass Bank, VISA, Business Check Card, Debit',
	'4366'  : 'Chase',
	'4377'  : 'Panin Bank - Indonesia, VISA, Platinum Card',
	'4380'  : 'Bank of China Olympics VISA Credit Card',
	'4382'  : 'UOB Campus VISA Debit Card (Singapore)',
	'4392'  : 'China Merchants Bank VISA Credit Card',
	'44'    : '------- (VISA)',
	'4408'  : 'Chase (AARP)',
	'4432'  : 'US Bank',
	'4451'  : 'First Tennessee Bank VISA Debit Card',
	'446261': 'Lloyds TSB VISA Debit Card (UK)',
	'446268': 'Cahoot Debit Card (UK)',
	'446278': 'Halifax Debit Card (UK)',
	'446279': 'Bank of Scotland VISA Debit Card (UK in �)',
	'4492'  : 'Vista Federal Credit Union (Walt Disney World) VISA Debit Card',
	'449352': 'Nationwide Building Society VISA',
	'449533': 'Bank of America, National Association - Classic, Debit, VISA',
	'443438': 'Credit Union Australia - VISA Debit Card',
	'45'    : '------- (VISA)',
	'4500'  : 'Canadian Imperial Bank of Commerce (CIBC) VISA & MBNA Quantum VISA Credit Cards',
	'450060': 'CIBC Aerogold (VISA Credit Card)',
	'4502'  : 'CIBC VISA',
	'4503'  : 'CIBC VISA',
	'4504'  : 'CIBC VISA',
	'4505'  : 'CIBC VISA',
	'4508'  : 'VISA Electron',
	'450823': 'Lloyds TSB VISA',
	'4510'  : 'Royal Bank of Canada VISA',
	'4512'  : 'Direct Access Malaysia VISA Credit Card',
	'4513'  : 'Bancolombia',
	'451503': 'Royal Bank of Canada VISA',
	'4519'  : 'Royal Bank of Canada Debit Card',
	'4520'  : 'TD Canada Trust VISA',
	'4530'  : 'VISA Desjardins',
	'4535'  : 'Scotiabank VISA',
	'4536'  : 'Scotiabank VISA',
	'4537'  : 'Scotiabank VISA',
	'4538'  : 'Scotiabank VISA',
	'4539'  : 'Barclays Bank Connect VISA Debit Card',
	'4540'  : 'Carte d\'accés Desjardins / VISA Desjardins',
	'454312': 'First Direct VISA Credit Card',
	'454313': 'Nationwide Building Society VISA Debit Card',
	'454434': 'First Trust Bank VISA Debit Card',
	'4546'  : 'Citibank VISA ??',
	'454605': 'Citibank VISA',
	'454617': 'ING DiBa VISA ??',
	'454718': 'UOB A*STAR VISA Corporate Gold Credit Card (Singapore)',
	'454742': 'Abbey National Bank VISA debit',
	'454867': 'ASB Bank VISA Credit Card',
	'455025': 'Cooperative Bank (UK)',
	'4551'  : 'TD Canada Trust VISA',
	'4555'  : 'Cooperative Bank Platinum VISA (UK)',
	'455701': 'National Australia Bank VISA Credit Card',
	'455702': 'National Australia Bank VISA Credit Card',
	'4563'  : 'Citibank Malaysia VISA Credit Card',
	'456462': 'ANZ Bank VISA Credit Card',
	'4565'  : 'ABSA VISA',
	'4567'  : 'CitiBank VISA Debit Card (UK)',
	'4568'  : 'Berliner Bank (Germany) VISA Credit Card',
	'4599'  : 'Caja Madrid VISA Electron Debit Card (Spain)',
	'46'    : '------- (VISA)',
	'462785': 'Egg plc VISA',
	'4600'  : 'ABSA VISA',
	'4640'  : 'Bank One (now J.P. Morgan Chase & Co.) Amazon.com VISA Credit Card',
	'465590': 'Tesco Personal Finance Finest VISA Credit Card (UK)',
	'4661'  : 'BB&T (Branch Banking and Trust) VISA Check Card',
	'4689'  : 'Asociacion la Nacional de Ahorros y Prestamos VISA Credit Card (Dominican Republic)',
	'4695'  : 'CitiBank SMRT Platinum Debit Card (Singapore)',
	'47'    : '------- (VISA)',
	'4715'  : 'Wachovia VISA',
	'4744'  : 'Bank of America VISA Debit',
	'4760'  : 'Bank Niaga (Indonesia) VISA Debit Card',
	'478880': 'Umpqua Bank of Oregon VISA Debit Card',
	'479293': 'Abbey International VISA Debit Card',
	'479213': 'TD Banknorth VISA Debit Card',
	'48'    : '------- (VISA)',
	'4800'  : 'MBNA Gold VISA Credit Card',
	'4828'  : 'Wachovia Bank VISA Debit Card',
	'482870': 'Wachovia Bank VISA Debit Card',
	'4844'  : 'VISA Electron',
	'4854'  : 'Washington Mutual VISA Debit Card',
	'4862'  : 'Capital One VISA Credit Card',
	'486236': 'Capital One VISA Platinum Credit Card',
	'486430': 'Lloyds TSB (UK) VISA Card',
	'4868'  : 'Wells Fargo Bank N.A. Check Card',
	'486993': '[Umpqua Bank of Oregon]] VISA Business Check Card',
	'4888'  : 'Bank of America VISA Credit Card',
	'49'    : '------- (VISA)',
	'490847': 'Parex Bank VISA Credit Card',
	'4903'  : 'Switch (Debit Card)',
	'4905'  : 'Switch (Debit Card)',
	'4906'  : 'Barclaycard VISA Credit Card (Germany)',
	'4909'  : 'Citibank VISA Credit Card (Spain)',
	'4911'  : 'Switch (Debit Card)',
	'4913'  : 'VISA Electron',
	'4917'  : 'VISA Electron',
	'4918'  : 'Caja Madrid VISA Business Credit Card (Spain)',
	'4920'  : 'Luottokunta issued VISA; Citibank UAE issued VISA Credit Card',
	'4921'  : 'Lloyds TSB VISA Debit Card',
	'492940': 'Barclaycard VISA Credit Card',
	'492946': 'Barclaycard Business VISA Credit Card',
	'4931'  : 'VISA Citi AA - American Airlines (Dominican Republic)',
	'493467': 'Bank of China Olympics VISA Credit Card (Singapore)',
	'493468': 'Bank of China Platinum VISA Credit Card (Singapore)',
	'4936'  : 'Switch (Debit Card)',
	'4937'  : 'Standard Chartered Bank UAE issued VISA Credit Card',
	'496604': 'HSBC VISA Credit Card (Hong Kong)',
	'496645': 'HSBC VISA Gold Credit Card (Singapore)',
	'498824': 'Smile (The Co-operative Bank) VISA Debit Card (UK in ?)',
	'499977': 'Bank of New Zealand VISA Credit Card',
	'50'    : '------- (Maestro) ??',
	'500766': 'Bank of Montreal Debit Card',
	'5018'  : 'Maestro Debit Card',
	'5020'  : 'Maestro Debit Card',
	'5038'  : 'Maestro Debit Card',
	'504507': 'Barnes & Noble Gift Card',
	'5049'  : 'Sears Card, issued by Citibank USA',
	'51'    : '------- (MasterCard)',
	'5108'  : 'INGDirect Electric Orange Debit Card',
	'5113'  : 'JPMorgan Chase Bank MasterCard Debit Card',
	'5121'  : 'Citi Sears MasterCard',
	'512607': 'Continental Finance, M/C, $300 limit card',
	'5140'  : 'TiVo MasterCard Credit Card',
	'5141'  : 'Banco Popular North America MasterCard Debit Card',
	'5148'  : 'US Airways Dividend Miles Platinum MasterCard',
	'516319': 'Virgin MasterCard Credit Card',
	'5176'  : 'China Minsheng Banking Corporation MasterCard Credit Card',
	'5178'  : 'Capital One MasterCard Credit Card',
	'5179'  : 'Bank Atlantic MasterCard Debit Card',
	'5181'  : 'PC Financial MasterCard Credit Card',
	'5186'  : 'MBNA MasterCard (UK)',
//	'51867500'  : 'MBNA / British Midland Airways MasterCard (UK)',
	'518675': 'MBNA / British Midland Airways MasterCard (UK)',
	'5187'  : 'China Merchants Bank MasterCard Credit Card',
	'5191'  : 'Bank of Montreal MasterCard',
	'5192'  : 'Bank of Montreal MasterCard',
	'52'    : '------- (MasterCard)',
	'5200'  : 'MBNA Quantum MasterCard Credit Card',
	'5221'  : 'MasterCard Credit Cards in South Africa',
	'522276': 'Chase Manhattan Bank MasterCard Credit Card',
	'5243'  : 'Hudson\'s Bay Company MasterCard Credit Card (Canada)',
	'5256'  : 'Sparda-Bank MasterCard Credit Card (Germany)',
	'5258'  : 'MasterCard National Bank of Canada (Canada)',
//	'5258969': 'MasterCard Husky (Canada) [Husky/Mohawk MasterCard]',
	'525896': 'MasterCard Husky (Canada) [Husky/Mohawk MasterCard]',
	'5259'  : 'MasterCard Cash Advantage Platinum Canadian Tire',
	'5262'  : 'Citibank MasterCard Debit Card',
	'5264'  : 'Bank Negara Indonesia MasterCard Debit Card',
	'526722': 'Standard Bank South Africa MasterCard Credit Card (Gift Card)',
	'5268'  : 'Landesbank Berlin (Germany) MasterCard Credit Card',
	'5289'  : 'ABN AMRO Bank Switch Platinum MasterCard Credit Card (Singapore)',
	'529930': 'Marks & Spencer Money MasterCard Credit Card',
	'53'    : '------- (MasterCard)',
	'5329'  : 'MBNA Preferred MasterCard Credit Card',
	'532902': 'Wachovia Bank MasterCard Credit Card',
	'535316': 'Commonwealth Bank MasterCard Credit Card',
	'535318': 'Commonwealth Bank MasterCard Credit Card',
	'54'    : '------- (MasterCard)',
	'5401'  : 'Bank of America (formerly MBNA) MasterCard Gold Credit Card',
	'5403'  : 'Citibank MasterCard Credit Card ("Virtual Card" number)',
	'5404'  : 'Lloyds TSB Bank MasterCard Credit Card',
	'5407'  : 'HSBC Bank GM Card',
	'540801': 'Household Bank USA MasterCard Credit Card',
	'5412'  : 'HSBC Malaysia issued MasterCard',
	'5424'  : 'Citibank MasterCard Credit Card (Dividend, Diamond and others)',
	'542418': 'Citibank Platinum Select',
	'5425'  : 'Barclaycard MasterCard Credit Card (Germany)',
	'54254200': 'GE Money Bank Mastercard debit card (SE)',
	'54254207': 'GE Money Bank Mastercard credit card (SE)',
	'542598': 'Bank of Ireland Post Office Platinum Card (UK)',
	'5426'  : 'Alberta Treasury Branch',
	'5430'  : 'ANZ Bank MasterCard',
//	'5430'  : 'Stockmann Department Store Mastercard, issued by Nordea (Finland)',
	'543034': 'Stockmann Department Store Exclusive Mastercard, issued by Nordea (Finland)',
	'543122': 'HSBC Hong Kong issued MasterCard',
	'543250': 'Bank of New Zealand MasterCard Credit Card',
	'5434'  : 'MasterCard Credit Cards from UK banks',
	'543460': 'HSBC MasterCard Credit Card (UK)',
	'5440'  : 'MasterCard from MBF Malaysia',
	'544156': 'AIB Gold MasterCard Credit Card',
	'5442'  : 'HSBC MasterCard Credit Card (Singapore)',
	'5443'  : 'HSBC MasterCard Debit Card with PayPass (USA)',
	'5446'  : 'Canadian Tire MasterCard Credit Card',
	'5452'  : 'MBNA Canada MasterCard',
	'5460'  : 'Berliner Bank (Germany) MasterCard Credit Card',
	'5466'  : 'Citibank, MBNA & Chase World MasterCard Credit Cards',
	'547347': 'HSBC Commercial Card (UK in ?)',
	'547356': 'RBS Royal Bank of Scotland',
	'547367': 'NatWest (RBS)',
	'548955': 'HOUSEHOLD BANK (NEVADA), N.A, (Orchard Bank M/C, HSBC Card Services)',
	'5490'  : 'MBNA & Chase Platinum MasterCard Credit Cards',
	'5491'  : 'AT&T Universal MasterCard Credit Card, now part of Citibank, also MBNA MasterCard Credit Cards',
//	'54911000'  : 'HSBC Bank Nevada, N.A. issued Household Bank Platinum MasterCard',
	'549110': 'HSBC Bank Nevada, N.A. issued Household Bank Platinum MasterCard',
	'55'    : '------- (MasterCard)',
	'550619': '"Skycard" MasterCard Credit Card issued in UK in association with Barclaycard',
	'5520'  : 'DBS POSB Everyday Platinum MasterCard (Singapore)',
	'553823': 'MIT Federal Credit Union Debit MasterCard',
	'554544': 'Bank of Ireland',
	'557843': '"Goldfish" MasterCard Credit Card issued in UK by Morgan Stanley',
	'558158': 'Paypal MasterCard Credit Card, Chase Bank, Formerly Bank One',
	'56'    : '------- (Maestro)',
	'560054': 'HSBC Bank USA, N.A. Maestro Card',
// (given to Online Savings account holders who do not hold a chequing account,
// this card does not carry a MasterCard logo and is mostly advertised in North
// America as an HSBC ATM card, although it does carry a Cirrus and Maestro
// logos on the back side of the card)
	'564182': 'Switch Debit Card',
	'58'    : '------- ??',
	'587781': 'Bank of America ATM Card',
	'589297': 'TD Canada Trust Debit Card',
	'60'    : '------- ??',
	'600649': 'Lowe\'s Home Improvement Center Gift Card (also Radio Shack)',
	'601056': 'ValueLink stored value card (Starbucks, Borders Books, et. al.)',
	'6011'  : 'Discover Card Credit Card',
	'6016'  : 'Bancolombia',
	'601859': 'A GAP Card (Monogram Credit Card Bank of Georgia)',
// carries GAP, Banana Republic and Old Navy logos, issued by Monogram Credit Card Bank of Georgia
	'602700': 'Wichita State University "Shocker Card" [1] (a stored value card)',
	'6035'  : 'Citibank (Home Depot) Card',
	'603753': 'McDonald\'s Gift Card (serviced by ValueLink)',
	'62'    : '------- ??',
	'622'   : '------- (China UnionPay)',
	'622126': '622925 China UnionPay Card',
	'627397': 'Wild Oats Gift Card',
	'627692': 'Dexit',
	'6277'  : '[iCard][ICICI Bank Canada]',
	'63'    : '------- ??',
//	'6304'  : 'Laser Debit Card??',
	'6304'  : 'Maestro Debit Card',
	'630490': 'Bank of Ireland Laser debit Card',
	'63191' : 'British Home Stores - Bhs Credit Card',
//	'6333 00 to 6333 49'  : 'Maestro Cards',
	'6333'  : 'Maestro Cards',
//	'6334 50 to 6334 99'  : 'Solo Cards',
	'6334'  : 'Solo Cards',
//	'6335 4099 000'  : 'Argos Card',
	'633540': 'Argos Card',
	'644'   : 'Discover Card Credit Card',
	'645'   : 'Discover Card Credit Card',
	'646'   : 'Discover Card Credit Card',
	'647'   : 'Discover Card Credit Card',
	'648'   : 'Discover Card Credit Card',
	'649'   : 'Discover Card Credit Card',
	'65'    : '------- (Discover Card until October 2006)',
	'67'    : '------- (Maestro) ??',
	'6706'  : 'Laser Debit Card??',
	'670695': 'AIB Maestro/Laser Card (Ireland)',
	'6709'  : 'Laser Debit Card',
	'6725'  : 'Maestro Debit Cards (Germany)',
	'6726'  : 'Maestro Debit Cards (Germany)',
	'6759'  : 'Maestro (formerly Switch) Debit Cards',
//  followed by the two digits of the bank's assigned sorting code prefix
	'6761'  : 'Maestro Debit Card',
	'6763'  : 'Maestro Debit Card',
	'6767'  : 'Solo, a sister debit card to Switch.',
	'6771'  : 'Laser Debit Card',
	'9920'  : 'Lufhansa Miles & More ??',
	'999999': '--unknown--'  // end of list
  }; // _IIN

  function _CAP() {}; // Card Reader protocol
  _CAP.prototype = {
	'desc'  : 'http://www.cl.cam.ac.uk/~sjm217/papers/fc09optimised.pdf',
	// CAP code         : used by
	'0xA0000000048002'  : 'NatWest',
	'0xA0000000038002'  : 'Barclays',
	'0xA0000002040000'  : 'HBOS'
  }; // _CAP

  // ======================================================================= //
  // global functions                                                        //
  // ======================================================================= //
  /*
   */
  //this.bits   	= 8; /* bits per input character. 8 - ASCII; 16 - Unicode    */

  this.val2num  = function(src) { return((src+='').replace(/[^0-9]/g,'')); };
  //#? force value to digits
	/* force any value wether string or number, to a string containing just digits */

  this.GTIN   = function(src,lng,cpc) { // name could be EAN, IAN, UPC also ..
  //#? general function to compute checksum for EAN, IAN, UPC numbers
	/* src: number to check
	 * lng: length of number to be check, starting from right
     *       if 0 all digits are used
     * cpc=true:  last digit is CPC and included in calculation
     * cpc=false: CPC digit missing
	 */
	/*
	 * GLN, EAN, UPC is similar to the Luhn (IBM) check, but uses a weighting
	 * factor of 3.
	 * Algorithm:
	 * 1) all digits in even positions from right are multiplied by 3
	 * 2) all digits, including results from 1), are added
	 * 3) the check digit is the number that when added to that sum equals a multiple of 10
	 */
		var i   = 0;
		var bux = 0;
		var kkk = EnDe.Check.val2num(src);
		if (lng > kkk.length) { return(-1); } // ToDo: bail out with error
		var anf = kkk.length - 1;
		var end = anf - lng;
		if (cpc == true) {  // strip of check digit
			anf--;
			end--;
		}
		if (lng == 0) { end = 0; } // use all digits
		if (end <= 0) { end = 0; } // lazy sanitation
		if (end >= anf) { return(-1); } // ToDo: bail out with error
		for (i=anf;     i>=end; i-=2) { bux += parseInt(kkk[i], 10); }
		bux *= 3;
		for (i=(anf-1); i>=end; i-=2) { bux += parseInt(kkk[i], 10); }
		if (bux > 9) { bux = bux%10; }
		return((bux==0)?0:(10-(bux%10))); // need to return 0 instead of 10 !
  }; // GTIN

  // ======================================================================= //
  // Luhn alhorithm                                                          //
  // ======================================================================= //
  /*
   * see: http://en.wikipedia.org/wiki/Luhn_algorithm
   */

  this.Luhn     = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.Luhn'); };

/* this one fails in some browsers 'cause they cannot assign array elements to itself
	this.get    = function(src) {
	//#? compute checksum with Luhn Algorithm
		var bux = 0;
		var kkk = EnDe.Check.val2num(src);
		for (i=(kkk.length-2); i>=0; i-=2) {
			kkk[i] *= 2;
			if (kkk[i] > 9) { kkk[i] -= 9; }
		}
		for (i=0; i<kkk.length; i++) { bux += parseInt(kkk[i], 10); }
		return(parseInt(bux, 10));
	};
*/

/* not as elegant as above, but should work in all JavaScript engines */
	this.get    = function(src) {
	//#? compute checksum with Luhn Algorithm
// ToDo: some systems, Credit cards use compute with luhn but omit the prefix (MII)
		var bux = 0;
		var ccc = 0;
		var i   = 0;
		var k   = 0;
		var kkk = EnDe.Check.val2num(src);
		for (i=(kkk.length-1); i>=0; i--, k++) {
			ccc = kkk[i];
			if ((k%2)===1) { // skips the very last in array
				ccc *= 2;
				if (ccc > 9) { ccc -= 9; }
			}
			bux += parseInt(ccc, 10);
		}
		return(bux);
	};

	this.is     = function(src) {
	//#? check if data is valid according Luhn Algorithm
		var kkk = this.get(src);
		if (kkk<0) { return(false); }
		return(((kkk%10)==0)?true:false);
	};

	this.valid  = function(src) { return(this.is(src)); }; // Luhn does not use checksum digits

	this.force  = function(src) {
	//#? compute checksum with Luhn Algorithm and set last digit to computed checksum
		var bux = src + ''; // force to string
		var kkk = this.get(src);
		if (kkk%10 > 0) { bux[bux.length-1] = 10 - kkk; }
		return(bux.toString());
	};

  }; // EnDe.Check.Luhn

  // ======================================================================= //
  // EFT numbers (Electronic Funds Transfer Routing Number Check)            //
  // ======================================================================= //
  /*
   * see: http://en.wikipedia.org/wiki/Electronic_Funds_Transfer
   *      http://www.augustana.ab.ca/~mohrj/algorithms/checkdigit.html
   */

  this.EFT      = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.EFT'); };

	this.get    = function(src) {
	//#? compute checksum for EFT numbers (Electronic Funds Transfer Routing Number Check)
		/* 3a1 + 7a2 + a3 + 3a4 + 7a5 + a6 + 3a7 + 7a8 + a9 mod 10 = 0 */
		/* we use a simple computation without modulo table like
		 *    0  1  2  3  4  5  6  7  8  9
		 *-----+--+--+--+--+--+--+--+--+--+--
		 * 1 [0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
		 * 3 [0, 3, 6, 9, 2, 5, 8, 1, 4, 7 ]
		 * 7 [0, 7, 4, 1, 8, 5, 2, 9, 6, 3 ]
		 * 9 [0, 9, 8, 7, 6, 5, 4, 3, 2, 1 ]
		 */
		var bux = -1;
		var kkk = EnDe.Check.val2num(src);
		if ((kkk.length < 9) || (kkk.length > 11)) { return(bux); } // ToDo: bail out with error
		bux = 3 * kkk[0]
			+ 7 * kkk[1]
			+ 1 * kkk[2]
			+ 3 * kkk[3]
			+ 7 * kkk[4]
			+ 1 * kkk[5]
			+ 3 * kkk[6]
			+ 7 * kkk[7]
			+ 1 * kkk[8];
		return(parseInt(bux, 10));
	};

	this.is     = function(src) {
	//#? check if data is valid EFT number
		var kkk = this.get(src);
		if (kkk<0) { return(false); }
		return(((kkk%10)==0)?true:false);
	};

	this.valid  = function(src) { return(this.is(src)); }; // EFT does not use checksum digits

	this.force  = function(src) {
	//#? compute checksum for EFT number and set last digit to computed checksum
		var bux = src + ''; // force to string
		var kkk = EnDe.Check.val2num(src);
		if (kkk%10 > 0) { bux[bux.length-1] = 10 - kkk; }
		return(bux.toString());
	};

  }; // EnDe.Check.EFT

  // ======================================================================= //
  // GLN International Location Number                                       //
  // ======================================================================= //
  /*
   * same as UPC, EAN, but not restricted to specific number of digits
   */

	// Note: checking variable length is tricky
	//  .get() assumes that there is no right-most checksum digit present
	//  .is()  needs to pass data without right-most digit therfore

  this.GLN      = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.GLN'); };
	this.GLN    = new _GLN;

	this.get    = function(src) {
	//#? compute checksum for GLN, EAN, IAN, UPC, ...
		var kkk = EnDe.Check.val2num(src);
		return EnDe.Check.GTIN(kkk,0,false);   // strip off check digit
	};

	this.is     = function(src) {
	//#? check if data ends with valid checksum digit
		var kkk = EnDe.Check.val2num(src);
		var ccc = kkk[kkk.length-1];
		return((this.get(src.substr(0,(src.length-1)))==ccc)?true:false);
	};

	this.valid  = function(src) { return(this.is(src)); };

	this.code   = function(src) {
	//#? return issuer country for given number, '--unknown--' if not found
		var k = '';
		var bux = src.replace(/[^0-9]/g,''); // reduce to digits
		// as the length is unknown, we can only check for GLN from left
		bux = bux.substr(0 ,3); for (k in this.GLN) { if (k == bux) { return(this.GLN[k]); } }
		bux = bux.substr(0 ,2); bux += 'x';// search for range [xx0, xx9]
		for (k in this.GLN) { if (k == bux) { return(this.GLN[k]); } }
		return('--unknown--');
	}; //code()

  }; // EnDe.Check.GLN

  // ======================================================================= //
  // UPC numbers (Universal Product Code)                                    //
  // ======================================================================= //
  /*
   * UPC is similar to the Luhn (IBM) check, but uses a weighting factor of 3
   * instead of 2.
   * see: http://en.wikipedia.org/wiki/Universal_Product_Code
   *      http://www.augustana.ab.ca/~mohrj/algorithms/checkdigit.html
   *
   * == Following not yet implemented
   * digits   UPC Version
   * --------+--------------
   *	10+2	UPC Version A
   *			An eleventh digit indicates the type of product, and a twelfth digit is a modulo check digit.
   *	10+2	UPC Version E (compressed Version A, strip 0)
   *			For example, the code 59300-00066 would be encoded as 593663
   *	10+2,3	EAN-13 see EnDe.Check.EAN below
   *	5+2+1	EAN-8
   */

	// NOTE: all numbers are check from right to left,
	//       hence only 12 digits from right are used/checked

  this.UPC      = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.UPC'); };

	this.get    = function(src) {
	//#? compute checksum for UPC numbers (aka UPC-A, aka UPC-12)
		var kkk = EnDe.Check.val2num(src);
		if (kkk.length == 11) { return EnDe.Check.GTIN(kkk,11,false); } // assume UPC without check digit
		if (kkk.length == 12) { return EnDe.Check.GTIN(kkk,12,true ); } // assume UPC with check digit
		return(-1);
	};

	this.is     = function(src) {
	//#? check if data ends with valid checksum digit
		var kkk = EnDe.Check.val2num(src);
		var ccc = kkk[kkk.length-1];
		return((this.get(src)==ccc)?true:false);
	};

	this.valid  = function(src) { return(this.is(src)); };

  }; // EnDe.Check.UPC

  // ======================================================================= //
  // EAN (European Article Numbers - International Article Number            //
  // ======================================================================= //
  /*
   * EAN is similar to UPC but has 13 digits and digits at even positions are
   * multiplied by 3.
   */

  this.EAN      = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.EAN'); };
	this.EAN    = new _GLN;

	// NOTE: all numbers are check from right to left,
	//       hence only 13 digits from right are used/checked

	this.get    = function(src) {
	//#? compute checksum for EAN-13 (aka GTIN, GLN, IAN)
		var kkk = EnDe.Check.val2num(src);
		if (kkk.length == 12) { return EnDe.Check.GTIN(kkk,12,false); } // assume EAN without check digit
		if (kkk.length == 13) { return EnDe.Check.GTIN(kkk,13,true ); } // assume EAN with check digit
		return(-1);
	};

	this.is     = function(src) {
	//#? check if data ends with valid checksum digit
		var kkk = EnDe.Check.val2num(src);
		var ccc = kkk[kkk.length-1];
		return((this.get(src)==ccc)?true:false);
	};

	this.valid  = function(src) { return(this.is(src)); }; // CPC must have a checksum digit

	this.code   = function(src) {
	//#? return issuer country for given number, '--unknown--' if not found
		/* this.EAN contains only first 3 digits */
		var k = '';
		var bux = src.replace(/[^0-9]/g,''); // reduce to digits
		var anf = bux.length - 13;
		if (anf < 0) { anf = 0; } // sanatize
		bux = bux.substr(anf,3); for (k in this.EAN) { if (k == bux) { return(this.EAN[k]); } }
		bux = bux.substr(0 ,2); bux += 'x';// search for range [xx0, xx9]
		for (k in this.EAN) { if (k == bux) { return(this.EAN[k]); } }
		return('--unknown--');
	}; //code()

  }; // EnDe.Check.EAN

  // ======================================================================= //
  // ISSN numbers                                                            //
  // ======================================================================= //
  /*
   * // ToDO: same as ISBN but only 8 digits including check digit
   */

  // ======================================================================= //
  // ISBN numbers                                                            //
  // ======================================================================= //
  /*
   * see: http://www.augustana.ab.ca/~mohrj/algorithms/checkdigit.html
   */

  this.ISBN     = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.ISBN'); };

	this.get    = function(src) {
	//#? compute checksum for ISBN number
		/* allows 9 or 10 digit numbers, returns checksum */
		/* sample: 0-1315-2447-X /*
		/* 10x0 + 9x1 + 8x3 + 7x1 + 6x5 + 5x2 + 4x4 + 3x4 + 2x7 + 1x10 mod 11 = 132 mod 11 = 0 */
		var bux = 0;
		var kkk = EnDe.Check.val2num(src);
		if ((kkk.length < 9) || (kkk.length > 11)) { return(-1); } // ToDo: bail out with error
		for (i=0; i<9; i++ ) { bux += ((10-i) * parseInt(kkk[i], 10)); }
		return(11-(bux%11));
	};

	this.is     = function(src) {
	//#? check if data ends with valid ISBN checksum number
		var kkk = EnDe.Check.val2num(src);
		var ccc = kkk[9];
		// last number may have 2 digits
		if (kkk.length==11)  { ccc = parseInt((kkk[9]+''+kkk[10]), 10); } // Note the cast to a string !
		return((this.get(src)==ccc)?true:false);
	};

	this.valid  = function(src) { return(this.is(src)); }; // ISBN must have a checksum digit

	this.force  = function(src) {
	//#? force setting ISBN mod 11 number
		/* input must be a 9 or 10 digit number, returns corresponding 10 digit number */
		var kkk = EnDe.Check.val2num(src);
		if (kkk.length <  9) { return(-1); } // ToDo: bail out with error
		if (kkk.length > 10) { kkk.length = 9; } // strip off last number
		var ccc = this.get(src);

		if (ccc<0) { return(-1); } // ToDo: bail out with error
		kkk[9] = ccc;
// ToDo: use given src and search for 9'th digit, then append checksum
		return(kkk.join(''));
	};

  }; // EnDe.Check.ISBN

  // ======================================================================= //
  // Verhoeff's Dihedral Group D5 Check                                      //
  // ======================================================================= //
  /*
   * see: http://www.augustana.ab.ca/~mohrj/algorithms/checkdigit.html
   */

  this.D5       = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.D5'); };

	var i,j;
	var F = new Array();
	F[0]  = new Array( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 );
	F[1]  = new Array( 1, 5, 7, 6, 2, 8, 3, 0, 9, 4 );
	for (i=2; i<8; i++ ) {
		F[i] = new Array();
		for (j=0; j<10; j++ ) {
			F[i][j] = F[i-1][F[1][j]];
		}
	}
	var o = new Array();
	o[0]  = new Array( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 );
	o[1]  = new Array( 1, 2, 3, 4, 0, 6, 7, 8, 9, 5 );
	o[2]  = new Array( 2, 3, 4, 0, 1, 7, 8, 9, 5, 6 );
	o[3]  = new Array( 3, 4, 0, 1, 2, 8, 9, 5, 6, 7 );
	o[4]  = new Array( 4, 0, 1, 2, 3, 9, 5, 6, 7, 8 );
	o[5]  = new Array( 5, 9, 8, 7, 6, 0, 4, 3, 2, 1 );
	o[6]  = new Array( 6, 5, 9, 8, 7, 1, 0, 4, 3, 2 );
	o[7]  = new Array( 7, 6, 5, 9, 8, 2, 1, 0, 4, 3 );
	o[8]  = new Array( 8, 7, 6, 5, 9, 3, 2, 1, 0, 4 );
	o[9]  = new Array( 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 );
	var I = new Array( 0, 4, 3, 2, 1, 5, 6, 7, 8, 9 );

	function reverse(src) {
		var bux = '';
		for (var i=src.length-1; i>=0; i-- ) { bux = bux + src.charAt(i); }
		return(bux);
	};

	this.get    = function(src) {
	//#? compute checksum according Verhoeff Dihedral Group D5 Check
		var bux = '';
		var kkk = EnDe.Check.val2num(src);
		    kkk = 'x' + reverse(kkk);
		var ccc = 0;
		for ( var i=1; i<kkk.length; i++ ) {
			ccc = o[ccc][F[i%8][kkk.charAt(i)]];
		}
		bux = bux + I[ccc];
		return(bux);
	};

	this.is     = function(src) {
	//#? check if data Verhoeff number
		//var kkk = this.get(src);
		return((this.get(src)==0)?true:false);
	};

	this.valid  = function(src) { return(this.is(src)); }; // must have a checksum digit

	this.force  = function(src) {
	//#? force setting Verhoeff's Dihedral Group D5 number
// ToDo: EnDe.Check.D5.force() NOT YET IMPLEMENTED
	};

  }; // EnDe.Check.D5

  // ======================================================================= //
  // Functions and mappings according credit cards, CSC, CVV, CVC            //
  // ======================================================================= //
  /*
   * see: http://en.wikipedia.org/wiki/Credit_card_numbers
   * see: http://en.wikipedia.org/wiki/List_of_Bank_Identification_Numbers
   * see: http://en.wikipedia.org/wiki/Card_Security_Code
   *
   * CSC  - Card Security Code (also known as a CCID or Credit Card ID)
   * CVV  - sometimes called Card Verification Value
   * CVC  - sometimes called Card Verification Code
   *        CVV1 aka CVC1, CVV2 aka CVC2, iCVV (aka Dynamic CVV)
   * MII  - Major Industry Identifier (a single digit)
   * IIN  - Issuer Identification Number (6 digits)
   * BIN  - Bank Identification Number
   * IBAN - International Bank ?? Number
   * ISO 7812  - IIN (MII + 5 digits) +  account number + single digit (Luhn) checksum
   */

  this.MII      = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.MII'); };
	this.MII    = new _MII;

	this.get    = function(src) {
	//#? return MII for given number, '--unknown--' if not found
		var k = '';
		var bux = src.replace(/[^0-9]/g,''); // reduce to digits
		bux = bux.substring(0,1); for (k in this.MII) { if (k == bux) { return(this.MII[k]); } }
	}; //get()
  }; // EnDe.Check.MII

  this.CC       = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.CC'); };
	this.MII    = new _MII;
	this.IIN    = new _IIN;

	this.get    = function(src) {
	//#? return issuer for given number, '--unknown--' if not found
		/* this.INN uses only 6 digits, so we start searching with 6 digits,
		 * repeat the search with 4 and finally with just 2 digits
		 * if all fails, the number is unknown
		 */
		var k = '';
		var bux = src.replace(/[^0-9]/g,''); // reduce to digits
		bux = bux.substring(0,6); for (k in this.IIN) { if (k == bux) { return(this.IIN[k]); } }
		bux = bux.substring(0,4); for (k in this.IIN) { if (k == bux) { return(this.IIN[k]); } }
		bux = bux.substring(0,2); for (k in this.IIN) { if (k == bux) { return(this.IIN[k]); } }
		return('--unknown--');
	}; //get()

	this.is     = function(src) {
	//#? check if given number is IIN
		//var kkk = this.get(src);
		return((this.get(src)=='--unknown--')?false:true);
	}; // is()

	this.valid  = function(src) { return(this.is(src)); }; // anything is valid
	this.code   = function(src) { return(this.get(src)); };

  }; // EnDe.Check.CC

// ToDo: does not yet work proper 'cause of limited integer range in JavaScript
// http://en.wikipedia.org/wiki/International_Bank_Account_Number
  this.IBAN     = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.IBAN'); };

	this.get    = function(src) {
	//#? compute checksum for IBAN
		/* GB82 WEST 1234 5698 7654 32
		 * 1. move first 4 characters to end
		 * 2. replace all letters with 2-digit number; A=10 .. Z=35
		 * 3. compute remainder on division by 97
		 */
		var i = '';
		var bux = '';
		var ccc = '';
		var kkk = src.replace(/[^0-9a-zA-Z]/g,''); // reduce
		for (i=4; i<kkk.length; i++) {
			ccc = kkk[i];
			if (ccc.match(/[0-9]/)!==null) {
				bux += ccc;
			} else {
				bux += ccc.toUpperCase().charCodeAt() - 55;
			}
		}
		for (i=0; i<2; i++) { // 3'rd and 4'th digit are the checksum
			ccc = kkk[i];
			if (ccc.match(/[0-9]/)!==null) {
				bux += ccc;
			} else {
				bux += ccc.toUpperCase().charCodeAt() - 55;
			}
		}
		bux = parseInt(bux.replace(/^0/g,''), 10);  // avoid interpretation as octal number
//#dbx# alert(bux+' ++ '+parseInt((bux % 97), 10));
		return(parseInt((bux % 97), 10));
	}; //get()

	this.is     = function(src) {
	//#? check if given number is valid IBAN
		var kkk = parseInt(src.substring(2,4), 10);
		return((kkk===this.get(src))?true:false);
	}; // is()

	this.valid  = function(src) { return(this.is(src)); }; // anything is valid
	this.code   = function(src) { return(this.get(src)); };

  }; // EnDe.Check.IBAN

  // ======================================================================= //
  // Functions for (US) Social Security Numbers                              //
  // ======================================================================= //
  /*
   */

  this.SSN      = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.SSN'); };

	this.is     = function(src) {
	//#? check if given number is SSN (Social Security Number)
		return((src.match(/(\d{6})[\-\+A](\d{3})[0123456789ABCDEFHJKLMNPRSTUVWXY]/)==null)?false:true);
	}; // is()
  }; // EnDe.Check.SSN

  // ======================================================================= //
  // Functions for byte checksums                                            //
  // ======================================================================= //

  this.Byte1    = new function() {
	this.sid    = function() { return(EnDe.Check.sid() + '.Byte1'); };

	this.get    = function(src) {
	//#? compute 1 byte checksum of given string
		var bux = 0;
		for (var i=0; i<src.length; i++ ) { bux += src.charCodeAt(i); }
		return (bux-((bux%256)*256));
	}; // get()
  }; // EnDe.Check.Byte1

}; // EnDe.Check

