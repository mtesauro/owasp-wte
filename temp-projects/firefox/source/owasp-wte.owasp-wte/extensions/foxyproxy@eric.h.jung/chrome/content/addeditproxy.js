/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

const CI = Components.interfaces, CC = Components.classes;
var urlsTree, proxy, foxyproxy, autoconfUrl, overlay, isWindows, fpc,
  autoconfMode, reloadFreq, loadNotification, errorNotification, autoReload,
  oldMatches = [];

Components.utils.import("resource://foxyproxy/utils.jsm");

function onLoad() {
  fpc = CC["@leahscape.org/foxyproxy/common;1"].getService().wrappedJSObject;
  foxyproxy = CC["@leahscape.org/foxyproxy/service;1"].
    getService().wrappedJSObject;
  overlay = fpc.getMostRecentWindow().foxyproxy;
  isWindows = fpc.xulRuntime.OS == "WINNT";
  autoconfUrl = document.getElementById("autoconfUrl");
  autoconfMode = document.getElementById("autoconfMode");
  reloadFreq = document.getElementById("autoConfReloadFreq");
  loadNotification = document.getElementById("pacLoadNotificationEnabled");
  errorNotification = document.getElementById("pacErrorNotificationEnabled");
  autoReload = document.getElementById("autoConfURLReloadEnabled");
  proxy = window.arguments[0].inn.proxy;
  if (window.arguments[0].inn.torwiz) {
    document.getElementById("torwiz-broadcaster").hidden = true;
    document.getElementById("not-torwiz-broadcaster").hidden = false;
    urlsTree = document.getElementById("torWizUrlsTree");
  } else {
    urlsTree = document.getElementById("urlsTree");
    document.getElementById("noInternalIPs").checked = proxy.noInternalIPs;
  }

  // System proxy settings are only implemented from Gecko 1.9.1 (FF 3.5)
  // onwards and only for Windows, MacOS and Linux. Thus, we disable this
  // option in older versions or on other OSes (like eComStation - OS/2). If a
  // user came from a version/OS supporting this we set the mode to direct to
  // keep FoxyProxy working. Checking the default proxy seems to be the best
  // option as it is always and across platforms available.
  if (!foxyproxy.proxies.list[foxyproxy.proxies.length - 1].sysProxyService) {
    if (proxy.mode === "system") {
      proxy.mode = "direct";
    }
    document.getElementById("system").disabled = true;
  }
  document.getElementById("proxyname").value = proxy.name;
  document.getElementById("proxynotes").value = proxy.notes;
  document.getElementById("animatedIcons").checked = proxy.animatedIcons;
  document.getElementById("cycleEnabled").checked = proxy.includeInCycle;
  document.getElementById("clearCacheBeforeUse").checked = proxy.
    clearCacheBeforeUse;
  document.getElementById("disableCache").checked = proxy.disableCache;
  document.getElementById("clearCookiesBeforeUse").checked = proxy.
    clearCookiesBeforeUse;
  document.getElementById("rejectCookies").checked = proxy.rejectCookies;
  document.getElementById("colorpicker").color = proxy.color;
  pickcolor(proxy.color); // NEW SVG
  document.getElementById("tabs").selectedIndex = proxy.selectedTabIndex;
  document.getElementById("proxyenabled").checked = proxy.enabled;
  document.getElementById("mode").value = proxy.mode;
  document.getElementById("host").value = proxy.manualconf.host;
  document.getElementById("port").value = proxy.manualconf.port;
  document.getElementById("isSocks").checked = proxy.manualconf.isSocks;
  document.getElementById("socksversion").value = proxy.manualconf.socksversion;
  document.getElementById("proxyDNS").checked = proxy.proxyDNS;
  autoconfMode.value = proxy.autoconfMode;

  if (proxy.autoconfMode === "pac") {
    // toggleMode("auto") is called below and it includes already a call of
    // toggleMode("pac") (or toggleMode("wpad")). We therefore omitting it here
    // and below in the wpad code path if the proxy mode is "auto".
    if (proxy.mode !== "auto") {
      toggleMode("pac");
    }
    loadNotification.checked = proxy.autoconf.loadNotification;
    errorNotification.checked = proxy.autoconf.errorNotification;
    autoReload.checked = proxy.autoconf.autoReload;
    reloadFreq.value = proxy.autoconf.reloadFreqMins;
  } else if (proxy.autoconfMode === "wpad") {
    if (proxy.mode !== "auto") {
      toggleMode("wpad");
    }
    loadNotification.checked = proxy.wpad.loadNotification;
    errorNotification.checked = proxy.wpad.errorNotification;
    autoReload.checked = proxy.wpad.autoReload;
    reloadFreq.value = proxy.wpad.reloadFreqMins;
  }
  toggleMode(proxy.mode);

  if (proxy.lastresort) {
    document.getElementById("default-proxy-broadcaster").
      setAttribute("disabled", "true");
    document.getElementById("proxyname").disabled = document.
      getElementById("proxynotes").disabled = true;
    document.getElementById("foxyproxy-urlpatterns-tab").hidden = true;
  }
  // We need to copy the matches array here in order to replace the modified
  // one with the old one if the user does not press the OK button (e.g. using
  // the Cancel button or just closing the window manually).
  for (let i = 0, length = proxy.matches.length; i < length; i++) {
    oldMatches[i] = proxy.matches[i].clone();
  }
  _updateView();
  sizeToContent();
}

function onCancel() {
  // We just overwrite the new array with the old one. Checking whether any
  // pattern really changed before overwriting the new array seems not worth
  // the effort. 
  proxy.matches = [];
  for (let i = 0, length = oldMatches.length; i < length; i++) {
    proxy.matches.push(oldMatches[i]);
  }
  return true;
}

function trim(s) {
  return s.replace(/^\s*|\s*$/g, "");
}

function onOK() {
  var host = trim(document.getElementById("host").value),
    port = document.getElementById("port").value,
    name = trim(document.getElementById("proxyname").value);
  if (!name)
    name = host ? (host + ":" + port) : foxyproxy.getMessage("new.proxy");
  var enabled = document.getElementById("proxyenabled").checked,
    url = trim(autoconfUrl.value);
  var mode = document.getElementById("mode").value;
  if (enabled) {
    if (mode === "auto") {
      if (autoconfMode.value === "pac") {
        if (!_checkUri())
          return false;
      }
    } else if (mode === "manual") {
      if (!host) {
        if (!port) {
          foxyproxy.alert(this, foxyproxy.getMessage("nohostport.3"));
          return false;
        }
        foxyproxy.alert(this, foxyproxy.getMessage("nohost.3"));
        return false;
      } else if (!port) {
        foxyproxy.alert(this, foxyproxy.getMessage("noport.3"));
        return false;
      }
    }
  }

  if (!foxyproxy.isFoxyProxySimple()) {
    // Don't do this for FoxyProxy Basic
    if (!hasWhite() && !foxyproxy.warnings.showWarningIfDesired(window,
        [window.arguments[0].inn.torwiz ? "torwiz.nopatterns.3" :
        "no.white.patterns.3", name], "white-patterns", false))
      return false;
  }

  var isSocks = document.getElementById("isSocks").checked;

  if (fpc.isThunderbird() && !isSocks && mode == "manual" &&
      !foxyproxy.warnings.showWarningIfDesired(window, ["socksWarning"],
      "socks", true))
    return false;

  let clearCache = document.getElementById("clearCacheBeforeUse").
    checked;
  let disableCache = document.getElementById("disableCache").checked;
  let clearCookies = document.getElementById("clearCookiesBeforeUse").checked;
  let rejectCookies = document.getElementById("rejectCookies").checked;

  proxy.name = name;
  proxy.notes = document.getElementById("proxynotes").value;
  proxy.selectedTabIndex = document.getElementById("tabs").selectedIndex;

  // We assign these settings here in order to have them before PACs are
  // loaded.
  if (autoconfMode.value === "pac") {
    proxy.autoconfMode = "pac";
    proxy.autoconf.url = url;
    proxy.autoconf.loadNotification = loadNotification.checked;
    proxy.autoconf.errorNotification = errorNotification.checked;
    proxy.autoconf.autoReload = autoReload.checked;
    proxy.autoconf.reloadFreqMins = reloadFreq.value;
  } else {
    proxy.autoconfMode = "wpad";
    proxy.wpad.loadNotification = loadNotification.checked;
    proxy.wpad.errorNotification = errorNotification.checked;
    proxy.wpad.autoReload = autoReload.checked;
    proxy.wpad.reloadFreqMins = reloadFreq.value;
  }
  proxy.mode = mode; // set this first to control PAC loading
  proxy.enabled = enabled;
  proxy.manualconf.host = host;
  proxy.manualconf.port = port;
  proxy.manualconf.isSocks = isSocks;
  proxy.manualconf.socksversion = document.getElementById("socksversion").value;
  proxy.animatedIcons = document.getElementById("animatedIcons").checked;
  proxy.includeInCycle = document.getElementById("cycleEnabled").checked;
  var color = new RGBColor(document.getElementById("color").value); // NEW SVG
  if(color.ok) {
    proxy.color = document.getElementById("color").value;
  } else {
    foxyproxy.alert(this, foxyproxy.getMessage("foxyproxy.invalidcolor.label"));
    return false;
  }
  proxy.proxyDNS = document.getElementById("proxyDNS").checked;
  // We only test and reset cacheOrCookiesChanged if the current proxy is the
  // selected proxy AND some checkbox got checked/unchecked.
  if (foxyproxy.isSelected(proxy)) {
    if (proxy.clearCacheBeforeUse !== clearCache || proxy.disableCache !==
        disableCache || proxy.clearCookiesBeforeUse !== clearCookies ||
        proxy.rejectCookies !== rejectCookies) {
      foxyproxy.cacheOrCookiesChanged = true;
    }
  }
  proxy.clearCacheBeforeUseOld = proxy.clearCacheBeforeUse;
  proxy.disableCacheOld = proxy.disableCache;
  proxy.clearCookiesBeforeUseOld = proxy.clearCookiesBeforeUse;
  proxy.rejectCookiesOld = proxy.rejectCookies;
  proxy.clearCacheBeforeUse = clearCache;
  proxy.disableCache = disableCache;
  proxy.clearCookiesBeforeUse = clearCookies;
  proxy.rejectCookies = rejectCookies;
  if (window.arguments[0].inn.torwiz) {
    proxy.noInternalIPs = document.getElementById("fpniip").checked;
  } else {
    proxy.noInternalIPs = document.getElementById("noInternalIPs").checked;
  }
  proxy.afterPropertiesSet();
  window.arguments[0].out = {proxy:proxy};
  return true;
}

function hasWhite() {
  return proxy.matches.some(function(m){return m.enabled && !m.isBlackList;});
}

function _checkUri() {
  var url = trim(autoconfUrl.value);
  if (url.indexOf("://") == -1) {
    // User didn't specify a scheme, so assume he means file:///

    // Replaces backslashes with forward slashes; probably not strictly
    // necessary.
    url = url.replace(/\\/g,"/");
    // prepend a leading slash if necessary 
    if (url[0] != "\\" && url[0] != "/") url="/"+url;
    url="file:///" + (isWindows?"C:":"") + url;
    autoconfUrl.value = url; // copy back to the UI
  }
  try {
    //return foxyproxy.newURI(url);
    return CC["@mozilla.org/network/io-service;1"]
      .getService(CI.nsIIOService).newURI(url, "UTF-8", null);
  }
  catch(e) {
    foxyproxy.alert(this, foxyproxy.getMessage("invalid.url"));
    return false;
  }
}

function noInternalIPs() {
  let noInternalIPsChecked;
  let localhostRegEx = "^https?://(?:[^:@/]+(?::[^@/]+)?@)?(?:localhost|127\\.\\d+\\.\\d+\\.\\d+)(?::\\d+)?(?:/.*)?$";
  let localSubRegEx = "^https?://(?:[^:@/]+(?::[^@/]+)?@)?(?:192\\.168\\.\\d+\\.\\d+|10\\.\\d+\\.\\d+\\.\\d+|172\\.(?:1[6789]|2[0-9]|3[01])\\.\\d+\\.\\d+)(?::\\d+)?(?:/.*)?$";
  let localHostnameRegEx = "^https?://(?:[^:@/]+(?::[^@/]+)?@)?[\\w-]+(?::\\d+)?(?:/.*)?$";
  if (window.arguments[0].inn.torwiz) {
    noInternalIPsChecked = document.getElementById("fpniip").checked;
  } else {
    noInternalIPsChecked = document.getElementById("noInternalIPs").checked;
  }
  if (noInternalIPsChecked) {
    let helper = [];
    let m = CC["@leahscape.org/foxyproxy/match;1"].createInstance().
      wrappedJSObject;
    m.init({enabled: true, name: foxyproxy.getMessage("localhost2") +
      foxyproxy.getMessage("localhost.patterns.message"), pattern:
      localhostRegEx, isRegEx: true, isBlackList: true, isMultiLine: true});
    helper.push(m);
    m = CC["@leahscape.org/foxyproxy/match;1"].createInstance().
      wrappedJSObject;
    m.init({enabled: true, name: foxyproxy.getMessage("localsubnets2") +
      foxyproxy.getMessage("localhost.patterns.message"), pattern:
      localSubRegEx, isRegEx: true, isBlackList: true, isMultiLine: true});
    helper.push(m);
    m = CC["@leahscape.org/foxyproxy/match;1"].createInstance().
      wrappedJSObject;
    m.init({enabled: true, name: foxyproxy.getMessage("localhostnames2") +
      foxyproxy.getMessage("localhost.patterns.message"), pattern:
      localHostnameRegEx, isRegEx: true, isBlackList: true, isMultiLine: true});
    helper.push(m);
    proxy.matches = helper.concat(proxy.matches);
  } else {
    // We want to delete these three patterns properly even if the user somehow
    // sorted the tree. Therefore, we have to walk through all patterns and if
    // we find a match we remove it from the array.
    let i = 0, j = 0;
    let matchesLength = proxy.matches.length;
    do {
      let proxyPattern = proxy.matches[i].pattern;
      if (proxyPattern === localhostRegEx || proxyPattern === localSubRegEx ||
          proxyPattern === localHostnameRegEx) {
        proxy.matches.splice(i, 1);
      } else {
        i++;
      }
      j++;
    } while  (j < matchesLength);
  }
  _updateView();
}

function onAddEditURLPattern(isNew) {
  var idx = urlsTree.currentIndex, m;
  if (isNew) {
    m = CC["@leahscape.org/foxyproxy/match;1"].createInstance().wrappedJSObject;
    idx = proxy.matches.length;
  }
  else if (idx == -1) return; // safety; may not be necessary anymore

  var params = {inn:{pattern: (isNew ? m : proxy.matches[idx]), superadd:false}, out:null};

  window.openDialog("chrome://foxyproxy/content/pattern.xul", "",
    "chrome, dialog, modal, resizable=yes", params).focus();

  if (params.out) {
    proxy.matches[idx] = params.out.pattern;
    _updateView();
    // Select item
	  urlsTree.view.selection.select(isNew?urlsTree.view.rowCount-1 : urlsTree.currentIndex);
  }
}

/** Sets the buttons on the URL Patterns tab */
function setButtons(observerId, tree) {
  // Disable Edit, Copy, Delete if no treeitem is selected
  document.getElementById(observerId).setAttribute("disabled",
    tree.currentIndex == -1);

  // Disable Edit & Copy if no item or multiple tree items selected
  let selIndices = utils.getSelectedIndices(tree),
    disable = selIndices.length == 0 || selIndices.length > 1;
  document.getElementById("editURLPatternSelectionCmd").
    setAttribute("disabled", disable);
  document.getElementById("copyURLPatternSelectionCmd").
    setAttribute("disabled", disable);

  onAutoConfUrlInput();
}

function getTextForCell(pat, col) {
  switch (col) {
    case "enabled":return pat.enabled;
    case "name":return pat.name;
    case "pattern":return pat.pattern;
    case "isRegEx":return foxyproxy.getMessage(pat.isRegEx ? "foxyproxy.regex.label" : "foxyproxy.wildcard.label");
    case "isBlackList":return foxyproxy.getMessage(pat.isBlackList ? "foxyproxy.blacklist.label" : "foxyproxy.whitelist.label");
    case "caseSensitive":return foxyproxy.getMessage(pat.caseSensitive ? "yes" : "no");
    case "temp":return foxyproxy.getMessage(pat.temp ? "yes" : "no");
    case "fromSubscription":return foxyproxy.
      getMessage(pat.fromSubscription ? "yes" : "no");
  };
}

function _updateView() {
  // We disable and enable the JSON export button depending on available
  // patterns.
  document.getElementById("exportURLPatternCmd").setAttribute("disabled", 
    proxy.matches.length === 0); 
  //document.getElementById("noInternalIPs").checked = proxy.noInteralIPs;

  // Save scroll position so we can restore it after making the new view
  let visibleRow = urlsTree.treeBoxObject.getFirstVisibleRow();

  // Redraw the tree
  urlsTree.view = makeView();

  // Restore scroll position - peng likes to complain that this feature was
  // missing.
  urlsTree.treeBoxObject.scrollToRow(visibleRow);

  function makeView() {
    return {
      rowCount : proxy.matches.length,
      getCellText : function(row, column) {
        return getTextForCell(proxy.matches[row], column.id ? column.id : column);
      },
      setCellValue: function(row, col, val) {proxy.matches[row].enabled = val;},
      getCellValue: function(row, col) {return proxy.matches[row].enabled;},
      isSeparator: function(aIndex) { return false; },
      isSorted: function() { return false; },
      isEditable: function(row, col) { return false; },
      isContainer: function(aIndex) { return false; },
      setTree: function(aTree){},
      getImageSrc: function(aRow, aColumn) {return null;},
      getProgressMode: function(aRow, aColumn) {},
      cycleHeader: function(aColId, aElt) {},
      getRowProperties: function(aRow, aColumn, aProperty) {},
      getColumnProperties: function(aColumn, aColumnElement, aProperty) {},
      getCellProperties: function(aRow, aProperty) {},
      getLevel: function(row){ return 0; }

    };
  }
  setButtons("urls-tree-row-selected", urlsTree);
}

function onRemoveURLPattern() {
  // Store cur selections
  let sel = utils.getSelectedIndices(urlsTree);

  // Delete in reverse order so we don't mess up the index as we delete multiple
  // items.
  for (let i=sel.length-1; i>=0; i--) {
    proxy.removeURLPattern(proxy.matches[sel[i]]);
  }
  _updateView();

  // If only one item was deleted, select its neighbor as convenience.
  // We don't bother with this when multiple items were selected.
  if (sel.length == 1 && sel[0] < urlsTree.view.rowCount-1)
    urlsTree.view.selection.select(sel[0]);
}  


function onCopyURLPattern() {
  // Get current selection
  var currentMatch = proxy.matches[urlsTree.currentIndex];
  // Make new match
  var m = CC["@leahscape.org/foxyproxy/match;1"].createInstance().wrappedJSObject,
    idx = proxy.matches.length,  
    dom = currentMatch.toDOM(document, true);
  m.fromDOM(dom, true);
  
  proxy.matches[idx] = m;
  _updateView();

  // Select new item
  urlsTree.view.selection.select(urlsTree.view.rowCount-1);
}

function onImportURLPattern() {
  //Getting the file first.
  let fp = CC["@mozilla.org/filepicker;1"].createInstance(CI.nsIFilePicker);  
  fp.init(window, foxyproxy.getMessage("file.select.patterns.import"), 
    CI.nsIFilePicker.modeOpen);
  fp.appendFilters(CI.nsIFilePicker.filterAll); 
  fp.displayDirectory = foxyproxy.getSettingsURI(CI.nsIFile).parent; 
  if (fp.show() !== CI.nsIFilePicker.returnCancel) { 
    let patterns = [];
    let fis = CC["@mozilla.org/network/file-input-stream;1"].
      createInstance(CI.nsIFileInputStream);
    fis.init(fp.file, 0x01, -1, 0);
    let conStream = CC["@mozilla.org/intl/converter-input-stream;1"].
      createInstance(CI.nsIConverterInputStream);
      conStream.init(fis, "UTF-8", 0, 0);
      conStream.QueryInterface(CI.nsIUnicharLineInputStream); 
    // read lines into one single string
    let line = {}, lines = "", hasmore;
    try {
      do {
        hasmore = conStream.readLine(line);
        lines = lines + line.value;
      } while(hasmore);
      conStream.close();
      patterns = window.opener.patternSubscriptions.getObjectFromJSON(lines).
        patterns;
    } catch (e) {
      dump("Error while reading the patterns!" + e + "\n");
    } 
    try {
      if (patterns) {
        let pattern;
        for (let i = 0, patLength = patterns.length; i < patLength; i++) {
          pattern = CC["@leahscape.org/foxyproxy/match;1"].createInstance().
                    wrappedJSObject;
          pattern.init({enabled: patterns[i].enabled, name: patterns[i].name,
            pattern: patterns[i].pattern, isRegEx: patterns[i].isRegEx,
            caseSensitive: patterns[i].caseSensitive, isBlackList:
            patterns[i].blackList, isMultiLine: patterns[i].multiLine});
          proxy.matches.push(pattern);
        }
      }
    } catch (ex) {
      dump("Error while adding the patterns!" + ex + "\n");
    }
  }
  _updateView();
}

function onExportURLPattern() {
  let patternLength = proxy.matches.length;
  // Now we are constructing the pattern JSON
  let JSONString = '{"patterns":[';
  for (let j = 0; j < patternLength; j++) {
    JSONString = JSONString + proxy.matches[j].toJSON();
    if (j < patternLength - 1) {
      JSONString = JSONString + ",";
    } else {
      JSONString = JSONString + "]}";
    }
  }
  // Now, we export the JSON to a file somewhere on the (local) disk...
  let fp = CC["@mozilla.org/filepicker;1"].createInstance(CI.nsIFilePicker);  
  fp.init(window, foxyproxy.getMessage("file.select.patterns.export"), 
    CI.nsIFilePicker.modeSave);
  fp.defaultString = "patterns.json";
  fp.appendFilters(CI.nsIFilePicker.filterAll); 
  fp.displayDirectory = foxyproxy.getSettingsURI(CI.nsIFile).parent; 
  if (fp.show() !== CI.nsIFilePicker.returnCancel) { 
    let fos = CC["@mozilla.org/network/file-output-stream;1"].
      createInstance(CI.nsIFileOutputStream); 
    fos.init(fp.file, 0x02 | 0x08 | 0x20, -1, 0); 
    // Maybe we have non-Ascii text in our JSON string. Therefore, we use the
    // ConverterOutputStream and UTF-8.
    let os = CC["@mozilla.org/intl/converter-output-stream;1"].
      createInstance(CI.nsIConverterOutputStream);
    os.init(fos, "UTF-8", 0, 0);
    os.writeString(JSONString);
    os.close();
  }
}

function toggleSocks() {
  let socksBC = document.getElementById("socks-broadcaster");
  if (document.getElementById("isSocks").checked) {
    socksBC.removeAttribute("disabled");
  } else {
    socksBC.setAttribute("disabled", "true");
  }
}

function toggleMode(mode) {
  // Next line--buggy in FF 1.5.0.1--makes fields enabled but readonly
  // document.getElementById("disabled-broadcaster").setAttribute("disabled", mode == "auto" ? "true" : "false");
  // Call removeAttribute() instead of setAttribute("disabled", "false") or setAttribute("disabled", false);
  // Thanks, Andy McDonald.
  if (mode == "auto") {
    document.getElementById("autoconf-broadcaster1").
      removeAttribute("disabled");
    document.getElementById("socks-broadcaster").setAttribute("disabled",
      "true");
    document.getElementById("disabled-broadcaster").setAttribute("disabled",
      "true");
    document.getElementById("direct-broadcaster").removeAttribute("disabled");
    document.getElementById("proxyDNS").hidden = false;
    // We need that here to trigger the broadcaster related code in the wpad
    // and pac codepath below in all possible cases.
    if (document.getElementById("autoconfMode").value === "wpad") {
      toggleMode("wpad");
    } else {
      toggleMode("pac");
    }
    onAutoConfUrlInput();
  } else if (mode == "direct" || mode == "system") {
    document.getElementById("disabled-broadcaster").setAttribute("disabled",
      "true");
    document.getElementById("autoconf-broadcaster1").setAttribute("disabled",
      "true");
    document.getElementById("autoconf-broadcaster2").setAttribute("disabled",
      "true");
    document.getElementById("autoconf-broadcaster3").setAttribute("disabled",
      "true");
    document.getElementById("socks-broadcaster").setAttribute("disabled",
      "true");
    if (mode == "direct") {
      document.getElementById("proxyDNS").hidden = true;
      document.getElementById("direct-broadcaster").setAttribute("disabled",
      "true");
    } else {
      document.getElementById("direct-broadcaster").removeAttribute("disabled");
    }
  } else if (mode == "wpad") {
    autoconfUrl.value = proxy.wpad.url;
    autoconfUrl.setAttribute("readonly", true);
    // We always have a URL here, thus we can remove the attribute directly.
    document.getElementById("autoconf-broadcaster2").
      removeAttribute("disabled");
    // We do not need the file picker either.
    document.getElementById("autoconf-broadcaster3").setAttribute("disabled",
      "true");
    // And no help icon.
    document.getElementById("autoconf-broadcaster4").setAttribute("style",
      "visibility: hidden");
  } else if (mode == "pac") {
    autoconfUrl.value = proxy.autoconf.url;
    autoconfUrl.removeAttribute("readonly");
    // If we clicked on WPAD first we have to enable the file picker again.
    document.getElementById("autoconf-broadcaster3").
      removeAttribute("disabled");
    // And the help icon.
    document.getElementById("autoconf-broadcaster4").setAttribute("style",
      "visibility: visible");
    onAutoConfUrlInput();
  } else {
    document.getElementById("disabled-broadcaster").removeAttribute("disabled");
    document.getElementById("autoconf-broadcaster1").setAttribute("disabled",
      "true");
    document.getElementById("autoconf-broadcaster2").setAttribute("disabled",
      "true");
    document.getElementById("autoconf-broadcaster3").setAttribute("disabled",
      "true");
    if (document.getElementById("isSocks").checked) {
      document.getElementById("socks-broadcaster").removeAttribute("disabled");
    } else {
      document.getElementById("socks-broadcaster").setAttribute("disabled",
        "true");
    }
    document.getElementById("direct-broadcaster").removeAttribute("disabled");
    document.getElementById("proxyDNS").hidden = false;
  }
}

function onHelp() {
  fpc.openAndReuseOneTabPerURL("http://getfoxyproxy.org/patterns.html");
}

function onViewAutoConf() {
  var w, p = _checkUri();
  if (p) {
    // This goes through currently configured proxies, unlike actually loading the PAC.
    // In that case, DIRECT (no proxy) is used.
    var url = p.spec + (p.spec.match(/\?/) == null ? "?" : "&") + (new Date()).getTime(); // bypass cache
		w = open("view-source:" + url, "", "scrollbars,resizable,modal,chrome,dialog=no,width=450,height=425").focus();
    if (w) w.windowtype="foxyproxy-options"; // set windowtype so it's forced to close when last browser closes
  }
}

function onTestAutoConf() {
  if (_checkUri()) {
    let autoconfMessage = "";
    try {
      CC["@leahscape.org/foxyproxy/autoconf;1"].createInstance().
        wrappedJSObject.testPAC(autoconfUrl.value);
      if (autoconfMode.value === "pac") {
        autoconfMessage = "autoconfurl.test.success";
      } else {
        autoconfMessage = "wpadurl.test.success";
      }
      foxyproxy.alert(this, foxyproxy.getMessage(autoconfMessage));
    } catch (e) {
      if (autoconfMode.value === "pac") {
        autoconfMessage = "autoconfurl.test.fail2";
      } else {
        autoconfMessage = "wpadurl.test.fail";
      }
      foxyproxy.alert(this, foxyproxy.getMessage(autoconfMessage, [e.message]));
    }
  }
}

function onAutoConfUrlInput() {
  // setAttribute("disabled", true) buggy in FF 1.5.0.4 for the way i've setup
  // the cmd so must use removeAttribute()
  var b = document.getElementById("autoconf-broadcaster2");
  // TODO: For some reason we need the second condition in order to disable the
  // view and test button iff the dialog gets loaded AND the proxy mode is not
  // "auto".
  if (autoconfUrl.value.length > 0 && document.getElementById("mode").value ===
    "auto")
    b.setAttribute("disabled", "false");
  else
    b.setAttribute("disabled", "true");
}

function onSelectAutoConf() {
  const nsIFilePicker = CI.nsIFilePicker;
  var p = CC["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  p.init(window, foxyproxy.getMessage("pac.select"), nsIFilePicker.modeOpen);
  p.appendFilters(nsIFilePicker.filterAll);
  p.appendFilter(foxyproxy.getMessage("pac.files"), "*.pac");
  p.defaultExtension = "pac";
  if (p.show() != nsIFilePicker.returnCancel) {
    autoconfUrl.value = foxyproxy.transformer(p.file, "uri-string");
    onAutoConfUrlInput();
  }
}

function onTreeMenuPopupShowing(enabledMenuItem, pats, tree) {
  if (tree.currentIndex == -1) return;
	enabledMenuItem.setAttribute("checked", pats[tree.currentIndex].enabled);
}

function toggleEnabled(pats, tree) {
	pats[tree.currentIndex].enabled = !pats[tree.currentIndex].enabled;
  _updateView();
}

function onWildcardReference(popupId, btnId) {
	document.getElementById(popupId).showPopup(document.getElementById(btnId), -1, -1, 'popup', 'bottomleft', 'topleft');
}

function pickcolor(scolor) {
	document.getElementById("color").value=scolor;
}

function customcolor(scolor) {
	var color = new RGBColor(scolor);
	if(color.ok) {
		document.getElementById("colorpicker").color=scolor;
		document.getElementById("colorfalse").setAttribute("hidden", "true");
		document.getElementById("colortrue").setAttribute("hidden", "false");
	} else {
		document.getElementById("colorfalse").setAttribute("hidden", "false");
		document.getElementById("colortrue").setAttribute("hidden", "true");
	}
}

function getTextForBoolean(b) {
  return foxyproxy.getMessage(b ? "yes" : "no");
}

/**
 * TODO: See if there's any way to generalize this function with sortlog() in options.xul to prevent code duplication
 */ 
function sort(columnId) {
  // determine how the urlsTree is currently sorted (ascending/decending) and by which column (sortResource)
  var order = urlsTree.getAttribute("sortDirection") == "ascending" ? 1 : -1;
  // if the column is passed and it's already sorted by that column, reverse sort
  if (columnId) {
    if (urlsTree.getAttribute("sortResource") == columnId) {
      order *= -1;
    }
  } else {
    columnId = urlsTree.getAttribute("sortResource");
  }
  
  //prepares an object for easy comparison against another. for strings, lowercases them
  function prepareForComparison(o) {
    if (typeof o == "string") {
      return o.toLowerCase();
    }
    return o;
  }
  
  function columnSort(a, b) {
    // Sort on the displayed text, not the underlying data. The underlying data can be true/false
    // for some columns while the displayed text can be, for example, "Whitelist/Blacklist" or "yes/no"
    // or "Wildcards/Regular Expression" 
    
    var c, d;
    if (columnId == "enabled") {
      if (a.enabled) return -1 * order;
      if (b.enabled) return order;
    }
    else {
      c = getTextForCell(a, columnId);
      d = getTextForCell(b, columnId);
    }
    
    if (prepareForComparison(c) > prepareForComparison(d)) return order;
    if (prepareForComparison(c) < prepareForComparison(d)) return -1 * order;
    // tie breaker: enabled ascending is the second level sort
    if (columnId != "enabled") {
      if (a.enabled) return 1;
      if (b.enabled) return -1;
    }
    return 0;
  }
  proxy.matches.sort(columnSort);
  
  // setting these will make the sort option persist
  urlsTree.setAttribute("sortDirection", order == 1 ? "ascending" : "descending");
  urlsTree.setAttribute("sortResource", columnId);
  
  // set the appropriate attributes to show to indicator
  var cols = urlsTree.getElementsByTagName("treecol");
  for (var i = 0; i < cols.length; i++) {
    cols[i].removeAttribute("sortDirection");
  }
  document.getElementById(columnId).setAttribute("sortDirection", order == 1 ? "ascending" : "descending");
  
  _updateView();
}
 
/**
 * If the user enters the port as part of the hostname, parse it and put it into the port field automatically.
 * Thanks, Sebastian Lisken <Sebastian dot Lisken at gmx dot net>
 */
function onHostChange(hostInput) {
  var portInput = document.getElementById("port");
  hostInput.value = hostInput.value.replace(/^\s*(.*?)\s*$/, "$1");
  var match = hostInput.value.match(/^(.*?)(?:\s*:\s*|\s+)([0-9]+)$/);
  if (match) {
    var port = match[2] - 0;
    if (port < 0x10000) {
      hostInput.value = match[1];
      portInput.value = port;
    }
  }
}
