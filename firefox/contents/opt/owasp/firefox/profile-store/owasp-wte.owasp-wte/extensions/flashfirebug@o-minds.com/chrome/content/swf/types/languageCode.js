/*
A language code identifies a spoken language that applies to text. Language codes are
associated with font specifications in the SWF file format.
*/
function LanguageCode(ba) {
	this.languageCode = ba.readUI8();
	this.language = LanguageCodes[this.languageCode];
}