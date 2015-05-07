/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

if (!CI) {
  // we're not being included by foxyproxy.js
  var CI = Components.interfaces, CC = Components.classes,
    CR = Components.results, fp;

  // Get attribute from node if it exists, otherwise return |def|.
  // No exceptions, no errors, no null returns.
  var gGetSafeAttr = function(n, name, def) {
    n.QueryInterface(CI.nsIDOMElement);
    return n ? (n.hasAttribute(name) ? n.getAttribute(name) : def) : def;
  };
  // Boolean version of GetSafe
  var gGetSafeAttrB = function(n, name, def) {
    n.QueryInterface(CI.nsIDOMElement);
    return n ? (n.hasAttribute(name) ? n.getAttribute(name) == "true" : def) :
      def;
  };
}

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

///////////////////////////// AutoConf class ///////////////////////
function AutoConf(owner, fpp) {
  this.wrappedJSObject = this;
  fp = fpp || CC["@leahscape.org/foxyproxy/service;1"].
    getService().wrappedJSObject;
  this.timer = CC["@mozilla.org/timer;1"].createInstance(CI.nsITimer);
  // That's our wrapper.
  this.ppp = CC["@mozilla.org/network/protocol-proxy-service;1"].
    getService().wrappedJSObject;
  this.owner = owner;
  this._resolver = new fpProxyAutoConfig(this);
}

AutoConf.prototype = {
  parser : /\s*(\S+)\s*(?:([^:]+):?(\d*)\s*[;]?\s*)?/,
  loadNotification: true,
  errorNotification: true,
  url: "",
  _autoReload: false,
  _reloadFreqMins: 60,
  owner: null,
  //disabledDueToBadPAC: false,
  disableOnBadPAC: true,
  ppp: null,
  QueryInterface: XPCOMUtils.generateQI([CI.nsISupports]),

  set autoReload(e) {
    this._autoReload = e;
    if (!e && this.timer) {
      this.timer.cancel();
    }
   },

  get autoReload() {return this._autoReload;},

  set reloadFreqMins(e) {
    if (isNaN(e) || e < 1) {
      e = 60;
    }
    else {
      this._reloadFreqMins = e;
    }
   },
  get reloadFreqMins() {return this._reloadFreqMins;},

  fromDOM : function(n) {
    this.url = gGetSafeAttr(n, "url", "");
    this.loadNotification = gGetSafeAttrB(n, "loadNotification", true);
    this.errorNotification = gGetSafeAttrB(n, "errorNotification", true);
    this._autoReload = gGetSafeAttrB(n, "autoReload", false);
    this._reloadFreqMins = gGetSafeAttr(n, "reloadFreqMins", 60);
    //this.disabledDueToBadPAC = gGetSafeAttrB(n, "disabledDueToBadPAC", false);
    this.disableOnBadPAC = gGetSafeAttrB(n, "disableOnBadPAC", true);
  },

  fromProxyConfig : function(a) {
    this.url = a.url;
    this.loadNotification = a.loadNotification;
    this.errorNotification = a.errorNotification;
    this.autoReload = a.autoReload;
    this.reloadFreqMins = a.reloadFreqMins;
    this.disableOnBadPAC = a.disableOnBadPAC;
  },

  toDOM : function(doc) {
    var e = doc.createElement("autoconf");
    e.setAttribute("url", this.url);
    e.setAttribute("loadNotification", this.loadNotification);
    e.setAttribute("errorNotification", this.errorNotification);
    e.setAttribute("autoReload", this._autoReload);
    e.setAttribute("reloadFreqMins", this._reloadFreqMins);
    //e.setAttribute("disabledDueToBadPAC", this.disabledDueToBadPAC);
    e.setAttribute("disableOnBadPAC", this.disableOnBadPAC);
    return e;
  },

  /**
   * Stateless function for loading and testing of PAC files.
   * On error, throws a localized Error object.
   */
  testPAC : function(url) {
    var req = CC["@mozilla.org/xmlextras/xmlhttprequest;1"]
      .createInstance(CI.nsIXMLHttpRequest);
    req.overrideMimeType("application/javascript");
    req.open("GET", url, false); // false means synchronous
    req.channel.loadFlags |= CI.nsIRequest.LOAD_BYPASS_CACHE;
    req.send(null);
    if (req.status == 200 ||
        (req.status == 0 && (url.indexOf("file://") == 0 ||
        url.indexOf("ftp://") == 0 || url.indexOf("relative://") == 0))) {
      new fpProxyAutoConfig(this).init(url, req.responseText);
    }
    else throw new Error(fp.getMessage("http.error", [req.status]));
  },

  loadPAC : function() {
    let autoconfMode = this.owner.autoconfMode;
    let autoconfMessage = "";
    let that = this;
    try {
      var req = CC["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(CI.nsIXMLHttpRequest);
      req.overrideMimeType("application/javascript");
      // We leave the sync version for Gecko < 18 as we are going to rewrite the
      // whole PAC part anyway using the single FP generated PAC file approach.
      if (fp.isGecko17) {
        req.open("GET", this.url, false); // false means synchronous
        req.channel.loadFlags |= CI.nsIRequest.LOAD_BYPASS_CACHE;
        req.send(null);
        that.processPACResponse(req, that, autoconfMode, autoconfMessage);
      } else {
        req.open("GET", this.url, true);
        req.channel.loadFlags |= CI.nsIRequest.LOAD_BYPASS_CACHE;
        req.onreadystatechange = function() {
          if (req.readyState === 4) {
            that.processPACResponse(req, that, autoconfMode, autoconfMessage);
          }
        };
        req.send(null);
      }
    }
    catch(e) {
      if (autoconfMode === "pac") {
        autoconfMessage = "pac.status.loadfailure2";
      } else {
        autoconfMessage = "wpad.status.loadfailure";
      }
      this.badPAC(autoconfMessage, e);
      return;
    }
  },

  processPACResponse: function(req, that, autoconfMode, autoconfMessage) {
    if (req.status == 200 || (req.status == 0 &&
         (that.url.indexOf("file://") == 0 || that.url.indexOf("ftp://") == 0 ||
          that.url.indexOf("relative://") == 0))) {
      try {
        that._resolver.init(that.url, req.responseText);
      }
      catch(e) {
        if (autoconfMode === "pac") {
          autoconfMessage = "pac.status.error2";
        } else {
          autoconfMessage = "wpad.status.error";
        }
        that.badPAC(autoconfMessage, e);
        // Either FoxyProxy got disabled or "direct" is used. Either way, emtpy
        // our request queue as the proxy got "resolved".
        if (!fp.isGecko17) {
          that.emptyRequestQueue(that.owner);
        }
        return;
      }
      let autoconfMessageHelper = "";
      if (autoconfMode === "pac") {
        autoconfMessage = "pac.status";
        autoconfMessageHelper = "pac.status.success2";
      } else {
        autoconfMessage = "wpad.status";
        autoconfMessageHelper = "wpad.status.success";
      }
      that.loadNotification && fp.notifier.alert(fp.getMessage(autoconfMessage),
        fp.getMessage(autoconfMessageHelper, [that.owner.name]));
      // Use _enabled so we don't loop infinitely 
      that.owner._enabled = true;
      //if (that.disabledDueToBadPAC) {
        //that.disabledDueToBadPAC = false; /* reset */
        //that.owner.fp.writeSettings();
      //}
      if (!fp.isGecko17) {
        // While the PAC loading was under way we queued all requests which hit
        // asyncOpen() meawhile. Let's dispatch them now that we have the PAC
        // loaded.
        that.emptyRequestQueue(that.owner);
      }
    } else {
      if (autoconfMode === "pac") {
        autoconfMessage = "pac.status.loadfailure2";
      } else {
        autoconfMessage = "wpad.status.loadfailure";
      }
      that.badPAC(autoconfMessage,
        new Error(fp.getMessage("http.error", [req.status])));
      if (!fp.isGecko17) {
        that.emptyRequestQueue(that.owner);
      }
    }
  },

  badPAC : function(r, e) {
    //if (!this.disabledDueToBadPAC) {
      /* marker to try loading the PAC next time */
      //this.disabledDueToBadPAC = true;
      //this.owner.fp.writeSettings();
    //}
    let autoconfMessage = "";
    if (this.owner.autoconfMode === "pac") {
      autoconfMessage = "pac.status";
    } else {
      autoconfMessage = "wpad.status";
    }
    var msg = fp.getMessage(r, [this.owner.name]) + "\n\n" + e.message;
    this.errorNotification && fp.notifier.alert(fp.getMessage(autoconfMessage),
      msg);
    if (this.owner.lastresort)
      this.owner.mode = "direct"; // don't disable!
    else if (this.disableOnBadPAC)
      this.owner._enabled = false; // Use _enabled so we don't loop infinitely
  },

  notify : function(timer) {
    // nsITimer callback
    this.loadPAC();
  },

  cancelTimer : function() {
    this.timer.cancel();
  },

  emptyRequestQueue : function(proxy) {
    let uri = "";
    let queuedRequests = this.ppp.queuedRequests;
    if (queuedRequests.length != 0) {
      // We are looping backwards in order to avoid issues with the index if
      // other proxies add new entries to the queue while a proxy is dispatching
      // all the requests belonging to it.
      for (let pos = queuedRequests.length - 1; pos > -1; --pos) {
        if (queuedRequests[pos][2] != this.owner.id) {
          // Not our business
          continue;
        }
        uri = queuedRequests[pos][1];
        pi = fp.applyFilter(null, uri, null);
        queuedRequests[pos][0].onProxyAvailable(null, uri, pi, 0);
        // TODO: Can we be sure that there are no race conditions here? Can't it
        // be that two proxies are trying to dispatch requests in our queue
        // almost simultaneously!?
        queuedRequests.splice(pos, 1);
      }
    }
  },

  classDescription: "FoxyProxy AutoConfiguration Component",
  classID: Components.ID("{54382370-f194-11da-8ad9-0800200c9a66}"),
  contractID: "@leahscape.org/foxyproxy/autoconf;1",
};

/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4)
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 and earlier (Firefox 3.6)
 */
if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([AutoConf]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([AutoConf]);

// FoxyProxy's own nsIProxyAutoConfig impl of
// http://mxr.mozilla.org/mozilla-central/source/netwerk/base/src/nsProxyAutoConfig.js.
// Why? Because Gecko's impl is a singleton. FoxyProxy needs multiple instances in order to
// support multiple, simultaneous PAC files (Gecko's impl cannot do this as of Moz 1.9 because
// of the singleon nature of this component)
function fpProxyAutoConfig(owner) {
  this.owner = owner;
}

fpProxyAutoConfig.prototype = {
    // sandbox in which we eval loaded autoconfig js file
    sandbox : null,
    owner: null,

    /** throws a localized Error object on error */
    init: function(pacURI, pacText) {
      let autoconfMessage = "";
      if (pacURI == "" || pacText == "") {
        dump("FoxyProxy: init(), pacURI or pacText empty\n");
        if (this.owner && this.owner.owner) {
          if (this.owner.owner.autoconfMode  === "pac") {
            autoconfMessage = "pac.empty";
          } else {
            autoconfMessage = "wpad.empty";
          }
        } else {
          // No PAC file content found while executing |testPAC()|. Let's assume
          // the user tested a PAC file. 
          autoconfMessage = "pac.empty";
        }
        throw new Error(fp.getMessage(autoconfMessage));
      }
      this.sandbox = new Components.utils.Sandbox(pacURI);
      Components.utils.evalInSandbox(pacUtils, this.sandbox);

      // add predefined functions to pac
      this.sandbox.importFunction(myIpAddress);
      this.sandbox.importFunction(dnsResolve);
      this.sandbox.importFunction(proxyAlert, "alert");

      // evaluate loaded js file
      Components.utils.evalInSandbox(pacText, this.sandbox);

      // We can no longer trust this.sandbox. Touching it directly can
      // cause all sorts of pain, so wrap it in an XPCSafeJSObjectWrapper
      // and do all of our work through there.
      this.sandbox = XPCSJSOWWrapper(this.sandbox, true);

      // Performance improvement in FoxyProxy over Firefox
      // by doing this next check ONCE in init() except
      // everytime in getProxyxForURI().
      if (!("FindProxyForURL" in this.sandbox)) {
        dump("FoxyProxy: init(), FindProxyForURL not found\n");
        if (this.owner && this.owner.owner) {
          if (this.owner.owner.autoconfMode === "pac") {
            autoconfMessage = "pac.fcn.notfound2";
          } else {
            autoconfMessage = "wpad.fcn.notfound";
          }
        } else {
          // No FindProxyForURL in a PAC file called via |testPAC()|. Let's
          // assume it is a PAC file.
          autoconfMessage = "pac.fcn.notfound2";
        }
        throw new Error(fp.getMessage(autoconfMessage));
      }
      // We need the if-clause here as |this.owner| can be |null|. That happens
      // if |testPAC()| is called in addeditproxy.js.
      if (this.owner && this.owner.owner) {
        // PAC file is ready.
        this.owner.owner.initPAC = false;
      }
      return true;
    },

    getProxyForURI: function(testURI, testHost) {
      // Call the original function
      try {
        // Letting the PAC request through but only if we have not loaded the
        // PAC yet. Otherwise there is no reason why the request should not use
        // the proxy given back by the PAC.
        if (this.owner.owner.initPAC) {
          // Make sure we don't have a trailing slash on one of our URIs.
          // Otherwise the comparison may fail and we risk loading the PAC file
          // itself through the proxy if it is not initialized yet which fails
          // for obvious reasons.
          // See: http://forums.getfoxyproxy.org/viewtopic.php?f=4&t=816.
          if (testURI.replace(/\/$/, '') === this.owner.url.
              replace(/\/$/, '')) {
            dump("FoxyProxy: Preventing cyclical PAC error; using no proxy " +
            "to load PAC file.\n");
            return "direct";
          }
        }
        // This is only relevant for Gecko > 17 as the PAC logic is async now.
        // If the PAC file is not loaded yet we return our custom error code
        // (which is "queue" + the proxy id) to indicate that the request needs
        // to get queued in the hooked asyncOpen().
        if (!fp.isGecko17 && this.owner.owner.initPAC) {
          return "queue" + this.owner.owner.id;
        }
        return this.sandbox.FindProxyForURL(testURI, testHost);
      } catch (e) {
        dump("FoxyProxy: getProxyForURI(), " + e + " \n\n" + e.stack + "\n");
        throw XPCSJSOWWrapper(e);
      }
    }
}

/** XPCSafeJSObjectWrapper is not available before FF 3.0. Only use it if it's available. **/
function XPCSJSOWWrapper(x, useNew) {
  return typeof(XPCSafeJSObjectWrapper) == "undefined" ?
    x : useNew ? new XPCSafeJSObjectWrapper(x) : XPCSafeJSObjectWrapper(x);
}

function proxyAlert(msg) {
    msg = XPCSJSOWWrapper(msg);
    try {
        // It would appear that the console service is threadsafe.
        var cns = Components.classes["@mozilla.org/consoleservice;1"]
                            .getService(Components.interfaces.nsIConsoleService);
        cns.logStringMessage("PAC-alert: "+msg);
    } catch (e) {
        dump("PAC: proxyAlert ERROR: "+e+"\n");
    }
}

// wrapper for getting local IP address called by PAC file
function myIpAddress() {
    try {
        return dns.resolve(dns.myHostName, 0).getNextAddrAsString();
    } catch (e) {
        return '127.0.0.1';
    }
}

// wrapper for resolving hostnames called by PAC file
function dnsResolve(host) {
    host = XPCSJSOWWrapper(host);
    try {
        return dns.resolve(host, 0).getNextAddrAsString();
    } catch (e) {
        return null;
    }
}

var dns = CC["@mozilla.org/network/dns-service;1"].getService(CI.nsIDNSService);

var pacUtils =
"function dnsDomainIs(host, domain) {\n" +
"    return (host.length >= domain.length &&\n" +
"            host.substring(host.length - domain.length) == domain);\n" +
"}\n" +

"function dnsDomainLevels(host) {\n" +
"    return host.split('.').length-1;\n" +
"}\n" +

"function convert_addr(ipchars) {\n"+
"    var bytes = ipchars.split('.');\n"+
"    var result = ((bytes[0] & 0xff) << 24) |\n"+
"                 ((bytes[1] & 0xff) << 16) |\n"+
"                 ((bytes[2] & 0xff) <<  8) |\n"+
"                  (bytes[3] & 0xff);\n"+
"    return result;\n"+
"}\n"+

"function isInNet(ipaddr, pattern, maskstr) {\n"+
"    var test = /^(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})$/.exec(ipaddr);\n"+
"    if (test == null) {\n"+
"        ipaddr = dnsResolve(ipaddr);\n"+
"        if (ipaddr == null)\n"+
"            return false;\n"+
"    } else if (test[1] > 255 || test[2] > 255 || \n"+
"               test[3] > 255 || test[4] > 255) {\n"+
"        return false;    // not an IP address\n"+
"    }\n"+
"    var host = convert_addr(ipaddr);\n"+
"    var pat  = convert_addr(pattern);\n"+
"    var mask = convert_addr(maskstr);\n"+
"    return ((host & mask) == (pat & mask));\n"+
"    \n"+
"}\n"+

"function isPlainHostName(host) {\n" +
"    return (host.search('\\\\.') == -1);\n" +
"}\n" +

"function isResolvable(host) {\n" +
"    var ip = dnsResolve(host);\n" +
"    return (ip != null);\n" +
"}\n" +

"function localHostOrDomainIs(host, hostdom) {\n" +
"    return (host == hostdom) ||\n" +
"           (hostdom.lastIndexOf(host + '.', 0) == 0);\n" +
"}\n" +

"function shExpMatch(url, pattern) {\n" +
"   pattern = pattern.replace(/\\./g, '\\\\.');\n" +
"   pattern = pattern.replace(/\\*/g, '.*');\n" +
"   pattern = pattern.replace(/\\?/g, '.');\n" +
"   var newRe = new RegExp('^'+pattern+'$');\n" +
"   return newRe.test(url);\n" +
"}\n" +

"var wdays = {SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6};\n" +

"var months = {JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11};\n"+

"function weekdayRange() {\n" +
"    function getDay(weekday) {\n" +
"        if (weekday in wdays) {\n" +
"            return wdays[weekday];\n" +
"        }\n" +
"        return -1;\n" +
"    }\n" +
"    var date = new Date();\n" +
"    var argc = arguments.length;\n" +
"    var wday;\n" +
"    if (argc < 1)\n" +
"        return false;\n" +
"    if (arguments[argc - 1] == 'GMT') {\n" +
"        argc--;\n" +
"        wday = date.getUTCDay();\n" +
"    } else {\n" +
"        wday = date.getDay();\n" +
"    }\n" +
"    var wd1 = getDay(arguments[0]);\n" +
"    var wd2 = (argc == 2) ? getDay(arguments[1]) : wd1;\n" +
"    return (wd1 == -1 || wd2 == -1) ? false\n" +
"                                    : (wd1 <= wday && wday <= wd2);\n" +
"}\n" +

"function dateRange() {\n" +
"    function getMonth(name) {\n" +
"        if (name in months) {\n" +
"            return months[name];\n" +
"        }\n" +
"        return -1;\n" +
"    }\n" +
"    var date = new Date();\n" +
"    var argc = arguments.length;\n" +
"    if (argc < 1) {\n" +
"        return false;\n" +
"    }\n" +
"    var isGMT = (arguments[argc - 1] == 'GMT');\n" +
"\n" +
"    if (isGMT) {\n" +
"        argc--;\n" +
"    }\n" +
"    // function will work even without explict handling of this case\n" +
"    if (argc == 1) {\n" +
"        var tmp = parseInt(arguments[0]);\n" +
"        if (isNaN(tmp)) {\n" +
"            return ((isGMT ? date.getUTCMonth() : date.getMonth()) ==\n" +
"getMonth(arguments[0]));\n" +
"        } else if (tmp < 32) {\n" +
"            return ((isGMT ? date.getUTCDate() : date.getDate()) == tmp);\n" +
"        } else { \n" +
"            return ((isGMT ? date.getUTCFullYear() : date.getFullYear()) ==\n" +
"tmp);\n" +
"        }\n" +
"    }\n" +
"    var year = date.getFullYear();\n" +
"    var date1, date2;\n" +
"    date1 = new Date(year,  0,  1,  0,  0,  0);\n" +
"    date2 = new Date(year, 11, 31, 23, 59, 59);\n" +
"    var adjustMonth = false;\n" +
"    for (var i = 0; i < (argc >> 1); i++) {\n" +
"        var tmp = parseInt(arguments[i]);\n" +
"        if (isNaN(tmp)) {\n" +
"            var mon = getMonth(arguments[i]);\n" +
"            date1.setMonth(mon);\n" +
"        } else if (tmp < 32) {\n" +
"            adjustMonth = (argc <= 2);\n" +
"            date1.setDate(tmp);\n" +
"        } else {\n" +
"            date1.setFullYear(tmp);\n" +
"        }\n" +
"    }\n" +
"    for (var i = (argc >> 1); i < argc; i++) {\n" +
"        var tmp = parseInt(arguments[i]);\n" +
"        if (isNaN(tmp)) {\n" +
"            var mon = getMonth(arguments[i]);\n" +
"            date2.setMonth(mon);\n" +
"        } else if (tmp < 32) {\n" +
"            date2.setDate(tmp);\n" +
"        } else {\n" +
"            date2.setFullYear(tmp);\n" +
"        }\n" +
"    }\n" +
"    if (adjustMonth) {\n" +
"        date1.setMonth(date.getMonth());\n" +
"        date2.setMonth(date.getMonth());\n" +
"    }\n" +
"    if (isGMT) {\n" +
"    var tmp = date;\n" +
"        tmp.setFullYear(date.getUTCFullYear());\n" +
"        tmp.setMonth(date.getUTCMonth());\n" +
"        tmp.setDate(date.getUTCDate());\n" +
"        tmp.setHours(date.getUTCHours());\n" +
"        tmp.setMinutes(date.getUTCMinutes());\n" +
"        tmp.setSeconds(date.getUTCSeconds());\n" +
"        date = tmp;\n" +
"    }\n" +
"    return ((date1 <= date) && (date <= date2));\n" +
"}\n" +

"function timeRange() {\n" +
"    var argc = arguments.length;\n" +
"    var date = new Date();\n" +
"    var isGMT= false;\n"+
"\n" +
"    if (argc < 1) {\n" +
"        return false;\n" +
"    }\n" +
"    if (arguments[argc - 1] == 'GMT') {\n" +
"        isGMT = true;\n" +
"        argc--;\n" +
"    }\n" +
"\n" +
"    var hour = isGMT ? date.getUTCHours() : date.getHours();\n" +
"    var date1, date2;\n" +
"    date1 = new Date();\n" +
"    date2 = new Date();\n" +
"\n" +
"    if (argc == 1) {\n" +
"        return (hour == arguments[0]);\n" +
"    } else if (argc == 2) {\n" +
"        return ((arguments[0] <= hour) && (hour <= arguments[1]));\n" +
"    } else {\n" +
"        switch (argc) {\n" +
"        case 6:\n" +
"            date1.setSeconds(arguments[2]);\n" +
"            date2.setSeconds(arguments[5]);\n" +
"        case 4:\n" +
"            var middle = argc >> 1;\n" +
"            date1.setHours(arguments[0]);\n" +
"            date1.setMinutes(arguments[1]);\n" +
"            date2.setHours(arguments[middle]);\n" +
"            date2.setMinutes(arguments[middle + 1]);\n" +
"            if (middle == 2) {\n" +
"                date2.setSeconds(59);\n" +
"            }\n" +
"            break;\n" +
"        default:\n" +
"          throw 'timeRange: bad number of arguments'\n" +
"        }\n" +
"    }\n" +
"\n" +
"    if (isGMT) {\n" +
"        date.setFullYear(date.getUTCFullYear());\n" +
"        date.setMonth(date.getUTCMonth());\n" +
"        date.setDate(date.getUTCDate());\n" +
"        date.setHours(date.getUTCHours());\n" +
"        date.setMinutes(date.getUTCMinutes());\n" +
"        date.setSeconds(date.getUTCSeconds());\n" +
"    }\n" +
"    return ((date1 <= date) && (date <= date2));\n" +
"}\n"

