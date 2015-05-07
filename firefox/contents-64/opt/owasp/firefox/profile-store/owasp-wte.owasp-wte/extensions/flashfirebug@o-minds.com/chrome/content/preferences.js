// Load in mm settings
var mm = Flashbug.readMMFile();

function $(id) {
	return document.getElementById(id);
};

var settingsWindow = {
	
	_prefSvc: Flashbug.CCSV("@mozilla.org/preferences-service;1", "nsIPrefBranch2"),
	
	init: function() {
		this._window = $('flashbugPreferences');
		this._window.addEventListener('select', this, false);
		
		this.prevPane = this.currentPane = this._window.currentPane;
		
		// Doesn't update toolbar
		/*for each (var pane in this._window.preferencePanes) {
			if (pane.id) {
				pane.setAttribute('label', Flashbug.$FL_STR(pane.getAttribute('label')));
			}
		}*/
		
		// internationalizeUI
		var elements = ['flashbugPreferences', 'paneMain', 'paneTrace', 'panePolicy', 'paneNet', 'paneAdvanced'];
		var attributes = ['label', 'title'];
		
		Flashbug.internationalizeElements(document, elements, attributes);
	}, 

	//**************************************************************************//
	// nsIDOMEventListener
		
	handleEvent: function(e) {
		if (e.type == "select") {
			this.prevPane = this.currentPane;
			this.currentPane = this._window.preferencePanes[this._window._paneDeck.selectedIndex];
			//alert(this.prevPane.id + ' -> ' + this.currentPane.id);
			if (this.currentPane.id == 'paneMain') {
				advPane.hide();
				mainPane.show();
			} else if(this.currentPane.id == 'paneAdvanced') {
				mainPane.hide();
				advPane.show();
			}
		}
	}, 
	
	onAccept: function() {
		this._window.removeEventListener('select', this, false);
		Flashbug.saveMMFile(mm);
	},
	
	onCancel: function() {
		this._window.removeEventListener('select', this, false);
		//nothing unless it's Mac OS X, then act like it's 'OK'
		if (this._prefSvc.getBoolPref('browser.preferences.instantApply')) Flashbug.saveMMFile(mm);
	}
};