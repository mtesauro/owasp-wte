/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

var foxyproxy, proxyTree, patternSubscriptionsTree, proxySubscriptionsTree,
  logTree, overlay, saveLogCmd, clearLogCmd, noURLsCmd, fpc, patternsIcon;
const CI = Components.interfaces, CC = Components.classes, CU = Components.utils;

CU.import("resource://foxyproxy/subscriptions.jsm");
CU.import("resource://foxyproxy/utils.jsm");

function onLoad() {
  foxyproxy = CC["@leahscape.org/foxyproxy/service;1"].getService().
    wrappedJSObject;
  fpc = CC["@leahscape.org/foxyproxy/common;1"].getService().wrappedJSObject;
  document.getElementById("maxSize").value = foxyproxy.logg.maxSize;
  overlay = fpc.getMostRecentWindow().foxyproxy;
  proxyTree = document.getElementById("proxyTree");
  patternSubscriptionsTree = document.
    getElementById("patternSubscriptionsTree");
  proxySubscriptionsTree = document.getElementById("proxySubscriptionsTree");
  logTree = document.getElementById("logTree");
  saveLogCmd = document.getElementById("saveLogCmd");
  clearLogCmd = document.getElementById("clearLogCmd");
  noURLsCmd = document.getElementById("noURLsCmd");
  _initSettings();
  var obs = CC["@mozilla.org/observer-service;1"].
    getService(CI.nsIObserverService);
  obs.addObserver(observer,"foxyproxy-mode-change", false);
  obs.addObserver(observer,"foxyproxy-proxy-change", false);
  obs.addObserver(observer,"foxyproxy-tree-update", false);
  sizeToContent();
  let svgDoc = document.getElementById("patterns-svg");
  patternsIcon = svgDoc.getElementsByTagName("rect");
  createPatternsIcon();
}

function onOK() {
  var obs = CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService);
  obs.removeObserver(observer, "foxyproxy-mode-change");
  obs.removeObserver(observer, "foxyproxy-proxy-change");
  obs.removeObserver(observer, "foxyproxy-tree-update");
}

var observer = {
  observe : function(subj, topic, str) {
    var e;
    try {
      e = subj.QueryInterface(CI.nsISupportsPRBool).data;
    }
    catch(ex) {}
    switch (topic) {
      case "foxyproxy-proxy-change": /* deliberate fall-through */
      case "foxyproxy-mode-change":
        _updateView(e);
        break;
      case "foxyproxy-tree-update":
        patternSubscriptionsTree.view = patternSubscriptions.
          makeSubscriptionsTreeView();
        // We need to call that function in order to be sure we get the actual
        // selection state after the tree got redrawn.
        onSubTreeSelected('pattern');
        proxySubscriptionsTree.view = proxySubscriptions.
          makeSubscriptionsTreeView();
        onSubTreeSelected('proxy');
        break;
     }
   }
}

function _initSettings() {
  _updateView(false, true);
  updateSettingsInfo();
  document.getElementById("tabs").selectedIndex = foxyproxy.selectedTabIndex;
  document.getElementById("statusbarWidth").value = foxyproxy.statusbar.width;
  toggleStatusBarText(foxyproxy.statusbar.textEnabled);
}

function updateSettingsInfo() {
  document.getElementById("settingsURL").value = foxyproxy.getSettingsURI("uri-string");
  document.getElementById("notDefaultSettingsBroadcaster").hidden = foxyproxy.usingDefaultSettingsURI();
  sizeToContent(); // because .hidden above can change the size of controls
}

function sortlog(columnId) {
	// determine how the log is currently sorted (ascending/decending) and by which column (sortResource)
	var order = logTree.getAttribute("sortDirection") == "ascending" ? 1 : -1;
	// if the column is passed and it's already sorted by that column, reverse sort
	if (columnId) {
		if (logTree.getAttribute("sortResource") == columnId) {
			order *= -1;
		}
	} else {
		columnId = logTree.getAttribute("sortResource");
	}
  // prepares an object for easy comparison against another. for strings, lowercases them
  function prepareForComparison(o) {
    if (typeof o == "string") {
      return o.toLowerCase();
    }
    return o;
  }

	function columnSort(a, b) {
		if (prepareForComparison(a[columnId]) > prepareForComparison(b[columnId])) return 1 * order;
		if (prepareForComparison(a[columnId]) < prepareForComparison(b[columnId])) return -1 * order;
		//tie breaker: timestamp ascending is the second level sort
		if (columnId != "timestamp") {
			if (prepareForComparison(a["timestamp"]) > prepareForComparison(b["timestamp"])) return 1;
			if (prepareForComparison(a["timestamp"]) < prepareForComparison(b["timestamp"])) return -1;
		}
		return 0;
	}
	foxyproxy.logg._elements.sort(columnSort);

	// setting these will make the sort option persist
	logTree.setAttribute("sortDirection", order == 1 ? "ascending" : "descending");
	logTree.setAttribute("sortResource", columnId);

	// set the appropriate attributes to show to indicator
	var cols = logTree.getElementsByTagName("treecol");
	for (var i = 0; i < cols.length; i++) {
		cols[i].removeAttribute("sortDirection");
	}
	document.getElementById(columnId).setAttribute("sortDirection", order == 1 ? "ascending" : "descending");

	_updateLogView(false);
}

function _updateLogView(keepSelection) {
	saveLogCmd.setAttribute("disabled", foxyproxy.logg.length == 0);
	clearLogCmd.setAttribute("disabled", foxyproxy.logg.length == 0);
  noURLsCmd.setAttribute("checked", foxyproxy.logg.noURLs);
  var selectedIndices;

  if (keepSelection) selectedIndices = utils.getSelectedIndices(logTree);

  // Save scroll position so we can restore it after making the new view
  let visibleRow = logTree.treeBoxObject.getFirstVisibleRow();

  logTree.view = {
    rowCount : foxyproxy.logg.length,
    getCellText : function(row, column) {
      var mp = foxyproxy.logg.item(row);
      if (!mp) return;
      if (column.id == "timestamp") return foxyproxy.logg.format(mp.timestamp);
      return mp[column.id] ? mp[column.id] : null;
    },
    isSeparator: function(aIndex) { return false; },
    isSorted: function() { return false; },
    isEditable: function(row, col) { return false; },
    isContainer: function(aIndex) { return false; },
    setTree: function(aTree){},
    getImageSrc: function(aRow, aColumn) {return null;},
    getProgressMode: function(aRow, aColumn) {},
    getCellValue: function(row, col) {},
    cycleHeader: function(aColId, aElt) {},
    getRowProperties: function(row, col, props) {
      /*if (foxyproxy.logg.item(row) && foxyproxy.logg.item(row).matchPattern == NA) {      
	  	  var a = Components.classes["@mozilla.org/atom-service;1"].
		      getService(Components.interfaces.nsIAtomService);
		    col.AppendElement(a.getAtom("grey"));
	    }*/
    },
    getColumnProperties: function(aColumn, aColumnElement, props) {},
    getCellProperties: function(row, col, props) {
      if (col.id == "colorCol") {
        var i = foxyproxy.logg.item(row);
        // Starting with 22.0a1 there is no |props| available anymore. See:
        // https://bugzilla.mozilla.org/show_bug.cgi?id=407956. Looking at the
        // patch the following seems to work, though.
        if (!props) {
          let newProps = "";
          newProps += i.colorString;
          return newProps;
        }
        var atom = CC["@mozilla.org/atom-service;1"].getService(CI.
          nsIAtomService).getAtom(i.colorString);
        props.AppendElement(atom);
      }
    },
    getLevel: function(row){ return 0; }
  };

  if (keepSelection) {
    // Restore any previous selections
    for (var i = 0, sz=selectedIndices.length; i<sz; i++)
      logTree.view.selection.rangedSelect(selectedIndices[i], selectedIndices[i], true);
  }

  // Restore scroll position - peng likes to complain that this feature was
  // missing.
  logTree.treeBoxObject.scrollToRow(visibleRow);
  updateLogButtons();
}

function _updateModeMenu() {
  var menu = document.getElementById("modeMenu");
  var popup=menu.firstChild;
  fpc.removeChildren(popup);

  if (!foxyproxy.isFoxyProxySimple())
    popup.appendChild(fpc.createMenuItem({idVal:"patterns",
     labelId:"mode.patterns.label", labelArgs:"", name:"", document:document,
     class:"orange"}));

  for (var i=0,p; i<foxyproxy.proxies.length &&
       ((p=foxyproxy.proxies.item(i)) || 1); i++)
    popup.appendChild(fpc.createMenuItem({idVal:p.id, labelId:
      "mode.custom.label", labelArgs:[p.name], name:"foxyproxy-enabled-type",
      document:document, style:"color: " + p.color}));
    //popup.appendChild(fpc.createMenuItem({idVal["random",
    //labelId:"mode.random.label", document:document}));
  popup.appendChild(fpc.createMenuItem({idVal:"disabled", labelId:
    "mode.disabled.label", labelArgs:"", name:"", document:document,
    class:"red"}));
  menu.value = foxyproxy.mode;
  if (foxyproxy.mode != "patterns" && foxyproxy.mode != "disabled" &&
      foxyproxy.mode != "random") {
    // subtract 1 because first element, patterns, is not in the proxies array
    // for FoxyProxy Simple. FP Simple has no "patterns" mode.
    var selIdx = foxyproxy.isFoxyProxySimple() ? menu.selectedIndex :
      menu.selectedIndex-1;
    if (!foxyproxy.proxies.item(selIdx).enabled) {
      // User disabled or deleted the proxy; select default setting.
      foxyproxy.setMode("disabled", true);
      menu.value = "disabled";
    }
  }
  // Set color of selected menu item.
  switch (foxyproxy.mode) {
    case "patterns":
      menu.setAttribute("style", "color:orange");
      break;
    case "disabled":
      menu.setAttribute("style", "color:red");
      break;
    case "random":
      break; // not yet supported
    case "roundrobin":
      break; // not yet supported
    default:
      menu.setAttribute("style", "color:" + foxyproxy._selectedProxy.color);
      break;
  }
}

function onSettingsURLBtn() {
  const nsIFilePicker = CI.nsIFilePicker;
  var fp = CC["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  fp.init(window, foxyproxy.getMessage("file.select"), nsIFilePicker.modeSave);
  fp.defaultString = "foxyproxy.xml";
  fp.appendFilters(nsIFilePicker.filterAll|nsIFilePicker.filterXML);
  // nsIFilePicker.displayDirectory requires a directory WITHOUT a filename
  // appended. Hence we use .parent here and in the following lines of code.
  fp.displayDirectory = foxyproxy.getSettingsURI(CI.nsIFile).parent;
  if (fp.show() != nsIFilePicker.returnCancel) {
    var defPath = foxyproxy.getDefaultPath();
    // If the current settings file is in the default path and the user wants to move it, warn him.
    if (fp.displayDirectory.equals(defPath.parent) && !defPath.parent.
        equals(fp.file.parent)) {
      var c = overlay.ask(this, foxyproxy.getMessage("settings.warning"), null, null, foxyproxy.getMessage("more.info"));
      switch (c) {
        case 1:
          // "no" clicked
          return;
        case 2:
          // "more info" clicked
          fpc.openAndReuseOneTabPerURL("http://getfoxyproxy.org/settings.html");
          return;
      }
    }
    foxyproxy.setSettingsURI(fp.file);
    // We write the subscriptions as well to the new place (if there are any).
    // We do not do this in the general writeSubscriptions method in
    // foxyproxy.js as this would only imply unnecessary disk I/O (the
    // subscriptions would then always be written, even if any tiny and
    // unrelated setting was changed).
    if (patternSubscriptions.subscriptionsList.length > 0) {
      patternSubscriptions.writeSubscriptions();
    }
    if (proxySubscriptions.subscriptionsList.length > 0) {
      proxySubscriptions.writeSubscriptions();
    }
    _initSettings();
  }
}

function onResetSettingsURL() {
  foxyproxy.setSettingsURI(foxyproxy.getDefaultPath());
  // Writing the current subscriptions back to the default path as well.
  if (patternSubscriptions.subscriptionsList.length > 0) {
    patternSubscriptions.writeSubscriptions();
  }
  if (proxySubscriptions.subscriptionsList.length > 0) {
    proxySubscriptions.writeSubscriptions();
  }
  updateSettingsInfo();
  overlay.alert(this, foxyproxy.getMessage("settings.default2"));
}

/* Contains items which can be updated via toolbar/statusbar/menubar/context-menu as well as the options dialog,
so we don't include these in onLoad() or init() */
function _updateView(writeSettings, updateLogView) {
  document.getElementById("enableLogging").checked = foxyproxy.logging;
  //document.getElementById("randomIncludeDirect").checked = foxyproxy.random.includeDirect;
  //document.getElementById("randomIncludeDisabled").checked = foxyproxy.random.includeDisabled;

  function _updateSuperAdd(saObj, str) {
    var temp = saObj.enabled;
    document.getElementById(str + "Enabled").checked = temp;
    document.getElementById(str + "Broadcaster").hidden = !temp;
    document.getElementById(str + "Reload").checked = saObj.reload;
    document.getElementById(str + "Notify").checked = saObj.notify;
    document.getElementById(str + "Prompt").checked = saObj.prompt;
  }

  _updateSuperAdd(foxyproxy.autoadd, "autoAdd");
  _updateSuperAdd(foxyproxy.quickadd, "quickAdd");
  document.getElementById("quickAddNotifyWhenCanceled").checked = foxyproxy.quickadd.notifyWhenCanceled; // only exists for QuickAdd
  document.getElementById("toolbarEnabled").checked = foxyproxy.toolbarIcon;
  document.getElementById("toolsMenuEnabled").checked = foxyproxy.toolsMenu;
  document.getElementById("contextMenuEnabled").checked = foxyproxy.contextMenu;
  document.getElementById("statusbarIconEnabled").checked = foxyproxy.statusbar.iconEnabled;
  document.getElementById("statusbarTextEnabled").checked = foxyproxy.statusbar.textEnabled;
  document.getElementById("advancedMenusEnabled").checked = foxyproxy.advancedMenus;

  document.getElementById("sbLeftClickMenu").value = foxyproxy.statusbar.leftClick;
  document.getElementById("sbMiddleClickMenu").value = foxyproxy.statusbar.middleClick;
  document.getElementById("sbRightClickMenu").value = foxyproxy.statusbar.rightClick;

  document.getElementById("tbLeftClickMenu").value = foxyproxy.toolbar.leftClick;
  document.getElementById("tbMiddleClickMenu").value = foxyproxy.toolbar.middleClick;
  document.getElementById("tbRightClickMenu").value = foxyproxy.toolbar.rightClick;

	_updateModeMenu();

  var menu = document.getElementById("autoAddProxyMenu");
  foxyproxy.autoadd.updateProxyMenu(menu, document);
  if (!menu.firstChild.firstChild) {
    document.getElementById("autoAddEnabled").checked = false;
    onAutoAddEnabled(false);
  }

  menu = document.getElementById("quickAddProxyMenu");
  foxyproxy.quickadd.updateProxyMenu(menu, document);
  if (!menu.firstChild.firstChild) {
    document.getElementById("quickAddEnabled").checked = false;
    onQuickAddEnabled(false);
  }

  fpc.makeProxyTreeView(proxyTree, foxyproxy.proxies, document);
  patternSubscriptionsTree.view = patternSubscriptions.
    makeSubscriptionsTreeView();
  proxySubscriptionsTree.view = proxySubscriptions.
    makeSubscriptionsTreeView();

  if (writeSettings)
    foxyproxy.writeSettingsAsync();
  setButtons();
  if (updateLogView)
    _updateLogView(true);
}

function onModeChanged(menu) {
  foxyproxy.setMode(menu.selectedItem.id, true);
  _updateView();
}

function onDeleteSelection() {
  if (_isDefaultProxySelected())
    overlay.alert(this, foxyproxy.getMessage("delete.proxy.default"));
  else if (foxyproxy.warnings.showWarningIfDesired(window,
           ["delete.proxy.confirm"], "confirmDeleteProxy", true)) {
    // Store cur selections
    let sel = utils.getSelectedIndices(proxyTree);
    // We have to delete the proxy from the subscription as well. Otherwise
    // there occur errors later on while loading/removing the subscription as
    // the proxy is still saved in the subscription but not found anymore. We
    // do this before we delete the proxy itself in order to get the necessary
    // information (i.e. its id).
    // Delete in reverse order so we don't mess up the index as we delete
    // multiple items.
    for (let i=sel.length-1; i>=0; i--) {
      if (patternSubscriptions.subscriptionsList.length > 0) {
        let proxyId = foxyproxy.proxies.item(sel[i]).id;
        patternSubscriptions.removeDeletedProxies(proxyId);
      }
      foxyproxy.proxies.remove(sel[i]);
    }
    utils.broadcast(true /*write settings*/, "foxyproxy-proxy-change");
    // If only one item was deleted, select its neighbor as convenience.
    // We don't bother with this when multiple items were selected.
    if (sel.length == 1)
      proxyTree.view.selection.select(sel[0]);
  }
}

function onCopySelection() {
  if (_isDefaultProxySelected())
    overlay.alert(this, foxyproxy.getMessage("copy.proxy.default"));
  else {
	  // Store cur selection so we can restore it
    var sel = proxyTree.currentIndex,
      orig = foxyproxy.proxies.item(proxyTree.currentIndex),
      dom = orig.toDOM(document, true),
      p = CC["@leahscape.org/foxyproxy/proxy;1"].createInstance().wrappedJSObject;
	  p.fromDOM(dom, true);
	  p.id = foxyproxy.proxies.uniqueRandom(); // give it its own id 
	  foxyproxy.proxies.push(p);
	  utils.broadcast(true /*write settings*/, "foxyproxy-proxy-change");
	  // Reselect what was previously selected
		proxyTree.view.selection.select(sel);
	}
}

/** Similar to onMode() */
function useSelectedForAllURLs() {
  var p = foxyproxy.proxies.item(proxyTree.currentIndex);
  foxyproxy.setMode(p.id, true);
  _updateView();
}

function onMove(direction) {
  // Store current selections
  let sel = utils.getSelectedIndices(proxyTree);

  if (direction=="up") {
    for (let i=0; i<sel.length; i++)
      foxyproxy.proxies.move(sel[i], direction);
  } else {
    for (let i=sel.length-1; i>=0; i--)
      foxyproxy.proxies.move(sel[i], direction);
  }

  _updateView(true);
  // Clear selections then reselect the moved items
  proxyTree.view.selection.clearSelection();
  for (let i=0; i<sel.length; i++) {
    let tmp = sel[i] + (direction=="up"?-1:1);
    proxyTree.view.selection.rangedSelect(tmp, tmp, true);
  }
}

function onSettings(isNew) {
  let sel = proxyTree.currentIndex,
    selSub = patternSubscriptionsTree.currentIndex,
    params = {inn:{proxy:isNew ? CC["@leahscape.org/foxyproxy/proxy;1"].
      createInstance().wrappedJSObject :
      foxyproxy.proxies.item(proxyTree.currentIndex)}, out:null};

  window.openDialog("chrome://foxyproxy/content/addeditproxy.xul", "",
    "chrome, dialog, modal, resizable=yes", params).focus();
  if (params.out) {
    if (isNew) foxyproxy.proxies.push(params.out.proxy);
    utils.displayPatternCookieWarning(foxyproxy.mode, foxyproxy);
    utils.broadcast(true /*write settings*/, "foxyproxy-proxy-change");
    // Reselect what was previously selected or the new item
    proxyTree.view.selection.select(isNew?proxyTree.view.rowCount-2:sel);
    // We need to include this call here as well as the selection is not
    // clearly visible anymore in the pattern subscription tree without it.
    // But only redraw the tree if we have one item selected. Otherwise enabling
    // just "Add New Pattern Subscription" if we have not selected a
    // subscription does not work properly.
    if (selSub > -1) {
      patternSubscriptionsTree.view.selection.select(selSub);
    }
  }
}

function setButtons() {
  let selItems = utils.getSelectedIndices(proxyTree),
    numSelected = selItems.length,
    isDefaultSelected = _isDefaultProxySelected();

  // If none selected, default proxy selected, or top-most proxy selected
  // (idx 0), disable moveUpCmd
  document.getElementById("moveUpCmd").setAttribute("disabled",
    numSelected == 0 || isDefaultSelected || selItems.indexOf(0) > -1);

  // If none selected, default proxy selected, bottom-most, or 2nd-bottom-most
  // proxy selected (it can't take priority over Default Proxy), disable
  // moveDownCmd
  document.getElementById("moveDownCmd").setAttribute("disabled",
    numSelected == 0 || isDefaultSelected ||
    selItems.indexOf(foxyproxy.proxies.length-1) > -1 ||
    selItems.indexOf(foxyproxy.proxies.length-2) > -1);

  // If none selected or default selected, disable delete
  document.getElementById("deleteSelectionCmd").setAttribute("disabled",
    numSelected == 0 || isDefaultSelected);

  // If multiple selected or non selected, disable edit
  document.getElementById("settingsCmd").setAttribute("disabled",
    numSelected > 1 || numSelected == 0);

  // If multiple selected or non selected or default selected, disable copy
  document.getElementById("copySelectionCmd").setAttribute("disabled",
    numSelected > 1 || numSelected == 0 || isDefaultSelected);
}

function getSelectedSubscription(type) {
  let selectedSubscription;
  if (type === "pattern") {
    selectedSubscription = patternSubscriptions.
      subscriptionsList[patternSubscriptionsTree.currentIndex];
  } else {
    selectedSubscription = proxySubscriptions.
      subscriptionsList[proxySubscriptionsTree.currentIndex];
  }
  return selectedSubscription;
}

function addSubscription(type) {
  let params = {
        inn : null,
        out : null
      };
  if (type === "pattern") {
  window.openDialog('chrome://foxyproxy/content/subscriptions/addEditPatternSubscription.xul',
    '', 'modal, resizable=yes', params).focus();
  } else {
    window.openDialog('chrome://foxyproxy/content/subscriptions/addEditProxySubscription.xul',
    '', 'modal, resizable=yes', params).focus();
  }
}

// We need this extra step here. Otherwise the user may click on the empty tree
// and the "edit-version" of the subscription dialog (Last Status and Refresh
// not being disabled) would be opened.
function onDblClickSubscriptionsTree(type) {
  if (type === "pattern" && patternSubscriptionsTree.currentIndex > -1) {
    editSubscription("pattern");
  } else if (type === "proxy" && proxySubscriptionsTree.currentIndex > -1 ) {
    editSubscription("proxy");
  }
}

function editSubscription(type) {
  let selectedSubscription = getSelectedSubscription(type);
  let params = {
        inn : {
          subscription : selectedSubscription,
          index : type === "pattern" ? patternSubscriptionsTree.currentIndex :
            proxySubscriptionsTree.currentIndex
        }
      };
  if (type === "pattern") {
    window.openDialog('chrome://foxyproxy/content/subscriptions/addEditPatternSubscription.xul',
    '', 'modal, resizable=yes', params).focus();
  } else {
     window.openDialog('chrome://foxyproxy/content/subscriptions/addEditProxySubscription.xul',
    '', 'modal, resizable=yes', params).focus();
  }
  if (params.out) {
    if (type === "pattern") {
      patternSubscriptions.editSubscription(selectedSubscription, params.
        out.userValues, patternSubscriptionsTree.currentIndex);
      // If new proxies were added we should add the patterns to them as
      // well but only to them!
      let proxyList = params.out.proxies;
      if (proxyList.length !== 0) {
        patternSubscriptions.addPatterns(selectedSubscription, proxyList, null);
      }
      patternSubscriptionsTree.view = patternSubscriptions.
        makeSubscriptionsTreeView();
    } else {
      proxySubscriptions.editSubscription(selectedSubscription, params.
        out.userValues, proxySubscriptionsTree.currentIndex);
      proxySubscriptionsTree.view = proxySubscriptions.
        makeSubscriptionsTreeView();
    }
  }
}

function deleteSubscriptions(type) {
  let subscriptions;
  let subscriptionsTree;
  if (type === "pattern") {
    subscriptions = patternSubscriptions;
    subscriptionsTree = patternSubscriptionsTree;
  } else {
    subscriptions = proxySubscriptions;
    subscriptionsTree = proxySubscriptionsTree;
  }
  // We save the current index to select the proper row after the
  // subscription got deleted.
  let selIndex = subscriptionsTree.currentIndex;
  // Currently, we have seltype=single that's why "selectedSubscription" is
  // in singular but it is planned to allow the user to delete more than one
  // subscription at once. That's why "deletePatternSubscriptions" is in
  // plural. The same reasoning holds for the two following functions.
  let selectedSubscription = getSelectedSubscription(type);
  if (foxyproxy.warnings.showWarningIfDesired(window,
      [type + "subscription.del.subscription"], type + "SubDelete", true)) {
    if (selectedSubscription.timer) {
      selectedSubscription.timer.cancel();
    }
    if (type === "pattern") {
      // Deleting the patterns as well if we have proxies following them...
      let selSubProxies = selectedSubscription.metadata.proxies;
      if (selSubProxies.length > 0) {
        selSubProxies = foxyproxy.proxies.getProxiesFromId(selSubProxies);
        subscriptions.deletePatterns(selSubProxies, selectedSubscription.
          metadata.enabled);
      }
    } else {
      // TODO: What about pattern subscriptions attached to it?
      subscriptions.deleteProxies(foxyproxy.proxies);
      utils.broadcast(true, "foxyproxy-proxy-change");
    }
    subscriptions.subscriptionsList.splice(selIndex, 1);
    subscriptions.writeSubscriptions();
    subscriptionsTree.view = subscriptions.makeSubscriptionsTreeView();
    // Deleting the subscription file if it is empty in order to avoid errors
    // during startup.
    if (subscriptions.subscriptionsList.length === 0) {
      dump("Deleting the " + type + " subscriptions file...\n");
      subscriptions.getSubscriptionsFile().remove(false);
      // We need that here otherwise all options in the context menu are still
      // selected even if no subscription exists anymore.
      document.getElementById(type + "subtree-row-selected").
        setAttribute("disabled", true);
      // The item on our action list is not automatically reset to "Add New
      // Subscription". Thus, we do it "manually".
      document.getElementById(type + "ActionList").selectedIndex = 0;
    } else {
      // Easy as we currently have seltype=single
      if (selIndex === subscriptionsTree.view.rowCount) {
        selIndex = selIndex - 1;
      }
      subscriptionsTree.view.selection.select(selIndex);
    }
  }
}

function refreshSubscriptions(type) {
  if (type === "pattern") {
    patternSubscriptions.refreshSubscription(patternSubscriptions.
      subscriptionsList[patternSubscriptionsTree.currentIndex], true);
  } else {
    proxySubscriptions.refreshSubscription(proxySubscriptions.
      subscriptionsList[proxySubscriptionsTree.currentIndex], true);
  }
}

function viewSubscriptions(type) {
  let selectedSubscription = getSelectedSubscription(type);
  let params;
  if (type === "pattern") {
    params = {
      inn : {
        patterns : selectedSubscription.patterns
      }
    };
    window.openDialog('chrome://foxyproxy/content/subscriptions/patternsView.xul',
    '', 'modal, resizable=yes', params).focus();
  } else {
    params = {
      inn : {
        proxies : selectedSubscription.proxies
      }
    };
    window.openDialog('chrome://foxyproxy/content/subscriptions/proxiesView.xul',
    '', 'modal, resizable=yes', params).focus();
  }
}

function onSubscriptionsAction(type) {
  try {
    switch (document.getElementById(type + "ActionList").selectedIndex) {
      case 0:
        addSubscription(type);
        break;
      case 1:
        editSubscription(type);
        break;
      case 2:
        deleteSubscriptions(type);
        break;
      case 3:
        refreshSubscriptions(type);
        break;
      case 4:
        viewSubscriptions(type);
        break;
    }
  } catch (e) {
    dump("There went something wrong in the " + type + " tree selection: " + e);
  }
}

function openSubscriptionsURL(type) {
  let path = "subscriptions/";
  if (type === "proxy") {
    path = path + "proxies/";
  } else if (type === "pattern") {
    path = path + "patterns/"
  }
  fpc.openAndReuseOneTabPerURL("http://getfoxyproxy.org/" + path +
    "share.html");
}

function onMaxSize() {
	var v = document.getElementById("maxSize").value;
	var passed = true;
	if (/\D/.test(v)) {
		foxyproxy.alert(this, foxyproxy.getMessage("torwiz.nan"));
		passed = false;
	}
	v > 9999 &&
		!overlay.ask(this, foxyproxy.getMessage("logg.maxsize.maximum")) &&
		(passed = false);
	if (!passed) {
		document.getElementById("maxSize").value = foxyproxy.logg.maxSize;
		return;
	}
	if (overlay.ask(this, foxyproxy.getMessage("logg.maxsize.change"))) {
		foxyproxy.logg.maxSize = v;
		_updateView(false, true);
	}
	else
		document.getElementById("maxSize").value = foxyproxy.logg.maxSize;
}
/*
function onIncludeDirectInRandom() {
  // TODO: ERROR CHECKING
	overlay.alert(this, foxyproxy.getMessage('random.applicable'));
	foxyproxy.random.includeDirect = this.checked;
}

function onIncludeDisabledInRandom() {
  // TODO: ERROR CHECKING
	overlay.alert(this, foxyproxy.getMessage('random.applicable'));
	foxyproxy.random.includeDisabled = this.checked;
}*/

function saveLog() {
	const nsIFilePicker = CI.nsIFilePicker;
	var fp = CC["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(this, foxyproxy.getMessage("log.save"), nsIFilePicker.modeSave);
	fp.defaultExtension = "html";
	fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);
	if (fp.show() == nsIFilePicker.returnCancel)
	  return;

	var os = CC["@mozilla.org/intl/converter-output-stream;1"].createInstance(CI.nsIConverterOutputStream);
	var fos = CC["@mozilla.org/network/file-output-stream;1"].createInstance(CI.nsIFileOutputStream); // create the output stream
        // -1 leads to 0664 (the latter is deprecated, though)
	fos.init(fp.file, 0x02 | 0x08 | 0x20 /*write | create | truncate*/, -1, 0);
	os.init(fos, "UTF-8", 0, 0x0000);
	os.writeString(foxyproxy.logg.toHTML());
	os.close();
	if (overlay.ask(this, foxyproxy.getMessage("log.saved2", [fp.file.path]))) {
		var win = fpc.getMostRecentWindow();
		win.gBrowser.selectedTab = win.gBrowser.addTab(fp.file.path);
  }
}

function importSettings() {
  var picker = importExportPrompt(false);
  if (!picker) return;

  var f1 = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile),
    f2 = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile),
    settingsFile = foxyproxy.getSettingsURI(CI.nsIFile);

  try {
    // Set f2 to user-selected directory (excluding filename)
    f2.initWithPath(picker.file.path.substring(0, picker.file.path.indexOf(picker.file.leafName)));
    f1.initWithFile(settingsFile);
    if (!foxyproxy.parseValidateSettings(picker.file)) {
      // Invalid file
      overlay.alert(this, foxyproxy.getMessage("import.error", [picker.file.path]));
      return;
    }
    // Are you sure? You'll overwrite current settings.
    if (!overlay.ask(this, foxyproxy.getMessage("import.warning")))
      return;

    if (settingsFile.exists()) // should always be true
      settingsFile.remove(false);

    f1.initWithPath(settingsFile.path.substring(0, settingsFile.path.indexOf(settingsFile.leafName)));
    picker.file.copyTo(f1, settingsFile.leafName);

    if (overlay.ask(this, foxyproxy.
      getMessage("import.success", [picker.file.path]))) {
      // We have to handle the import and export of pattern subscriptions a bit 
      // differently here as they are in JSON and not in XML. See as well the 
      // comment in exportSettings(). "True" and "false" as arguments means that
      // we have an import (probably of pattern subscriptions as well) and they 
      // should be removed from the normal FoxyProxy settings file afterwards.
      patternSubscriptions.handleImportExport("pattern", true, false);
      proxySubscriptions.handleImportExport("proxy", true, false);
      foxyproxy.restart();
    }
  }
  catch (e) {
    dump(e + "\n");
    overlay.alert(this, foxyproxy.getMessage("copy.error", [picker.file.path, f1.path]));
    return;
  }
}

function importExportPrompt(isExport) {
  var nsIFilePicker = CI.nsIFilePicker,
  picker = CC["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  picker.init(window, foxyproxy.getMessage(isExport ? "export.settings":"import.settings"),
    isExport ? nsIFilePicker.modeSave : nsIFilePicker.modeOpen);
  picker.defaultExtension = "xml";
  picker.appendFilters(nsIFilePicker.filterAll);
  return picker.show() == nsIFilePicker.returnCancel ? null : picker;
}

function exportSettings() {
  var picker = importExportPrompt(true);
  if (!picker) return;
  // We have the subscriptions and the other FoxyProxy settings in differernt
  // files in order to reduce the necessary disk I/O while running FoxyProxy.
  // But we need the subscriptions as well if a user wants to export her
  // settings. Therefore, handleImportExport() prepares the settings file before
  // exporting (i.e. the pattern subscriptions are added) if "false" and "true"
  // are passed as parameters. We use "false" and "false" as parameters in order
  // to remove the subscriptions from the settings file again after it got
  // exported in order not to clutter it unnecessarily.
  if (patternSubscriptions.subscriptionsList.length > 0) {
    patternSubscriptions.handleImportExport("pattern", false, true);
  }
  if (proxySubscriptions.subscriptionsList.length > 0) {
    proxySubscriptions.handleImportExport("proxy", false, true);
  }
  var f2 = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile),
    settingsFile = foxyproxy.getSettingsURI(CI.nsIFile);

  try {
    // Set f2 to user-selected directory (excluding filename)
    f2.initWithPath(picker.file.path.substring(0, picker.file.path.indexOf(picker.file.leafName)));
    if (picker.file.exists()) // Delete if the file already exists
      picker.file.remove(false);
    settingsFile.copyTo(f2, picker.file.leafName);
    overlay.alert(this, foxyproxy.getMessage("export.success", [picker.file.path]));
  }
  catch (e) {
    dump(e + "\n");
    overlay.alert(this, foxyproxy.getMessage("copy.error", [settingsFile.path, picker.file.path]));
    return;
  }
  finally {
    if (patternSubscriptions.subscriptionsList.length > 0) {
      patternSubscriptions.handleImportExport("pattern", false, false);
    }
    if (proxySubscriptions.subscriptionsList.length > 0) {
      proxySubscriptions.handleImportExport("proxy", false, false);
    }
  }
}

// function importProxyList() {
// }

function onProxyTreeSelected() {
	setButtons();
}

function onSubTreeSelected(type) {
  let selLength;
  if (type === "pattern") {
    selLength = utils.getSelectedIndices(patternSubscriptionsTree).length;
  } else {
    selLength = utils.getSelectedIndices(proxySubscriptionsTree).length;
  }
  document.getElementById(type + "subtree-row-selected").
    setAttribute("disabled", selLength === 0);
}

function updateLogButtons() {
  document.getElementById("logtree-row-selected").setAttribute("disabled",
    utils.getSelectedIndices(logTree).length == 0);
}

function onProxyTreeMenuPopupShowing() {
	var e = document.getElementById("enabledPopUpMenuItem"), f = document.getElementById("menuSeperator");
  e.hidden = f.hidden = _isDefaultProxySelected();
	e.setAttribute("checked", foxyproxy.proxies.item(proxyTree.currentIndex).enabled);
}

function toggleEnabled() {
	var p = foxyproxy.proxies.item(proxyTree.currentIndex);
	p.enabled = !p.enabled;
	utils.broadcast(true /*write settings*/, "foxyproxy-proxy-change");
}

function _isDefaultProxySelected() {
  for each (let i in utils.getSelectedIndices(proxyTree)) {
    if (foxyproxy.proxies.item(i).lastresort)
      return true;
  }
  return false;
}

function onToggleStatusBarText(checked) {
  foxyproxy.statusbar.textEnabled = checked;
  toggleStatusBarText(checked);
}

function toggleStatusBarText(checked) {
  // Next line--buggy in FF 1.5.x, 2.0.x--makes fields enabled but readonly
  // document.getElementById("statusBarWidthBroadcaster").setAttribute("disabled", true);
  // Call removeAttribute() instead of setAttribute("disabled", "false") or setAttribute("disabled", false);
  if (checked)
    document.getElementById("statusBarWidthBroadcaster").removeAttribute("disabled"); // enables!    
  else
    document.getElementById("statusBarWidthBroadcaster").setAttribute("disabled", "true");
}

function onQuickAddEnabled(cb) {
  if (cb.checked) {
    if (foxyproxy.quickadd.allowed()) {
        foxyproxy.quickadd.enabled = true;
        foxyproxy.quickadd.updateProxyMenu(document.getElementById("quickAddProxyMenu"), document);
        document.getElementById("quickAddBroadcaster").hidden = false;
    }
    else {
      overlay.alert(this, foxyproxy.getMessage("superadd.verboten2", [foxyproxy.getMessage("foxyproxy.quickadd.label")]));
      cb.checked = false;
    }
  }
  else {
    document.getElementById("quickAddBroadcaster").hidden = true;
    foxyproxy.quickadd.enabled = false;
  }
  sizeToContent();
}

function onAutoAddEnabled(cb) {
  if (cb.checked) {
    if (foxyproxy.autoadd.allowed()) {
      foxyproxy.autoadd.enabled = true;
      document.getElementById("autoAddBroadcaster").hidden = false;
      foxyproxy.autoadd.updateProxyMenu(document.getElementById("autoAddProxyMenu"), document);
      sizeToContent(); // call this before the alert() otherwise user can see unsized dialog in background
      overlay.alert(this, foxyproxy.getMessage("autoadd.notice"));
    }
    else {
      overlay.alert(this, foxyproxy.getMessage("superadd.verboten2", [foxyproxy.getMessage("foxyproxy.tab.autoadd.label")]));
      cb.checked = false;
    }
  }
  else {
    document.getElementById("autoAddBroadcaster").hidden = true;
    foxyproxy.autoadd.enabled = false;
    sizeToContent();
  }
}

function onDefinePattern(superadd) {
  var p = superadd.match.clone();
  p.temp = superadd.temp; // see notes in the .match setter in superadd.js as to why we do this
  var params = {inn:{pattern:p, superadd:true}, out:null};

  window.openDialog("chrome://foxyproxy/content/pattern.xul", "",
    "chrome, dialog, modal, resizable=yes", params).focus();

  if (params.out)
    superadd.match = params.out.pattern;
}

function onBlockedPagePattern() {
  var m = foxyproxy.autoadd.blockedPageMatch;
  var params = {inn:{pattern:m.pattern, regex:m.isRegEx, caseSensitive:m.caseSensitive}, out:null};

  window.openDialog("chrome://foxyproxy/content/blockedpagepattern.xul", "",
    "chrome, dialog, modal, resizable=yes", params).focus();

  if (params.out) {
    params = params.out;
    m.pattern = params.pattern;
    m.isRegEx = params.isRegEx;
    m.caseSensitive = params.caseSensitive;
    foxyproxy.writeSettingsAsync();
  }
}

function openLogURLInNewTab() {
  let selectedIndices = utils.getSelectedIndices(logTree);

  // If more than 3 selected, ask user if he's sure he wants to open that many tabs
  if (selectedIndices.length > 4 && !foxyproxy.warnings.
      showWarningIfDesired(window, ["reallyOpenXNewTabs", selectedIndices.
      length], "openXNewTabs", false))
  return;

  // Open 'em, ignoring entries whose URLs haven't been stored because user had enabled, "Do not store or displays URLs" (for privacy purposes)
  //var noUrl = foxyproxy.getMessage("log.nourls.url");
  for (var i = 0, sz=selectedIndices.length; i<sz; i++)
    fpc.openAndReuseOneTabPerURL(foxyproxy.logg.item(selectedIndices[i]).uri);

  // Refresh the log view for the user
  _updateLogView(true);
}

function deleteLogEntry() {
  foxyproxy.logg.del(utils.getSelectedIndices(logTree));
  // Refresh the log view for the user
  _updateLogView(false);
}

function copyLogURLToClipboard() {
  let selectedIndices = utils.getSelectedIndices(logTree);

  // Copy the URLs to the cliboard, separated by spaces if there's more than one selection
  var txt = "";
  for (var i = 0, sz = selectedIndices.length; i<sz; i++) {
    txt += foxyproxy.logg.item(selectedIndices[i]).uri;
    if (i+1 != sz) txt += " "; // don't add space to the front or the end
  }
  CC["@mozilla.org/widget/clipboardhelper;1"].getService(CI.nsIClipboardHelper).copyString(txt);
}

// We are not animating the icon anmyore due to user complaints but are
// creating a new icon on every dialog load. Seems to be a good trade-off.
function createPatternsIcon() {
  for (let i = 0; i < patternsIcon.length; i++) {
    let color = Math.round(0xffffff * Math.random()).toString(16);
    if (color.length < 6) {
      do {
        color = "0" + color;
      } while (color.length < 6)
    }
    patternsIcon[i].setAttribute("style", "fill: " + ("#" + color)
      + ";fill-opacity:1;fill-rule:nonzero;stroke:none");
  }
}

function proxyWizard() {
  let params = {};
  window.openDialog('chrome://foxyproxy/content/proxywizard.xul', '',
    'modal, centerscreen', params).focus();
  if (params.proxy) {
    let params2 = {};
    params2.inn = {
      country: params.proxy["name"],
      username: params.proxy["username"],
      password: params.proxy["password"]
    };
    window.openDialog('chrome://foxyproxy/content/proxywizardcongrat.xul', '',
      'resizable=yes', params2).focus();
  }
}
