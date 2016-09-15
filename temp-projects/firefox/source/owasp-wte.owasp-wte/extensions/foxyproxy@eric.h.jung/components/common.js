/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/
// common fcns used throughout foxyproxy, exposed a an xpcom service

const CI = Components.interfaces;
const CC = Components.classes;
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

var fp;

function Common() {
  this.wrappedJSObject = this;
  fp = CC["@leahscape.org/foxyproxy/service;1"].getService().wrappedJSObject;
  this.appInfo = CC["@mozilla.org/xre/app-info;1"].getService(CI.nsIXULAppInfo);
  this.xulRuntime = CC["@mozilla.org/xre/app-info;1"].getService(CI.
    nsIXULRuntime);
  this.vc = CC["@mozilla.org/xpcom/version-comparator;1"].getService(CI.
    nsIVersionComparator);
  // We need that to handle bug 769764 properly.
  fp.isGecko17 = this.vc.compare(this.appInfo.platformVersion, "18.0a1") < 0;
  // We only need to add the foxyproxy service to our wrapper if we are about
  // to is it. But that only happens on Gecko >= 18. Adding it in older versions
  // may result in serious bugs (reproducible on Win7 with Firefox 3.6.28).
  if (!fp.isGecko17) {
    // Making this service available to our protocol proxy service wrapper.
    CC["@mozilla.org/network/protocol-proxy-service;1"].getService().
      wrappedJSObject.fp = fp;
  }
  let uuid = fp.isFoxyProxySimple() ? "foxyproxy-basic@eric.h.jung" : "foxyproxy@eric.h.jung";
  // Get installed version
  if ("@mozilla.org/extensions/manager;1" in CC) {
    // Pre-Gecko 2.0
    this.version = CC["@mozilla.org/extensions/manager;1"]
      .getService(CI.nsIExtensionManager)
      .getItemForID(uuid)
      .version || "0.0";
  }
  else {
    // Post-Gecko 2.0
    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    var self = this;
    AddonManager.getAddonByID(uuid, function(addon) {self.version = addon.version;});
  }
}

Common.prototype = {
  QueryInterface: XPCOMUtils.generateQI([CI.nsISupports]),
  _ios : CC["@mozilla.org/network/io-service;1"].getService(CI.nsIIOService),
  version : null,

  // Application-independent version of getMostRecentWindow()
  getMostRecentWindow : function(wm) {
    var tmp = wm || CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.nsIWindowMediator);
    return tmp.getMostRecentWindow("navigator:browser") || tmp.getMostRecentWindow("Songbird:Main") || tmp.getMostRecentWindow("mail:3pane");
  },

  // Application-independent version of getEnumerator()
  getEnumerator : function() {
    var wm = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.nsIWindowMediator);
    // The next line always returns an object, even if the enum has no elements, so we can't use it to determine between applications
    //var e = wm.getEnumerator("navigator:browser") || wm.getEnumerator("Songbird:Main")
    return wm.getMostRecentWindow("navigator:browser") ? wm.getEnumerator("navigator:browser") : (wm.getMostRecentWindow("Songbird:Main") ? wm.getEnumerator("Songbird:Main") : wm.getEnumerator("mail:3pane"));
  },

  openAndReuseOneTabPerURL : function(aURL) {
    var winEnum = this.getEnumerator();
    while (winEnum.hasMoreElements()) {
      var win = winEnum.getNext();
      var browser = win.getBrowser();
      for (var i = 0; i < browser.mTabs.length; i++) {
        if (aURL == browser.getBrowserForTab(browser.mTabs[i]).currentURI.spec) {
          win.focus(); // bring wnd to the foreground
          browser.selectedTab = browser.mTabs[i];
          return;
        }
      }
    }
    // Our URL isn't open. Open it now.
    this.openTab(aURL);
  },

  openTab : function(aURL) {
    var w = this.getMostRecentWindow();
    var event = { notify: function(timer) {w.gBrowser.selectedTab = w.gBrowser.addTab(aURL, null, null, null);} }

    if (w) {
      // Note: Since TB doesn't support tabs and trunk isn't the same
      // Use an existing browser window
      if(w.messenger) // Thunderbird
        w.messenger.launchExternalURL(aURL);
      else if (!w.delayedOpenTab) /* SongBird, etc. */ {
        //setTimeout(function(aTabElt) { w.gBrowser.selectedTab = aTabElt; }, 0, w.gBrowser.addTab(aURL, null, null, null));
        var t = CC["@mozilla.org/timer;1"].createInstance(CI.nsITimer);
        t.initWithCallback(event, 10, CI.nsITimer.TYPE_ONE_SHOT);
      }
      else // FF, SM, Flock, etc.
        w.delayedOpenTab(aURL, null, null, null, null);
      w.focus();
    }
  },

  validatePattern : function(win, isRegEx, p) {
    var origPat = p;
    p = p.replace(/^\s*|\s*$/g,"");
    if (p == "") {
      fp.alert(win, fp.getMessage("pattern.required"));
      return false;
    }
    if (isRegEx) {
      try {
        new RegExp(p);
      }
      catch(e) {
        fp.alert(win, fp.getMessage("pattern.invalid.regex", [origPat]));
        return false;
      }
    }
    else if (p.indexOf("*") == -1 && p.indexOf("?") == -1 && !fp.warnings.
             showWarningIfDesired(win, ["no.wildcard.characters", p],
             "wildcards", true))
      return false;
    // Check for parenthesis without backslash
    if (new RegExp("[^\\\\]\\(|[^\\\\]\\)", "g").test(p) && !fp.warnings.
        showWarningIfDesired(win, ["no.parentheses3"], "parentheses", true)) {
      return false;
    }
    return p;
  },

  removeChildren : function(node) {
    while (node.hasChildNodes())
      node.removeChild(node.firstChild);
  },

  createMenuItem : function(args) {
    var doc = args.document || document;
    var e = doc.createElement("menuitem");
    e.setAttribute("id", args["idVal"]);
    e.setAttribute("label", args["labelId"]?fp.getMessage(args["labelId"], args["labelArgs"]) : args["labelVal"]);
    e.setAttribute("value", args["idVal"]);
    if (args["type"])
      e.setAttribute("type", args["type"]);
    if (args["name"])
      e.setAttribute("name", args["name"]);
    if (args["class"])
      e.setAttribute("class", args["class"]);
    if (args["style"])
      e.setAttribute("style", args["style"]);
    return e;
  },

  getVersion : function() {
    return this.version;
  },

  applyTemplate : function(url, strTemplate, caseSensitive) {
    var flags = caseSensitive ? "gi" : "g";
    try {
      var parsedUrl = this._ios.newURI(url, "UTF-8", null).QueryInterface(CI.nsIURL);
      var ret = strTemplate.replace("${0}", parsedUrl.scheme?parsedUrl.scheme:"", flags);
      ret = ret.replace("${1}", parsedUrl.username?parsedUrl.username:"", flags);
      ret = ret.replace("${2}", parsedUrl.password?parsedUrl.password:"", flags);
      ret = ret.replace("${3}", parsedUrl.userPass?(parsedUrl.userPass+"@"):"", flags);
      ret = ret.replace("${4}", parsedUrl.host?parsedUrl.host:"", flags);
      ret = ret.replace("${5}", parsedUrl.port == -1?"":parsedUrl.port, flags);
      ret = ret.replace("${6}", parsedUrl.hostPort?parsedUrl.hostPort:"", flags);
      ret = ret.replace("${7}", parsedUrl.prePath?parsedUrl.prePath:"", flags);
      ret = ret.replace("${8}", parsedUrl.directory?parsedUrl.directory:"", flags);
      ret = ret.replace("${9}", parsedUrl.fileBaseName?parsedUrl.fileBaseName:"", flags);
      ret = ret.replace("${10}", parsedUrl.fileExtension?parsedUrl.fileExtension:"", flags);
      ret = ret.replace("${11}", parsedUrl.fileName?parsedUrl.fileName:"", flags);
      ret = ret.replace("${12}", parsedUrl.path?parsedUrl.path:"", flags);
      ret = ret.replace("${13}", parsedUrl.ref?parsedUrl.ref:"", flags);
      ret = ret.replace("${14}", parsedUrl.query?parsedUrl.query:"", flags);
      ret = ret.replace("${15}", parsedUrl.spec?parsedUrl.spec:"", flags);
      /*ret = ret.replace(/\^|\$|\+|\\|\||\*|\{|\}|\(|\)|\[|\]/g,
        function(s) {
          switch(s) {
            case "^":return "\\^";break;
            case "$":return "\\$";break;
            case "+":return "\\+";break;
            case "\\":return "\\\\";break;
            case ".":return "\\.";break;
            case "|":return "\\|";break;
            case "*":return "\\*";break;
            case "{":return "\\{";break;
            case "}":return "\\}";break;
            case "(":return "\\(";break;
            case ")":return "\\)";break;
            case "[":return "\\[";break;
            case "]":return "\\]";break;
          }
        }
      );*/
      return ret;
    }
    catch(e) {/*happens for about:blank, about:config, etc.*/}
    return url;
  },

  onSuperAdd : function(wnd, url, superadd) {
    var p = {inn:{url:url || this.getMostRecentWindow().content.location.href, superadd:superadd}, out:null};
    // superadd.proxy is null when user hasn't yet used QuickAdd
    if (superadd.proxy != null)
      p.inn.proxyId = superadd.proxy.id;
    wnd.openDialog("chrome://foxyproxy/content/superadd.xul", "",
      "minimizable,dialog,chrome,resizable=yes,modal", p).focus();
    if (p.out) {
      // Copy any changes
      p = p.out;
      superadd.reload = p.reload;
      superadd.notify = p.notify;
      superadd.prompt = p.prompt;
      superadd.notifyWhenCanceled = p.notifyWhenCanceled;
      superadd.proxy = fp.proxies.getProxyById(p.proxyId);
      fp.writeSettingsAsync();
      return p.match;
    }
  },

  makeProxyTreeView : function(tree, proxies, document) {
    // Save scroll position so we can restore it after making the new view
    let visibleRow = tree.treeBoxObject.getFirstVisibleRow();

    tree.view = {
      rowCount : proxies.length,
      getCellText : function(row, column) {
        var i = proxies.item(row);
        switch(column.id) {
          case "nameCol":return i.name;
          case "descriptionCol":return i.notes;
          case "hostCol":return i.manualconf.host;
          case "portCol":return i.manualconf.port;
          case "isSocksCol":return i.manualconf.isSocks?fp.getMessage("yes"):fp.getMessage("no");
          case "socksverCol":
            if (i.manualconf.isSocks)
              return i.manualconf.socksversion == "5" ? "5" : "4/4a";
            else
              // We only want to show the SOCKS version in the tree if it is
              // really a SOCKS proxy.
              return "";
          case "wpadCol":
            if (i.autoconfMode === "wpad")
              return fp.getMessage("yes");
            else
              return fp.getMessage("no");
          case "autopacCol":return i.autoconf.url;
          case "animatedIconsCol":return i.animatedIcons?fp.getMessage("yes"):fp.getMessage("no");
          case "cycleCol":return i.includeInCycle?fp.getMessage("yes"):fp.getMessage("no");
          case "remoteDNSCol":
            if (i.mode == "direct") return fp.getMessage("not.applicable");
            else
              return i.proxyDNS ? fp.getMessage("yes"):fp.getMessage("no");
          case "fromSubscriptionCol":
            return fp.getMessage(i.fromSubscription ? "yes" : "no");
        }
      },
      setCellValue: function(row, col, val) {proxies.item(row).enabled = val;},
      getCellValue: function(row, col) {return proxies.item(row).enabled;},
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
      getCellProperties: function(row, col, props) {
        if (col.id == "colorCol") {
          var i = proxies.item(row);
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

    // Restore scroll position - peng likes to complain that this feature was
    // missing
    tree.treeBoxObject.scrollToRow(visibleRow);

    /* Set the color column dynamically. Note that "x" in the CSS class
       treechildren::-moz-tree-cell(x) must contain only letters. No numbers or symbols,
       so we can't use proxy.id or proxy.name or even proxy.color. Hence, the special
       proxy.colorString property that is a mapping of proxy.color to letters only
     */
    var styleSheet = document.styleSheets[0];
    for (var i=0, len=proxies.length; i<len; i++) {
      var p = proxies.item(i);
      styleSheet.insertRule("treechildren::-moz-tree-cell(" + p.colorString + "){border: 1px solid black;background-color:" + p.color + "}", styleSheet.cssRules.length);
    }
  },

  isThunderbird : function() {
    return this.appInfo.ID == "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
  },

  notify : function(msg, ar, buttons, priority, callback, getNotWithVal, callbackArgs) {
    let wm = this.getMostRecentWindow(), message = fp.getMessage(msg, ar), nb;
    // First we check, whether we use Firefox or Seamonkey...
    if (wm.gBrowser) {
      nb = wm.gBrowser.getNotificationBox();
    } else {
      // We assume we are using Thunderbird now.
      // TODO: We should optimize this a bit and should not use the main window
      // notification if that method got called from proxy:// protocolhandler
      // in Thunderbird.
      nb = wm.document.getElementById("mail-notification-box");
      // Should not happen but as a fallback we use a normal notification
      // without buttons and are just showing the (error) message.
      if (!nb) {
        fp.notifier.alert(null, message);
        return;
      }
    }
    if (getNotWithVal) {
      getNotWithVal = nb.getNotificationWithValue("foxyproxy-notification");
    }
    if (!buttons) {
      buttons = [
        {
          label: fp.getMessage("allow"),
          accessKey: fp.getMessage("allow.accesskey"),
          popup: null,
          callback: callback,
          callbackArgs: callbackArgs
        }
      ];
    }
    if (!priority) {
      priority = nb.PRIORITY_WARNING_MEDIUM;
    }
    if (getNotWithVal) {
      getNotWithVal.label = message;
    }
    else {
      nb.appendNotification(message, "foxyproxy-notification",
          "chrome://foxyproxy/content/images/16x16.gif", priority, buttons);
    }
  },

  processProxyURI : function(aURI) {
    // aURI is a nsIUri, so get a string from it using .spec
    var uri = aURI.spec;
    // strip away the proxy: part
    uri = uri.substring(uri.indexOf(":") + 1, uri.length);
    // and, optionally, leading // as in proxy://
    if (uri.indexOf("//") == 0)
      uri = uri.substring(2);
    uri = decodeURI(uri);
    // decodeURI doesn't convert &amp; entity to &
    uri = uri.replace(new RegExp("&amp;", "g"), "&");
    // e.g. proxy:ip=xx.xx.xx.xx&port=yyyyy
    // Parse query params into nameValuePairs array
    var count = 0, nameValuePairs = [], queryParams = uri.split('&'),
      foundSomeInput;
    for (var i in queryParams) {
      var pair = queryParams[i].split('=');
      if (pair.length == 2) {
        nameValuePairs[pair[0]] = pair[1];
        foundSomeInput = true;
      }
    }
    if (!foundSomeInput) return false;
    var proxy = CC["@leahscape.org/foxyproxy/proxy;1"].createInstance().
      wrappedJSObject;
    proxy.fromAssociateArray(nameValuePairs);
    // We accept URIs like this:
    //   proxy:foxyProxyMode=disabled
    // with no other parameters. In cases like that, we must skip the
    // create/update/delete proxy code otherwise we'll create an empty/useless
    // proxy. Note: |uri| has been stripped of its scheme at this point.
    if (!(/^foxyProxyMode=[^&]*$/.test(uri))) {
      // Are we adding a new proxy, or deleting or updating an existing one?
      // Default is to updateOrAdd.
      if (!nameValuePairs["action"]) { /* no action was specified */
          nameValuePairs["action"] = "updateOrAdd";
      }
      switch (nameValuePairs["action"]) {
        case "update":
          var p = fp.proxies.mergeByName(proxy, nameValuePairs);
          if (p) {
            proxy = p;
            fp.broadcast(null, "foxyproxy-proxy-change");
          }
          break;
        case "add":
          let position = null;
          if (nameValuePairs["position"]) {
            position = nameValuePairs["position"];
          }
          fp.proxies.insertAt(position, proxy);
          fp.broadcast(null, "foxyproxy-proxy-change");
          break;
        case "delete": /* deliberate fall-through */
        case "deleteOne":
          fp.proxies.deleteByName(proxy.name, false);
          fp.broadcast(null, "foxyproxy-proxy-change");
          break;
        case "deleteMultiple":
          fp.proxies.deleteByName(proxy.name, true);
          fp.broadcast(null, "foxyproxy-proxy-change");
          break;
        case "updateOrAdd":
          var p = fp.proxies.mergeByName(proxy, nameValuePairs);
          if (p)
            proxy = p;
          else {
            let position = null;
            if (nameValuePairs["position"]) {
              position = nameValuePairs["position"];
            }
            fp.proxies.insertAt(position, proxy);
          }
          fp.broadcast(null, "foxyproxy-proxy-change");
          break;
      }
      fp.writeSettingsAsync(); // Save to disk
    }

    // If foxyProxyMode was specified as "this", translate that to something
    // that fp.setMode() understands. Can't set mode to "this" if you're
    // deleting.
    if (nameValuePairs["foxyProxyMode"] == "this") {
      nameValuePairs["foxyProxyMode"] = nameValuePairs["action"] == "delete" ||
        nameValuePairs["action"] == "deleteOne" ||
        nameValuePairs["action"] == "deleteMultiple" ? null : proxy.id;
    }
    // If a proxy name was specifed, get its ID and use that for new foxyproxy
    // mode.
    else if (nameValuePairs["foxyProxyMode"] != "patterns" &&
             nameValuePairs["foxyProxyMode"] != "disabled" &&
             nameValuePairs["foxyProxyMode"] != "random" &&
             nameValuePairs["foxyProxyMode"] != "previous" &&
             nameValuePairs["foxyProxyMode"] != "roundrobin" &&
             !fp.proxies.getProxyById(nameValuePairs["foxyProxyMode"])) {
      var proxy2 = fp.proxies.getProxyByName(nameValuePairs["foxyProxyMode"]);
      if (proxy2)
        nameValuePairs["foxyProxyMode"] = proxy.id;
    }

    // Set mode last in case user is setting mode to the proxy we just
    // configured. (In that case, setting mode earlier will result in the proxy
    // not being found)
    if (nameValuePairs["foxyProxyMode"])
      fp.setMode(nameValuePairs["foxyProxyMode"], true);

    // User-feedback?
    if (nameValuePairs["confirmation"] == "popup") {
      fp.notifier.alert(fp.getMessage("foxyproxy"),
        fp.getMessage("proxy.configured", [nameValuePairs["name"]]));
      return nameValuePairs;
    }
    else if (nameValuePairs["confirmation"]) {
      // Is it a valid URL?
      try {
        this._ios.newURI(nameValuePairs["confirmation"], "UTF-8", null);
      }
      catch(e) {/* not a valid URL */ return true; }
      this.openTab(nameValuePairs["confirmation"]);
    }
    return nameValuePairs;
  },

  classDescription: "FoxyProxy Common Utils",
  classID: Components.ID("{ecbe324b-9ad7-401a-a272-5cc1efba9be6}"),
  contractID: "@leahscape.org/foxyproxy/common;1",
  _xpcom_factory: {
    singleton: null,
    createInstance: function (aOuter, aIID) {
      if (aOuter)
        throw Components.results.NS_ERROR_NO_AGGREGATION;
      if (!this.singleton)
        this.singleton = new Common();
      return this.singleton.QueryInterface(aIID);
    }
  }
};

/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4)
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 and earlier (Firefox 3.6)
 */
if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([Common]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([Common]);
