/*
 Undocumented 41 - This tag defines information about the product used to generate the animation. 
The product identifier should be unique among all the products. The info includes a product identifier, 
a product edition, a major and minor version, a build number and the date of compilation. All of this 
information is all about the generator, not the output movie.
*/
function ProductInfo(ba, obj) {
	this.header = new RecordHeader(ba);
	this.product = PRODUCTS[ba.readUI32()];
	this.edition = EDITIONS[ba.readUI32()];
	this.majorVersion = ba.readUI8();
	this.minorVersion = ba.readUI8();
	this.build = ba.readUI64();
	this.compileDate = new Date(ba.readUI64()).toLocaleString();
	this.sdk = this.majorVersion + '.' + this.minorVersion + '.' + this.build;
};