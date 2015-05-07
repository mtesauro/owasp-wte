/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

/**

This is the super class for AutoAdd and QuickAdd classes.

AutoAdd and QuickAdd both have their own instance of a Match object in their ._match property. It is used for storing a template
of the Match object to be added to a proxy dynamically:
  .name - User-supplied name of the pattern. "Dynamic QuickAdd/AutoAdd Pattern" by default
  .pattern - A string template, applied to the URL at the time of addition of a dynamic Match object to the SuperAdd object.
    It is *://${3}${6}/* by default.
  .caseSensitive - whether or not the expanded (post-applyTemplate()) .pattern should be compared to URLs case-sensitively
  .temp - not used; SuperAdd.temp is used instead since match.temp isn't serialized/deserialized to/from DOM
  .type - whether or not the expanded (post-applyTemplate()) .pattern is black or white list
  .isRegExp - whether or not the expanded (post-applyTemplate()) .pattern is a regexp or a wildcard pattern
  .enabled - always true. doesn't make sense to dynamically add a disabled pattern.
  .isMultiLine - whether or not .pattern should be searched single or multiline.

blockedPageMatch - a Match object specific to AutoAdd only. Only four of the properties are relavent:
  .pattern - A string wildcard or regexp expression of the pattern that marks a page as blocked.
    *Corporate policy prevents access* by default.
  .caseSensitive - whether or not .pattern should be tested against input pages case-sensitively.
  .isRegExp - whether or not .pattern is a regexp or a wildcard pattern
  .isMultiLine - whether or not .pattern should be tested against single or multi-line. Always true in this context.
  .name, .enabled, .temp, .isBlackList - not used in this context
*/
//dump("superadd.js\n");
const DEF_PATTERN = "*://${3}${6}/*";
function SuperAdd(mName) {
  this._match = new Match();
  this._match.init({enabled: true, name: mName, pattern: DEF_PATTERN});
  this._match.clone = function() {
    // does a clone of this._match and copies this.temp into the cloned object
    var ret = Match.prototype.clone.apply(this, arguments); // call super
    ret.temp = this.temp;
    return ret;
  };
  //try {
    //this.fpc = CC["@leahscape.org/foxyproxy/common;1"].getService().wrappedJSObject;
  //}
  //catch (e) { /* Firefox Portable 3.0 & FF 4.0b3 throws the above statement. We use setFPC() below. */ }
}

function QuickAdd(mName) {
  SuperAdd.apply(this, arguments);
  this.notificationTitle = "foxyproxy.quickadd.label";
  this.elemName = "quickadd";
  this.elemNameCamelCase = "QuickAdd";
  this.setFPC();
}

function AutoAdd(mName) {
  SuperAdd.apply(this, arguments);
  this._blockedPageMatch = new Match();
  this._blockedPageMatch.init({enabled: true, name: "", pattern:
    this.fp.getMessage("not.authorized"), isMultiLine: true});
  this.notificationTitle = "foxyproxy.tab.autoadd.label";
  this.elemName = "autoadd";
  this.elemNameCamelCase = "AutoAdd";
  // Override the setter for this.blockedPageMatch.pattern to change empty and null
  // patterns to the default pattern
  this._blockedPageMatch.__defineSetter__("pattern", function(p) {
    if (!p) p = ""; // prevent null patterns
    this._pattern = p.replace(/^\s*|\s*$/g,""); // trim
    if (this._pattern == "")
      this._pattern = this.fp.getMessage("not.authorized");
    this.buildRegEx();
  });
  // Strangely, if we override the setter with __defineSetter__, the getter is reset.
  // So we have to forcefully set it again...
  this._blockedPageMatch.__defineGetter__("pattern", function() { return this._pattern; });
  this.setFPC();
}

// The super class definition
SuperAdd.prototype = {
  fp : null,
  _reload : true,
  _enabled : false,
  _temp : false, // new for 2.8. Whether or not the expanded (post-applyTemplate()) .pattern is permanent or temporary.
  _proxy : null,
  _notify : true,
  _notifyWhenCanceled : true, // TODO: AutoAdd doesn't use; only QuickAdd, so make don't put it on the super class
  _prompt : true,
  _match : null,
  fpc : null,

  _formatConverter : CC["@mozilla.org/widget/htmlformatconverter;1"].createInstance(CI.nsIFormatConverter),

  setFPC : function() {
    // For Portable Firefox 3.0 && FF4.0b3, which has problems setting this.fpc in SuperAdd() ctor.
    this.fpc = CC["@leahscape.org/foxyproxy/common;1"].getService().wrappedJSObject;
  },

  get enabled() { return this._enabled; },
  set enabled(e) {
    this._enabled = e;
    this.fp.writeSettingsAsync();
    this.elemName == "autoadd" && gBroadcast(e, "foxyproxy-autoadd-toggle");
  },

  get temp() { return this._temp; },
  set temp(t) {
    this._temp = t;
    this.fp.writeSettingsAsync();
  },

  get reload() { return this._reload; },
  set reload(e) {
    this._reload = e;
    this.fp.writeSettingsAsync();
  },

  get proxy() { return this._proxy; },
  set proxy(p) {
    this._proxy = p;
    this.fp.writeSettingsAsync();
  },

  set proxyById(id) {
    // Call |set proxy(p) {}|
    this.proxy = this.fp.proxies.getProxyById(id);
  },

  get notify() { return this._notify; },
  set notify(n) {
    this._notify = n;
    this.fp.writeSettingsAsync();
  },

  get notifyWhenCanceled() { return this._notifyWhenCanceled; },
  set notifyWhenCanceled(n) {
    this._notifyWhenCanceled = n;
    this.fp.writeSettingsAsync();
  },

  get prompt() { return this._prompt; },
  set prompt(n) {
    this._prompt = n;
    this.fp.writeSettingsAsync();
  },

  get match() {
    return this._match.clone();
  },

  set match(m) {
    this._match.name = m.name;
    this._match.pattern = m.pattern;
    this._match.isRegEx = m.isRegEx;
    this._match.caseSensitive = m.caseSensitive;
    this._match.isBlackList = m.isBlackList;
    this._match.isMultiLine = m.isMultiLine;
    // Note: we're not copying m.temp, m.enabled and m.fromSubscription.
    // SuperAdd.match acts as a template for creating Match objects through
    // QuickAdd/AutoAdd. SuperAdd match objects are never temporary or from a
    // subscription; temp value is stored in SuperAdd.temp instead because
    // Superadd._match.temp must be false else it isn't written to disk. Also,
    // SuperAdd.match objects are always enabled (doesn't make sense to add a
    // disabled Match).
    this._temp = m.temp; /* save to this.temp instead; see notes above as to why */
    this._match.buildRegEx();
    this.fp.writeSettingsAsync();
  },

  /**
   * Update the list of menuitems in |menu|
   */
  updateProxyMenu : function(menu, doc) {
    if (!this._enabled) return;
    var popup=menu.firstChild;
    this.fpc.removeChildren(popup);
    for (var i=0,p; i<this.fp.proxies.length && ((p=this.fp.proxies.item(i)) || 1); i++) {
      if (!p.lastresort && p.enabled) {
        popup.appendChild(this.fpc.createMenuItem({idVal:p.id, labelVal:p.name, name:"foxyproxy-enabled-type",
          document:doc}));
        //popup.appendChild(this.fpc.createMenuItem({idVal:"disabled", labelId:"mode.disabled.label"}));
      }
    }
    // Select the appropriate one or, if none was previously selected, select
    // the first or show a disabled note if there is not valid proxy left.
    let dialogType = "";
    if (menu.id.indexOf("autoAdd") === 0) {
      dialogType = this.fp.getMessage("foxyproxy.autoadd.label");
    } else if (menu.id.indexOf("quickAdd") === 0) {
      dialogType = this.fp.getMessage("foxyproxy.quickadd.label"); 
    }
    if (this._proxy ) {
      menu.value = this.proxy.id;
      if (menu.selectedIndex == -1) {
        if (popup.firstChild) {
          this.proxyById = menu.value = popup.firstChild.id;
        } else {
            this.fp.alert(null, this.fp.getMessage("superadd.disabled",
              [dialogType])); 
        }
      }
    }
    else {
      if (popup.firstChild) {
        this.proxyById = menu.value = popup.firstChild.id;
      } 
    }
  },

  getPatternFromTemplate : function(window, url) {
    var ret;
    if (this._prompt) {
      ret = this.fpc.onSuperAdd(window, url, this); // prompt user for edits first
      // if !ret then the user canceled the SuperAdd dlg
    }
    else {
      ret = this.match.clone();
      ret.pattern = this.fpc.applyTemplate(url, ret.pattern, ret.caseSensitive);
      ret.temp = this.temp; /* the cloned match object doesn't clone temp because it's not deserialized from disk while this.temp is */
    }
    return ret;
  },

 /**
   * todo: define this fcn only for autoadd
   */
  onAutoAdd : function(window, doc) {
    var url = doc.location.href;
    if (this._match.pattern != "") {
      // Does this URL already match an existing pattern for a proxy?
      var p = this.fp.proxies.getMatches(this._match.pattern, url).proxy;
      if (p.lastresort) { // no current proxies match (except the lastresort, which matches everything anyway)
        var n, treeWalker = doc.createTreeWalker(doc.documentElement,
          4, {acceptNode: function() {return 1;}}, false);
        while ((n = treeWalker.nextNode())) {
          if (this._blockedPageMatch.regex.test(n.nodeValue)) {
            var match = this.getPatternFromTemplate(window, url);
            if (match) {
              // Check for duplicates and exclusions due to black lists
              var m = match.isBlackList ? this.proxy.isBlackMatch(match.pattern, url) : this.proxy.isWhiteMatch(match.pattern, url);
              if (m) {
                // Resist the temptation to inform the user. Does he really care if autoadd was canceled? Interferes with surfing UX.
              }
              else
                this.addPattern(match, doc.location);
            }
            break;
          }
        }
      }
    }
    function stripTags(txt) {
      var oldStr = CC["@mozilla.org/supports-string;1"].createInstance(CI.nsISupportsString);
      oldStr.data = txt;
      var newStr = {value: null};
      try {
          this._formatConverter.convert("text/html", oldStr, oldStr.toString().length,
            "text/unicode", newStr, {});
          return newStr.value.QueryInterface(CI.nsISupportsString).toString();
      }
      catch (e) {
        return oldStr.toString();
      }
    }
  },

  /**
   * todo: define this fcn only for quickadd
   */
  onQuickAdd : function(window, doc) {
    var url = doc.location.href;
    var match = this.getPatternFromTemplate(window, url);
    if (match) {
      // Check for duplicates and exclusions due to black lists
      var m = match.isBlackList ? this.proxy.isBlackMatch(match.pattern, url) : this.proxy.isWhiteMatch(match.pattern, url);
      if (m) {
        this._notifyWhenCanceled &&
          this.fp.notifier.alert(this.fp.getMessage("foxyproxy.quickadd.label"),
            this.fp.getMessage("quickadd.quickadd.canceled", [m.name, this._proxy.name]));
      }
      else
        this.addPattern(match, doc.location);
    }
  },

  /**
   * Push a Match object onto our proxy's match list.
   * Reload the location if necessary.
   */
  addPattern : function(m, loc) {
    this._proxy.matches.push(m);
    this.fp.writeSettingsAsync();
    this._notify && this.fp.notifier.alert(this.fp.getMessage(this.notificationTitle),
      fp.getMessage("superadd.url.added", [m.pattern, this._proxy.name]));
    this._reload && loc.reload(); // reload page. TODO: don't call onAutoAdd() on the reloaded page!
  },

  allowed : function() {
    for (var i=0,p; i<this.fp.proxies.length && (p = this.fp.proxies.item(i)); i++)
      if (p.enabled && !p.lastresort)
        return true;
    return false;
  },

  // Disable superadd if our proxy is being deleted/disabled
  maintainIntegrity : function(proxyId, isBeingDeleted) {
    if (this._proxy && this._proxy.id == proxyId) {
      // Turn it off
      this.enabled && (this.enabled = false);
      if (isBeingDeleted) {
        // Clear it
        this.proxy = null;
      }
      return true;
    }
    return false;
  },

  toDOM : function(doc) {
    var e = doc.createElement(this.elemName);
    e.setAttribute("enabled", this._enabled);
    e.setAttribute("temp", this._temp);
    e.setAttribute("reload", this._reload);
    e.setAttribute("notify", this._notify);
    e.setAttribute("notifyWhenCanceled", this._notifyWhenCanceled);
    e.setAttribute("prompt", this._prompt);
    this._proxy && e.setAttribute("proxy-id", this._proxy.id);
    e.appendChild(this._match.toDOM(doc));
    return e;
  },

  fromDOM : function(doc) {
    var n = doc.getElementsByTagName(this.elemName).item(0);
    this._enabled = gGetSafeAttrB(n, "enabled", false);
    this._temp = gGetSafeAttrB(n, "temp", false);
    this._reload = gGetSafeAttrB(n, "reload", true);
    this._notify = gGetSafeAttrB(n, "notify", true);
    this._notifyWhenCanceled = gGetSafeAttrB(n, "notifyWhenCanceled", true);
    this._prompt = gGetSafeAttrB(n, "prompt", true);
    var proxyId = gGetSafeAttr(n, "proxy-id", null);
    if (n) {
      this._match.fromDOM(n.getElementsByTagName("match").item(0));
      var urlTemplate = gGetSafeAttr(n, "urlTemplate");
      if (urlTemplate) // upgrade from 2.7.5 to 2.8+
        this._match.pattern = urlTemplate;
    }
    this._match.isMultiLine = false;
    var error;
    if (proxyId) {
      // Ensure the proxy still  exists
      this._proxy = this.fp.proxies.getProxyById(proxyId);
      this._enabled && (!this._proxy || !this._proxy.enabled) && (error = true);
    }
    else if (this._enabled)
      error = true;
    if (error) {
      this._enabled = false;
      this.fp.alert(null, this.fp.getMessage("superadd.error", [this.elemName]));
    }
  }
};
// Next two lines must come *after* SuperAdd.prototype definition.
// TODO: Use inheritence approach described at http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Guide:Inheritance instead
QuickAdd.prototype = new SuperAdd();
AutoAdd.prototype = new SuperAdd();
AutoAdd.prototype.__defineGetter__("blockedPageMatch", function() { return this._blockedPageMatch; });
AutoAdd.prototype.__defineSetter__("blockedPageMatch", function(m) {
  this._blockedPageMatch = m;
  this.fp.writeSettingsAsync();
});
AutoAdd.prototype.toDOM = function(doc) {
  var e = SuperAdd.prototype.toDOM.apply(this, arguments);
  e.appendChild(this._blockedPageMatch.toDOM(doc));
  return e;
};
AutoAdd.prototype.fromDOM = function(doc) {
  SuperAdd.prototype.fromDOM.apply(this, arguments);

  var n = doc.getElementsByTagName("autoadd")[0];
  if (n) {
    n = n.getElementsByTagName("match")[1] // 0-indexed, so this is the 2nd node
  }
  if (n) {
    try {
      this._blockedPageMatch.fromDOM(n);
    }
    catch (e) {dump(e+"\n");}
  }
  else {
    dump("Cannot find autoadd/match[1] node.\n");
  }
   
  // Note XPath expression array index is 1-based
  /*var n = getBlockedPageMatch("foxyproxy/autoadd/match[2]");
  if (n) {
    try {
      this._blockedPageMatch.fromDOM(n);
    }
    catch (e) {dump(e+"\n");}
  }
  else
    this._blockedPageMatch.fromDOM(getBlockedPageMatch("foxyproxy/autoadd/match[1]"));

  function getBlockedPageMatch(exp) {
    // doc.createNSResolver(doc) fails on FF2 (not FF3), so we use an instance of nsIDOMXPathEvaluator instead
    // of the next line
    // var n = doc.evaluate(exp, doc, doc.createNSResolver(doc), doc.ANY_TYPE, null).iterateNext();

    // new XPathEvaluator() is not yet available; must go through XPCOM
    var xpe = CC["@mozilla.org/dom/xpath-evaluator;1"].getService(CI.nsIDOMXPathEvaluator);
    // FF 2.0.0.14: iterateNext is not a function
    var n = xpe.evaluate(exp, doc, xpe.createNSResolver(doc), xpe.FIRST_ORDERED_NODE_TYPE, null);
    n.QueryInterface(CI.nsIDOMXPathResult); // not necessary in FF3, only 2.x and possibly earlier
    return n.iterateNext();
  }*/
};
