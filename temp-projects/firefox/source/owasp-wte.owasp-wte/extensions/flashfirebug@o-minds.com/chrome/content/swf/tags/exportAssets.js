/*
The ExportAssets tag makes portions of a SWF file available for import by other SWF files
(see "ImportAssets" on page 56). For example, ten SWF files that are all part of the same
website can share an embedded custom font if one file embeds the font and exports the font
character. Each exported character is identified by a string. Any type of character can be
exported.
If the value of the character in ExportAssets was previously exported with a different identifier,
Flash Player associates the tag with the latter identifier. That is, if Flash Player has already read
a given value for Tag1 and the same Tag1 value is read later in the SWF file, the second Name1
value is used.
The minimum file format version is SWF 5.
*/
function ExportAssets(ba, obj) {
	this.header = new RecordHeader(ba);
	this.count = ba.readUI16();
	
	this.assets = []; // *
	
	var i = this.count;
	while(i--) {
		this.assets.push({ id:ba.readUI16(), exportName:ba.readString() });
	}
}