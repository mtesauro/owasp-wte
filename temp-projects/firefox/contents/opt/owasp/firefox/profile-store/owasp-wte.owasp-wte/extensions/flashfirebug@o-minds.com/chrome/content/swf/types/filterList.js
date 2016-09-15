function FilterList(ba) {
	this.numberOfFilters = ba.readUI8();
	this.filter = [];
	
	var count = this.numberOfFilters;
	while (count--) {
		this.filter.push(new Filter(ba));
	}
}