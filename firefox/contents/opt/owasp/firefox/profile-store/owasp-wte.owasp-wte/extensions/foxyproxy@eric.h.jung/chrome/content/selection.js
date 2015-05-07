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
 * Handles page selections; e.g., for setting new host:port from user-selected text
 */
foxyproxy.selection = {
  reloadcurtab: true,
  onChangeHost : function() {
    var fp = foxyproxy.fp, sel = this.parseSelection();
    if (sel.reason == 0) {
      var p = {inn:{title:fp.getMessage("choose.proxy", [sel.hostPort]), reloadcurtab:this.reloadcurtab, host:sel.host, port:sel.port, pattern:false}, out:null};          
      window.openDialog("chrome://foxyproxy/content/chooseproxy.xul", "",
        "chrome, dialog, modal, centerscreen=yes, resizable=yes", p).focus();
      if (p.out) {
        p = p.out;
        this.reloadcurtab = p.reloadcurtab;
        p.proxy.manualconf.host = sel.host;
        p.proxy.manualconf.port = sel.port;        
        fp.notifier.alert(null, fp.getMessage("changed.host", [p.proxy.name, sel.hostPort]));
        if (p.reloadcurtab) {
          var r;
          function askAboutSwitching(str, arg) {
            if (fp.isFoxyProxySimple) {
              var r = foxyproxy.ask(window, arg ? fp.getMessage(str, [arg]) : fp.getMessage(str));
              if (r == 1) fp.setMode(p.proxy.id, false);
              return r;
            }
            else {
              var r = foxyproxy.ask(window, arg ? fp.getMessage(str, [arg]) : fp.getMessage(str), fp.getMessage("yes.use.patterns"), fp.getMessage("yes.use.proxy.for.all", [p.proxy.name]), fp.getMessage("no.dont.change.anything"));
              if (r == 0) fp.setMode("patterns", false);
              else if (r == 1) fp.setMode(p.proxy.id, false);
              return r;
            }
          }
          if (fp.mode == "disabled")
            r = askAboutSwitching("enable.before.reloading.2");
          else if (fp.mode != "patterns" && fp.mode != "random" && fp.mode != "roundrobin" && fp.mode != p.proxy.id)
            r = askAboutSwitching("switch.before.reloading", fp._selectedProxy.name);
          if (r != 2 && p.proxy.mode != "manual") {
            var modeAsText;
            switch (p.proxy.mode) {
              case "direct" :
                modeAsText = fp.getMessage("foxyproxy.add.option.direct.label");
                break;
              case "auto" :
                modeAsText = fp.getMessage("foxyproxy.automatic.label");
                break;
            }
            var q = foxyproxy.ask(window, fp.getMessage("switch.proxy.mode2", [p.proxy.name, modeAsText, sel.hostPort]));
            if (q)
              p.proxy.mode = "manual";
          }      
          gBrowser.reloadTab(gBrowser.mCurrentTab);
        }
        fp.writeSettingsAsync();        
      }
    }
    else if (sel.reason == 1)
      fp.notifier.alert(null, fp.getMessage("noHostPortSelected"));
  },
  
  /**
   * Returns object with 3 properties.
   * reason contains 0 if success, 1 if current selection can't be parsed properly (or nothing
   * selected), and 2 if the |proxy| optional argument is disabled. if no |proxy| specified,
   * |reason| is never 2.
   */
  parseSelection : function(proxy) { 
    /* Any selected text that looks like it might be a host:port?
     Found a possible host:port combination if parsed.length == 2.
     http://mxr.mozilla.org/mozilla-central/source/browser/base/content/browser.js#4620
     getBrowserSelection() never appears to return null, just the empty string, but we
     check for null anyway just in case that is changed in a future release.*/
    var ret = {};
    ret.selection = this.getBrowserSelection();
    // Only show these menu items if there is selected text, otherwise they their phrasing
    // appears funny: "Set <blank> as this proxy's new host and port", even if disabled.
    if (ret.selection != null && ret.selection != "") {
      var parsed = ret.selection.split(/:|\s/);        
      if (proxy && !proxy.enabled  /* || fp.mode == "disabled" */)
        ret.reason = 2;
      else if (parsed.length != 2 || parsed[1].match(/\D/) != null)
        ret.reason = 1;
      else {
        ret.reason = 0;
        // Make the returned selection look nice for cases where the delimiter wasn't a colon
        ret.hostPort = parsed[0] + ":" + parsed[1];
        ret.host = parsed[0];
        ret.port = parsed[1];
      }
    }
    else
      ret.reason = 1;
    return ret;
  },

  /**
   * Copied from Firefox's browser.xul because some platforms (e.g., Tbird)
   * don't have this method
   * 
   * Gets the selected text in the active browser. Leading and trailing
   * whitespace is removed, and consecutive whitespace is replaced by a single
   * space. A maximum of 150 characters will be returned, regardless of the value
   * of aCharLen.
   *
   * @param aCharLen
   *        The maximum number of characters to return.
   */
  getBrowserSelection : function(aCharLen) {
    // selections of more than 150 characters aren't useful
    const kMaxSelectionLen = 150;
    const charLen = Math.min(aCharLen || kMaxSelectionLen, kMaxSelectionLen);

    var focusedWindow = document.commandDispatcher.focusedWindow;
    var selection = focusedWindow.getSelection().toString();

    if (selection) {
      if (selection.length > charLen) {
        // only use the first charLen important chars. see bug 221361
        var pattern = new RegExp("^(?:\\s*.){0," + charLen + "}");
        pattern.test(selection);
        selection = RegExp.lastMatch;
      }

      selection = selection.replace(/^\s+/, "")
                           .replace(/\s+$/, "")
                           .replace(/\s+/g, " ");

      if (selection.length > charLen)
        selection = selection.substr(0, charLen);
    }
    return selection;
  }

};
