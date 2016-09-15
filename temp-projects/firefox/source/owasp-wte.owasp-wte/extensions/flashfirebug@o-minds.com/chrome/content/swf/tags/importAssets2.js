/*
The ImportAssets2 tag replaces the ImportAssets tag for SWF 8 and later. ImportAssets2
currently mirrors the ImportAssets tag's functionality.
The ImportAssets2 tag imports characters from another SWF file. The importing SWF file
references the exporting SWF file by the URL where it can be found. Imported assets are
added to the dictionary just like characters defined within a SWF file.
The URL of the exporting SWF file can be absolute or relative. If it is relative, it is resolved
relative to the location of the importing SWF file.
The ImportAssets2 tag must be earlier in the frame than any later tags that rely on the
imported assets.
The minimum file format version is SWF 8.
*/
function ImportAssets2(ba, obj) {
	this.header = new RecordHeader(ba);
	this.url = ba.readString();
	ba.readUI8(); // Reserved
	ba.readUI8(); // Reserved
	this.count = ba.readUI16();
	
	this.assets = []; // *
	
	var i = this.count;
	while(i--) {
		this.assets.push({id:ba.readUI16(), exportName:ba.readString(), url:this.url});
	}
}