/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/
const kSCHEME = "relative";
const CI = Components.interfaces;
const CC = Components.classes
const CR = Components.results;

const kIOSERVICE_CONTRACTID = "@mozilla.org/network/io-service;1";
const IOS = CC[kIOSERVICE_CONTRACTID].
  getService(CI.nsIIOService).getProtocolHandler("file").
  QueryInterface(CI.nsIFileProtocolHandler);
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function Protocol() {}
Protocol.prototype = {
  scheme: kSCHEME,
  defaultPort: -1,
  protocolFlags: CI.nsIProtocolHandler.URI_DANGEROUS_TO_LOAD,

  allowPort: function(port, scheme) {
    return false;
  },

  newURI: function(spec, charset, baseURI) {
    var uri = CC["@mozilla.org/network/simple-uri;1"].createInstance(CI.nsIURI);
    uri.spec = spec;
    return uri;
  },

  newChannel: function(aURI) {
    // aURI is a nsIUri, so get a string from it using .spec
    var uri = aURI.spec;

    // strip away the kSCHEME: part
    uri = uri.substring(uri.indexOf(":") + 1, uri.length);
    // and, optionally, leading // as in kSCHEME://
    uri.indexOf("//") == 0 && (uri = uri.substring(2));
    uri = uri.replace(/\\/g,"/"); // replace any backslashes with forward slashes
    var parts = uri.split("/");
    var file = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile);
    var dir = CC["@mozilla.org/file/directory_service;1"].getService(CI.nsIProperties).get(parts[0], CI.nsILocalFile);
    file.initWithPath(dir.path);
    // Note: start loop at 1, not 0
    for (var i=1,sz=parts.length; i<sz; i++)
      file.appendRelativePath(parts[i]);
    var pHandler = CC[kIOSERVICE_CONTRACTID].
        getService(CI.nsIIOService).getProtocolHandler("file").
        QueryInterface(CI.nsIFileProtocolHandler);
    return pHandler.newChannel(pHandler.newFileURI(file, null, null));
  },

  QueryInterface: XPCOMUtils.generateQI([CI.nsISupports, CI.nsIProtocolHandler]),
  classDescription: "FoxyProxy Relative Component",
  classID: Components.ID("{22ed2962-a8ec-11dc-8314-0800200c9a66}"),
  contractID: "@mozilla.org/network/protocol;1?name=" + kSCHEME
};

/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4)
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 and earlier (Firefox 3.6)
 */
if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([Protocol]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([Protocol]);
