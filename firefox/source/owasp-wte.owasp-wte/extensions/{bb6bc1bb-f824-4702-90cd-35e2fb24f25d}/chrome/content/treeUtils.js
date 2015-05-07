coomanPlus.getTreeSelections = function (tree)
{
	var selections = [];
	var select;

	try
	{
		if (tree.treeBoxObject.view && tree.treeBoxObject.view.selection)
			select = tree.treeBoxObject.view.selection;
	}
	catch(e){};


	if (select) {
		var count = select.getRangeCount();
		var min = new Object();
		var max = new Object();
		for (var i=0; i<count; i++) {
			select.getRangeAt(i, min, max);
			for (var k=min.value; k<=max.value; k++) {
				if (k != -1) {
					selections[selections.length] = k;
				}
			}
		}
	}
	return selections;
}

coomanPlus.fixColumnName = function(c)
{
	if (this._cookies.length > 0 && !c in this._cookies[0])
		c = "rawHost";

	return c;
}

coomanPlus.sortTreeData = function(tree, table, columnName)
{
	var order = tree.getAttribute("sortDirection") == "ascending";
	var column = tree.getAttribute("sortResource");

	column = this.fixColumnName(column);

	if (column == columnName)
		order = !order;

	if (columnName)
	{
		column = columnName;
		tree.setAttribute("sortResource", column);
	}
	tree.setAttribute("sortDirection", order ? "ascending" : "descending");

	// do the sort or re-sort
	var compareFunc = function compare(first, second)
	{
		var h = coomanPlus.prefSimpleHost > 0 && column == "rawHost" ? (coomanPlus.prefSimpleHost == 1 ? "simpleHost" : "rootHost") : column;
		var f = column == "expiresString" ? "expires" : h.replace(/String$/, "");
		var r;
		if (typeof(first[f]) == "string")
			r = first[f].toLowerCase().localeCompare(second[f].toLowerCase());
		else
			r = (first[f] > second[f]) - (first[f] < second[f]);

		if (!r)
		{
			var a = [(column == "rawHost" ? (coomanPlus.prefSimpleHost > 0 ? "rawHost" : "name") : "name"), "name", "path"];
			for(var i = 0; i < a.length; i++)
			{
				r = first[a[i]].toLowerCase().localeCompare(second[a[i]].toLowerCase());
				if (r)
					break;
			}
		}
		return r;
	}
	var s = (new Date()).getTime();
	table.sort(compareFunc);
	if (!order)
		table.reverse();

	var cols = tree.getElementsByTagName("treecol");
	for (var i = 0; i < cols.length; i++)
	{
		cols[i].removeAttribute("sortDirection");
	}
	document.getElementById(column).setAttribute("sortDirection", order ? "ascending" : "descending");
}
coomanPlus.sortTree = function(tree, table, columnName)
{
	this.sortTreeData(tree, table, columnName);

	// display the results
//	tree.treeBoxObject.invalidate();
	tree.treeBoxObject.invalidateRange(tree.treeBoxObject.getFirstVisibleRow(), tree.treeBoxObject.getLastVisibleRow());
}

