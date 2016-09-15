FBL.ns(function() { with (FBL) {
    
Components.utils.import("resource://flashfirebuglibs/prepare.js");
	
const AMF_MIME = "application/x-amf";

var Ci = Components.interfaces;
var Cc = Components.classes;
var Cu = Components.utils;

var $FL_STR = Flashbug.$FL_STR,
$FL_STRF = Flashbug.$FL_STRF;

function trace(msg, obj) {
	msg = "Flashbug - AMFTab::" + msg;
	if (FBTrace.DBG_FLASH_AMF) {
		if (typeof FBTrace.sysout == "undefined") {
			Flashbug.alert(msg + " | " + obj);
		} else {
			FBTrace.sysout(msg, obj);
		}
	}
}
	
Flashbug.AMFInfoModule = extend(Firebug.Module, {
	
	tabId1: "AMFPost",
	tabId2: "AMFResponse",
	trace: trace,
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	// Extends Module
	
	dispatchName: "AMFViewer",
	
    initialize: function() {
		trace("initialize");
		
		Firebug.Module.initialize.apply(this, arguments);
		
		// Add AMF as a cached content type
		var cachedTypes = Firebug.getPref(Firebug.prefDomain, "cache.mimeTypes");
		if(cachedTypes && cachedTypes.indexOf(AMF_MIME) == -1) {
			if(cachedTypes.length > 0) cachedTypes += " ";
			cachedTypes += AMF_MIME;
			Firebug.getPref(Firebug.prefDomain, "cache.mimeTypes", cachedTypes);
		}
		
		// Register NetInfoBody listener
        Firebug.NetMonitor.NetInfoBody.addListener(this);
		
		// Register cache listener
		Firebug.TabCacheModel.addListener(this);
    },
	
    shutdown: function() {
		trace("shutdown");
		
		Firebug.Module.shutdown.apply(this, arguments);
		
		// Unregister NetInfoBody listener
        Firebug.NetMonitor.NetInfoBody.removeListener(this);
		
		// Unregister cache listener
		Firebug.TabCacheModel.removeListener(this);
    },
	
	showPanel: function(browser, panel) {
		if (panel && panel.name == "net") {
			// Append CSS
			var doc = panel.document;
			if ($("flashbugStyles", doc)) {
				// Don't append the stylesheet twice. 
			} else {
				var styleSheet = createStyleSheet(doc, "chrome://flashbug/skin/flashbug.css");
				styleSheet.setAttribute("id", "flashbugStyles");
				addStyleSheet(doc, styleSheet);
			}
		}
	},
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	// Extends CacheListener
	
	shouldCacheRequest: function(request){
		return this.isAMF(safeGetContentType(request));
	},
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	// Extends NetInfoBody
	
    initTabBody: function(infoBox, file) {
      if (flashfirebugPrepare.isPro) {
          var request = file.request || file;
          //trace("initTabBody", file);
          if (this.isAMF(safeGetContentType(request))) {
                  Firebug.NetMonitor.NetInfoBody.appendTab(infoBox, this.tabId1, $FL_STR("flashbug.netInfoAMF.requestTitle"));
                  Firebug.NetMonitor.NetInfoBody.appendTab(infoBox, this.tabId2, $FL_STR("flashbug.netInfoAMF.responseTitle"));
          }
      }
	},
	
    destroyTabBody: function(infoBox, file) {},
	
    updateTabBody: function(infoBox, file, context) {
		
		
		// Get currently selected tab.
		var tab = infoBox.selectedTab;
		
		// Generate content only for the first time; and only if our tab has been just activated.
		if (tab.dataPresented || (!hasClass(tab, "netInfo" + this.tabId1 + "Tab") && !hasClass(tab, "netInfo" + this.tabId2 + "Tab"))) return;
		
		// Make sure the content is generated just once.
		tab.dataPresented = true;
		
		// Get body element associated with the tab.
		var isPostTab = hasClass(tab, "netInfo" + this.tabId1 + "Tab");
		var tabBody = isPostTab ? getElementByClass(infoBox, "netInfo" + this.tabId1 + "Text") : getElementByClass(infoBox, "netInfo" + this.tabId2 + "Text");
		
		if(isPostTab) {
			// Create container html
			tabBody = Flashbug.AMFInfoModule.NetInfoAMF.tagPost.replace({}, tabBody, Flashbug.AMFInfoModule.NetInfoAMF);
			
			// Request
			if(!file.requestAMF) {
				if (file.postText) {
					var worker = new Worker("chrome://flashbug/content/amf/amfWorker.js");
					var t = this;
					worker.onmessage = function(event) {
						if (event.data && event.data.type && event.data.type == 'debug') {
							var arr = event.data.message,
								title = arr.shift();
							t.trace('Worker trace - ' + title, arr);
						} else {
							t.trace("Worker post complete", event.data);
                                                        
							file.requestAMF = event.data;
							Firebug.DOMPanel.DirTable.tag.replace({object: file.requestAMF, toggles: t.toggles}, tabBody, Firebug.DOMPanel.DirTable);
						}
					};
					worker.onerror = function(error) {
						t.trace("Worker error post: " + error.message, error);
						Flashbug.AMFInfoModule.NetInfoAMF.tagError.replace({message:$FL_STR("flashbug.netInfoAMF.error.parse") + ": " + file.href}, tabBody, Flashbug.AMFInfoModule.NetInfoAMF);
					};
					
					var postText = file.postText;
					
					// Strip headers
					postText = postText.replace(/^([^:]+):\s?(.*)[\r|\n]|\r?\n$|[\r\n]$/gm, ""); // Remove headers and one LF
					postText = postText.replace(/[\r\n]/, ""); // Remove extra CRLF
					
					worker.postMessage(postText);
				} else {
					Flashbug.AMFInfoModule.NetInfoAMF.tagError.replace({message:$FL_STR("flashbug.netInfoAMF.error.load") + ": " + file.href}, tabBody);
				}
			} else {
				Firebug.DOMPanel.DirTable.tag.replace({object: file.requestAMF, toggles: this.toggles}, getChildByClass(tabBody, "flashbugAMFRequest"));
			}
		} else {
			// Create container html
			tabBody = Flashbug.AMFInfoModule.NetInfoAMF.tagResponse.replace({}, tabBody);
			
			// Response
			if(!file.responseAMF) {
				if (file.responseText) {
					var worker = new Worker("chrome://flashbug/content/amf/amfWorker.js");
					var t = this;
					worker.onmessage = function(event) {
						if (event.data.type == 'debug') {
							var arr = event.data.message,
								title = arr.shift();
							t.trace('Worker trace - ' + title, arr);
						} else {
							t.trace("Worker response complete", event.data);
						
							file.responseAMF = event.data;
 							Firebug.DOMPanel.DirTable.tag.replace({object: file.responseAMF, toggles: t.toggles}, tabBody);
						}
					};
					worker.onerror = function(error) {
						t.trace("Worker error response: " + error.message, error);
						Flashbug.AMFInfoModule.NetInfoAMF.tagError.replace({message:$FL_STR("flashbug.netInfoAMF.error.parse") + ": " + file.href}, tabBody);
					};
					
					var responseText = file.responseText;
					trace("responseText", responseText);
					worker.postMessage(responseText);
				} else {
					Flashbug.AMFInfoModule.NetInfoAMF.tagError.replace({message:$FL_STR("flashbug.netInfoAMF.error.load") + ": " + file.href}, tabBody);
				}
			} else {
				Firebug.DOMPanel.DirTable.tag.replace({object: file.responseAMF, toggles: this.toggles}, getChildByClass(tabBody, "flashbugAMFResponse"));
			}
		}
	},
	
	isAMF: function(contentType) {
		//trace(contentType + " :: " + AMF_MIME);
		if (!contentType) return false;
		if (contentType.indexOf(AMF_MIME) == 0) return true;
		return false;
	}
});

// ************************************************************************************************

Flashbug.AMFInfoModule.NetInfoAMF = domplate(Firebug.Rep, {
	inspectable: false,
	
	trace:Flashbug.AMFInfoModule.trace,
	
	tagPost:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup flb-amf-group"},
				SPAN($FL_STR("flashbug.netInfoAMF.dataTitle")),
                SPAN({"class": "netHeadersViewSource request", onclick: "$onSave", _rowName: "RequestAMF"},
                    $FL_STR("flashbug.netInfoAMF.save")
                )
			),
			DIV({class: "flashbugAMFRequest"})
		),
	
	tagResponse:
		DIV({"role": "tabpanel"},
			DIV({"class": "netInfoHeadersGroup flb-amf-group"},
				SPAN($FL_STR("flashbug.netInfoAMF.dataTitle")),
                SPAN({"class": "netHeadersViewSource response", onclick: "$onSave", _rowName: "ResponseAMF"},
                    $FL_STR("flashbug.netInfoAMF.save")
                )
			),
			DIV({class: "flashbugAMFResponse"})
		),
	
	tagError:
		DIV({"role": "tabpanel"}, "$message"),
	
	onSave: function(event) {
        var target = event.target;
        var requestAMF = (target.rowName == "RequestAMF");
        var netInfoBox = getAncestorByClass(target, "netInfoBody");
        var file = netInfoBox.repObject;
		var dir = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
		var timestamp = file.startTime || (new Date()).getTime();
		var fileName = String(file.request.URI.host + "-" + timestamp);
		
		if(requestAMF) {
			// Request/Post
			var postText = file.postText;
			postText = postText.replace(/^([^:]+):\s?(.*)[\r|\n]|\r?\n$|[\r\n]$/gm, ""); // Remove headers and one LF
			postText = postText.replace(/[\r\n]/, ""); // Remove extra CRLF
			var file = this.getTargetFile(fileName + "-Post.amf");
			if(file) Flashbug.writeFile(file, postText);
		} else {
			// Response
			var responseText = file.responseText;
			var file = this.getTargetFile(fileName + "-Response.amf");
			if(file) Flashbug.writeFile(file, responseText);
		}
		
        cancelEvent(event);
    },
	
	getTargetFile: function(defaultFileName) {
        var nsIFilePicker = Ci.nsIFilePicker;
        var fp = CCIN("@mozilla.org/filepicker;1", "nsIFilePicker");
        fp.init(window, null, nsIFilePicker.modeSave);
        fp.appendFilter("AMF Files","*.amf");
        fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
        fp.filterIndex = 1;
        fp.defaultString = defaultFileName;
		
        var rv = fp.show();
        if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) return fp.file;
		
        return null;
    }
});

//////////////////////////
// Firebug Registration //
//////////////////////////

if (CCSV("@mozilla.org/preferences-service;1", "nsIPrefBranch2").getBoolPref(Firebug.prefDomain + ".flashbug.amf.enableAMF")) {
	Firebug.registerModule(Flashbug.AMFInfoModule);
}

/////////////////////////////
// Firebug Trace Constants //
/////////////////////////////

FBTrace.DBG_FLASH_AMF = Firebug.getPref(Firebug.prefDomain, "DBG_FLASH_AMF");

// Add flash mime types
try {
Firebug.NetMonitor.Utils.mimeCategoryMap["application/x-amf"] = "flash";
Firebug.NetMonitor.Utils.mimeCategoryMap["application/shockwave-flash"] = "flash";
Firebug.NetMonitor.Utils.mimeCategoryMap["application/x-futuresplash"] = "flash";
Firebug.NetMonitor.Utils.mimeCategoryMap["application/futuresplash"] = "flash";
} catch (e) { }

}});