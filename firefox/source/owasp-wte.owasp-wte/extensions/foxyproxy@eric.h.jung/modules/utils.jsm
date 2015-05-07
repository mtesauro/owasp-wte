/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license, available in the LICENSE
  file at the root of this installation and also online at
  http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

"use strict";

/** TODO: Move all of components/common.js here, import Services.jsm and replace
 *  all calls to services declared there in FoxyProxy.**/

let CI = Components.interfaces, CC = Components.classes, gObsSvc =
  CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService),

  EXPORTED_SYMBOLS = ["utils"],
 
  utils = {

    dumpp: function(e) {
      if (e) out(e);
      else {
        try {
          throw new Error("e");
        }
        catch (e) {out(e);}
      }
      function out(e) {
        // We do not always have a stack property...
        let stack = null;
        if (e.stack) {
          stack = e.stack;
        }
        dump("FoxyProxy Error: " + e + " \n\nCall Stack:\n" +
          stack + "\n");
      }
    },

    // Get attribute from node if it exists, otherwise return |def|.
    // No exceptions, no errors, no null returns.
    getSafeAttr: function(n, name, def) {
      if (!n) {dumpp(); return; }
      n.QueryInterface(CI.nsIDOMElement);
      return n ? (n.hasAttribute(name) ? n.getAttribute(name) : def) : def;
    },

    // Boolean version of getSafeAttr()
    getSafeAttrB: function(n, name, def) {
      if (!n) {dumpp(); return; }
      n.QueryInterface(CI.nsIDOMElement);
      return n ? (n.hasAttribute(name) ? n.getAttribute(name)=="true" : def) :
        def;
    },

    getPrefsService: function(branch) {
      return CC["@mozilla.org/preferences-service;1"].
        getService(CI.nsIPrefService).getBranch(branch);
    },

    // Broadcast a msg/notification optionally with data attached to the msg
    broadcast: function(subj, topic, data) {
      let bool = CC["@mozilla.org/supports-PRBool;1"].
        createInstance(CI.nsISupportsPRBool);
      bool.data = subj;
      let d;
      if (typeof(data) == "string" || typeof(data) == "number") {
        // It's a number when foxyproxy._mode is 3rd arg, and FoxyProxy is set
        // to a proxy for all URLs
        d = CC["@mozilla.org/supports-string;1"].
          createInstance(CI.nsISupportsString);
        d.data = "" + data; // force to a string
      } else {
        if (data)
          d = data.QueryInterface(CI.nsISupports);
      }
      gObsSvc.notifyObservers(bool, topic, d);
    },

    /**
     * Load a script in the /components directory or subdirectory. If a subdir,
     * use linux-style directory delimiters (forward-slash) even when executing
     * on Windows. For example: api/proxyConfig.js not api\proxyConfig.js.
     */
    loadComponentScript : function(filename, target) {
      // load js files
      let self;
      let fileProtocolHandler = CC["@mozilla.org/network/protocol;1?name=file"].
        getService(CI["nsIFileProtocolHandler"]);
      if ("undefined" != typeof(__LOCATION__)) {
        // preferred way
        self = __LOCATION__;
      } else {
        self = fileProtocolHandler.getFileFromURLSpec(Components.Exception().
          filename);
      }
      let rootDir = self.parent.parent; // our root dir
      let loader = CC["@mozilla.org/moz/jssubscript-loader;1"].
        getService(CI["mozIJSSubScriptLoader"]);
      try {
        let filePath = rootDir.clone();
        filePath.append("components");

        // In case |filename| has a relative path, split the path and append one
        // at a time. Appending, for example, "api/proxyConfig.js" all at once
        // throws an exception.
        let tmp = filename.split('/'); // split() never returns null
        for (let i=0, len=tmp.length; i<len; i++) {
          // tmp[i] can be "" if, for example, filePath is "/foo.js"
          if (tmp[i] != "") {
            filePath.append(tmp[i]);
          }
        }
        loader.loadSubScript(fileProtocolHandler.getURLSpecFromFile(filePath),
          target);
      }
      catch (e) {
        dump("Error loading component " + filename + ": " + e + "\n" + e.stack +
          "\n");
        throw(e);
      }
    },

    /**
     * Displays a warning if the user is about to enter/in pattern mode and 
     * the cookie related settings of her proxies differ.
     */
    displayPatternCookieWarning : function(mode, fp) {
      if (mode === "patterns") {
        // Should we display the warning about problematic cookie behavior?
        let cookieSettingsDiff = false;
        // reference values
        let clearCookies = fp.proxies.item(0).clearCookiesBeforeUse;
        let rejectCookies = fp.proxies.item(0).rejectCookies;
        for (let i=1, len=fp.proxies.length; i<len; i++) {
          let proxy = fp.proxies.item(i);
          if (proxy.clearCookiesBeforeUse !== clearCookies ||
              proxy.rejectCookies !== rejectCookies) {
            cookieSettingsDiff = true;
            break;
          }
        }
        if (cookieSettingsDiff) {
          this.showCookieWarningIfDesired(null, ["patternmode.cookie.warning2"],
            "patternModeCookieWarning", fp);
        }
      }
    },

    showCookieWarningIfDesired : function(win, msg, name, fp) {
      if (fp.warnings._warnings[name] === undefined ||
          fp.warnings._warnings[name]) {
        let l10nMessage = fp.getMessage(msg[0], msg.slice(1)),
          cb = {value: false};
        CC["@mozilla.org/embedcomp/prompt-service;1"].
          getService(CI.nsIPromptService).alertCheck(win,
            fp.getMessage("foxyproxy"), l10nMessage,
            fp.getMessage("message.stop"), cb);
        // Note: We save the inverse of user's selection because the way the
        // question is phrased.
        fp.warnings._warnings[name] = !cb.value;
        fp.writeSettingsAsync();
      }
    },

    /**
     * Get the selected indices of a multiselect tree as an integer array
     */
    getSelectedIndices : function(tree) {
      // handle empty tree views for FoxyProxy Basic
      if (!tree.view) return [];

      let start = {}, end = {}, numRanges = tree.view.selection.getRangeCount(),
        selectedIndices = [];

      for (let t = 0; t < numRanges; t++){
        tree.view.selection.getRangeAt(t, start, end);
        for (let v = start.value; v <= end.value; v++)
          selectedIndices.push(v);
      }
      return selectedIndices;
    }
  };
