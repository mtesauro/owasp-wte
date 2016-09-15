/*
The DefineFontName tag contains the name and copyright information for a font embedded
in the SWF file.
The minimum file format version is SWF 9.
*/
function DefineFontName(ba, obj) {
	this.header = new RecordHeader(ba);
	this.fontID =  ba.readUI16();
	this.fontName = ba.readString();
	this.copyright = ba.readString();
};