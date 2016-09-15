/*
The Metadata tag is an optional tag to describe the SWF file to an external process. The tag
embeds XML metadata in the SWF file so that, for example, a search engine can locate this
tag, access a title for the SWF file, and display that title in search results. Flash Player always
ignores the Metadata tag.
If the Metadata tag is included in a SWF file, the FileAttributes tag must also be in the SWF
file with its HasMetadata flag set. Conversely, if the FileAttributes tag has the HasMetadata
flag set, the Metadata tag must be in the SWF file. The Metadata tag can only be in the SWF
file one time.
The Metadata string is stored in the SWF file with all unnecessary white space removed.
The minimum file format version is SWF 1.
*/
function Metadata(ba, obj) {
	this.header = new RecordHeader(ba);
	this.metadata = ba.readString();
}