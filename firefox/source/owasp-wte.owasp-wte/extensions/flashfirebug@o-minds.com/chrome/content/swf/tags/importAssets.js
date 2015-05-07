/*
The ImportAssets tag imports characters from another SWF file. The importing SWF file
references the exporting SWF file by the URL where it can be found. Imported assets are
added to the dictionary just like characters defined within a SWF file.
The URL of the exporting SWF file can be absolute or relative. If it is relative, it will be
resolved relative to the location of the importing SWF file.
The ImportAssets tag was deprecated in SWF 8; Flash Player 8 or later ignores this tag. In
SWF 8 or later, use the ImportAssets2 tag instead.
The minimum file format version is SWF 5, and the maximum file format version is SWF 7.
*/
function ImportAssets(ba, obj) {
	this.header = new RecordHeader(ba);
	this.url = ba.readString();
	this.count = ba.readUI16();
	
	this.assets = []; // *
	
	var i = this.count;
	while(i--) {
		this.assets.push({id:ba.readUI16(), exportName:ba.readString(), url:this.url});
	}
}