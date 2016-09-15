/*
The SymbolClass tag creates associations between symbols in the SWF file and
ActionScript 3.0 classes. It is the ActionScript 3.0 equivalent of the ExportAssets tag. If the
character ID is zero, the class is associated with the main timeline of the SWF. This is how the
root class of a SWF is designated. Classes listed in the SymbolClass tag are available for
creation by other SWF files (see StartSound2, DefineEditText (HasFontClass), and
PlaceObject3 (PlaceFlagHasClassName and PlaceFlagHasImage). For example, ten SWF files
that are all part of the same website can share an embedded custom font if one file embeds
and exports the font class.
*/
function SymbolClass(ba, obj) {
	this.header = new RecordHeader(ba);
	this.numSymbols = ba.readUI16();
	
	this.symbols = []; // *
	
	var i = this.numSymbols;
	while(i--) {
		this.symbols.push({ id:ba.readUI16(), exportName:ba.readString() });
	}
}