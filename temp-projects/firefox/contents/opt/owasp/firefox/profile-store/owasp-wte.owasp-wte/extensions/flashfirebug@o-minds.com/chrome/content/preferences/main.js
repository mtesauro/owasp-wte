const PREF_TRACE_CHARSET    = "extensions.firebug.flashbug.console.charSet";
const PREF_TRACE_MAXLINES    = "extensions.firebug.flashbug.console.maxLines";
const PREF_TRACE_MAX_WARNINGS = "extensions.firebug.flashbug.console.maxWarnings";
const PREF_TRACE_ENABLE_WARNINGS = "extensions.firebug.flashbug.console.enableWarnings";
const PREF_NET_AMF = "extensions.firebug.flashbug.amf.enableAMF";
const PREF_MM_CONCAT = "extensions.firebug.flashbug.mm.concat";

/*
bool: A boolean set to either true or false. Usually a checkbox would be connected to these preferences.
int: An integer
string: A string
unichar: A Unicode string
wstring: A localized string. In this situation the preference will save the path to a property file which contains the actual value of the preference.
file: A file. The file path will be stored in the preferences.
*/

var mainPane = {
	
	_prefSvc: Flashbug.CCSV("@mozilla.org/preferences-service;1", "nsIPrefBranch2"),

	init: function() {
		// internationalizeUI 
		var elements = ['outputDesc', 'lblCharset', 'lblMaxLines', 'maxLines', 'mmDesc', 'mmLocDesc', 'netDesc', 'traceDesc', 'policyDesc', 'ErrorReportingEnable', 'lblMaxWarning', 'MaxWarnings', 'PolicyFileLog', 'PolicyFileLogAppend', 'enableAMF', 'mmConcatDesc', 'mmConcatTextArea'];
		var attributes = ['label', 'tooltiptext', 'value', 'title'];
		
		Flashbug.internationalizeElements(document, elements, attributes);
		
		// Preferences
		this._prefSvc.addObserver(PREF_TRACE_CHARSET, this, false);
		this._prefSvc.addObserver(PREF_TRACE_MAX_WARNINGS, this, false);
		this._prefSvc.addObserver(PREF_TRACE_ENABLE_WARNINGS, this, false);
		this._prefSvc.addObserver(PREF_NET_AMF, this, false);
                this._prefSvc.addObserver(PREF_MM_CONCAT, this, false);
		
		// Load in mm settings
		/*for(var i in mm) {
			var el = $(i);
			if (el) {
				if (typeof mm[i] == 'string' || typeof mm[i] == 'number') {
					el.value = mm[i];
				} else if(typeof mm[i] == 'boolean') {
					el.checked = mm[i];
				}
			}
		}*/
		
		// Show file paths
		try {
		$('mmLocation').value = Flashbug.mmFile.path;
		$('traceLocation').value = Flashbug.logFile.path;
		} catch(e) { alert(e);}
		$('policyLocation').value = Flashbug.policyFile.path;
		
		
		// Listen for window unload so we can remove our preference observers.
		window.addEventListener("unload", this, false);
                window.sizeToContent();
	},
	
	destroy: function() {
		window.removeEventListener("unload", this, false);
		this._prefSvc.removeObserver(PREF_TRACE_CHARSET, this);
		this._prefSvc.removeObserver(PREF_TRACE_MAX_WARNINGS, this);
		this._prefSvc.removeObserver(PREF_TRACE_ENABLE_WARNINGS, this);
		this._prefSvc.removeObserver(PREF_NET_AMF, this);
                this._prefSvc.removeObserver(PREF_MM_CONCAT, this);
	},
	
	show: function() {
		//$('ErrorReportingEnable').checked = mm['ErrorReportingEnable'];
		//$('MaxWarnings').value = mm['MaxWarnings'];
		//$('PolicyFileLog').checked = mm['PolicyFileLog'];
		//$('PolicyFileLogAppend').checked = mm['PolicyFileLogAppend'];
	},
	
	hide: function() {
		//
	},
	
	//**************************************************************************//
	// nsIObserver

	observe: function (aSubject, aTopic, aData) {
		/*if (aTopic == "nsPref:changed") {
			// aData = pref name
		}*/
	},

	
	//**************************************************************************//
	// nsIDOMEventListener
	
	handleEvent: function(aEvent) {
		if (aEvent.type == "unload") {
			this.destroy();
		}
	},
	
	updateMM: function() {
		//mm['ErrorReportingEnable'] = $('ErrorReportingEnable').checked;
		//mm['MaxWarnings'] = $('MaxWarnings').value;
		//mm['PolicyFileLog'] = $('PolicyFileLog').checked;
		//mm['PolicyFileLogAppend'] = $('PolicyFileLogAppend').checked;
	}
}