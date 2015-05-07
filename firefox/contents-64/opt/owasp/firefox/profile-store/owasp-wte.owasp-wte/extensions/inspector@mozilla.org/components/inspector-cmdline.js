/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const nsICommandLineHandler = Components.interfaces.nsICommandLineHandler;
const nsISupportsString     = Components.interfaces.nsISupportsString;
const nsIWindowWatcher      = Components.interfaces.nsIWindowWatcher;

function InspectorCmdLineHandler() {}
InspectorCmdLineHandler.prototype =
{
  classDescription: "DOM Inspector Command Line Handler",
  classID: Components.ID("{38293526-6b13-4d4f-a075-71939435b408}"),
  contractID: "@mozilla.org/commandlinehandler/general-startup;1?type=inspector",
  /* Needed for XPCOMUtils NSGetModule */
  _xpcom_categories: [{category: "command-line-handler",
                       entry: "m-inspector"}],

  /* nsISupports */
  QueryInterface: XPCOMUtils.generateQI([nsICommandLineHandler]),

  /* nsICommandLineHandler */
  handle : function handler_handle(cmdLine) {
    var args = Components.classes["@mozilla.org/supports-string;1"]
                         .createInstance(nsISupportsString);
    try {
      var uristr = cmdLine.handleFlagWithParam("inspector", false);
      if (uristr == null)
        return;
      try {
        args.data = cmdLine.resolveURI(uristr).spec;
      }
      catch (e) {
        return;
      }
    }
    catch (e) {
      cmdLine.handleFlag("inspector", true);
    }

    var wwatch = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                           .getService(nsIWindowWatcher);
    wwatch.openWindow(null, "chrome://inspector/content/", "_blank",
                      "chrome,dialog=no,all", args);
  },

  helpInfo : "  -inspector <url>     Open the DOM inspector.\n"
};


/**
 * XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4).
 * XPCOMUtils.generateNSGetModule is for Mozilla 1.9.0 (Firefox 3.0).
 */
if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([InspectorCmdLineHandler]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([InspectorCmdLineHandler]);
