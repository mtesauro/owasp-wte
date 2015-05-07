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

var Cc = Components.classes, Cu = Components.utils;
var proxyTree;
var fpc = Cc["@leahscape.org/foxyproxy/common;1"].getService().wrappedJSObject;
var fp = Cc["@leahscape.org/foxyproxy/service;1"].getService().wrappedJSObject;
// We need this proxy wrapper at least in order to use the makeProxyTreeView
// method in common.js
var proxies = {
  list : [],
  push : function(p) {
    this.list.push(p);
  },
  get length() {
    return this.list.length;
  },
  item : function(i) {
    return this.list[i];
  }
};

// These are the ones we load in the onLoad() function. We need them separated
// from the proxy object above in order to add patterns (and show a warning 
// dialog) only to newly added proxies.
var oldProxies = [];

// Helper Array for proxy handling current subscription.
var helperProxies = [];

Cu.import("resource://foxyproxy/subscriptions.jsm");
Cu.import("resource://foxyproxy/utils.jsm");

function onLoad(type) {
  try {
    var metadata;
    var proxyArray;
    var formatList = document.getElementById("subscriptionFormat");
    var obfuscationList = document.getElementById("subscriptionObfuscation");
    if (type === "pattern") {
      proxyTree = document.getElementById("subscriptionProxyTree");
    }
    if (window.arguments[0].inn !== null) {
      metadata = window.arguments[0].inn.subscription.metadata;
      document.getElementById("subscriptionEnabled").checked = metadata.enabled;
      document.getElementById("subscriptionName").value = metadata.name;
      document.getElementById("subscriptionNotes").value = metadata.notes;
      document.getElementById("subscriptionUrl").value = metadata.url;
      // The following piece of code deals with the problem of correlating
      // proxies to subscriptions. The single proxies are not parsable using
      // JSON but our whole pattern subscription feature depends on that.
      // Thus, in order to get the proxies related to a subscription their
      // id's are saved into an array that is parsable using JSON (see: onOk())
      // and if the addeditsubscription dialog is loaded the proxies object
      // is constructed using those saved id's. That accomplish the following
      // five lines of code.
      if (metadata.proxies.length > 0) {
        proxyArray = fp.proxies.getProxiesFromId(metadata.proxies);
	for (var i = 0; i < proxyArray.length; i++) {
          proxies.push(proxyArray[i]);
          // We are pushing the proxies here as well and do not copy them
          // once we added all of them to the proxy.list array because
          // we would have to write some array copy code we only need here.
          oldProxies.push(proxyArray[i]);
        }
        fpc.makeProxyTreeView(proxyTree, proxies, document);
      }

      document.getElementById("refresh").value = metadata.refresh;
      // Do we have a proxyType value > 0 in the metadata? If not, do nothing as
      // we either have a pattern subscription or a proxy subscription wherethe
      // first option (i.e. the one with index "0") is selected per default
      // anyway.
      if (metadata.proxyType) {
        // We have a proxy susbcription AND the user had either "HTTP" or
        // "SOCKS" selected earlier. Let's show her her selection.
        document.getElementById("subscriptionType").selectedIndex = metadata.
          proxyType;
      }
      // Assuming we have only 'FoxyProxy' and 'AutoProxy' as format values...
      if (metadata.format === "FoxyProxy") {
        formatList.selectedIndex = 0;
      } else {
        formatList.selectedIndex = 1;
      }
      // And assuming that we only have 'None' and 'Base64' so far as 
      // obfuscation methods...
      if (metadata.obfuscation === "Base64") {
        obfuscationList.selectedIndex = 1;
      } else {
        obfuscationList.selectedIndex = 0;
      }
    } else {
      // As the user is adding a new subscription there is nothing to refresh
      // yet. There is no last status either. Therefore, we are disabling these
      // buttons.
      document.getElementById("refreshButton").disabled = true;
      document.documentElement.getButton("extra2").disabled = true;
    }
  } catch(e) {
    dump("There went something wrong within the onLoad function: " + e + "\n");
  }
}

function generateError(type, error) {
  let errorText = "";
  for (let i = 0; i < error.length; i++) {
    errorText = errorText + "\n" + error[i];
  }
  fp.alert(null, fp.getMessage(type +
    "subscription.initial.import.failure") + "\n" + errorText);
}

function onOK(type) {
  try {
    var userValues = {};
    userValues.proxies = [];
    var proxyFound;
    var newProxies = [];
    var parsedSubscription, base64Encoded, foxyproxyFormat;
    var errorText = "";
    var url = document.getElementById("subscriptionUrl").value;
    // ToDo: Do we want to check whether it is really a URL here?
    if (url === null || url === "") {
      fp.alert(this, fp.getMessage(type + "subscription.invalid.url"));
      return false;
    }
    userValues.enabled = document.getElementById("subscriptionEnabled").checked;
    userValues.name = document.getElementById("subscriptionName").value;
    userValues.notes = document.getElementById("subscriptionNotes").value;
    userValues.url = url;
    if (type === "pattern") {
      for (var i = 0; i < proxies.list.length; i++) {
        // Let's check first whether the user has added the same proxy more than
        // once to the subscription. We do not allow that.
        for (var j = i + 1; j < proxies.list.length; j++) {
          if (proxies.list[i].id === proxies.list[j].id) {
            fp.alert(null, fp.getMessage("patternsubscription.warning.dupProxy",
              [proxies.list[i].name]));
            return false;
	  }
        }
        // Creating the array of proxy id's for saving to disk and rebuilding
        // the proxy list on startup.
        userValues.proxies.push(proxies.item(i).id);
      }
      // We don't have a proxy type for patterns on a pattern list. Thus,
      // setting it to |null|.
      userValues.proxyType = null;
    } else {
      // Proxy type is only for proxy lists.
      userValues.proxyType = document.getElementById("subscriptionType").
        selectedIndex;
    }
    userValues.refresh = document.getElementById("refresh").value;
    userValues.format = document.getElementById("subscriptionFormat").
      selectedItem.label;
    userValues.obfuscation = document.getElementById("subscriptionObfuscation").
      selectedItem.label;
    if (window.arguments[0].inn === null) {
      base64Encoded = userValues.obfuscation === "Base64";
      foxyproxyFormat = userValues.format === "FoxyProxy";
      let error;
      if (type === "pattern") {
        error = patternSubscriptions.loadSubscription(userValues, base64Encoded,
          function(subscription, values) {
            // The following is kind of a trivial array test. We need that to
            // check whether we got an array of error messages back or a
            // subscription object. Iff the latter is the case we add a new
            // subscription. As we do not have any subscription yet if we got an
            // array back, we just show an import error message.
            if (subscription && subscription.length === undefined) {
              patternSubscriptions.addSubscription(subscription, values);
              // Now adding the patterns to the proxies provided the user has
              // added at least one proxy in the addeditsubscription dialog.
              if (proxies.list.length !== 0) {
                patternSubscriptions.addPatterns(null, proxies.list, null);
              }
              utils.broadcast(true, "foxyproxy-tree-update");
            } else {
              generateError(type, subscription);
            }
          }
        );
      } else {
        error = proxySubscriptions.loadSubscription(userValues, base64Encoded,
          function(subscription, values) {
            if (subscription && subscription.length === undefined) {
              proxySubscriptions.addSubscription(subscription, values);
              // Redrawing the proxy tree as well as we probably added new
              // proxies. We do not have to broadcast "foxyproxy-tree-update" as
              // well as this is handled by |_updateView()|, too. The latter is
              // called by broadcasting "foxyproxy-proxy-change".
              utils.broadcast(true, "foxyproxy-proxy-change");
            } else {
              generateError(type, subscription);
            }
          }
        );
      }
      if (error) {
        generateError(type, error);
      }
      return true;
    } else {
      // The user has edited the pattern subscription. Maybe she removed a proxy
      // and we have to delete the respective patterns and to restore the old
      // ones now. Note: We just need to include the code here, i.e. if the user
      // edits a subscription, as there can be no patterns to remove/enable if 
      // the user adds a new subscription.
      if (helperProxies.length > 0) {
        patternSubscriptions.deletePatterns(helperProxies);
      }
      // If a user edits a subscription it can happen that she already had
      // added proxies to it. But we want to give only those back that were
      // not yet tied to the subscription in order to avoid doubling the
      // patterns. Therefore extracting the new ones.
      // We cannot just slice the oldProxies and proxies.list array as the 
      // user may have deleted some of the oldProxies, added some new, 
      // deleted some of them again etc. We have to compare the id's or some
      // other distinguishing attribute.
      // TODO: Is there really no easier way?
      for (i = 0; i < proxies.length; i++) {
	proxyFound = false;
        for (j = 0; j < oldProxies.length; j++) {
          if (oldProxies[j].id === proxies.item(i).id) {
	    proxyFound = true;
            // Now, the second use case of our herlperProxies array (the first
            // was storing the proxies that need to get removed from the 
            // subscription).
            helperProxies.push(oldProxies[j]);
	  }
	}
	if (!proxyFound) {
	  newProxies.push(proxies.item(i));
        };
      }
      // Now we check whether the status of the subscription will be changed.
      // If so, we call the necessary method to do this for the old proxies as
      // the new ones will automatically be up-to-date due to addPatterns().
      if (userValues.enabled !== window.arguments[0].inn.subscription.
	  metadata.enabled && helperProxies.length > 0) {
        // Okay, we had proxies and we know that these are really only proxies
        // we had when we loaded the addEditPatternSubscriptions.xul AND are 
        // still to be used for the subscription. AND the status changed. Let's
        // adapt it for the patterns tied to these old proxies.
	patternSubscriptions.changeSubStatus(helperProxies,
          userValues.enabled);
      }
      window.arguments[0].out = {
        userValues : userValues,
        proxies : newProxies
      }
      return true;
    }
    return false;
  } catch(e) {
    dump("There went something wrong in the onOK function: " + e + "\n");
    // TODO: Maybe just closing the window after this exception is not the
    // right way to cope with the situation!?
    return true;
  }
}

function onLastStatus(type) {
  var metadata = window.arguments[0].inn.subscription.metadata;
  var statusString = metadata.lastUpdate + "   " + metadata.lastStatus;
  var contentLength;
  if (type === "pattern") {
    contentLength = window.arguments[0].inn.subscription.patterns.length;
  } else {
    contentLength = window.arguments[0].inn.subscription.proxies.length;
  }
  if (!metadata.errorMessages) {
    statusString = statusString + "   " + contentLength + " " + fp.
      getMessage(type + "subscription.successful.retrieved");
  }
  var p = {
    inn: {
      status: statusString,
      errorMessages: metadata.errorMessages
    }
  };
  window.openDialog('chrome://foxyproxy/content/subscriptions/lastStatus.xul', '', 'modal, centerscreen, resizable', p).focus();
}

function addProxy(e) {
  if (e.type === "click" && e.button === 0) {
    var p = {
      inn: {
        title: fp.getMessage("choose.proxy.patterns"),
        pattern: true
      },
      out: null
    };
    window.openDialog("chrome://foxyproxy/content/chooseproxy.xul", "",
        "modal, centerscreen, resizable", p).focus();
    if (p.out) {
      proxies.push(p.out.proxy);
      fpc.makeProxyTreeView(proxyTree, proxies, document);
    }
  }
}

function removeProxy(e) {
  if (e.type === "click" && e.button === 0) {
    if (proxyTree.currentIndex < 0) {
      fp.alert(this, fp.getMessage("patternsubscription.noproxy.selected"));
      return;
    }
    // Why does helperProxies.push(proxies.list.
    // splice(proxyTree.currentIndex,1)) not work?
    helperProxies.push(proxies.list[proxyTree.currentIndex]);
    proxies.list.splice(proxyTree.currentIndex, 1);
    fpc.makeProxyTreeView(proxyTree, proxies, document);
  }
}

function contextHelp(type, subscription) {
  switch (type) {
    case "format":
      fpc.openAndReuseOneTabPerURL('http://getfoxyproxy.org/' + subscription +
        'subscriptions/help.html#format');
      break;
    case "obfuscation":
      fpc.openAndReuseOneTabPerURL('http://getfoxyproxy.org/' + subscription + 'subscriptions/help.html#obfuscation');
      break;
    case "refresh":
      fpc.openAndReuseOneTabPerURL('http://getfoxyproxy.org/' + subscription + 'subscriptions/help.html#refresh-rate');
      break;
    default:
      break;
  }
  // hide the help popup
  document.getElementById(type + subscription + "Help").hidePopup();
}

function refreshSubscription(type, e) {
  if (e.type === "click" && e.button === 0) {
    if (type === "pattern") {
      patternSubscriptions.refreshSubscription(window.arguments[0].inn.
        subscription, true);
    } else {
      proxySubscriptions.refreshSubscription(window.arguments[0].inn.
        subscription, true);
    }
  }
}
