/*
bool: A boolean set to either true or false. Usually a checkbox would be connected to these preferences.
int: An integer
string: A string
unichar: A Unicode string
wstring: A localized string. In this situation the preference will save the path to a property file which contains the actual value of the preference.
file: A file. The file path will be stored in the preferences.
*/

var $FL_STR = Flashbug.$FL_STR,
	$FL_STRF = Flashbug.$FL_STRF;

var advPane = {
	
	_prefSvc: Flashbug.CCSV("@mozilla.org/preferences-service;1", "nsIPrefBranch2"),
	_visibleTypes: [],

	init: function() {
		this._list = $("mmView");
		
		// internationalizeUI 
		var elements = ['lblUndocumented', 'mmDesc2'];
		var attributes = ['label', 'tooltiptext', 'value', 'title'];
		
		Flashbug.internationalizeElements(document, elements, attributes);
		
		// Sort
		if (document.getElementById("actionColumn").hasAttribute("sortDirection")) {
			this._sortColumn = document.getElementById("actionColumn");
			document.getElementById("typeColumn").removeAttribute("sortDirection");
		} else {
			this._sortColumn = document.getElementById("typeColumn");
		}
		
		var _delayedPaneLoad = function(self) {
			self._rebuildVisibleTypes();
			self._sortVisibleTypes();
			self._rebuildView();
		}
		setTimeout(_delayedPaneLoad, 0, this);
	},
	
	show: function() {
		for (var i = 0; i < this._list.itemCount; i++) {
			var item = this._list.getItemAtIndex(i),
			value = this.toXULValue(item, item.getAttribute('typeDescription'));
			item.setAttribute('actionDescription', value);
		}
	},
	
	hide: function() {
		// save mmfile
	},
	
	//**************************************************************************//
	// View Construction
	
	_rebuildVisibleTypes: function() {
		// Reset the list of visible types and the visible type description counts.
		this._visibleTypes = [];
		this._visibleTypes = Flashbug.MM_PROPS.slice(0);
	},
	
	_rebuildView: function() {
		// Clear the list of entries.
		while (this._list.childNodes.length > 1) {
			this._list.removeChild(this._list.lastChild);
		}
		
		for each (var prop in this._visibleTypes) {
			var item = document.createElement("richlistitem");
			item.setAttribute("type", prop.type); // Type
			item.setAttribute("typeDescription", prop.name); // Label
			item.setAttribute("typeTip", Flashbug.$FL_STR('flashbug.mm.' + prop.name)); // Tooltip
			if (!prop.hasOwnProperty('documented')) item.setAttribute("typeIcon", 'chrome://flashbug/skin/dialog-warning.png'); // Icon
			item.setAttribute("actionDescription", this.toXULValue(item, prop.name)); // Value
			this._list.appendChild(item);
		}
	},
	
	//**************************************************************************//
	// Sorting & Filtering

	_sortColumn: null,

	/**
	* Sort the list when the user clicks on a column header.
	*/
	sort: function(event) {
		var column = event.target;
		
		// If the user clicked on a new sort column, remove the direction indicator
		// from the old column.
		if (this._sortColumn && this._sortColumn != column) {
			this._sortColumn.removeAttribute("sortDirection");
		}
		
		this._sortColumn = column;
		
		// Set (or switch) the sort direction indicator.
		if (column.getAttribute("sortDirection") == "ascending") {
			column.setAttribute("sortDirection", "descending");
		} else {
			column.setAttribute("sortDirection", "ascending");
		}
		
		this._sortVisibleTypes();
		this._rebuildView();
	},

	/**
	* Sort the list of visible types by the current sort column/direction.
	*/
	_sortVisibleTypes: function() {
		if (!this._sortColumn) return;
		
		var t = this;
		function sortByType(a, b) {
			return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
		}
		
		function sortByAction(a, b) {
			var valA = mm.hasOwnProperty(a.name) ? mm[a.name].toString() : '';
			var valB = mm.hasOwnProperty(b.name) ? mm[b.name].toString() : '';
			return valA.toLowerCase().localeCompare(valB.toLowerCase());
		}
		
		switch (this._sortColumn.getAttribute("value")) {
			case "type":
				this._visibleTypes.sort(sortByType);
				break;
			case "action":
				this._visibleTypes.sort(sortByAction);
				break;
		}
		
		if (this._sortColumn.getAttribute("sortDirection") == "descending") {
			this._visibleTypes.reverse();
		}
	},
	
	/**
	* Rebuild the actions menu for the selected entry.  Gets called by
	* the richlistitem constructor when an entry in the list gets selected.
	*/
	rebuildTypeMenu: function() {
		var typeItem = this._list.selectedItem;
		// typeItem.type = string,bool,int
		var menu = document.getAnonymousElementByAttribute(typeItem, "class", "typeMenu");
		var menuPopup = menu.menupopup;
		
		// Clear out existing items.
		while (menuPopup.hasChildNodes()) {
			menuPopup.removeChild(menuPopup.lastChild); 
		}
		
		// Create Yes Value
		var strTrue = $FL_STR('flashbug.pref.pane.true');
		var strFalse = $FL_STR('flashbug.pref.pane.false');
		var yesMenuItem = document.createElement("menuitem");
		var label = strTrue;
		yesMenuItem.setAttribute("label", label);
		yesMenuItem.setAttribute("tooltiptext", label);
		menuPopup.appendChild(yesMenuItem);
		
		// Create No Value
		var noMenuItem = document.createElement("menuitem");
		label = strFalse;
		noMenuItem.setAttribute("label", label);
		noMenuItem.setAttribute("tooltiptext", label);
		menuPopup.appendChild(noMenuItem);
		
		// Add a separator to distinguish these items from the helper app items
		// that follow them.
		var menuItem = document.createElement("menuseparator");
		menuPopup.appendChild(menuItem);
		
		// Create <None> Value
		var noneMenuItem = document.createElement("menuitem");
		label = $FL_STR('flashbug.pref.pane.none');
		noneMenuItem.setAttribute("label", label);
		noneMenuItem.setAttribute("tooltiptext", label);
		menuPopup.appendChild(noneMenuItem);
		
		// Select the item corresponding to the preferred action.  If the always
		// ask flag is set, it overrides the preferred action.  Otherwise we pick
		// the item identified by the preferred action (when the preferred action
		// is to use a helper app, we have to pick the specific helper app item).
		switch (menu.tooltipText) {
			case strTrue:
				menu.selectedItem = yesMenuItem;
				break;
			case strFalse:
				menu.selectedItem = noMenuItem;
				break;
			case '':
				menu.selectedItem = noneMenuItem;
				break;
		}
	},
	
	toXULValue: function(item, name) {
		var value;
		if (item.getAttribute('type') == 'bool') {
			value = mm.hasOwnProperty(name) ? mm[name] === true ? $FL_STR('flashbug.pref.pane.true') : $FL_STR('flashbug.pref.pane.false') : '';
		} else {
			value = mm.hasOwnProperty(name) ? mm[name] : '';
		}
		//alert('toXULValue ; ' + item.getAttribute('typeDescription') + ' ; ' + value);
		return value;
	},
	
	toMMValue: function(item, data) {
		var value;
		if (item.getAttribute('type') == 'bool') {
			value = (data == $FL_STR('flashbug.pref.pane.true')) ? true : data == '' ? null : false;
		} else {
			value = data == '' ? null : data;
		}
		//alert('toMMValue ; ' + item.getAttribute('typeDescription') + ' ; ' + value);
		return value;
	},
	
	onSelectAction: function(actionItem) {
		var typeItem = this._list.selectedItem,
		value = actionItem.localName == 'menuitem' ? actionItem.label : actionItem.value;
		if (value == $FL_STR('flashbug.pref.pane.none')) value = '';
		typeItem.setAttribute('actionDescription', value);
		mm[typeItem.getAttribute('typeDescription')] = this.toMMValue(typeItem, value);
	}
}