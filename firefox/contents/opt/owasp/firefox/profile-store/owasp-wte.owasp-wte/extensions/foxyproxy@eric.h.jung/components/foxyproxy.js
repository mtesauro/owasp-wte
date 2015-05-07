/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

// Don't const the next line anymore because of the generic reg code
// dump("foxyproxy.js\n");
var CI = Components.interfaces, CC = Components.classes, CR = Components.results, CU = Components.utils, gFP;
CU.import("resource://gre/modules/XPCOMUtils.jsm");
var dumpp = function(e) {
  if (e) out(e);
  else {
    try {
      throw new Error("e");
    }
    catch (e) {out(e);}
  }
  function out(e) {dump("FoxyProxy Error: " + e + " \n\nCall Stack:\n" + e.stack + "\n");}
};
// Get attribute from node if it exists, otherwise return |def|.
// No exceptions, no errors, no null returns.
var gGetSafeAttr = function(n, name, def) {
  if (!n) {dumpp(); return; }
  n.QueryInterface(CI.nsIDOMElement);
  return n ? (n.hasAttribute(name) ? n.getAttribute(name) : def) : def;
};
// Boolean version of GetSafe
var gGetSafeAttrB = function(n, name, def) {
  if (!n) {dumpp(); return; }
  n.QueryInterface(CI.nsIDOMElement);
  return n ? (n.hasAttribute(name) ? n.getAttribute(name)=="true" : def) : def;
};
var loadComponentScript = function(filename) {
  try {
    var filePath = componentDir.clone();
    filePath.append(filename);
    loader.loadSubScript(fileProtocolHandler.getURLSpecFromFile(filePath));
  }
  catch (e) {
    dump("Error loading component " + filename + ": " + e + "\n" + e.stack + "\n");
    throw(e);
  }
};
var loadModuleScript = function(filename) {
  try {
    var filePath = componentDir.clone();
    filePath = filePath.parent;
    filePath.append("modules");
    filePath.append(filename);
    loader.loadSubScript(fileProtocolHandler.getURLSpecFromFile(filePath));
  }
  catch (e) {
    dump("Error loading module " + filename + ": " + e + "\n" + e.stack + "\n");
    throw(e);
  }
};
var gLoggEntryFactory = function(proxy, aMatch, uri, type, errMsg) {
    return new LoggEntry(proxy, aMatch, foxyproxy.prototype.logg._noURLs ? foxyproxy.prototype.logg.noURLsMessage : uri, type, errMsg);
  },
  gObsSvc = CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService),
  gBroadcast = function(subj, topic, data) {
    var bool = CC["@mozilla.org/supports-PRBool;1"].createInstance(CI.nsISupportsPRBool);
    bool.data = subj;
    var d;
    if (typeof(data) == "string" || typeof(data) == "number") {
      /*
       * it's a number when this._mode is 3rd arg, and FoxyProxy is set to a proxy for all URLs
       */
      var d = CC["@mozilla.org/supports-string;1"].createInstance(CI.nsISupportsString);
      d.data = "" + data; // force to a string
    }
    else {
      data && (d = data.QueryInterface(CI.nsISupports));
    }
    gObsSvc.notifyObservers(bool, topic, d);
};

// load js files
var self;
var fileProtocolHandler = CC["@mozilla.org/network/protocol;1?name=file"].getService(CI["nsIFileProtocolHandler"]);
if ("undefined" != typeof(__LOCATION__)) {
  // preferred way
  self = __LOCATION__;
}
else {
  self = fileProtocolHandler.getFileFromURLSpec(Components.Exception().filename);
}
var componentDir = self.parent; // the directory this file is in
var loader = CC["@mozilla.org/moz/jssubscript-loader;1"].getService(CI["mozIJSSubScriptLoader"]);
loadComponentScript("proxy.js");
loadComponentScript("match.js");
loadModuleScript("superadd.js");

// l is for lulu...
function foxyproxy() {
  SuperAdd.prototype.fp = gFP = this.wrappedJSObject = this;
  // That CU call has to be here, otherwise it would not work. See:
  // https://developer.mozilla.org/en/JavaScript/Code_modules/Using section
  // "Custom modules and XPCOM components" 
  CU.import("resource://foxyproxy/subscriptions.jsm", this);
  CU.import("resource://foxyproxy/defaultprefs.jsm", this);
  CU.import("resource://foxyproxy/cookiesAndCache.jsm", this);
  CU.import("resource://foxyproxy/utils.jsm", this);
};
foxyproxy.prototype = {
  PFF : " ",
  _mode : "disabled",
  _selectedProxy : null, /* remains null unless all URLs are set to load through a proxy */
  _selectedTabIndex : 0,
  _toolbarIcon : true,
  _toolsMenu : true,
  _contextMenu : true,
  _advancedMenus : false,
  _previousMode : "patterns",
  _resetIconColors : true,
  _useStatusBarPrefix: true,
  autoadd : null,
  quickadd : null,
  excludePatternsFromCycling : false,
  excludeDisabledFromCycling : false,
  ignoreProxyScheme : false,
  writeSettingsTimer : null,
  apiDisabled : false,
  cacheOrCookiesChanged : false,
  cacheAndCookiesChecked : false,
  _proxyForVersionCheck : "",
  // That gets set in the Common() constructor.
  isGecko17 : false,
  fpc : null,

  broadcast : function(subj, topic, data) {
    gBroadcast(subj, topic, data);
  },

  init : function() {
    try {
      this.writeSettingsTimer = CC["@mozilla.org/timer;1"].
        createInstance(CI.nsITimer);
      this.autoadd = new AutoAdd(this.getMessage("autoadd.pattern.label"));
      this.quickadd = new QuickAdd(this.getMessage("quickadd.pattern.label"));
      LoggEntry.prototype.init();
    }
    catch (e) {
      dumpp(e);
    }
  },

  observe: function(subj, topic, data) {
      switch(topic) {
        case "profile-after-change":
          this.fpc = CC["@leahscape.org/foxyproxy/common;1"].getService().
            wrappedJSObject;
          gObsSvc.addObserver(this, "quit-application", false);
          gObsSvc.addObserver(this, "domwindowclosed", false);
          gObsSvc.addObserver(this, "domwindowopened", false);
          try {
            this.init();
            this.patternSubscriptions.init();
            this.proxySubscriptions.init();
            // Initialize defaultPrefs before initial call to this.setMode().
            // setMode() is called from this.loadSettings()->this.fromDOM(), but
            // also from commandlinehandler.js.
            this.defaultPrefs.init(gFP);
            this.loadSettings();
          }
          catch (e) {
            dumpp(e);
          }
        break;
      case "domwindowclosed":
        // Did the last browser window close? It could be that the DOM
        // Inspector, JS console, or the non-last browser window just closed.
        // In that case, don't close FoxyProxy.
        let wm = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.
          nsIWindowMediator);
        if (!this.fpc.getMostRecentWindow(wm)) {
          this.closeAppWindows("foxyproxy", wm);
          this.closeAppWindows("foxyproxy-superadd", wm);
          this.closeAppWindows("foxyproxy-options", wm);
        }
        break;
      case "quit-application": // Called whether or not FoxyProxy options dialog is open when app is closing
        gObsSvc.removeObserver(this, "quit-application");
        gObsSvc.removeObserver(this, "domwindowclosed");
        gObsSvc.removeObserver(this, "domwindowopened");
        this.defaultPrefs.uninit();
        break;
      case "domwindowopened":
        this.strings.load();
        this.notifier.emptyQueue();
        break;
    }
  },

  closeAppWindows: function(type, wm) {
    var wm = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.nsIWindowMediator);
    var e = wm.getEnumerator(type);
    while (e.hasMoreElements())
      e.getNext().close();
  },

  loadSettings : function() {
    this.migrateSettingsURI();
    var f = this.getSettingsURI(CI.nsIFile);
    dump("FoxyProxy settingsDir: " + f.path + "\n");
    var doc = this.parseValidateSettings(f);
    if (!doc) {
      this.alert(null, this.getMessage("settings.error.2", [f.path, f.path]));
      this.writeSettings(f);
    }
    else {
      this.fromDOM(doc, doc.documentElement);
    }
    // Now we load the pattern subscriptions as well if there are any.
    var patternSubFile = f.parent.clone();
    patternSubFile.append("patternSubscriptions.json");
    // If we do not have a file yet we do not do anything here concerning the
    // pattern subscriptions. Maybe the user does not need that feature at all.
    if (patternSubFile.exists() && patternSubFile.isFile()) {
      this.patternSubscriptions.loadSavedSubscriptions(patternSubFile);
    }
    // Now the proxy subscriptions if there are any.
    var proxySubFile =  f.parent.clone();
    proxySubFile.append("proxySubscriptions.json");
    // If we do not have a file yet we do not do anything here concerning the
    // proxy subscriptions. Maybe the user does not need that feature at all.
    if (proxySubFile.exists() && proxySubFile.isFile()) {
      this.proxySubscriptions.loadSavedSubscriptions(proxySubFile);
    }
  },

  /* Parsing and very basic validation that the settings file is legit. TODO: we could create an XSD for complete validation */
  parseValidateSettings : function(f) {
    try {
      var s = CC["@mozilla.org/network/file-input-stream;1"].createInstance(CI.nsIFileInputStream);
      s.init(f, -1, -1, CI.nsIFileInputStream.CLOSE_ON_EOF);
      var p = CC["@mozilla.org/xmlextras/domparser;1"].createInstance(CI.nsIDOMParser),
        doc = p.parseFromStream(s, null, f.fileSize, "text/xml");
      return doc && doc.documentElement.nodeName == "foxyproxy" /* checks for parsererror nodeName; i.e. malformed XML */ ?
        doc : null;
    }
    catch (e) {
      dump("FoxyProxy parsing/validation error: " + e + "\n");
    }
  },

  get mode() { return this._mode; },
  setMode : function(mode, writeSettings, init) {
    // If the user is about to enter pattern mode AND has different cookie
    // related settings in her proxies we show a warning.
    this.utils.displayPatternCookieWarning(mode, this);
    // Possible modes are: patterns, _proxy_id_ (for "Use proxy xyz for all
    // URLs), random, roundrobin, disabled, previous.
    // Note that "previous" isn't used anywhere but this method: it is
    // translated into the previous mode then broadcasted.
    if (mode == "previous") {
      if (this.mode == "disabled")
        mode = this.previousMode;
      else
        mode = "disabled";
    }
    this._previousMode = this._mode;
    this._mode = mode;
    this._selectedProxy = null; // todo: really shouldn't do this in case
                                // something tries to load right after this
                                // instruction
    for (var i=0,len=this.proxies.length; i<len; i++) {
      var proxy = this.proxies.item(i);
      if (mode == proxy.id) {
        this._selectedProxy = proxy;
        // If we are in mode "Use proxy XYZ for all URLs" AND have the selected
        // proxy, check for PAC loading. It is done via the enabled-setter in
        // proxy.js!
        proxy.enabled = true; // ensure it's enabled
      } else {
        // Check PAC loading in pattern mode for every proxy.
        // TODO: Add |random| and |roundrobin| as well if we have these modes.
        if (mode == "patterns") {
          if (proxy.shouldLoadPAC()) {
            proxy.preparePACLoading();
          }
        }
      }
    }
    // Ensure the new mode is valid. If it's invalid, set mode to disabled for
    // safety (what else should we do?) and spit out a message. The only time
    // an invalid mode could be specified is if (a) there's a coding error,
    // (b) the user specified an invalid mode on the command-line arguments or
    // (c) the content-facing API specified an invalid mode.
    if (!this._selectedProxy && mode != "disabled" && mode != "patterns" &&
        mode != "random" && mode != "roundrobin") {
      dump("FoxyProxy: unrecognized mode specified. Defaulting to \"disabled\".\n");
      this._mode = "disabled";
      this.notifier.alert(this.getMessage("foxyproxy"),
        "Unrecognized mode specified: " + mode);
    }

    if (this.isGecko17) {
      this.toggleFilter(this._mode != "disabled");
    }
    // This line must come before the next one -- gBroadcast(...) Otherwise,
    // AutoAdd and QuickAdd write their settings before they've been
    // deserialized, resulting in them always getting written to disk as
    // disabled (althogh the file itself is already in-memory, so they will be
    // enabled until restart. Unless, of course, the user first does something
    // to FoxyProxy which forces it to flush it's in-memory state to disk
    // (e.g., switch FoxyProxy tabs, edit a proxy/pattern, etc).
    if (init) return;
    gBroadcast(this.autoadd._enabled, "foxyproxy-mode-change", this._mode);
    if (writeSettings)
      this.writeSettingsAsync();
  },

  handleCacheAndCookies : function(proxy, previousProxy) {
    if (proxy) {
      if (previousProxy && previousProxy.id !== proxy.id &&
          this.cacheAndCookiesChecked) {
        this.cacheAndCookiesChecked = false;
      }
      if (this.cacheAndCookiesChecked && !this.cacheOrCookiesChanged) {
        return;
      } else if (this.cacheAndCookiesChecked && this.cacheOrCookiesChanged) {
        // The user just changed values in the addeditproxy dialog.
        if (proxy.clearCacheBeforeUse !== proxy.clearCacheBeforeUseOld) {
          if (proxy.clearCacheBeforeUse) {
            this.cacheMgr.clearCache();
          }
        }
        if (proxy.disableCache !== proxy.disableCacheOld) {
          if (proxy.disableCache) {
            // Disabling and enabling the pref observer in order to not save
            // new default cache values.
            this.defaultPrefs.removeCacheObserver();
            this.cacheMgr.disableCache();
            this.defaultPrefs.addCacheObserver();
          } else {
            this.defaultPrefs.restoreOriginals("cache");
          }
        }
        if (proxy.clearCookiesBeforeUse !== proxy.clearCookiesBeforeUseOld) {
          if (proxy.clearCookiesBeforeUse) {
            this.cookieMgr.clearCookies();
          }
        }
        if (proxy.rejectCookies !== proxy.rejectCookiesOld) {
          if (proxy.rejectCookies) {
            // Disabling and enabling the pref observer in order to not save
            // new default cookie values.
            this.defaultPrefs.removeCookieObserver();
            this.cookieMgr.rejectCookies();
            this.defaultPrefs.addCookieObserver();
          } else {
            this.defaultPrefs.restoreOriginals("cookies");
          }
        }
        // We are just changing the cacheOrCookiesChanged flag and not the
        // *Old flags as the latter are only important if the former is set to
        // true. And when that flag is set to true the *Old flags are getting
        // their proper values as well. Thus, we do not need to adjust them
        // here.
        this.cacheOrCookiesChanged = false;
      } else {
        // This is called even if the user changed settings in the addeditproxy
        // dialog before handleCacheAndCookies() is called for the first time
        // with the current proxy. It is called on start-up as well as
        // cacheAndCookiesChecked is false then.
        if (proxy.clearCacheBeforeUse) {
          this.cacheMgr.clearCache();
        }
        if (proxy.disableCache) {
          // Disabling and enabling the pref observer in order to not save
          // new default cache values.
          this.defaultPrefs.removeCacheObserver();
          this.cacheMgr.disableCache();
          this.defaultPrefs.addCacheObserver();
        } else {
          this.defaultPrefs.restoreOriginals("cache");
        }
        if (proxy.clearCookiesBeforeUse) {
          this.cookieMgr.clearCookies();
        }
        if (proxy.rejectCookies) {
          // Disabling and enabling the pref observer in order to not save
          // new default cookie values.
          this.defaultPrefs.removeCookieObserver();
          this.cookieMgr.rejectCookies();
          this.defaultPrefs.addCookieObserver();
        } else {
          this.defaultPrefs.restoreOriginals("cookies");
        }
        // We obviously checked the cache and cookie settings...
        this.cacheAndCookiesChecked = true;
      }
    }
  },

  /**
   * This assumes mode order is:
   * patterns, proxy1, ..., lastresort, random, roundrobin, disabled
   * "patterns" can be removed from the cycle with if this.excludePatternsFromCycling is true
   * "disabled" can be removed from the cycle with if this.excludeDisabledFromCycling is true
   */
  cycleMode : function() {
    if (this._selectedProxy && this._selectedProxy.lastresort) {
      // We're at the end of the proxy list. Either set
      // to "disabled" or, if the user doesn't want "disabled"
      // in the cycle, wrap around to "patterns". Ah, but if the
      // user doesn't want "patterns" in the cycle, then wrap
      // around to the next proxy after "patterns"
      if (gFP.excludeDisabledFromCycling)
        this.setMode(gFP.excludePatternsFromCycling ? _getNextAfterPatterns() : "patterns", true);
      else
        this.setMode("disabled", true);
    }
    else if (this._mode == "disabled") {
      this.setMode(this.isFoxyProxySimple() || gFP.excludePatternsFromCycling ?
          /* FP Simple has no "patterns" mode, so skip to next one */_getNextAfterPatterns() : "patterns", true);
    }
    else if (this._mode == "patterns") {
      this.setMode(_getNextAfterPatterns(), true);
    }
    else {
      // Mode is set to a specific proxy for all URLs
      var p = _getNextInCycle(this._mode);
      this.setMode(p?p.id:"disabled", true);
    }
    function _getNextInCycle(start) {
      for (var p=gFP.proxies.getNextById(start); p && !p.includeInCycle; p = gFP.proxies.getNextById(p.id));
      return p;
    }
    function _getNextAfterPatterns() {
      var p = gFP.proxies.item(0);
      (!p || !p.enabled || !p.includeInCycle) && (p = _getNextInCycle(gFP.proxies.item(0).id));
      return p?p.id:"disabled";
    }
  },

  toggleFilter : function(enabled) {
    var ps = CC["@mozilla.org/network/protocol-proxy-service;1"]
      .getService(CI.nsIProtocolProxyService);
    ps.unregisterFilter(this); // safety - always remove first
    enabled && ps.registerFilter(this, 0);
  },

  mp : null,

  applyFilter : function(ps, uri, proxy) {
    var spec = "";
    try {
      var s = uri.scheme;
      // feed schemes handled internally by browser. ignore Mcafee site advisor
      // http://web.archive.org/web/20110625145438/http://foxyproxy.mozdev.org/
      // drupal/content/foxyproxy-latest-mcafee-site-advisor
      if (s == "feed" || s == "sacore" || s == "dssrequest") return;
      spec = uri.spec;
      var previousProxy = this.mp ? this.mp.proxy : null;
      this.mp = this.applyMode(spec);
      var ret = this.mp.proxy.getProxy(spec, uri.host, this.mp);
      if (ret) {
        this.handleCacheAndCookies(this.mp.proxy, previousProxy);
        return ret;
      }
      return this._err(spec, this.getMessage("route.error"));
    }
    catch (e) {
      dump("applyFilter: " + e + "\n" + e.stack + "\nwith url " + uri.spec + "\n");
      return this._err(spec, this.getMessage("route.exception", [""]),
        this.getMessage("route.exception", [": " + e]));
    }
    finally {
      // Our custom return value is a string in Gecko > 17 indicating that we
      // queue the request. Thus, we only add it to the log tab if it is really
      // issued now (i.e. we got no string in return). 
      if (typeof ret != "string") {
        gObsSvc.notifyObservers(this.mp.proxy, "foxyproxy-throb", null);
        this.logg.add(this.mp);
      }
    }
  },

  _err : function(spec, info, extInfo) {
    var def = this.proxies.item(this.proxies.length-1);
    this.mp = gLoggEntryFactory(def, null, spec, "err", extInfo?extInfo:info);
    // We don't have a logging tab in FoxyProxy Basic. Thus we don't show the
    // advice to look there for further information in that case.
    let message = this.isFoxyProxySimple() ? "" : this.getMessage("see.log");
    this.notifier.alert(info, message);
    // Failsafe: use lastresort proxy if nothing else was chosen
    return def;
  },

  getPrefsService : function(str) {
    return CC["@mozilla.org/preferences-service;1"].
      getService(CI.nsIPrefService).getBranch(str);
  },

  clearSettingsPref : function(p) {
    p = p || this.getPrefsService("extensions.foxyproxy.");
    if (p.prefHasUserValue("settings"))
      p.clearUserPref("settings");
  },

  /**
   * Prior to 2.8.11, the settings filepath was stored as an absolute path in FF preferences.
   * Look for that abs filepath and get rid of it if necessary (unless the abs filepath is
   * somewhere other than the default location (the profile dir + "foxyproxy.xml")
   */
  migrateSettingsURI : function() {
    try {
      var p = this.getPrefsService("extensions.foxyproxy.");
      var o = p.getCharPref("settings");
      if (this.isDefaultSettingsURI(o)) {
        // Remove the pref since we don't use it anymore
        // unless it points outside the profile
        this.clearSettingsPref(p);
      }
    }
    catch(e) {}
  },

  isDefaultSettingsURI : function(o) {
    return o == this.PFF || this.transformer(o, CI.nsIFile).equals(this.getDefaultPath());
  },

  usingDefaultSettingsURI : function(p) {
    try {
      p = p || this.getPrefsService("extensions.foxyproxy.");
      var v = p.getCharPref("settings");
      // The very presence of this pref means we're not using the default.
      if (v) return false;
    }
    catch(e) {}
    return true;
  },

  // Returns settings URI in desired form. Creates the file if it doesn't exist.
  getSettingsURI : function(type) {
    try {
      var o = this.getPrefsService("extensions.foxyproxy.").getCharPref("settings");
    }
    catch(e) {}
    if (!o)
      o = this.getDefaultPath();
    var file = this.transformer(o, CI.nsIFile);
    // Does it exist?
    if (!file.exists())
      // We are calling this method directly as we do not want to write the
      // settings in a separate thread due to race conditions.
      this.writeSettings(file);
    return (typeof(type) == "object" && "equals" in type && type.equals(CI.nsIFile)) ? file : this.transformer(o, type);
  },

  setSettingsURI : function(o) {
    if (this.isDefaultSettingsURI(o)) {
      // Remove the pref (if it exists) since it should only be present for non-default settings URIs
      this.clearSettingsPref();
      return;
    }
    var o2 = this.transformer(o, "uri-string");
    try {
      // We want to have a synchronous writing of the settings here as we want
      // to update the settings pref only if it succeeded.
      this.writeSettings(o2);
      // Only update the preference if writeSettings() succeeded
      this.getPrefsService("extensions.foxyproxy.").setCharPref("settings", o2);
    }
    catch(e) {
      this.alert(this, this.getMessage("error") + ":\n\n" + e);
    }
  },

  alert : function(wnd, str) {
    CC["@mozilla.org/embedcomp/prompt-service;1"].getService(CI.nsIPromptService)
      .alert(null, /*this.getMessage("foxyproxy")*/ "FoxyProxy", str); /* FoxyProxy isn't localized here so we can show errors early during startup if necessary */
  },

  getDefaultPath : function() {
    /* Always use ProfD by default in order to support application-wide installations.
       http://foxyproxy.mozdev.org/drupal/content/tries-use-usrlibfirefox-304foxyproxyxml-linux#comment-974 */
    let dir = CC["@mozilla.org/file/directory_service;1"].getService(CI.nsIProperties).get("ProfD", CI.nsILocalFile);
    dir.appendRelativePath("foxyproxy.xml");
    return dir;
  },

  // Convert |o| from:
  // - string of the form c:\path\eric.txt
  // - string of the form file:///c:/path/eric.txt
  // - nsIFile
  // - nsIURI
  // - null: implies use of PFF
  // to any of the other three types. Valid values for |desiredType|:
  // - "uri-string"
  // - "file-string"
  // - Components.interfaces.nsIFile
  // - Components.interfaces.nsIURI
  transformer : function(o, desiredType) {
    o == this.PFF && (o = this.getDefaultPath());
    const handler = CC["@mozilla.org/network/io-service;1"].
              getService(CI.nsIIOService).getProtocolHandler("file").
              QueryInterface(CI.nsIFileProtocolHandler);
    switch(desiredType) {
      case "uri-string":
        switch(typeof(o)) {
          case "string":
            if (o.indexOf("://" > -1)) return o;
            return handler.getURLSpecFromFile(this.createFile(o));
          case "object":
            if (o instanceof CI.nsIFile) return handler.getURLSpecFromFile(o);
            if (o instanceof CI.nsIURI) return o.spec;
            return null; // unknown type
        }
      case "file-string":
        switch(typeof(o)) {
          case "string":
            if (o.indexOf("://" > -1)) return handler.getFileFromURLSpec(o).path;
            return o;
          case "object":
            if (o instanceof CI.nsIFile) return o.path;
            if (o instanceof CI.nsIURI) return handler.getFileFromURLSpec(o.spec).path;
            return null; // unknown type
        }
      case CI.nsIFile:
        switch(typeof(o)) {
          case "string":
            if (o.indexOf("://" > -1)) return handler.getFileFromURLSpec(o);
              return this.createFile(o).path;
          case "object":
            if (o instanceof CI.nsIFile) return o;
            if (o instanceof CI.nsIURI) return handler.getFileFromURLSpec(o.spec);
            return null; // unknown type
        }
      case CI.nsIURI:
        var ios = CC["@mozilla.org/network/io-service;1"].getService(CI.nsIIOService);
        switch(typeof(o)) {
          case "string":
            if (o.indexOf("://" > -1)) return ios.newURI(o, null, null);
            return handler.newFileURI(this.createFile(o));
          case "object":
            if (o instanceof CI.nsIFile) return handler.newFileURI(o);
            if (o instanceof CI.nsIURI) return o;
            return null; // unknown type
        }
    }
  },

  // Create nsIFile from a string
  createFile : function(str) {
    var f = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile);
    f.initWithPath(str);
    return f;
  },

  writeSettingsAsync : function(o) {
    // As we often call writeSettings (for instance it can happen several times
    // if we change the proxy mode in the options dialog) it is important to
    // have just a single timer responsible for writing the settings and cancel
    // an already scheduled one. 20 ms delay should be enough to get all timer
    // intialization cancelled before the actual writing happens.
    // Obviously, that does not hold for the last call to writeSettingsAsync()
    // in a series of such calls. Thus, the settings get written only once
    // instead of several times as intended.
    this.writeSettingsTimer.cancel();
    let writeSettingsThread = {
      notify: function() {
        that.writeSettings(o);
      }
    };
    // try {
      // dump("*** writeSettings\n");
      // throw new Error("e");
    // }
    // catch (e) {catch (e) {dump("*** " + e + " \n\n\n");
    // dump ("\n" + e.stack + "\n");} }
    let that = this;
    this.writeSettingsTimer.initWithCallback(writeSettingsThread, 20,
      CI.nsITimer.TYPE_ONE_SHOT);
  },

  writeSettings : function(o) {
    try {
      let o2 = o ? gFP.transformer(o, CI.nsIFile) :
        gFP.getSettingsURI(CI.nsIFile);
      let foStream = CC["@mozilla.org/network/file-output-stream;1"].
        createInstance(CI.nsIFileOutputStream);
      // write, create, truncate
      // Octal values (as 0664) are deprecated; "-1" does the job here as well.
      foStream.init(o2, 0x02 | 0x08 | 0x20, -1, 0);
      foStream.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n", 39);
      CC["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(CI.
        nsIDOMSerializer).serializeToStream(gFP.toDOM(), foStream, "UTF-8");
      foStream.close();
    } catch(ex) {
      dumpp(ex);
      this.alert(null, this.getMessage("settings.error.3",
        o instanceof CI.nsIFile ? [o.path] : [o]));
    }
  },

  get resetIconColors() { return this._resetIconColors; },
  set resetIconColors(p) {
    this._resetIconColors = p;
    this.writeSettingsAsync();
  },

  get useStatusBarPrefix() { return this._useStatusBarPrefix; },
  set useStatusBarPrefix(p) {
    this._useStatusBarPrefix = p;
    this.writeSettingsAsync();
  },

  get selectedTabIndex() { return this._selectedTabIndex; },
  set selectedTabIndex(i) {
    this._selectedTabIndex = i;
    this.writeSettingsAsync();
  },

  get logging() { return this.logg.enabled; },
  set logging(e) {
    this.logg.enabled = e;
    this.writeSettingsAsync();
  },

  get toolbarIcon() { return this._toolbarIcon; },
  set toolbarIcon(e) {
    this._toolbarIcon = e;
    gBroadcast(e, "foxyproxy-toolbarIcon");
    this.writeSettingsAsync();
  },

  get toolsMenu() { return this._toolsMenu; },
  set toolsMenu(e) {
    this._toolsMenu = e;
    gBroadcast(e, "foxyproxy-toolsmenu");
    this.writeSettingsAsync();
  },

  get contextMenu() { return this._contextMenu; },
  set contextMenu(e) {
    this._contextMenu = e;
    gBroadcast(e, "foxyproxy-contextmenu");
    this.writeSettingsAsync();
  },

  get advancedMenus() { return this._advancedMenus; },
  set advancedMenus(i) {
    this._advancedMenus = i;
    this.writeSettingsAsync();
  },

  get previousMode() { return this._previousMode; },
  set previousMode(p) {
    this._previousMode = p;
    this.writeSettingsAsync();
  },

  get proxyForVersionCheck() { return this._proxyForVersionCheck; },
  set proxyForVersionCheck(p) {
    this._proxyForVersionCheck = p;
    this.writeSettingsAsync();
  },

  isSelected : function(p) {
    if (this._selectedProxy) {
      return p.id === this._selectedProxy.id;
    } else {
      return false;
    }
  },

  /**
   * Return a LoggEntry instance.
   */
  applyMode : function(spec) {
    var loggEntry;
    switch (this.mode) {
      case "random":
        //loggEntry = this.proxies.getRandom(spec, this.random._includeDirect, this.random._includeDisabled);
        // break;
      case "patterns":
        loggEntry = this.proxies.getMatches(null, spec);
        break;
      case "roundrobin":
        break;
      default:
        loggEntry = gLoggEntryFactory(this._selectedProxy, null, spec, "ded");
        break;
    }
    return loggEntry;
  },

  restart : function() {
    CC["@mozilla.org/toolkit/app-startup;1"].getService(CI.nsIAppStartup)
      .quit(CI.nsIAppStartup.eForceQuit|CI.nsIAppStartup.eRestart);
  },

  fromDOM : function(doc, node) {
    this.statusbar.fromDOM(doc);
    this.toolbar.fromDOM(doc);
    this.logg.fromDOM(doc);
    this._toolbarIcon = gGetSafeAttrB(node, "toolbaricon", true); // new for 3.2
    this._toolsMenu = gGetSafeAttrB(node, "toolsMenu", true); // new for 2.0
    this._contextMenu = gGetSafeAttrB(node, "contextMenu", true); // new for 2.0
    this._advancedMenus = gGetSafeAttrB(node, "advancedMenus", false); // new for 2.3--default to false if it doesn't exist
    this._selectedTabIndex = gGetSafeAttr(node, "selectedTabIndex", "0");
    if (this._selectedTabIndex > 1 && this.isFoxyProxySimple())
      this._selectedTabIndex = 0;  /* FoxyProxy Simple has just two tabs */
    var mode = node.hasAttribute("enabledState") ?
      (node.getAttribute("enabledState") == "" ? "disabled" : node.getAttribute("enabledState")) :
      node.getAttribute("mode"); // renamed to mode in 2.0
    if (mode == "patterns" && this.isFoxyProxySimple())
      mode = "disabled"; /* FoxyProxy Simple has no "patterns" mode */
    this._previousMode = gGetSafeAttr(node, "previousMode", this.isFoxyProxySimple() ? "disabled" : "patterns");
    this._resetIconColors = gGetSafeAttrB(node, "resetIconColors", true); // new for 2.10
    this._useStatusBarPrefix = gGetSafeAttrB(node, "useStatusBarPrefix", true); // new for 2.10
    this.excludePatternsFromCycling = gGetSafeAttrB(node, "excludePatternsFromCycling", false);
    this.excludeDisabledFromCycling = gGetSafeAttrB(node, "excludeDisabledFromCycling", false);
    this.ignoreProxyScheme = gGetSafeAttrB(node, "ignoreProxyScheme", false);
    // We'd like to delegate the reading of apiDisabled to api.js, but that
    // requires the api to expose a fromDOM() method, or similar, to the
    // general public (the wrappedJSObject trick does not work for api.js
    // because it exposes a real interface). Exposing fromDOM() to webpages is
    // not something we should do since it is really an internal function.
    // Therefore, foxyproxy.js reads it. If we start reading a lot of state for
    // the API, we should create an API object within foxyproxy.js to handle it.
    this.apiDisabled = gGetSafeAttrB(node, "apiDisabled", false);
    this.proxies.fromDOM(mode, doc);
    // Note: This sets the default proxy only if a user upgraded from a former
    // FoxyProxy version, not if she is just installed it and started it for the
    // first time. The reason: |toDOM| writes the |proxyForVersionCheck|
    // property with its default value to disc before this |fromDOM| is called
    // if started for the fist time resultung in a node with |""| as value. We
    // cope with that later during start-up to avoid an additional performance
    // hit (see: |defaultToolbarIconFF4()| in overlay.js).
    this._proxyForVersionCheck = gGetSafeAttr(node, "proxyForVersionCheck",
      this.proxies.lastresort.id);
    // We need to populate the warnings before calling setMode() as we check
    // for the patternModeCookieWarning if we are in pattern mode.
    this.warnings.fromDOM(doc);
    this.setMode(mode, false, true);
    this.random.fromDOM(doc);
    this.quickadd.fromDOM(doc); // KEEP THIS BEFORE this.autoadd.fromDOM() else fromDOM() is overwritten!?
    this.autoadd.fromDOM(doc);
    this.defaultPrefs.fromDOM(doc);
  },

  toDOM : function() {
    var doc = CC["@mozilla.org/xml/xml-document;1"].createInstance(CI.nsIDOMDocument);
    var e = doc.createElement("foxyproxy");
    e.setAttribute("mode", this._mode);
    e.setAttribute("selectedTabIndex", this._selectedTabIndex);
    e.setAttribute("toolbaricon", this._toolbarIcon);
    e.setAttribute("toolsMenu", this._toolsMenu);
    e.setAttribute("contextMenu", this._contextMenu);
    e.setAttribute("advancedMenus", this._advancedMenus);
    e.setAttribute("previousMode", this._previousMode);
    e.setAttribute("resetIconColors", this._resetIconColors);
    e.setAttribute("useStatusBarPrefix", this._useStatusBarPrefix);
    e.setAttribute("excludePatternsFromCycling", this.excludePatternsFromCycling);
    e.setAttribute("excludeDisabledFromCycling", this.excludeDisabledFromCycling);
    e.setAttribute("ignoreProxyScheme", this.ignoreProxyScheme);
    // We'd like to delegate the writing of apiDisabled to api.js, but that
    // requires the api to expose a toDOM() method, or similar, to the general
    // public (the wrappedJSObject trick does not work for api.js because it
    // exposes a real interface). Exposing fromDOM() to webpages is not
    // something we should do since it is really an internal function.
    // Therefore, foxyproxy.js writes it. If we start writing a lot of state for
    // the API, we should create an API object within foxyproxy.js to handle it.
    try {
    e.setAttribute("apiDisabled", CC["@leahscape.org/foxyproxy/api;1"].
      getService().apiDisabled);
    }
    catch(e) {
      dumpp(e);
    }
    e.setAttribute("proxyForVersionCheck", this._proxyForVersionCheck);
    e.appendChild(this.random.toDOM(doc));
    e.appendChild(this.statusbar.toDOM(doc));
    e.appendChild(this.toolbar.toDOM(doc));
    e.appendChild(this.logg.toDOM(doc));
    e.appendChild(this.warnings.toDOM(doc));
    e.appendChild(this.autoadd.toDOM(doc));
    e.appendChild(this.quickadd.toDOM(doc));
    e.appendChild(this.defaultPrefs.toDOM(doc));
    e.appendChild(this.proxies.toDOM(doc));
    return e;
  },

  ///////////////// random \\\\\\\\\\\\\\\\\\\\\\

  random : {
    _includeDirect : false,
    _includeDisabled : false,

    get includeeDirect() { return this._includeDirect; },
    set includeeDirect(e) {
      this._includeDirect = e;
      gFP.writeSettingsAsync();
    },

    get includeDisabled() { return this._includeDisabled; },
    set includeDisabled(e) {
      this._includeDisabled = e;
      gFP.writeSettingsAsync();
    },

    toDOM : function(doc) {
      var e = doc.createElement("random");
      e.setAttribute("includeDirect", this._includeDirect);
      e.setAttribute("includeDisabled", this._includeDisabled);
      return e;
    },

    fromDOM : function(doc) {
      var n = doc.getElementsByTagName("random").item(0);
      this._includeDirect = gGetSafeAttrB(n, "includeDirect", false);
      this._includeDisabled = gGetSafeAttrB(n, "includeDisabled", false);
    }
  },

  ///////////////// proxies \\\\\\\\\\\\\\\\\\\\\\

  proxies : {
    list : [],
    lastresort : null,
    push : function(p) {
      // not really a push: this inserts p
      // as the second-to-last item in the list
      if (this.list.length == 0)
        this.list[0] = p;
      else {
        var len = this.list.length-1;
        this.list[len+1] = this.list[len];
        this.list[len] = p;
      }
      return true;
    },

    /**
     * Prevent inserts beyond the last item since
     * the last item must always remain our |lastResort|.
     * 
     * idx: "last", "first" (same as 0), "random", or an integer between 0 (inclusive) and this.length()-1 (inclusive)
     *      if null, "first" is assumed.
     * p: the proxy to insert at position |idx|
     */
    insertAt : function(idx, p) {
      // Is idx a word or a number?
      if (!isNaN(parseInt(idx))) {
        // Number - a specific position was specified
        idx = parseInt(idx);
        if (idx < 0 || idx > this.list.length-1) return false; /* Prevent inserts at or after lastResort */
        if (this.list.length == 0) // Shouldn't really ever happen since we'll always have a lastResort
          this.list[0] = p;
        else {
          // Shift everyone to the right by one (up to, but not including, the proxy at idx)
          for (var i=this.list.length; i>idx; i--) {
            this.list[i] = this.list[i-1]
          }
          this.list[i] = p; // now i == idx, so insert our newbie there
        }
      }
      else {
        // idx is a word
        switch (idx) {
          case "random": this.insertAt(Math.floor(Math.random()*this.list.length) /* does not include this.list.length in possible outcome */, p); break; /* thanks Andrew @ http://www.shawnolson.net/a/789/ */
          case "last": this.push(p); break;
          case "first": /* Deliberate fall-through */
          default: this.insertAt(this.list.length-1, p); break;
        }
      }
      return true;
    },

    get length() {
      return this.list.length;
    },

    getProxyById : function(id) {
      var a = this.list.filter(function(e) {return e.id == this;}, id);
      // We are getting an array back at any rate. Thus checking |a| alone is
      // not enough to be sure that we may return an |a[0]|.
      if (a && a[0]) {
        return a[0];
      }
      return null;
    },

    requiresRemoteDNSLookups : function() {
      return this.list.some(function(e) {return e.shouldDisableDNSPrefetch();});
    },

    getProxiesFromId : function(aIdArray) {
      let proxyArray = [];
      for (let i = 0; i < aIdArray.length; i++) {
        let proxy = this.getProxyById(aIdArray[i]);
        if (proxy) {
          proxyArray.push(proxy);
        }
      }
      return proxyArray;
    },

    /**
     * Returns the first existing proxy with the given name or null
     * if none found.
     */
    getProxyByName : function(name) {
      var a = this.list.filter(function(e) {return e.name == this;}, name);
      return a?a[0]:null;
    },

    getIndexById : function(id) {
      var len=this.length;
      for (var i=0; i<len; i++) {
        if (this.list[i].id == id) return i;
      }
      return -1;
    },

    /**
     *  Returns the index of the first proxy with |name| or -1 if none exists with that name
     */
    getIndexByName : function(name) {
      for (var i=0, len=this.length; i<len; i++) {
        if (this.list[i].name == name) return i;
      }
      return -1;
    },

    /**
     * Merges the first existing proxy with |proxy|. Searches by name.
     * |nameValuePairs| is an associative array of the properties to
     * update in the existing proxy.
     * Returns null or the proxy which was affected (merged with |proxy|).
     */
    mergeByName : function(proxy, nameValuePairs) {
      var idx = this.getIndexByName(proxy.name);
      if (idx > -1) {
        this.list[idx].merge(proxy, nameValuePairs);
        return this.list[idx];
      }
      return null;
    },

    /**
     * Deletes the first proxy with the specified |name|, or none if there are
     * no proxies with the specified |name|. Returns the affected index or -1.
     * 
     * If |all| is true, all proxies with the specified |name| are deleted, and
     * an array of the deleted indices is returned.
     */
    deleteByName : function(name, all) {
      if (all) {
        var ret = [], idx = -1;
        while ((idx = this.getIndexByName(name)) > -1) {
          ret.push(idx);
          this.remove(idx);
        }
        return ret;
      }
      else {
        var idx = this.getIndexByName(name);
        if (idx > -1) {
          this.remove(idx);
          return idx;
        }
      }
    },

    deleteAll : function() {
      this.list.length = 0;
      this.lastresort = null;
    },

    fromDOM : function(mode, doc) {
      var last = null;
      for (var i=0,proxyElems=doc.getElementsByTagName("proxy"); i<proxyElems.length; i++) {
        var n = proxyElems.item(i);
        n.QueryInterface(CI.nsIDOMElement);
        var p = new Proxy(gFP);
        p.fromDOM(n, mode);
        if (!last && n.getAttribute("lastresort") == "true")
          last = p; // Save for later so we can enforce it's last in the list
        else
          this.list.push(p); // Note: Using native push, not this.push()
      }
      if (last) {
        this.list.push(last); // ensures it really IS last
        !last.enabled && (last.enabled = true);    // ensure it is enabled
      }
      else {
        last = new Proxy(gFP);
        last.name = gFP.getMessage("proxy.default");
        last.notes = gFP.isFoxyProxySimple() ? "" : gFP.getMessage("proxy.default.notes");
        last.mode = "direct";
        last.lastresort = true;
        var match = new Match();
        match.name = gFP.getMessage("proxy.default.match.name");
        match.pattern = "*";
        last.matches.push(match);
        last.selectedTabIndex = 0;
        last.animatedIcons = false;
        this.list.push(last); // ensures it really IS last
        gFP.writeSettingsAsync();
      }
      this.lastresort = last;
    },

    toDOM : function(doc) {
      var proxiesElem=doc.createElement("proxies");
      for (var i=0; i<this.list.length; i++) {
        proxiesElem.appendChild(this.list[i].toDOM(doc));
      }
      return proxiesElem;
    },

    item : function(i) {
      return this.list[i];
    },

    remove : function(idx) {
      this.maintainIntegrity(this.list[idx], true, false, false);
      for (var i=0, temp=[]; i<this.list.length; i++) {
        if (i == idx) {
          // cancel any refresh timers 
          if (this.list[i].mode === "auto") {
            if (this.list[i].autoconfMode === "pac") {
              this.list[i].autoconf.cancelTimer();
            } else if (this.list[i].autoconfMode === "wpad") {
              this.list[i].wpad.cancelTimer();
            }
          }
        }
        else
          temp[temp.length] = this.list[i];
      }
      this.list = []; // this.list.splice(0, this.length);
      for (var i=0; i<temp.length; i++) {
        this.list.push(temp[i]);
      }
    },

    /** better name: swap() */
    move : function(idx, direction) {
      var newIdx = idx + (direction=="up"?-1:1);
      if (newIdx < 0 || newIdx > this.list.length-1) return false;
      var temp = this.list[idx];
      this.list[idx] = this.list[newIdx];
      this.list[newIdx] = temp;
      return true;
    },

    getMatches : function(patStr, uriStr) {
      for (var i=0, aMatch; i<this.list.length; i++) {
        if (this.list[i]._enabled && (aMatch = this.list[i].isWhiteMatch(patStr, uriStr))) {
          return gLoggEntryFactory(this.list[i], aMatch, uriStr, "pat");
        }
      }
      // Failsafe: use lastresort proxy if nothing else was chosen
      return gLoggEntryFactory(this.lastresort, this.lastresort.matches[0], uriStr, "pat");
    },

    getRandom : function(uriStr, includeDirect, includeDisabled) {
      var isDirect = true, isDisabled = true, r, cont, maxTries = this.list.length*10;
      do {
        r = Math.floor(Math.random()*this.list.length); // Thanks Andrew @ http://www.shawnolson.net/a/789/
        // dump(r+"\n");
        cont = (!includeDirect && this.list[r].mode == "direct") ||
          (!includeDisabled && !this.list[r]._enabled);
         // dump("cont="+cont+"\n");
      } while (cont && (--maxTries > 0));
      if (maxTries == 0) {
        return this.lastresort;
      }
      return gLoggEntryFactory(this.list[r], null, uriStr, "rand");
    },

    getNextById : function(curId) {
      var idx = this.getIndexById(curId);
      if (idx==-1) return null;
      for (var i=idx+1,len=this.length; i<len; i++) {
        if (this.list[i]._enabled) {
          return this.list[i];
        }
      }
      return null; // at end; do not wrap.
    },

    uniqueRandom : function() {
      var unique = true, r;
      do {
        r = Math.floor(Math.random()*4294967296); // Thanks Andrew @ http://www.shawnolson.net/a/789/
        for (var i=0; i<this.list.length && unique; i++)
          this.list[i].id == r && (unique = false);
      } while (!unique);
      return r;
    },

    maintainIntegrity : function(proxy, isBeingDeleted, isBeingDisabled, isBecomingDIRECT) {
      var updateViews;
      // Handle foxyproxy "mode"
      if (isBeingDeleted || isBeingDisabled) {
        if (gFP._mode == proxy.id) {
          // Mode is set to "Use proxy ABC for all URLs" and ABC is being deleted/disabled
          gFP.setMode("disabled", true);
          updateViews = true;
        }
      }
      if (isBeingDeleted) {
        // If the proxy set for "previousMode" is being deleted, change "previousMode"
        if (gFP.previousMode == proxy.id)
          gFP.previousMode = gFP.isFoxyProxySimple() ? "disabled" : "patterns";
      }

      // Handle AutoAdd & QuickAdd (superadd)
      if (gFP.autoadd.maintainIntegrity(proxy.id, isBeingDeleted) && !updateViews) {
        updateViews = true;
      }
      if (gFP.quickadd.maintainIntegrity(proxy.id, isBeingDeleted) && !updateViews) {
        updateViews = true;
      }

      // updateViews() with false, false (do not write settings and do not update log view--settings were just written when the properties themselves were updated
      updateViews && gBroadcast(null, "foxyproxy-updateviews");
    }
  },

  ///////////////// logg \\\\\\\\\\\\\\\\\\\\\\\\\\\
  logg : {
    owner : null,
    _maxSize : 500,
    _elements : new Array(this._maxSize),
    _end : 0,
    _start : 0,
    _full : false,
    enabled : false,
    _templateHeader : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n<html xmlns=\"http://www.w3.org/1999/xhtml\"><head><title></title><link rel=\"icon\" href=\"http://getfoxyproxy.org/favicon.ico\"/><link rel=\"shortcut icon\" href=\"http://getfoxyproxy.org/favicon.ico\"/><link rel=\"stylesheet\" href=\"http://getfoxyproxy.org/styles/log.css\" type=\"text/css\"/></head><body><table class=\"log-table\"><thead><tr><td class=\"heading\">${timestamp-heading}</td><td class=\"heading\">${url-heading}</td><td class=\"heading\">${proxy-name-heading}</td><td class=\"heading\">${proxy-notes-heading}</td><td class=\"heading\">${pattern-name-heading}</td><td class=\"heading\">${pattern-heading}</td><td class=\"heading\">${pattern-case-heading}</td><td class=\"heading\">${pattern-type-heading}</td><td class=\"heading\">${pattern-color-heading}</td><td class=\"heading\">${pac-result-heading}</td><td class=\"heading\">${error-msg-heading}</td></tr></thead><tfoot><tr><td/></tr></tfoot><tbody>",
    _templateFooter : "</tbody></table></body></html>",
    _templateRow : "<tr><td class=\"timestamp\">${timestamp}</td><td class=\"url\"><a href=\"${url}\">${url}</a></td><td class=\"proxy-name\">${proxy-name}</td><td class=\"proxy-notes\">${proxy-notes}</td><td class=\"pattern-name\">${pattern-name}</td><td class=\"pattern\">${pattern}</td><td class=\"pattern-case\">${pattern-case}</td><td class=\"pattern-type\">${pattern-type}</td><td class=\"pattern-color\">${pattern-color}</td><td class=\"pac-result\">${pac-result}</td><td class=\"error-msg\">${error-msg}</td></tr>",
    _timeformat : null,
    _months : null,
    _days : null,
    _noURLs : false,
    noURLsMessage : null,

    fromDOM : function(doc) {
      // init some vars first
      this._timeformat = gFP.getMessage("timeformat");
      this.noURLsMessage = gFP.getMessage("log.nourls.url");
      this._months = [gFP.getMessage("months.long.1"), gFP.getMessage("months.long.2"),
        gFP.getMessage("months.long.3"), gFP.getMessage("months.long.4"), gFP.getMessage("months.long.5"),
        gFP.getMessage("months.long.6"), gFP.getMessage("months.long.7"), gFP.getMessage("months.long.8"),
        gFP.getMessage("months.long.9"), gFP.getMessage("months.long.10"), gFP.getMessage("months.long.11"),
        gFP.getMessage("months.long.12")];
      this._days = [gFP.getMessage("days.long.1"), gFP.getMessage("days.long.2"),
        gFP.getMessage("days.long.3"), gFP.getMessage("days.long.4"), gFP.getMessage("days.long.5"),
        gFP.getMessage("days.long.6"), gFP.getMessage("days.long.7")];

      // Now deserialize
      var n = doc.getElementsByTagName("logg").item(0);
      this.enabled = gGetSafeAttrB(n, "enabled", false);
      this._maxSize = gGetSafeAttr(n, "maxSize", 500);
      this._templateHeader = gGetSafeAttr(n, "header-v2", this._templateHeader);
      this._templateFooter = gGetSafeAttr(n, "footer-v2", this._templateFooter);
      this._templateRow = gGetSafeAttr(n, "row-v2", this._templateRow);
      this._noURLs = gGetSafeAttrB(n, "noURLs", false);
      this.clear();
    },

    toDOM : function(doc) {
      var e = doc.createElement("logg");
      e.setAttribute("enabled", this.enabled);
      e.setAttribute("maxSize", this._maxSize);
      e.setAttribute("noURLs", this._noURLs);
      e.setAttribute("header", this._templateHeader);
      e.setAttribute("row", this._templateRow);
      e.setAttribute("footer", this._templateFooter);
      return e;
    },

    toHTML : function() {
      // Doing the heading substitution here (over and over again instead of once in fromDOM()) permits users to switch locales w/o having to restart FF and
      // the changes take effect immediately in FoxyProxy.
      var self = this, sz = this.length, ret = this._templateHeader.replace(/\${timestamp-heading}|\${url-heading}|\${proxy-name-heading}|\${proxy-notes-heading}|\${pattern-name-heading}|\${pattern-heading}|\${pattern-case-heading}|\${pattern-type-heading}|\${pattern-color-heading}|\${pac-result-heading}|\${error-msg-heading}/gi,
        function($0) {
          switch($0) {
            case "${timestamp-heading}": return gFP.getMessage("foxyproxy.tab.logging.timestamp.label");
            case "${url-heading}": return gFP.getMessage("foxyproxy.tab.logging.url.label");
            case "${proxy-name-heading}": return gFP.getMessage("foxyproxy.proxy.name.label");
            case "${proxy-notes-heading}": return gFP.getMessage("foxyproxy.proxy.notes.label");
            case "${pattern-name-heading}": return gFP.getMessage("foxyproxy.pattern.name.label");
            case "${pattern-heading}": return gFP.getMessage("foxyproxy.pattern.label");
            case "${pattern-case-heading}": return gFP.getMessage("foxyproxy.casesensitive.label");
            case "${pattern-type-heading}": return gFP.getMessage("foxyproxy.pattern.type.label");
            case "${pattern-color-heading}": return gFP.getMessage("foxyproxy.whitelist.blacklist.label");
            case "${pac-result-heading}": return gFP.getMessage("foxyproxy.pac.result.label");
            case "${error-msg-heading}": return gFP.getMessage("foxyproxy.error.msg.label");
          }
        }
      );
      function _xmlEncode(str) {
        return str.replace(/\<|\>|\&|\'|\"/g,
          function($0) {
            switch($0) {
              case "<": return "&lt;";
              case ">": return "&gt;";
              case "&": return "&amp;";
              case "'": return "&apos;";
              case "\"": return "&quot;";
            }
          }
        );
      };
      for (var i=0; i<sz; i++) {
        ret += self._templateRow.replace(/\${timestamp}|\${url}|\${proxy-name}|\${proxy-notes}|\${pattern-name}|\${pattern}|\${pattern-case}|\${pattern-type}|\${pattern-color}|\${pac-result}|\${error-msg}/gi,
          function($0) {
            switch($0) {
              case "${timestamp}": return _xmlEncode(self.format(self.item(i).timestamp));
              case "${url}": return _xmlEncode(self.item(i).uri);
              case "${proxy-name}": return _xmlEncode(self.item(i).proxyName);
              case "${proxy-notes}": return _xmlEncode(self.item(i).proxyNotes);
              case "${pattern-name}": return _xmlEncode(self.item(i).matchName);
              case "${pattern}": return _xmlEncode(self.item(i).matchPattern);
                            case "${pattern-case}": return _xmlEncode(self.item(i).caseSensitive);
              case "${pattern-type}": return _xmlEncode(self.item(i).matchType);
              case "${pattern-color}": return _xmlEncode(self.item(i).whiteBlack);
              case "${pac-result}": return _xmlEncode(self.item(i).pacResult);
              case "${error-msg}": return _xmlEncode(self.item(i).errMsg);
            }
          }
        );
      }
      return ret + this._templateFooter;
    },

    // Thanks for the inspiration, Tor2k (http://www.codeproject.com/jscript/dateformat.asp)
    format : function(d) {
      d = new Date(d);
      if (!d.valueOf())
        return ' ';
      var self = this;
      return this._timeformat.replace(/yyyy|mmmm|mmm|mm|dddd|ddd|dd|hh|HH|nn|ss|zzz|a\/p/gi,
        function($1) {
          switch ($1) {
            case 'yyyy': return d.getFullYear();
            case 'mmmm': return self._months[d.getMonth()];
            case 'mmm':  return self._months[d.getMonth()].substr(0, 3);
            case 'mm':   return zf((d.getMonth() + 1), 2);
            case 'dddd': return self._days[d.getDay()];
            case 'ddd':  return self._days[d.getDay()].substr(0, 3);
            case 'dd':   return zf(d.getDate(), 2);
            case 'hh':   return zf(((h = d.getHours() % 12) ? h : 12), 2);
            case 'HH':   return zf(d.getHours(), 2);
            case 'nn':   return zf(d.getMinutes(), 2);
            case 'ss':   return zf(d.getSeconds(), 2);
            case 'zzz':  return zf(d.getMilliseconds(), 3);
            case 'a/p':  return d.getHours() < 12 ? 'AM' : 'PM';
          }
        }
      );
      // My own zero-fill fcn, not Tor 2k's. Assumes (n==2 || n == 3) && c<=n.
      function zf(c, n) { c=""+c; return c.length == 1 ? (n==2?'0'+c:'00'+c) : (c.length == 2 ? (n==2?c:'0'+c) : c); }
    },

    get length() {
      var size = 0;
      if (this._end < this._start) {
          size = this._maxSize - this._start + this._end;
      } else if (this._end == this._start) {
         size = (this._full ? this._maxSize : 0);
      } else {
          size = this._end - this._start;
      }
      return size;
    },

    get maxSize() {
      return this._maxSize;
    },

    set maxSize(m) {
      this._maxSize = m;
      this.clear();
      gFP.writeSettingsAsync();
    },

    get noURLs() {
      return this._noURLs;
    },

    set noURLs(m) {
      this._noURLs = m;
      gFP.writeSettingsAsync();
    },

    get templateHeader() {
      return this._templateHeader;
    },

    set templateHeader(t) {
      this._templateHeader = t;
      gFP.writeSettingsAsync();
    },

    get templateFooter() {
      return this._templateFooter;
    },

    set templateFooter(t) {
      this._templateFooter = t;
      gFP.writeSettingsAsync();
    },

    get templateRow() {
      return this._templateRow;
    },

    set templateRow(t) {
      this._templateRow = t;
      gFP.writeSettingsAsync();
    },

    clear : function() {
      this._full = false;
      this._end = this._start = 0;
      //this._elements.forEach(function(element, index, array) {array[index] = null;});
      this._elements = new Array(this._maxSize);
    },

    scrub : function() {
      // Remove sensitive data (urls)
      var self=this;
      this._elements.forEach(function(element, index, array) {array[index].uri = self.noURLsMessage;});
    },

    add : function(o) {
      if (!this.enabled) return;
      this.length == this._maxSize && this._remove();
      this._elements[this._end++] = o;
      this._end >= this._maxSize && (this._end = 0);
      this._end == this._start && (this._full = true);
    },

    item : function(idx) {
      return this.length == 0 ? null : this._elements[idx];
    },

    /**
     * Removes the first item from the array; like pop but doesn't return the popped value.
     */
    _remove : function() {
      if (this.length == 0)
        return;
      var element = this._elements[this._start];

      if (element) {
        this._elements[this._start++] = null;
        this._start >= this._maxSize && (this._start = 0);
        this._full = false;
      }
    },

    /** |delete| is a JS keyword so we use |del|
     * |indices| should be an array of 0-indexed indices to remove
     */
    del : function(indices) {
      for (var i=0; i<indices.length; i++) {
        var idx = indices[i];
        // Is index out-of-bounds?
        if (idx < 0 || idx >= this.length) continue;
        this._elements.splice(idx, 1);
        this._end--;
        this._full = false
      }
    }
  },

  // /////////////// notifier \\\\\\\\\\\\\\\\\\\\\\\\\\\
  // Thanks for the inspiration: InfoRSS extension (Didier Ernotte, 2005)
  notifier : {
    _queue : [],
    alerts : function() {
      try {
        return CC["@mozilla.org/alerts-service;1"].getService(CI.
          nsIAlertsService);
      } catch(e) {
        return null;
      }
    }(),

    alert : function(title, text, noQueue) {
      if (!title) title = gFP.getMessage("foxyproxy");
      if (this.alerts) {
        // With all the checks to ensure we don't use nsIAlertsService on
        // unsupported platforms, it would appear it can still happen
        // (http://foxyproxy.mozdev.org/drupal/content/component-returned-
        // failure-code-error-firefox-launch). So we use a try/catch just in
        // case.
        try {
          this.alerts.showAlertNotification("chrome://foxyproxy/content/" +
            "images/foxyproxy-nocopy.gif", title, text, true, "", {observe:
            function() {/*no-op; just permits the window to close sooner*/}},
            "FoxyProxy");
        } catch(e) {
           // now future notifications are now automatically displayed with
           // simpleNotify()
          this.alerts = null;
          simpleNotify(this);
        }
      } else {
        simpleNotify(this);
      }

      function simpleNotify(self) {
        (!self.timer && (self.timer = CC["@mozilla.org/timer;1"].
                         createInstance(CI.nsITimer)));
        self.timer.cancel();
        let win = gFP.fpc.getMostRecentWindow();
        try {
          let doc = win.parent.document;
          self.tooltip = doc.getElementById("foxyproxy-popup");
          self._removeChildren(self.tooltip);
          let grid = doc.createElement("grid");
          grid.setAttribute("flex", "1");
          self.tooltip.appendChild(grid);

          let columns = doc.createElement("columns");
          columns.appendChild(doc.createElement("column"));
          grid.appendChild(columns);

           let rows = doc.createElement("rows");
           grid.appendChild(rows);
           self._makeHeaderRow(doc, title, rows);
           self._makeRow(doc, "", rows);
           self._makeRow(doc, text, rows);
           self.tooltip.showPopup(doc.getElementById("status-bar"), -1, -1,
             "tooltip", "topright","bottomright");
           self.timer.initWithCallback(self, 5000, CI.nsITimer.TYPE_ONE_SHOT);
        } catch (e) {
          // In case win, win.parent, win.parent.document, tooltip, etc. don't
          // exist...
          dump("Window not available for user message: " + text + "\n");
          if (!noQueue) {
            dump("Queuing message\n");
            self._queue.push({text:text, title:title});
          }
        }
      }
    },

    emptyQueue : function() {
      for (var i=0,sz=this._queue.length; i<sz; i++) {
        var msg = this._queue.pop();
        this.alert(msg.title, msg.text, true);
      }
    },

    notify : function() {
      this.tooltip.hidePopup();
    },

    _makeHeaderRow : function(doc, col, gridRows) {
      var label = doc.createElement("label");
      label.setAttribute("value", col);
      label.setAttribute("style",
        "font-weight: bold; text-decoration: underline; color: blue;");
      gridRows.appendChild(label);
    },

    _makeRow : function(doc, col1, gridRows) {
      var gridRow = doc.createElement("row");
      var label = doc.createElement("label");
      label.setAttribute("value", col1);
      gridRow.appendChild(label);
      gridRows.appendChild(gridRow);
    },

    _removeChildren : function(node) {
      if (node && node.firstChild) {
        node.removeChild(node.firstChild);
        this._removeChildren(node);
      }
    }
  },

  // /////////////// statusbar \\\\\\\\\\\\\\\\\\\\\
  statusbar : {
    _iconEnabled : true,
    _textEnabled : false,
    _leftClick : "options",
    _middleClick : "cycle",
    _rightClick : "contextmenu",
    _width : 0,

    toDOM : function(doc) {
      var e = doc.createElement("statusbar");
      e.setAttribute("icon", this._iconEnabled); // new for 2.3 (used to be just "enabled")
      e.setAttribute("text", this._textEnabled); // new for 2.3 (used to be just "enabled")
      e.setAttribute("left", this._leftClick); // new for 2.5
      e.setAttribute("middle", this._middleClick); // new for 2.5
      e.setAttribute("right", this._rightClick); // new for 2.5
      e.setAttribute("width", this._width); // new for 2.6.3
      return e;
    },

    fromDOM : function(doc) {
      var n = doc.getElementsByTagName("statusbar").item(0);
      this._iconEnabled = gGetSafeAttrB(n, "icon", true);
      this._textEnabled = gGetSafeAttrB(n, "text", true);
      this._leftClick = gGetSafeAttr(n, "left", "options");
      this._middleClick = gGetSafeAttr(n, "middle", "cycle");
      this._rightClick = gGetSafeAttr(n, "right", "contextmenu");
      this._width = gGetSafeAttr(n, "width", 0);
    },

    get iconEnabled() { return this._iconEnabled; },
    set iconEnabled(e) {
      this._iconEnabled = e;
      gFP.writeSettingsAsync();
      gBroadcast(e, "foxyproxy-statusbar-icon");
      e && gFP.setMode(gFP.mode, false, false); // todo: why is this here? can it be removed? it forces PAC to reload
    },

    get textEnabled() { return this._textEnabled; },
    set textEnabled(e) {
      this._textEnabled = e;
      gFP.writeSettingsAsync();
      gBroadcast(e, "foxyproxy-statusbar-text");
      e && gFP.setMode(gFP.mode, false, false);  // todo: why is this here? can it be removed? it forces PAC to reload
    },

    get leftClick() { return this._leftClick; },
    set leftClick(e) {
      this._leftClick = e;
      gFP.writeSettingsAsync();
    },

    get middleClick() { return this._middleClick; },
    set middleClick(e) {
      this._middleClick = e;
      gFP.writeSettingsAsync();
    },

    get rightClick() { return this._rightClick; },
    set rightClick(e) {
      this._rightClick = e;
      gFP.writeSettingsAsync();
    },

    get width() { return this._width; },
    set width(e) {
      e = parseInt(e);
      if (isNaN(e)) e = 0;
      this._width = e;
      gFP.writeSettingsAsync();
      gBroadcast(e, "foxyproxy-statusbar-width");
    }
  },

  // /////////////// toolbar \\\\\\\\\\\\\\\\\\\\\
  toolbar : {
    _leftClick : "options",
    _middleClick : "cycle",
    _rightClick : "contextmenu",

    toDOM : function(doc) {
      var e = doc.createElement("toolbar");
      e.setAttribute("left", this._leftClick); // new for 2.5
      e.setAttribute("middle", this._middleClick); // new for 2.5
      e.setAttribute("right", this._rightClick); // new for 2.5
      return e;
    },

    fromDOM : function(doc) {
      var n = doc.getElementsByTagName("toolbar").item(0);
      this._leftClick = gGetSafeAttr(n, "left", "options");
      this._middleClick = gGetSafeAttr(n, "middle", "cycle");
      this._rightClick = gGetSafeAttr(n, "right", "contextmenu");
    },

    get leftClick() { return this._leftClick; },
    set leftClick(e) {
      this._leftClick = e;
      gFP.writeSettingsAsync();
    },

    get middleClick() { return this._middleClick; },
    set middleClick(e) {
      this._middleClick = e;
      gFP.writeSettingsAsync();
    },

    get rightClick() { return this._rightClick; },
    set rightClick(e) {
      this._rightClick = e;
      gFP.writeSettingsAsync();
    }
  },

  // /////////////// strings \\\\\\\\\\\\\\\\\\\\\
  getMessage : function(msg, ar) {
    try {
      return this.strings.getMessage(msg, ar);
    }
    catch (e) {
      dumpp(e);
      this.alert(null, "Error reading string resource: " + msg); // Do not localize!
    }
  },

  strings : {
    _sbs : CC["@mozilla.org/intl/stringbundle;1"]
      .getService(CI.nsIStringBundleService)
      .createBundle("chrome://foxyproxy/locale/foxyproxy.properties"),
    _entities : null,

    getMessage : function(msg, ar) {
      if (ar)
        return this._sbs.formatStringFromName(msg, ar, ar.length)
      else {
        try {
          return this._sbs.GetStringFromName(msg);
        }
        catch (e) {
          return this._entities[msg];
        }
      }
    },

    load : function() {
      if (!this._entities) {
        this._entities = [];
        var req = CC["@mozilla.org/xmlextras/xmlhttprequest;1"].
          createInstance(CI.nsIXMLHttpRequest);
        req.open("GET", "chrome://foxyproxy/content/strings.xml", false);
        req.send(null);
        for (var i=0,e=req.responseXML.getElementsByTagName("i18n"); i<e.length; i++)  {
          var attrs = e.item(i).attributes;
          this._entities[attrs.getNamedItem("id").value] = attrs.getNamedItem("value").value;
        }
      }
    }
  },

  warnings : {
    // XXX Why is this not just an object?
    _warnings : [],

    /**
     * Displays a message to the user with "No" and "Yes" buttons
     * and a "Do not display the message again" checkbox. The latter is
     * maintained internally. Function returns false if user clicks "No", true
     * if "Yes".
     *
     * If no message is to be displayed because the user previously disabled
     * them, true is returned.
     *
     * First arg is the owning/parent window. Second arg is an array whose
     * first element is the key of the message to display. Subsequent array
     * args are substitution parameters for the message key, if any.
     *
     * Third arg is the name under which to store whether or not this |msg|
     * should be displayed in the future.
     *
     * The fourth argument indicates whether "No" should be selected by
     * default.
     */
    showWarningIfDesired : function(win, msg, name, noDefault) {
      if (this._warnings[name] == undefined || this._warnings[name]) {
        let l10nMessage = gFP.getMessage(msg[0], msg.slice(1)),
          cb = {}, prompts = CC["@mozilla.org/embedcomp/prompt-service;1"].
          getService(CI.nsIPromptService);
        let flags = prompts.BUTTON_TITLE_IS_STRING * prompts.BUTTON_POS_0 +
          prompts.BUTTON_TITLE_IS_STRING * prompts.BUTTON_POS_1;
        if (noDefault) {
          flags = flags + prompts.BUTTON_POS_1_DEFAULT;
        }
        // 0 means the "Yes" button got clicked
        let ret = prompts.confirmEx(win, gFP.getMessage("foxyproxy"),
                                    l10nMessage, flags, gFP.getMessage("yes"),
                                    gFP.getMessage("no"), null,
                                    gFP.getMessage("message.stop"), cb) === 0;
        // Note: We save the inverse of user's selection because the way the
        // question is phrased.
        this._warnings[name] = !cb.value;
        gFP.writeSettingsAsync();
        return ret;
      }
      return true;
    },

    /* return true or false based on whether or not we should show the |name|d warning */
    getWarning : function(name) {
      if (this._warnings[name] == undefined || this._warnings[name])
        return true;
      return false;
    },

    /* sets the |name|d warning to never show again */
    setWarning : function(name, bool) {
      this._warnings[name] = bool;
      gFP.writeSettingsAsync();
    },

    toDOM : function(doc) {
      var e = doc.createElement("warnings");
      for (var i in this._warnings)
        e.setAttribute(i, this._warnings[i]);
      return e;
    },

    fromDOM : function(doc) {
      var n = doc.getElementsByTagName("warnings").item(0);
      let name;
      for (var i=0,sz=n.attributes.length; i<sz; i++) {
        name = n.attributes[i].name;
        // The name of the warning changed in FP Standard 4.0
        if (name === "noneEncodingWarning") {
          name = "patternEncodingWarning";
        }
        this._warnings[name] = n.attributes[i].value == "true";
      }
    }
  },

  isFoxyProxySimple : function() {
    /*! begin-foxyproxy-simple
    return true;
    end-foxyproxy-simple !*/

    /*! begin-foxyproxy-standard !*/
    return false
    /*! end-foxyproxy-standard !*/
  },

  classID: Components.ID("{46466e13-16ab-4565-9924-20aac4d98c82}"),
  contractID: "@leahscape.org/foxyproxy/service;1",
  classDescription: "FoxyProxy Core",
  QueryInterface: XPCOMUtils.generateQI([CI.nsISupports, CI.nsIObserver]),
  _xpcom_categories: /* this var for for pre gecko-2.0 */ [{category:"profile-after-change", entry:"foxyproxy_catobserver"}],
  _xpcom_factory: {
    singleton: null,
    createInstance: function (aOuter, aIID) {
      if (aOuter) throw CR.NS_ERROR_NO_AGGREGATION;
      if (!this.singleton) this.singleton = new foxyproxy();
      return this.singleton.QueryInterface(aIID);
    }
  }
};

// /////////////////////////// LoggEntry class ///////////////////////
function LoggEntry(proxy, aMatch, uriStr, type, errMsg) {
    this.timestamp = Date.now();
    this.uri = uriStr;
    this.proxy = proxy;
    // Make local copy so logg history doesn't change if user changes proxy
    this.proxyName = proxy.name;
    // See last comment
    this.proxyNotes = proxy.notes;
    if (type == "pat") {
      // See last comment
      this.matchName = aMatch.name;
      // See last comment
      this.matchPattern = aMatch.pattern;
      this.matchType = aMatch.isRegEx ? this.regExMsg : this.wcMsg;
      // See last comment
      this.whiteBlack = aMatch.isBlackList ? this.blackMsg : this.whiteMsg;
      // See last comment
      this.caseSensitive = aMatch.caseSensitive ? this.yes : this.no;
    }
    else if (type == "ded") {
      this.caseSensitive = this.whiteBlack = this.matchName =
        this.matchPattern = this.matchType = this.allMsg;
    }
    else if (type == "rand") {
      this.matchName = this.matchPattern = this.matchType =
        this.whiteBlack = this.randomMsg;
    }
    else if (type == "round") {
    }
    else if (type == "err") {
      this.errMsg = errMsg;
      this.caseSensitive = this.whiteBlack = this.matchName =
        this.matchPattern = this.matchType = "";
    }
    this.colorString = proxy.colorString;
};

LoggEntry.prototype = {
  errMsg : "", // Default value for MPs which don't have errors
  pacResult : "", // Default value for MPs which don't have PAC results (i.e., they probably don't use PACs or the PAC returned null
  init : function() { /* one-time init to get localized msgs */
    this.randomMsg = gFP.getMessage("proxy.random");
    this.allMsg = gFP.getMessage("proxy.all.urls");
    this.regExMsg = gFP.getMessage("regex");
    this.wcMsg = gFP.getMessage("wildcards");
    this.blackMsg = gFP.getMessage("blacklist");
    this.whiteMsg = gFP.getMessage("whitelist");
    this.yes = gFP.getMessage("yes");
    this.no = gFP.getMessage("no");
  }
};

/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4)
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 and earlier (Firefox 3.6)
 */
if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([foxyproxy]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([foxyproxy]);
