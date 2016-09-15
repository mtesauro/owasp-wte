/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

"use strict";

// Constants
let CC = Components.classes, CI = Components.interfaces, CU = Components.utils,
  CR = Components.results;

CU.import("resource://gre/modules/XPCOMUtils.jsm");

/**
 * FoxyProxy Api
 */
function api() {
  this.fp = CC["@leahscape.org/foxyproxy/service;1"].getService().
    wrappedJSObject;
  this.fpc = CC["@leahscape.org/foxyproxy/common;1"].getService().
    wrappedJSObject;
 
  // We let |fp| manage |apiDisabled| serialization. Note we do not want to
  // expose a setter for this variable, just a getter. If we exposed a setter,
  // websites could enable the API when it is disabled.
  this._apiDisabled = this.fp.apiDisabled;

  CU.import("resource://foxyproxy/utils.jsm", this);
};

api.prototype = {
  fp: null,
  fpc: null,
  _apiDisabled: false,

  /**
   * Load settings from contents of a webpage or other DOM source. We use the
   * terminology "tag" instead of "node/element" in error messages since that is
   * the vernacular with web developers.
   */
  setSettings : function(node, callbackObj) {
    if (this.apiDisabled) return null;
    callbackObj = callbackObj || {}; // Minimizes null checks

    // nodeName is always capitalized by Gecko so no need for case-insensitive
    // check
    if (node.nodeName != "FOXYPROXY") {
      if (callbackObj.error) {
        let msg = "Root tag must be named foxyproxy instead of '" +
          node.nodeName + "'";
        callbackObj.error(msg);
      }
    }

    let that = this, metaCallback = {
      callbackObj : callbackObj,
      // Code to run if user allows this request
      onAllow: function() {
        // Delete all first. TODO: consider a merge algorithm instead
        that.fp.proxies.deleteAll();
        that.fp.fromDOM(node, node);
      },
      successArgs: ""
    };
    this.notify(metaCallback);
  },

  set settings(node) {
    this.setSettings(node);
  },

  get settings() {
    if (this.apiDisabled) return null;
    return this.fp.toDOM();
  },

  /**
   * Change the mode to the one specified.
   * See foxyproxy.setMode() for acceptable mode values.
   * This version allows caller to provide a callback function, unlike
   * the |mode| property setter
   */
  setMode: function(newMode, callbackObj) {
    if (this.apiDisabled) return null;
    let that = this;
    let metaCallback = {
      callbackObj : callbackObj,
      onAllow: function() { that.fp.setMode(newMode, true, false); },
      successArgs: newMode,
      successTest : function() {return that.fp.mode == newMode;},
      errorArgs : "Unrecognized mode"
    };
    this.notify(metaCallback);
  },

  /**
   * Change the mode to the one specified.
   * See foxyproxy.setMode() for acceptable mode values.
   * This version does not allow the caller to provide a callback function,
   * unlike the setMode() function.
   */
  set mode(newMode) {
    this.setMode(newMode);
  },

  /**
   * Get the current foxyproxy mode.
   * See foxyproxy.setMode() for possible values.
   */
  get mode() {
    if (this.apiDisabled) return null;
    return this.fp.mode;
  },

  /**
   * Returns true if we ignore API calls; false if we act on them. Note: this
   * is the only function which we expose regardless of the value of
   * |apiDisabled|.
   * In this way, webpages can determine if they can successfully instrument
   * foxyproxy and possibly inform the user if they cannot.
   */
  get apiDisabled() {
    return this._apiDisabled;
  },

  /**
   * Returns a JSON object with two properties: name and version.
   * |name| is the name of the addon installed, one of:
   * "FoxyProxyBasic", "FoxyProxyStandard", or "FoxyProxyPlus"
   * |version| is the version of the installed addon.
   */
  get version() {
    if (this.apiDisabled) return null;
    let name;
    if (this.fp.isFoxyProxySimple())
      name = "FoxyProxyBasic";
    else {
      // Are we Standard or Plus?
      try {
        CC["@leahscape.com/foxyproxyplus/licenseresolver;1"].getService().
          wrappedJSObject;
        name = "FoxyProxyPlus";
      }
      catch (e) {
        name = "FoxyProxyStandard";
      }
    }
    return '{"version": "' + this.fpc.getVersion() + '", "name": "' + name +
      '"}';
  },

  getProxyConfigs : function(callbackObj) {
    if (this.apiDisabled) return null;
    let metaCallback = {
      callbackObj: callbackObj,
      successArgs: CC["@leahscape.org/foxyproxy/proxyconfigs;1"].
        getService(CI.foxyProxyConfigs)
    };
    this.notify(metaCallback);
    return null;
  },

  /**
   * Similar to common.js notify() but understands when "Allow" vs "x" (close
   * btn) is clicked.
   */
  notify : function(metaCallback) {
    // First notify options.xul, addeditproxy.xul, etc (if they are open)
    this.utils.broadcast(null, "foxyproxy-proxy-change");

    // to eliminate some null checks
    let callbackObj = metaCallback.callbackObj || {};
    let calledBack = false;

    function callbackHook() {
      if (!calledBack) {
        calledBack = true;
        // User accepted the request - run the request if code is required
        if (metaCallback.onAllow)
          metaCallback.onAllow();
        // Did the request succeed?
        if (metaCallback.successTest) {
          if (metaCallback.successTest()) {
            // It did -- inform content
            if (callbackObj.success)
              callbackObj.success(metaCallback.successArgs);
          }
          else {
            // It did not -- call error() to inform content
            if (callbackObj.error)
              callbackObj.error(metaCallback.errorArgs);
          }
        }
        else {
          // There is no success test -- just inform content
          if (callbackObj.success)
            callbackObj.success(metaCallback.successArgs);
        }
      }
    }

    function nbEventCallback(e) {
      if (e == "removed") {
        // nbox is closing because user clicked "x" or "Allow", we don't know
        // which.
        if (!calledBack) {
          // "Allow" wasn't clicked. If it had been, callbackHook() would have
          // already been called. User rejected the request; notify content.
          calledBack = true;
          if (callbackObj.rejected) {
            // Workaround for bug 749966. See its second comment.
            wm.setTimeout(function() {callbackObj.rejected();}, 0);
          }
        }
      }
    }

    let wm = this.fpc.getMostRecentWindow(), message =
      this.fp.getMessage("proxy.scheme.warning.2", null), nb;

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
        this.fp.notifier.alert(null, message);
        return;
      }
    }
    let buttons = [
      {
        label: this.fp.getMessage("allow"),
        accessKey: this.fp.getMessage("allow.accesskey"),
        popup: null,
        callback: callbackHook,
        callbackArgs: null
      }
    ];
    nb.appendNotification(message, "foxyproxy-notification",
      "chrome://foxyproxy/content/images/16x16.gif", nb.PRIORITY_WARNING_MEDIUM,
      buttons, nbEventCallback);
  },

  // nsIClassInfo
  /*
    Gecko 2.x only (doesn't work with Firefox 3.6.x)
      classInfo: generateCI({ interfaces: ["foxyProxyApi"], classID: Components.ID("{26e128d0-542c-11e1-b86c-0800200c9a66}"),
      contractID: "@leahscape.org/foxyproxy/api;1",
      classDescription: "FoxyProxy Content API", flags: CI.nsIClassInfo.SINGLETON|CI.nsIClassInfo.DOM_OBJECT}),
  */

  flags: CI.nsIClassInfo.SINGLETON|CI.nsIClassInfo.DOM_OBJECT,
  implementationLanguage: CI.nsIProgrammingLanguage.JAVASCRIPT,
  getHelperForLanguage: function(l) null,
  getInterfaces: function(count) {
    let interfaces = [CI.foxyProxyApi];
    count.value = interfaces.length;
    return interfaces;
  },
  classDescription: "FoxyProxy Content API",
  contractID: "@leahscape.org/foxyproxy/api;1",
  // uuid from IDL
  classID: Components.ID("{26e128d0-542c-11e1-b86c-0800200c9a66}"),
  QueryInterface: XPCOMUtils.generateQI([CI.foxyProxyApi, CI.nsIClassInfo]),
  _xpcom_factory: {
    singleton: null,
    createInstance: function (aOuter, aIID) {
      if (aOuter) throw CR.NS_ERROR_NO_AGGREGATION;
      if (!this.singleton) this.singleton = new api();
      return this.singleton.QueryInterface(aIID);
    }
  }
};

/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4)
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 and earlier (Firefox 3.6)
 */
if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([api]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([api]);
