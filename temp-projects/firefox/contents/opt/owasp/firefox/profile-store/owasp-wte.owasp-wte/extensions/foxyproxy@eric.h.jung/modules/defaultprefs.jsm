/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license, available in the LICENSE
  file at the root of this installation and also online at
  http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

// Manages the saving of original pref values on installation
// and their restoration when FoxyProxy is disabled/uninstalled through the EM.
// Also forces our values to remain in effect even if the user or
// another extension changes them. Restores values to original
// when FoxyProxy is in disabled mode.

"use strict";

let CI = Components.interfaces, CC = Components.classes, CU = Components.utils,
  gObsSvc = CC["@mozilla.org/observer-service;1"].
    getService(CI.nsIObserverService),
   
  EXPORTED_SYMBOLS = ["defaultPrefs"];

let defaultPrefs = {
  FALSE : 0x10,
  TRUE : 0x11,    
  CLEARED : 0x12,
  // These values are just reasonable defaults. The user-specific original
  // values will be read in saveOriginals().
  origPrefetch : null,
  // We save this instance because we must call removeObserver method on the
  // same nsIPrefBranch2 instance on which we called addObserver method in order
  // to remove an observer.
  networkDNSPrefs : null,
  cachePrefs : null, // see above comment
  networkCookiePrefs : null, // see above comment
  beingUninstalled : false, /* flag per https://developer.mozilla.org/en/Code_snippets/Miscellaneous#Receiving_notification_before_an_extension_is_disabled_and.2for_uninstalled */
  beingDisabled : false,
  fp : null,
  ps : null,
  networkPrefs : null,
  prefs : null,

  // Install observers
  init : function(fp) {
    CU.import("resource://foxyproxy/utils.jsm", this);
    try {
      CU.import("resource://gre/modules/AddonManager.jsm", this);
      this.addExtensionListener();
    } catch (e) {}
    this.fp = fp;
    this.ps = this.utils.getPrefsService("extensions.foxyproxy.");
    this.networkPrefs = this.utils.getPrefsService("network.proxy.");
    this.prefs = this.utils.getPrefsService("");
    if (!this.ps.prefHasUserValue("cache.memory.enable")) {
      // We are new in a profile, save the currently used cache and cookie
      // preferences. 
      this.saveOriginals();
    }
    if (this.ps.prefHasUserValue("autoconfig_url")) {
      // FoxyProxy has been closed before and the user's proxy settings got
      // saved and overwritten. Restore them now.
      this.restoreOriginalProxyPrefs();
    }
    this.addPrefsObservers();
    this.addGeneralObservers();
  },

  addExtensionListener : function() {
    let that = this;
    try {
    let extensionListener = {
      onUninstalling: function(addon, needsRestart) {
        if (addon.id === "foxyproxy-basic@eric.h.jung" ||
            addon.id === "foxyproxy@eric.h.jung" ||
            addon.id === "foxyproxyplus@leahscape.com") {
          that.beingUninstalled = true;
        }
      },

      onDisabling: function(addon, needsRestart) {
        if (addon.id === "foxyproxy-basic@eric.h.jung" ||
            addon.id === "foxyproxy@eric.h.jung" ||
            addon.id === "foxyproxyplus@leahscape.com") {
          that.beingDisabled = true;
        }
      },

      onOperationCancelled: function(addon) {
        if (addon.id === "foxyproxy-basic@eric.h.jung" ||
            addon.id === "foxyproxy@eric.h.jung" ||
            addon.id === "foxyproxyplus@leahscape.com") {
          that.beingUninstalled = false;
          that.beingDisabled = false;
        }
      }
    }; 

    this.AddonManager.addAddonListener(extensionListener); 
    } catch (e) {dump(e + "\n")}
  },

  addPrefsObservers : function() {
    if (!this.networkDNSPrefs) {
      this.networkDNSPrefs = this.utils.getPrefsService("network.dns.").
        QueryInterface(CI.nsIPrefBranch2);
      this.networkDNSPrefs.addObserver("", this, false);
      this.addCacheObserver();
      this.addCookieObserver();
    }
  },

  addGeneralObservers : function() {
    for each (let i in ["foxyproxy-mode-change", "foxyproxy-proxy-change",
              "em-action-requested", "quit-application"])
      gObsSvc.addObserver(this, i, false);
  },
  
  removePrefsObservers : function() {
    // we're not initialized and calling .removeObserver() will throw
    if (!this.networkDNSPrefs)
      return;
    this.networkDNSPrefs.removeObserver("", this);
    this.removeCacheObserver();
    this.removeCookieObserver();
    this.networkCookiePrefs = this.cachePrefs = this.networkDNSPrefs = null;
  },

  removeGeneralObservers : function() {
    // Getting the exception in case we already removed these observers
    try {
      for each (let i in ["foxyproxy-mode-change", "foxyproxy-proxy-change",
                "em-action-requested", "quit-application"])
        gObsSvc.removeObserver(this, i);
    } catch(e) {} 
  },

  addCookieObserver : function() {
    if (!this.networkCookiePrefs) {
      this.networkCookiePrefs = this.utils.getPrefsService("network.cookie.").
        QueryInterface(CI.nsIPrefBranch2);
    }
    // TODO: Can it happen that we have added an observer already?
    this.networkCookiePrefs.addObserver("", this, false);
  },

  removeCookieObserver : function() {
    try {
      this.networkCookiePrefs.removeObserver("", this);
    } catch (e) {dump("There was no cookie observer\n");}
  },

  addCacheObserver : function() {
    if (!this.cachePrefs) {
      this.cachePrefs = this.utils.getPrefsService("browser.cache.").
        QueryInterface(CI.nsIPrefBranch2);
    }
    // TODO: Can it happen that we have added an observer already?
    this.cachePrefs.addObserver("", this, false);
  },

  removeCacheObserver : function() {
    try {
      this.cachePrefs.removeObserver("", this);
    } catch (e) {dump("There was no cache observer!\n");}
  },

  // Uninstall observers
  uninit : function() {
    this.removePrefsObservers();
    this.removeGeneralObservers();
  },

  observe : function(subj, topic, data) {
    try {
      if (topic == "nsPref:changed") {
        if (data == "disablePrefetch") {
          if (this.shouldDisableDNSPrefetch())
            this.disablePrefetch();
            // Don't restore originals if shouldDisableDNSPrefetch == false --
            // let the user do what he wants with the setting
        } else if (data == "cookieBehavior") {
          // This saves the the old-value-pref for cookies as the user has
          // chosen a new default value. The same holds if we get notifications
          // about the cache prefs we observe... If a proxy changes the
          // cookie/cache values the notifications do not get triggered as we
          // remove the observers first (and add them later again). Thus, we can
          // be sure that 1) No proxy is messing with the user's cookie/cache
          // values and 2) the new user chosen values are saved.
          this.ps.setIntPref(data,
            this.prefs.getIntPref("network.cookie.cookieBehavior")); 
        } else if (data == "memory.enable") {
          this.ps.setBoolPref("cache." + data,
            this.prefs.getBoolPref("browser.cache.memory.enable"));
        } else if (data == "disk.enable") {
          this.ps.setBoolPref("cache." + data,
            this.prefs.getBoolPref("browser.cache.disk.enable"));
        } else if (data == "offline.enable") {
          this.ps.setBoolPref("cache." + data,
            this.prefs.getBoolPref("browser.cache.offline.enable"));
        } else if (data == "disk_cache_ssl") {
          this.ps.setBoolPref("cache." + data,
            this.prefs.getBoolPref("browser.cache.disk_cache_ssl"));
        }
      }
      else if (topic == "em-action-requested") {
        this.restoreOnExit(data, subj.QueryInterface(CI.nsIUpdateItem));
      }
      else if (topic == "quit-application") {
        if (this.beingUninstalled || this.beingDisabled) {
          this.restoreOriginals("all", false);
          if (this.beingUninstalled) {
            // We are deleting all of our FoxyProxy preferences of the
            // extensions.foxproxy. branch. One reason is to leave nothing of
            // FoxyProxy as the user uninstalls it. The other reason is the
            // options to re-read the original values easily if FoxyProxy gets
            // installed again.
            this.ps.deleteBranch("");
          } else {
            // We got disabled. We do not know how long we will be disabled and
            // whether the user will change her default cookie/cache settings
            // meanwhile. Therefore, we just delete the
            // extensions.foxyproxy.cache.memory.enable preference which causes
            // a re-saving of the cache/cookie prefs if we get enabled again.
            if (this.ps.prefHasUserValue("cache.memory.enable")) {
              this.ps.clearUserPref("cache.memory.enable");
            }
          }
        } else {
          // This case means being or getting enabled and shutting down...
          this.uninit();
          // Now the safeguards against IP and DNS leaks due to a compatibility
          // check on restart if the application got upgraded. This affects 
          // Gecko 2 and later Gecko versions. That workaround is necessary as
          // FoxyProxy is _not_ available at that moment yet but rather
          // initialized after it. Nevertheless, the user is expecting to get
          // all requests handled by FoxyProxy as it is perceived to be enabled
          // (although that is wrong strictly speaking).
          this.saveFoxyProxyProxyMode();
        }
      }
      else if (topic == "foxyproxy-mode-change") {
        if (this.fp._mode == "disabled") {
          // We need to reset this value in order to not miss changes while
          // disabling FoxyProxy and enabling the same proxy again.
          this.fp.cacheAndCookiesChecked = false;
          // We're being disabled. But we still want to have our general
          // observers.
          this.restoreOriginals("all", true);
          return;
        }
        if (this.fp._previousMode == "disabled") {
          // We're coming out of disabled mode
          this.saveOriginals();
        }
        this.setOrUnsetPrefetch();
        // Start listening for pref changes if we aren't already
        this.addPrefsObservers();
      }
      else if (topic == "foxyproxy-proxy-change") {
        if (this.fp._mode == "disabled") return;
        this.setOrUnsetPrefetch();
        // Start listening for pref changes if we aren't already
        this.addPrefsObservers();
      }
    }
    catch (e) { this.utils.dumpp(e); }
  },

  setOrUnsetPrefetch : function() {
    if (this.shouldDisableDNSPrefetch())
      this.disablePrefetch();
    else
      this.restoreOriginalPreFetch(true);
  }, 
  
  shouldDisableDNSPrefetch : function() {
    if (this.fp._mode == "disabled") return false;
    // Is mode "Use proxy xyz for all URLs"? Does the selected proxy require dns
    // prefetch disabling?
    if (this.fp._selectedProxy)
      return this.fp._selectedProxy.shouldDisableDNSPrefetch()
    // Mode is patterns, random, or roundrobin. If any of the proxies require
    // remote DNS lookup, disable the preference so we can manage it ourselves
    // as proxies are switched across URLs/IPs.
    return this.fp.proxies.requiresRemoteDNSLookups();
  },

  // Set our desired values for the prefs; may or may not be the same as the
  // originals
  disablePrefetch : function() {
    // stop observing the prefs while we change them
    this.removePrefsObservers();
    this.utils.getPrefsService("network.dns.").setBoolPref("disablePrefetch",
      true);
    // start observing the prefs again
    this.addPrefsObservers();
  },
  
  // FoxyProxy being disabled/uninstalled. Should we restore the original
  // pre-FoxyProxy values?
  restoreOnExit : function(d, updateItem) {
    let guid = updateItem.id;
    if (guid === "foxyproxy-basic@eric.h.jung" || guid ===
        "foxyproxy@eric.h.jung" || guid === "foxyproxyplus@leahscape.com") {
      if (d === "item-cancel-action") {
        this.beingUninstalled = false;
        this.beingDisabled = false;
      }
      else if (d === "item-uninstalled")
        this.beingUninstalled = true;
      else if (d === "item-disabled")
        this.beingDisabled = true;
    }
  },

  // Restore the original pre-FoxyProxy values.
  // |type| can be "cache", "cookies", or "all"
  restoreOriginals : function(type, contObserving) {
    if (type === "cache" || type === "all") {
      this.prefs.setBoolPref("browser.cache.disk.enable", this.ps.
        getBoolPref("cache.disk.enable"));
      this.prefs.setBoolPref("browser.cache.memory.enable", this.ps.
        getBoolPref("cache.memory.enable"));
      this.prefs.setBoolPref("browser.cache.offline.enable", this.ps.
        getBoolPref("cache.offline.enable"));
      this.prefs.setBoolPref("browser.cache.disk_cache_ssl", this.ps.
        getBoolPref("cache.disk_cache_ssl"));
    }
    if (type === "cookies" || type === "all") {
      this.prefs.setIntPref("network.cookie.cookieBehavior", this.ps.
        getIntPref("cookieBehavior"));
    }
    if (type === "all") {
      this.restoreOriginalPreFetch(contObserving);
    }
  },

  restoreOriginalBool : function(branch, pref, value) {
    let p = this.utils.getPrefsService(branch);
    if (value == this.TRUE)
      p.setBoolPref(pref, true);
    else if (value == this.FALSE)
      p.setBoolPref(pref, false);
    else if (value == this.CLEARED) {
      try {
        if (p.prefHasUserValue(pref))
          p.clearUserPref(pref);
      }
      catch (e) {
        // I don't think this is necessary since p.prefHasUserValue() is called
        // before clearing
        this.utils.dumpp(e);
      }
    }
  },
  
  // Restore the original pre-FoxyProxy dnsPrefetch value and
  // optionally stop observing changes
  restoreOriginalPreFetch : function(contObserving) {
    let that = this;
    function forcePACReload() {
      let type;
      // If Firefox is configured to use a PAC file, we need to force that PAC
      // file to load. Firefox won't load it automatically except on startup
      // and after network.proxy.autoconfig_retry_* seconds. Rather than make
      // the user wait for that, we load the PAC file now by flipping
      // network.proxy.type (Firefox is observing that pref)
      try {
        type = that.networkPrefs.getIntPref("type");
      }
      catch(e) {
        dump("FoxyProxy: network.proxy.type doesn't exist or can't be read\n");
        that.utils.dumpp(e);
      }
      // Isn't there a const for this?
      if (type == 2) {
        // network.proxy.type is set to use a PAC file. Don't use
        // nsPIProtocolProxyService to load the PAC. From its comments:
        // "[nsPIProtocolProxyService] exists purely as a hack to support the
        // configureFromPAC method used by the preference panels in the various
        // apps. Those apps need to be taught to just use the preferences API
        // to "reload" the PAC file. Then, at that point, we can eliminate this
        // interface completely."

        // var pacURL = that.networkPrefs.getCharPref("autoconfig_url");
        // var pps = CC["@mozilla.org/network/protocol-proxy-service;1"]
        // .getService(Components.interfaces.nsPIProtocolProxyService);
        // pps.configureFromPAC(pacURL);

        // Instead, change the prefs--the proxy service is observing and will
        // reload the PAC.
        that.networkPrefs.setIntPref("type", 1);
        that.networkPrefs.setIntPref("type", 2);
      }
    }

    // Stop observing the prefs while we change disablePrefetch.
    this.removePrefsObservers();
    this.restoreOriginalBool("network.dns.", "disablePrefetch",
      this.origPrefetch);
    forcePACReload();
    if (!contObserving)
      this.removeGeneralObservers();
  },
  
  // Save the original prefs for restoring when FoxyProxy is disabled or
  // uninstalled or restarted.
  saveOriginals : function() {
    let p = this.utils.getPrefsService("network.dns.");
    this.origPrefetch = p.prefHasUserValue("disablePrefetch") ?
      (p.getBoolPref("disablePrefetch") ? this.TRUE : this.FALSE) :
      this.CLEARED;
    // We save the cache and cookie values into preferences...
    this.ps.setBoolPref("cache.memory.enable",
      this.prefs.getBoolPref("browser.cache.memory.enable"));
    this.ps.setBoolPref("cache.disk.enable",
      this.prefs.getBoolPref("browser.cache.disk.enable"));
    this.ps.setBoolPref("cache.offline.enable",
      this.prefs.getBoolPref("browser.cache.offline.enable"));
    this.ps.setBoolPref("cache.disk_cache_ssl",
      this.prefs.getBoolPref("browser.cache.disk_cache_ssl"));
    this.ps.setIntPref("cookieBehavior", this.prefs.
      getIntPref("network.cookie.cookieBehavior"));
    this.fp.writeSettingsAsync();
  },

  saveFoxyProxyProxyMode : function() {
    // First, we save the original prefs... As the problem at hand is only an
    // issue for Gecko 2+ versions and there is no Gopher supported anymore in
    // these versions we let the Gopher settings alone if they exist. We
    // nevertheless have to save the FoxyProxy proxy settings to the prefs file
    // even on systems using a Gecko version < 2 as they might (and should)
    // upgrade to a version > 2.
    // TODO: Do we really need all prefs? We should only save those we gonna 
    // overwrite.
    this.ps.setCharPref("autoconfig_url",
      this.networkPrefs.getCharPref("autoconfig_url"));
    this.ps.setCharPref("ftp", this.networkPrefs.getCharPref("ftp"));
    this.ps.setIntPref("ftp_port", this.networkPrefs.getIntPref("ftp_port"));
    this.ps.setCharPref("http", this.networkPrefs.getCharPref("http"));
    this.ps.setIntPref("http_port", this.networkPrefs.getIntPref("http_port"));
    this.ps.setCharPref("socks", this.networkPrefs.getCharPref("socks"));
    this.ps.setIntPref("socks_port",
      this.networkPrefs.getIntPref("socks_port"));
    this.ps.setIntPref("socks_version",
      this.networkPrefs.getIntPref("socks_version"));
    this.ps.setCharPref("ssl", this.networkPrefs.getCharPref("ssl"));
    this.ps.setIntPref("ssl_port", this.networkPrefs.getIntPref("ssl_port"));
    this.ps.setIntPref("type", this.networkPrefs.getIntPref("type"));
    this.ps.setBoolPref("socks_remote_dns",
      this.networkPrefs.getBoolPref("socks_remote_dns"))

    // Now, writing FoxyProxy's current proxy settings to the prefs but only if
    // the user has one proxy for all URLs or is in pattern mode.
    let proxy;
    if (this.fp._selectedProxy) {
      proxy = this.fp._selectedProxy;
    } else {
      // This does currently only include pattern mode (there is no random nor a
      // round-robin mode yet and that function is not called if FoxyProxy is
      // disabled.
      proxy = this.fp.proxies.getProxyById(this.fp.proxyForVersionCheck);
    }
    // Every proxy has this attribute. Thus, let's save it before deciding
    // which proxy settings to save in particular.
    this.networkPrefs.setBoolPref("socks_remote_dns", proxy.proxyDNS);
    if (proxy.mode == "manual") {
      this.networkPrefs.setIntPref("type", 1);
      if (!proxy.manualconf.isSocks) {
        this.networkPrefs.setCharPref("http", proxy.manualconf.host);
        this.networkPrefs.setIntPref("http_port", proxy.manualconf.port);
        this.networkPrefs.setCharPref("ssl", proxy.manualconf.host);
        this.networkPrefs.setIntPref("ssl_port", proxy.manualconf.port);
        this.networkPrefs.setCharPref("ftp", proxy.manualconf.host);
        this.networkPrefs.setIntPref("ftp_port", proxy.manualconf.port);
      } else {
        this.networkPrefs.setCharPref("socks", proxy.manualconf.host);
        this.networkPrefs.setIntPref("socks_port", proxy.manualconf.port);
        this.networkPrefs.setIntPref("socks_version", proxy.manualconf.port);
      }
    } else if (proxy.mode == "auto") {
      if (proxy.autoconfMode == "wpad") {
        this.networkPrefs.setIntPref("type", 4);
      } else {
        // PAC mode
        this.networkPrefs.setIntPref("type", 2);
        this.networkPrefs.setCharPref("autoconfig_url", proxy.autoconf.url);
      }
    } else if (proxy.mode == "system") {
      this.networkPrefs.setIntPref("type", 5);
    } else if (proxy.mode == "direct") {
      this.networkPrefs.setIntPref("type", 0);
    }
  },

  restoreOriginalProxyPrefs : function() {
    // Now that FoxyProxy has taken the control over the proxy handling again we
    // restore the user's proxy settings in the network panel to have them back
    // if FoxyProxy gets e.g. disabled or uninstalled.
    this.networkPrefs.setCharPref("autoconfig_url",
      this.ps.getCharPref("autoconfig_url"));
    this.networkPrefs.setCharPref("ftp", this.ps.getCharPref("ftp"));
    this.networkPrefs.setIntPref("ftp_port", this.ps.getIntPref("ftp_port"));
    this.networkPrefs.setCharPref("http", this.ps.getCharPref("http"));
    this.networkPrefs.setIntPref("http_port", this.ps.getIntPref("http_port"));
    this.networkPrefs.setCharPref("socks", this.ps.getCharPref("socks"));
    this.networkPrefs.setIntPref("socks_port",
      this.ps.getIntPref("socks_port"));
    this.networkPrefs.setIntPref("socks_version",
      this.ps.getIntPref("socks_version"));
    this.networkPrefs.setCharPref("ssl", this.ps.getCharPref("ssl"));
    this.networkPrefs.setIntPref("ssl_port", this.ps.getIntPref("ssl_port"));
    this.networkPrefs.setIntPref("type", this.ps.getIntPref("type"));
    this.networkPrefs.setBoolPref("socks_remote_dns",
      this.ps.getBoolPref("socks_remote_dns"));
  },
  
  fromDOM : function(doc) {
    let n = doc.getElementsByTagName("defaultPrefs").item(0);
    // for pre-2.17 foxyproxy.xml files that don't have this node
    if (!n) return;
    // Default: does not exist
    this.origPrefetch = this.utils.getSafeAttr(n, "origPrefetch", null);
  },
  
  toDOM : function(doc) {
    let e = doc.createElement("defaultPrefs");
    e.setAttribute("origPrefetch", this.origPrefetch);
    return e;
  }
};
