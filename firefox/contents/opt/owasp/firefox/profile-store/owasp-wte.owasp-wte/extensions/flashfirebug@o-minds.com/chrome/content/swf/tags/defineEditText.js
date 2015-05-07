/*
The DefineEditText tag defines a dynamic text object, or text field.
A text field is associated with an ActionScript variable name where the contents of the text
field are stored. The SWF file can read and write the contents of the variable, which is always
kept in sync with the text being displayed. If the ReadOnly flag is not set, users may change
the value of a text field interactively.
Fonts used by DefineEditText must be defined using DefineFont2, not DefineFont.
The minimum file format version is SWF 4.
*/
function DefineEditText(ba, obj) {
	this.header = new RecordHeader(ba);
	this.id = ba.readUI16();
	this.bounds = new Rect(ba);
	this.bounds.fromTwips();
	this.hasText = ba.readBoolean();
	this.wordWrap = ba.readBoolean();
	this.multiline = ba.readBoolean();
	this.password = ba.readBoolean();
	this.readOnly = ba.readBoolean();
	this.hasTextColor = ba.readBoolean();
	this.hasMaxLength = ba.readBoolean();
	this.hasFont = ba.readBoolean();
	this.hasFontClass = ba.readBoolean();
	this.autoSize = ba.readBoolean();
	this.hasLayout = ba.readBoolean();
	this.noSelect = ba.readBoolean();
	this.border = ba.readBoolean();
	this.wasStatic = ba.readBoolean();
	this.html = ba.readBoolean();
	this.useOutlines = ba.readBoolean();
	
	if (this.hasFont) this.fontID = ba.readUI16();
	if (this.hasFontClass) this.fontClass = ba.readString();
	if (this.hasFont) this.fontHeight = ba.readUI16();
	if (this.hasTextColor) this.textColor = new RGBA(ba);
	if (this.hasMaxLength) this.maxLength = ba.readUI16();
	if (this.hasLayout) {
		this.align = Align[ba.readUI8()];
		this.leftMargin = ba.readUI16() / 20; // twips
		this.rightMargin = ba.readUI16() / 20; // twips
		this.indent = ba.readUI16() / 20; // twips
		this.leading = ba.readSI16() / 20; // twips
	}
	this.variableName = ba.readString();
	if (this.hasText) this.initialText = ba.readString();
}