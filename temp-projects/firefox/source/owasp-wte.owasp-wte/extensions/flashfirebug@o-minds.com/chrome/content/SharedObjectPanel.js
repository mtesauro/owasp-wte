FBL.ns(function() { with (FBL) {
    
Components.utils.import("resource://flashfirebuglibs/prepare.js");

// Constants

var Ci = Components.interfaces;
var Cc = Components.classes;
var Cu = Components.utils;
var panelName = "flashSharedObjects";

var $FL_STR = Flashbug.$FL_STR,
$FL_STRF = Flashbug.$FL_STRF;

// ************************************************************************************************
// Array Helpers

function cloneMap(map) {
    var newMap = [];
    for (var item in map) {
        newMap[item] = map[item];
	}
        
    return newMap;
}

// Helper array for prematurely created contexts
var contexts = new Array();

// Module Implementation
//-----------------------------------------------------------------------------

Flashbug.SharedObjectModule = extend(Firebug.Module, {

	trace:function(msg, obj) {
		if (FBTrace.DBG_FLASH_SOL) FBTrace.sysout('SharedObjectModule - ' + msg, obj);
	},
	ERROR:function(e) {
		if (FBTrace.DBG_FLASH_ERRORS) FBTrace.sysout('SharedObjectModule: ERROR ' + e);
	},
	
	//////////////////////////////////////////////////////////////////////////////////////////////
	// Shared Objects Module                                                                    //
	//////////////////////////////////////////////////////////////////////////////////////////////
	
	/////////////////////////////
	// Firebug Module Override //
	/////////////////////////////
	
	/**
	* Called by Firebug when Firefox window is opened.
	*/
	initialize: function() {
		this.trace("initialize");
		
		var dir = Flashbug.flashPlayerDirectory;
		dir.append("#SharedObjects");
		var entries = dir.directoryEntries;
		var entry;
		while(entries.hasMoreElements()) {
			entry = entries.getNext();
			entry.QueryInterface(Ci.nsIFile);
			if(entry.isDirectory()) break;
		}
		this.dir = entry;
		
		Firebug.NetMonitor.addListener(this);
		Firebug.Module.initialize.apply(this, arguments);
	},
	
	internationalizeUI: function(doc) {
		this.trace("internationalizeUI");
        var elements = ["flbRefresh", "flbDeleteAll", "fbFlashbugDownload", "flbVersion"];
        var attributes = ["label", "tooltiptext", "value"];
		
        Flashbug.internationalizeElements(doc, elements, attributes);
    },
    
    activatePro: function() {
      if (flashfirebugPrepare.isPro) {
        $FQuery("#pro-main", this.getThisPanel().panelNode).remove();
      } else {
        Firebug.FlashModuleConsole.NeedProRep.tag.append({}, this.getThisPanel().panelNode, Firebug.FlashModuleConsole.NeedProRep.tag);
      }
    },
    
    getThisPanel:function(){
    	var panel = Flashbug.getContext().getPanel("flashfirebug", true);
    	if(panel){
    		return panel.getTool(panelName);
    	}
    },
	
	/**
	* Called by Firebug when Firefox window is closed.
	*/
    shutdown: function() {
		this.trace("shutdown");
		Firebug.NetMonitor.removeListener(this);
    },
	
	/*
	* After "onSelectingPanel", a panel has been selected but is not yet visible
	*/
    showPanel: function(browser, panel) {
        var isPanel = panel && (panel.name == "flashfirebug" && panel.currTool == panelName);
        
//        collapse(Firebug.chrome.$("fbFlashbugSOButtons"), !isPanel);
//        collapse(Firebug.chrome.$("fbFlashbugVersion"), !isPanel);
		
		if (isPanel) {
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
	
	/**
	* Called when a new context is created but before the page is loaded.
	*/
	initContext: function(context, persistedState) {
		this.trace("initContext");
		
		var tabId = Firebug.getTabIdForWindow(context.window);
		
		// Create sub-context for solDomains. The solDomains object exists within the context even if the panel is disabled
        context.solDomains = {};
		context.length = 0;
		
		// The temp context isn't created e.g. for empty tabs, chrome pages.
        var tempContext = contexts[tabId];
        if (tempContext) {
            this.destroyTempContext(tempContext, context);
            delete contexts[tabId];
        }
    },
	
	/**
	* Called when a context is destroyed. Module may store info on persistedState for reloaded pages.
	*/
	destroyContext: function(context) {
		this.trace("destroyContext");
		
		for (var p in context.solDomains) {
            delete context.solDomains[p];
		}
		
        delete context.solDomains;
    },
	
	/////////////////////////////
	// Shared Objects Specific //
	/////////////////////////////
	
	dispatchName: $FL_STR('flashbug.solPanel.title'),
	description: $FL_STR("flashbug.solPanel.description"),
	dir: null,
	
	openPath: function(url) {
		this.trace("openPath");
		var f = CCIN("@mozilla.org/file/local;1", "nsILocalFile");
		f.initWithPath(url);
		Flashbug.launchFile(f);
	},

	// Asks the operating system to open the folder which contains this file or folder. 
	// This routine only works on platforms which support the ability to open a folder. 
	revealPath: function(url) {
		this.trace("revealPath");
		var f = CCIN("@mozilla.org/file/local;1", "nsILocalFile");
		f.initWithPath(url);
		
		try {
			f.reveal();
		} catch (ex) {
			// If reveal fails for some reason (e.g., it's not implemented on unix or
			// the file doesn't exist), try using the parent if we have it.
			var parent = QI(f.parent, Ci.nsILocalFile);
			if (!parent) return;
			
			// "Double click" the parent directory to show where the file should be
			this.openPath(parent.path);
		}
	},
	
	destroyTempContext: function(tempContext, context) {
        if (!tempContext) return;
		
		context.solDomains = cloneMap(tempContext.solDomains);

        delete tempContext.solDomains;
    },
	
	onResponse: function(context, file) {
		//this.trace("onResponse");
		this.addDomain(context, file, file.request.URI.asciiSpec);
	},
	
	onCachedResponse: function(context, file) {
		//this.trace("onCachedResponse");
		this.addDomain(context, file, file.request.URI.asciiSpec);
	},
	
	onExamineResponse: function(context, request) {
		//this.trace("onExamineResponse");
		this.addDomain(context, request, request.URI.asciiSpec);
	},
	
	onExamineCachedResponse: function(context, request) {
		//this.trace("onExamineCachedResponse");
		this.addDomain(context, request, request.URI.asciiSpec);
	},
	
	addDomain: function(context, file, href) {
//		this.trace("addDomain", file);
		var request = file.hasOwnProperty('request') ? file.request : file;
		
		try {
			var contentType = request.contentType;
		} catch (e) {
			// Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIHttpChannel.contentType]
			return;
		}
		
		var domain = getPrettyDomain(href);
		var fullDomain = getDomain(href);
		
		// Fix domains with ports
		var portIndex = domain.lastIndexOf(":");
		if (portIndex != -1) domain = domain.slice(0, portIndex);
		
		// Fix localhost
		if (domain == "localhost") domain = "#" + domain;
		
		// For some reason some shared objects aren't saved to the domain, but the basedomain
		// Maybe for old swfs? The example is Flash 6
		// i.e. http://netticat.ath.cx/BetterPrivacy/BetterPrivacy.htm
		var arrDomain = domain.split(".");
		while (arrDomain.length > 2) {
			arrDomain.shift();
		}
		var baseDomain = arrDomain.join(".");
		
		// Get MIME Type
		var mimeType = Firebug.NetMonitor.Utils.getMimeType(safeGetContentType(request), href);
		if (mimeType == null) {
			var ext = getFileExtension(request.name);
			if (ext) {
				var extMimeType = ext.toLowerCase() == 'spl' ? Flashbug.SPL_MIME : ext.toLowerCase() == 'swf' ? Flashbug.SWF_MIME : null;
				if (extMimeType) mimeType = extMimeType;
			}
		}
		
		var tabId = Firebug.getTabIdForWindow(context.window);

		// Create temporary context
		if (!contexts[tabId]) {
			var tempContext = {tabId:tabId, solDomains:{}, length:0 };
			contexts[tabId] = tempContext;
		}

        // Use the temporary context first, if it exists. There could be an old
        // context (associated with this tab) for the previous URL.
        var context2 = contexts[tabId];
        context2 = context2 ? context2 : context;
		
		// For some reason this isn't always available
		if (!context2.hasOwnProperty("solDomains")) {
			context2.solDomains = {};
			context2.length = 0;
		}
		
		// If is a SWF, add domain(s)
		if (mimeType == Flashbug.SWF_MIME || mimeType == Flashbug.SPL_MIME) {
			var hasAdded = false,
				isFirst = (context2.length == 0);
				
			if (!context.solDomains[domain]) {
				context.solDomains[domain] = domain;
				hasAdded = true;
//				this.trace("addDomain: " + context.solDomains[domain]);
			}
			
			if (!context.solDomains[fullDomain]) {
				context.solDomains[fullDomain] = fullDomain;
				hasAdded = true;
//				this.trace("addDomain: " + context.solDomains[fullDomain]);
			}
			
			if (!context.solDomains[baseDomain]) {
				context.solDomains[baseDomain] = baseDomain;
				hasAdded = true;
//				this.trace("addDomain: " + context.solDomains[baseDomain]);
			}
			
			// Refresh the panel asynchronously.
//			if(hasAdded && context instanceof Firebug.TabContext) context.invalidatePanels(panelName);
			if(hasAdded && context instanceof Firebug.TabContext) context.invalidatePanels("flashfirebug"); 
			
			// Refresh the panel asynchronously.
			/*if(hasAdded && context instanceof Firebug.TabContext) {
				if (isFirst) {
					context.invalidatePanels(panelName);
				} else {
					context.getPanel(childPanelName).append(file);
				}
			}*/
		}
	},
	
	refresh: function(context) {
		this.trace("refresh");

		var panel = context.getPanel("flashfirebug", true);
		if(panel){
			//FlashfirebugPanel.getTool();
			var my = panel.getTool(panelName);
			if(my)my.refresh();
		}
	},
	
	deleteAll: function(context) {
		this.trace("deleteAll");
		
		var panel = context.getPanel("flashfirebug", true);
		if(panel){
			var my = panel.getTool(panelName);
			if(my)my.deleteAll();
		}
	}
});

// DOMPlate Implementation
//-----------------------------------------------------------------------------

Flashbug.SharedObjectModule.Rep = domplate(Firebug.Rep, {
	inspectable: false,
	
    getContextMenuItems: function(cookie, target, context) {
        var popup = $("fbContextMenu");
        if (popup.firstChild && popup.firstChild.getAttribute("command") == "cmd_copy") popup.removeChild(popup.firstChild);
    }
});

/**
 * @domplate Represents a template for basic cookie list layout. This
 * template also includes a header and related functionality (such as sorting).
 */
Flashbug.SharedObjectModule.TableRep = domplate(Flashbug.SharedObjectModule.Rep, {
    inspectable: false,

    tag:
        TABLE({class: "netTable", cellpadding: 0, cellspacing: 0, hiddenCols: ""},
            TBODY(
                TR({class: "netHeaderRow netRow", onclick: "$onClickHeader"},
					TD({id: "colBreakBar", "class": "netHeaderCell"},
                        "&nbsp;"
                    ),
                    TD({id: "colName", class: "netHeaderCell alphaValue"},
                        DIV({class: "netHeaderCellBox", title: $FL_STR("flashbug.solPanel.colName.tooltip")}, $FL_STR("flashbug.solPanel.colName.title"))
                    ),
                    TD({id: "colVersion", class: "netHeaderCell alphaValue"},
                        DIV({class: "netHeaderCellBox", title: $FL_STR("flashbug.solPanel.colVersion.tooltip")}, $FL_STR("flashbug.solPanel.colVersion.title"))
                    ),
                    TD({id: "colSize", class: "netHeaderCell"},
                        DIV({class: "netHeaderCellBox", title: $FL_STR("flashbug.solPanel.colSize.tooltip")}, $FL_STR("flashbug.solPanel.colSize.title"))
                    ),
					TD({id: "colSWF", class: "netHeaderCell"},
                        DIV({class: "netHeaderCellBox", title: $FL_STR("flashbug.solPanel.colSWF.tooltip")}, $FL_STR("flashbug.solPanel.colSWF.title"))
                    ),
                    TD({id: "colPath", class: "netHeaderCell alphaValue"},
                        DIV({class: "netHeaderCellBox", title: $FL_STR("flashbug.solPanel.colPath.tooltip")}, $FL_STR("flashbug.solPanel.colPath.title"))
                    )
                ),
				TR({"class": "netRow netSummaryRow"},
					TD({"class": "netCol"}, "&nbsp;"),
					TD({"class": "netCol netHrefCol"},
						DIV({"class": "netCountLabel netSummaryLabel"}, "-")
					),
					TD({"class": "netCol"}),
					TD({"class": "netTotalSizeCol netCol netSizeCol"},
						DIV({"class": "netTotalSizeLabel netSummaryLabel"}, "0KB")
					),
					TD({"class": "netCol"}),
					TD({"class": "netCol"})
				)
            )
        ),

    onClickHeader: function(event) {
        if (!isLeftClick(event)) return;
		if (event.target.id == 'colBreakBar') return;
		
        var table = getAncestorByClass(event.target, "netTable");
        var column = getAncestorByClass(event.target, "netHeaderCell");
        this.sortColumn(table, column);
    },

    sortColumn: function(table, col, direction) {
        if (!col) return;
		
        if (typeof(col) == "string") {
            var doc = table.ownerDocument;
            col = doc.getElementById(col);
        }
		
        if (!col) return;
		
        var numerical = !hasClass(col, "alphaValue");
		
        var colIndex = 0;
        for (col = col.previousSibling; col; col = col.previousSibling) {
            ++colIndex;
		}
		
        this.sort(table, colIndex, numerical, direction);
    },

    sort: function(table, colIndex, numerical, direction) {
        var tbody = table.lastChild;
		var summaryRow = tbody.lastChild;
        var headerRow = tbody.firstChild;
		
        // Remove class from the currently sorted column
        var headerSorted = getChildByClass(headerRow, "netHeaderSorted");
        removeClass(headerSorted, "netHeaderSorted");
		
        // Mark new column as sorted.
        var header = headerRow.childNodes[colIndex];
        setClass(header, "netHeaderSorted");
		
        // If the column is already using required sort direction, bubble out.
        if ((direction == "desc" && header.sorted == 1) || (direction == "asc" && header.sorted == -1)) return;
		
        var values = [];
        for (var row = tbody.childNodes[1]; row; row = row.nextSibling) {
            var cell = row.childNodes[colIndex];
            var value = numerical ? parseFloat(cell.textContent) : cell.textContent;
			
            if (hasClass(row, "opened")) {
                var cookieInfoRow = row.nextSibling;
                values.push({row: row, value: value, info: cookieInfoRow});
                row = cookieInfoRow;
            } else {
                values.push({row: row, value: value});
            }
        }
		
        values.sort(function(a, b) { return a.value < b.value ? -1 : 1; });
		
        if ((header.sorted && header.sorted == 1) || (!header.sorted && direction == "asc")) {
            removeClass(header, "sortedDescending");
            setClass(header, "sortedAscending");
			
            header.sorted = -1;
			
            for (var i = 0; i < values.length; ++i) {
				tbody.insertBefore(values[i].row, summaryRow);
                if (values[i].info) tbody.insertBefore(values[i].info, summaryRow);
            }
        } else {
            removeClass(header, "sortedAscending");
            setClass(header, "sortedDescending");
			
            header.sorted = 1;
			
            for (var i = values.length-1; i >= 0; --i) {
                tbody.insertBefore(values[i].row, summaryRow);
                if (values[i].info) tbody.insertBefore(values[i].info, summaryRow);
            }
        }
		
        // Remember last sorted column & direction in preferences.
        var prefValue = header.getAttribute("id") + " " + (header.sorted > 0 ? "desc" : "asc");
		Firebug.getPref(Firebug.prefDomain, "flashbug.sol.lastSortedColumn", prefValue);
    },

    supportsObject: function(object) {
        return (object == this);
    }
});

/**
 * @domplate Represents a domplate template for cookie entry in the cookie list.
 */
Flashbug.SharedObjectModule.RowRep = domplate(Flashbug.SharedObjectModule.Rep, {
    inspectable: false,
    
    tag:
        FOR("cookie", "$cookies",
            TR({class: "flb-so-row", _repObject: "$cookie", onclick: "$onClickRow"},
				TD({"class": "netDebugCol netCol"},
                   DIV({"class": "sourceLine netRowHeader"}, "&nbsp;")
                ),
                TD({class: "flb-so-name-col flb-so-col netCol"},
                    DIV({class: "flb-so-name-label netLabel"}, "$cookie|getName")
                ),
                TD({class: "flb-so-version-col flb-so-col netCol"},
                    SPAN({class: "flb-so-version-label netLabel"}, "$cookie|getVersion")
                ),
                TD({class: "flb-so-size-col flb-so-col netCol"},
                    DIV({class: "flb-so-size-label netLabel"}, "$cookie|getSize")
                ),
				TD({class: "flb-so-swf-col flb-so-col netCol"},
                    DIV({class: "flb-so-swf-label netLabel"}, "$cookie|getSWF")
                ),
                TD({class: "flb-so-path-col flb-so-col netCol"},
                    DIV({class: "flb-so-path-label netLabel", title: "$cookie|getPath"},
                        SPAN("$cookie|getPath")
                    )
                )
            )
        ),

    bodyRow:
        TR({class: "cookieInfoRow"},
			TD({"class": "netDebugCol netCol"},
			   DIV({"class": "sourceLine netRowHeader"}, "&nbsp;")
			),
            TD({class: "flb-so-info-col", colspan: 5},
				DIV({"class": "netInfoTabs focusRow subFocusRow"},
					A({"class": "netInfoParamsTab netInfoTab", /*onclick: "$onClickTab",*/ selected:'true' },
						'Value'
					)
				),
				DIV({class: "flb-so-info-body"},
					DIV({class: "cookieInfoValueText flb-so-info-text", selected:true})
				)
			)
        ),

	hasProperties: function (ob) {
		try {
			for (var name in ob) {
				return true;
			}
		} catch (exc) {}
		return false;
	},
	
    getName: function(cookie) {
        return cookie.header.fileName;
    },

    getVersion: function(cookie) {
        return "AMF" + cookie.header.amfVersion;
    },

    getSize: function(cookie) {
        return formatSize(cookie.fileSize);
    },
	
	getSWF: function(cookie) {
		var swf = cookie.swf;
		if(swf.indexOf(".swf") == -1) swf = null;
        return swf ? swf : "?";
	},

    getPath: function(cookie) {
        var path = cookie.path;
        return path ? path : "?";
    },
	
	// Firebug rep support
    supportsObject: function(cookie) {
        return (cookie.fullPath && cookie.fileSize && cookie.header && cookie.body);
    },
	
	browseObject: function(cookie, context) {
        return false;
    },

    getRealObject: function(cookie, context) {
        return cookie.body;
    },
	
	onRemove: function(url, context) {
		var file = CCIN("@mozilla.org/file/local;1", "nsILocalFile");
		file.initWithPath(url);
		
		if(file.exists()) {
			try {
				file.remove(false);
			} catch (e) {
				ERROR(e);
			}
		}
		
		Flashbug.SharedObjectModule.refresh(context);
	},
	
	getContextMenuItems: function(data, target, context) {
        var items = [];
		var url = data.fullPath;
		
		// xxxHonza not sure how to do this better if the default Firebug's "Copy"
        // command (cmd_copy) shouldn't be there.
        var popup = $("fbContextMenu");
        if (popup.firstChild && popup.firstChild.getAttribute("command") == "cmd_copy") popup.removeChild(popup.firstChild);
		
		items.push(
			{label: $FL_STR("flashbug.contextMenu.delete"), nol10n: true, command: bindFixed(this.onRemove, this, url, context) },
			"-",
			{label: $FL_STR("flashbug.contextMenu.open"), nol10n: true, command: bindFixed(Flashbug.SharedObjectModule.openPath, this, url) },
			{label: $FL_STR("flashbug.contextMenu.openFolder"), nol10n: true, command: bindFixed(Flashbug.SharedObjectModule.revealPath, this, url) },
			"-",
			{label: $FL_STR("flashbug.contextMenu.copyLocation"), nol10n: true, command: bindFixed(copyToClipboard, FBL, url) }
		);
		
        return items;
    },

    onClickRow: function(event) {
        if (isLeftClick(event)) {
            var row = getAncestorByClass(event.target, "flb-so-row");
            if (row) {
                this.toggleRow(row);
                cancelEvent(event);
            }
        }
    },
	
	toggles: {},

    toggleRow: function(row) {
        var opened = hasClass(row, "opened");
        toggleClass(row, "opened");
        if (hasClass(row, "opened")) {
            var bodyRow = this.bodyRow.insertRows({}, row)[0];
			Firebug.DOMPanel.DirTable.tag.replace({object: row.repObject.body, toggles: this.toggles}, bodyRow.childNodes[1].childNodes[1].childNodes[0]);
        } else {
			row.parentNode.removeChild(row.nextSibling);
        }
    }
});

// Panel Implementation
//-----------------------------------------------------------------------------

function SharedObjectPanel() {}
SharedObjectPanel.prototype = extend(Firebug.ActivablePanel, {
    
	//////////////////////////////////////////////////////////////////////////////////////////////
	// Shared Objects Panel                                                                     //
	//////////////////////////////////////////////////////////////////////////////////////////////
	
	////////////////////////////
	// Firebug Panel Override //
	////////////////////////////
	
	// clicking on contents in the panel will invoke the inline editor, eg the CSS Style panel or HTML panel.
	editable: false,
	parentNode:{},
	
	trace:function(msg, obj) {
		if (FBTrace.DBG_FLASH_SOL) FBTrace.sysout('SharedObjectPanel - ' + msg, obj);
	},
	ERROR:function(e) {
		if (FBTrace.DBG_FLASH_ERRORS) FBTrace.sysout('SharedObjectPanel: ERROR ' + e);
	},
	
	initialize:function(context, doc, node){
		this.trace("initialize");
		
        if (!context.browser)
        {
            if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("attempt to create panel with dud context!");
            return false;
        }

        this.context = context;
        this.document = doc;
        this.panelNode = node;

//        setClass(this.panelNode, "panelNode panelNode-" + this.name);

        // Load persistent content if any.
        var persistedState = Firebug.getPanelState(this);
        if (persistedState)
        {
            this.persistContent = persistedState.persistContent;
            if (this.persistContent && persistedState.panelNode)
                this.loadPersistedContent(persistedState);
        }

        this.initializeNode(this.panelNode);
	},
	
	// Called at the end of module.initialize; addEventListener-s here
	initializeNode: function(panelNode) {
		this.trace("initializeNode", this.panelNode);
		
		this.showVersion();
		this.refresh();
	},
	
	// this is how a panel in one window reappears in another window; lazy called
	reattach: function(doc) {
		this.trace("reattach");
		this.showVersion();
		this.refresh();
//		Firebug.ActivablePanel.reattach.apply(this, arguments);
	},
	
	refresh: function() {
		this.trace("refresh", this.panelNode);
		
		// Do we have access to the context, if so, parse
		if(this.context && this.context.solDomains) {
			this.files = this.getSharedObjectsFiles(this.context);
		} else {
			this.trace("refresh....return!!!!");
			return;
		}
		
		// Create cookie list table.
		Flashbug.SharedObjectModule.TableRep.tag.replace({}, this.panelNode, Flashbug.SharedObjectModule.TableRep);
		this.summaryRow = this.panelNode.getElementsByClassName('netSummaryRow')[0];
		
		// Parse Files
		this.sols = [];
		if(this.files) {
			var t = this;
			for (var i = 0; i < this.files.length; ++i) {
				try {
					var worker = new Worker("chrome://flashbug/content/amf/solWorker.js");
					worker.onmessage = function(event) {
						var idx = event.data.fileID;
						var file = t.files[idx];
						var data = event.data.data;
						t.trace("Worker message file", file);
						t.trace("Worker message data", data);
						data.fileSize = file.fileSize;
						data.fullPath = file.path;
						data.swf = file.parent.leafName;
						data.path = file.path.replace(Flashbug.SharedObjectModule.dir.path, "");
						data.path = data.path.replace(file.leafName, "");
						t.onParseComplete(data);
					};
					worker.onerror = function(error) {
						t.trace("Worker error: " + error.message + "\n");
						throw error;
					};
					
					var input = CCIN("@mozilla.org/network/file-input-stream;1", "nsIFileInputStream");
					input.init(this.files[i], -1, -1, false);
					var contentText = readFromStream(input);
					worker.postMessage({text:contentText, fileID:i});
				} catch (e) {
					ERROR(e);
				}
			}
		}
	},
	
	deleteAll: function() {
		this.trace("deleteAll");
		for (var i = 0; i < this.files.length; ++i) {
			var file = this.files[i];
			if(file.exists()) {
				try {
					file.remove(false);
				} catch (e) {
					ERROR(e);
				}
			}
		}
		
		Flashbug.SharedObjectModule.refresh(this.context);
	},
	
	onParseComplete: function(data) {
		this.trace("onParseComplete", data);
		this.sols.push(data);
		
		// Create cookie list table.
		Flashbug.SharedObjectModule.TableRep.tag.replace({}, this.panelNode, Flashbug.SharedObjectModule.TableRep);
		this.summaryRow = this.panelNode.getElementsByClassName("netSummaryRow")[0];
		
		// Generate HTML list of cookies using domplate.
		var totalSize = 0;
        if (this.sols.length) {
            var header = this.panelNode.getElementsByClassName("netHeaderRow")[0];
            var row = Flashbug.SharedObjectModule.RowRep.tag.insertRows({cookies: this.sols}, header)[0];
            for (var i = 0; i < this.sols.length; ++i) {
                var cookie = this.sols[i];
                cookie.row = row;
				totalSize += cookie.fileSize;
                row.repObject = cookie;
                row = row.nextSibling;
            }
        }
		
		var countLabel = this.panelNode.getElementsByClassName("netCountLabel")[0];
                flashfirebugPrepare.replaceHTML(countLabel, this.sols.length > 0 ? this.sols.length + ' ' + $FL_STR('flashbug.menu.sharedobject') : '-');
		
		var totalSizeLabel = this.panelNode.getElementsByClassName("netTotalSizeLabel")[0];
                flashfirebugPrepare.replaceHTML(totalSizeLabel, formatSize(totalSize));
		
		Firebug.ActivablePanel.refresh.apply(this, arguments);
	},
	
	// persistedPanelState plus non-persisted hide() values
	show: function(state) {
		this.trace("show " + state + " / " + this.panelNode);
		this.showToolbarButtons("fbFlashbugVersion", true);
		//显示SOL tool的工具按钮
		this.showToolbarButtons("fbFlashbugSOButtons", true);
		
		//隐藏右侧子面板
		collapse(Firebug.chrome.$("fbSidePanelDeck"), true);
		collapse(Firebug.chrome.$("fbPanelSplitter"), true);

		// Append CSS
		var doc = this.document;
		if ($("flashbugStyles", doc)) {
			// Don't append the stylesheet twice. 
		} else {
			var styleSheet = createStyleSheet(doc, "chrome://flashbug/skin/flashbug.css");
			styleSheet.setAttribute("id", "flashbugStyles");
			addStyleSheet(doc, styleSheet);
		}
                if (!flashfirebugPrepare.isPro && (!this.proMsgNode || !this.proMsgNode.parentNode)) {
                  this.proMsgNode = Firebug.FlashModuleConsole.NeedProRep.tag.append({}, this.panelNode, Firebug.FlashModuleConsole.NeedProRep.tag);
                }
	},
	
	// store info on state for next show.
	hide: function(state) {
		this.trace("hide");
		this.showToolbarButtons("fbFlashbugVersion", false);
		
		//隐藏SOL tool的工具按钮
		this.showToolbarButtons("fbFlashbugSOButtons", false);
        //隐藏面板内容
//		this.parentNode.removeChild(this.panelNode);
	},
	
	// Called when "Options" clicked. Return array of
    // {label: 'name', nol10n: true,  type: "checkbox", checked: <value>, command:function to set <value>}
	getOptionsMenuItems: function(context) {
		this.trace("getOptionsMenuItems");
		return [
			{
				label: $FL_STR("flashbug.options.pref"),
				nol10n: true,
				type: "button",
				command: function() {
					context.chrome.window.openDialog("chrome://flashbug/content/preferences.xul", "flashbugPreferences", "chrome,titlebar,toolbar,centerscreen,modal");
				}
			}
		];
    },
	
	/////////////////////////////
	// Shared Objects Specific //
	/////////////////////////////
	
	name: panelName,
    title: $FL_STR("flashbug.solPanel.title"),
	files: [],
	sols: [],
	order: 100,
	summaryRow: null,
        proMsgNode:{},
	
	// Gets all shared objects for each domain
	getSharedObjectsFiles: function(context) {
		this.trace("getSharedObjectsFiles");
		var arrFiles = [];
		try {
		for (var key in context.solDomains) {
			var dir2 = CCIN("@mozilla.org/file/local;1", "nsILocalFile");
			dir2.initWithPath(Flashbug.SharedObjectModule.dir.path);
			dir2.append(context.solDomains[key]);
			this.getFiles(arrFiles, dir2);
		}
		} catch(err){
			ERROR(err);
		}
		
		this.trace("getSharedObjectsFiles - Files", arrFiles);
		return arrFiles;
	},
	
	// Recursively runs through all folders searching for files
	getFiles: function(arrFiles, dir) {
//		this.trace("getFiles");
		if(dir.exists()) {
			var entries = dir.directoryEntries;
			while(entries.hasMoreElements()) {
				var entry = entries.getNext();
				entry.QueryInterface(Ci.nsIFile);
				if(entry.isDirectory()) {
					this.getFiles(arrFiles, entry);
				} else if(entry.isFile()) {
					arrFiles.push(entry);
				}
			}
		}
	},
	
	showVersion: function() {
		var version = Flashbug.playerVersion;
		this.trace("showVersion : '" + version + "'");
		
		// If we know for sure they have the debugger, hide link
		if(version.indexOf("Debug") != -1) Firebug.chrome.$("fbFlashbugDownload").style.display = 'none';
		
		Firebug.chrome.$("flbVersion").value = version;
	}
});


//////////////////////////
// Firebug Registration //
//////////////////////////
Firebug.registerRep(
	Flashbug.SharedObjectModule.TableRep,          // Cookie table with list of cookies
	Flashbug.SharedObjectModule.RowRep             // Entry in the cookie table
);

Flashbug.registerToolType(SharedObjectPanel);
Firebug.SOLModule = Flashbug.SharedObjectModule;
Firebug.registerModule(Flashbug.SharedObjectModule);
//Firebug.registerPanel(SharedObjectPanel);

}});