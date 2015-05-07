/**
  FoxyProxy
  Copyright (C) 2006-2013 Eric H. Jung and FoxyProxy, Inc.
  http://getfoxyproxy.org/
  eric.jung@yahoo.com

  This source code is released under the GPL license,
  available in the LICENSE file at the root of this installation
  and also online at http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
**/
const CC = Components.classes;
const CI = Components.interfaces;
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function CmdLineHandler() {}
CmdLineHandler.prototype = {
  QueryInterface: XPCOMUtils.generateQI([CI.nsISupports, CI.nsICommandLineHandler]),    
  classDescription: "FoxyProxy CommandLine Handler",
  classID: Components.ID("{ea321380-6b35-4e15-8d1e-fe6dc9c2ccae}"),
  contractID: "@mozilla.org/commandlinehandler/general-startup;1?type=foxyproxy",
  _xpcom_categories: /* this var for for pre gecko-2.0 */ [{category:"command-line-handler", entry:"m-foxyproxy"}],  
  _xpcom_factory: {
    singleton: null,
    createInstance: function (aOuter, aIID) {
      if (aOuter) throw CR.NS_ERROR_NO_AGGREGATION;
      if (!this.singleton) this.singleton = new CmdLineHandler();
      return this.singleton.QueryInterface(aIID);
    }
  },

  /* nsICommandLineHandler */
  handle : function(cmdLine) {
    try {
      var mode = cmdLine.handleFlagWithParam("foxyproxy-mode", false);
      if (mode)
        CC["@leahscape.org/foxyproxy/service;1"].getService().wrappedJSObject.setMode(mode, false, true);
    }
    catch (e) {
      Components.utils.reportError("incorrect parameter passed to -foxyproxy-mode on the command line.");
    }
  },

  // Per nsICommandLineHandler.idl: flag descriptions should start at
  // character 24, and lines should be wrapped at
  // 72 characters with embedded newlines,
  // and finally, the string should end with a newline
  helpInfo : "  -foxyproxy-mode      Start FoxyProxy in the specified mode. Valid\n" +
             "                       values are:\n" +
             "                         patterns\n" +
             "                         disabled\n" +
             "                         <id of a proxy as specified in foxyproxy.xml's proxy element>\n" +
             "                         random (not supported)\n" +
             "                         roundrobin (not supported)\n"
};

/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4)
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 and earlier (Firefox 3.6)
 */
if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([CmdLineHandler]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([CmdLineHandler]);
