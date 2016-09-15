/**
  FoxyProxy
  Copyright (C) 2006-2013 FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/

// Thanks for the template, doron (http://www.nexgenmedia.net/docs/protocol/)
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
const kSCHEME = "proxy";
const CI = Components.interfaces
const CC = Components.classes
const CR = Components.results;
const IOS = CC["@mozilla.org/network/io-service;1"].
  getService(CI.nsIIOService).getProtocolHandler("file").
        QueryInterface(CI.nsIFileProtocolHandler);

function Protocol() {}

Protocol.prototype = {
  scheme: kSCHEME,
  defaultPort: -1,
  protocolFlags: CI.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE,

  allowPort: function(port, scheme) {
    return false;
  },

  newURI: function(spec, charset, baseURI) {
    var uri = CC["@mozilla.org/network/simple-uri;1"].createInstance(CI.nsIURI);
    uri.spec = spec;
    return uri;
  },

  newChannel: function(aURI) {
    var fp = CC["@leahscape.org/foxyproxy/service;1"].getService().wrappedJSObject;
    if (fp.ignoreProxyScheme) return new nsDummyChannel();
    
    // user notification first
    var fpc = CC["@leahscape.org/foxyproxy/common;1"].getService().wrappedJSObject,
      self = this;
    fpc.notify("proxy.scheme.warning.2", null, null, null, 
      function() {fpc.processProxyURI(aURI)}, true);
    return new nsDummyChannel();
  },

  classID: Components.ID("{d1362868-da85-4faa-b1bf-24bfd936b0a6}"),
  contractID: "@mozilla.org/network/protocol;1?name=" + kSCHEME,
  classDescription: "FoxyProxy Protocol",
  QueryInterface: XPCOMUtils.generateQI([CI.nsISupports, CI.nsIProtocolHandler])
};

// Dummy channel implementation - thanks mark finkle and http://mxr.mozilla.org/mobile-browser/source/components/protocols/nsTelProtocolHandler.js#49
function nsDummyChannel() {}
nsDummyChannel.prototype = {
  QueryInterface: XPCOMUtils.generateQI([CI.nsISupports, CI.nsIChannel, CI.nsIRequest]),
  /* nsIChannel */
  loadAttributes: null,
  contentLength: 0,
  owner: null,
  loadGroup: null,
  notificationCallbacks: null,
  securityInfo: null,
  asyncOpen: function() {},
  asyncRead: function() {throw CR.NS_ERROR_NOT_IMPLEMENTED;},
  /* nsIRequest */
  isPending: function() {return true;},
  status: CR.NS_OK,
  cancel: function(status) {this.status = status;},
  suspend: this._suspres,
  resume: this._suspres,

  _suspres: function() {throw CR.NS_ERROR_NOT_IMPLEMENTED;}
};

/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4)
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 and earlier (Firefox 3.6)
 */
if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([Protocol]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([Protocol]);
